interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: IRDAI Regulatory Report — structured report for compliance
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const period = url.searchParams.get('period') || 'ytd'; // 'ytd' or '2026-03' etc.

    if (!db) {
      return json({ error: 'Database not available' }, 503);
    }

    // Date filter based on period
    let dateFilter = '';
    if (period !== 'ytd' && period.match(/^\d{4}-\d{2}$/)) {
      dateFilter = `AND strftime('%Y-%m', c.submitted_at) = '${period}'`;
    }

    // Section 1: Claims Summary
    const claimsSummary = await db.prepare(`
      SELECT
        COUNT(*) as total_received,
        COUNT(CASE WHEN status IN ('approved', 'paid') THEN 1 END) as total_settled,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as total_rejected,
        COUNT(CASE WHEN status IN ('submitted', 'under_review', 'pre_auth_pending') THEN 1 END) as total_pending,
        COUNT(CASE WHEN status = 'appealed' THEN 1 END) as total_appealed,
        SUM(claimed_amount) as gross_claims_amount,
        COALESCE(SUM(CASE WHEN status IN ('approved', 'paid') THEN approved_amount ELSE 0 END), 0) as net_settled_amount,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN claimed_amount ELSE 0 END), 0) as rejected_amount,
        ROUND(AVG(claimed_amount), 0) as avg_claim_size,
        ROUND(AVG(CASE WHEN status IN ('approved', 'paid') THEN approved_amount END), 0) as avg_settlement_size
      FROM claims c
      WHERE 1=1 ${dateFilter}
    `).first();

    // Section 2: Claims by Scheme
    const { results: claimsByScheme } = await db.prepare(`
      SELECT c.payer_scheme,
             COUNT(*) as received,
             COUNT(CASE WHEN status IN ('approved', 'paid') THEN 1 END) as settled,
             COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
             SUM(claimed_amount) as claimed_amount,
             COALESCE(SUM(CASE WHEN status IN ('approved', 'paid') THEN approved_amount ELSE 0 END), 0) as settled_amount,
             CASE WHEN COUNT(*) > 0
               THEN ROUND(COUNT(CASE WHEN status IN ('approved', 'paid') THEN 1 END) * 100.0 / COUNT(*), 1)
               ELSE 0
             END as settlement_rate
      FROM claims c
      WHERE 1=1 ${dateFilter}
      GROUP BY c.payer_scheme
      ORDER BY received DESC
    `).all();

    // Section 3: Loss Ratio (premium vs claims) — subqueries to avoid cross-join
    const { results: lossRatioByScheme } = await db.prepare(`
      SELECT pc_agg.payer_scheme,
             pc_agg.premium,
             COALESCE(cl_agg.claims_incurred, 0) as claims_incurred,
             CASE WHEN pc_agg.premium > 0
               THEN ROUND(COALESCE(cl_agg.claims_incurred, 0) * 100.0 / pc_agg.premium, 1)
               ELSE 0
             END as loss_ratio
      FROM (
        SELECT payer_scheme, SUM(premium_collected) as premium
        FROM premium_collections GROUP BY payer_scheme
      ) pc_agg
      LEFT JOIN (
        SELECT payer_scheme, SUM(approved_amount) as claims_incurred
        FROM claims WHERE status IN ('approved', 'paid')
        GROUP BY payer_scheme
      ) cl_agg ON cl_agg.payer_scheme = pc_agg.payer_scheme
      ORDER BY loss_ratio DESC
    `).all();

    // Section 4: Turnaround Time
    const { results: tatByScheme } = await db.prepare(`
      SELECT payer_scheme,
             COUNT(*) as resolved_count,
             ROUND(AVG(julianday(resolved_at) - julianday(submitted_at)), 1) as avg_tat_days,
             COUNT(CASE WHEN julianday(resolved_at) - julianday(submitted_at) <= 30 THEN 1 END) as within_30_days,
             CASE WHEN COUNT(*) > 0
               THEN ROUND(COUNT(CASE WHEN julianday(resolved_at) - julianday(submitted_at) <= 30 THEN 1 END) * 100.0 / COUNT(*), 1)
               ELSE 0
             END as tat_compliance_pct
      FROM claims
      WHERE resolved_at IS NOT NULL AND submitted_at IS NOT NULL
      GROUP BY payer_scheme
      ORDER BY avg_tat_days ASC
    `).all();

    // Section 5: Fraud Summary
    const fraudSummary = await db.prepare(`
      SELECT
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_cases,
        COUNT(CASE WHEN status = 'open' OR status = 'under_investigation' THEN 1 END) as active_cases,
        ROUND(AVG(risk_score), 2) as avg_risk_score
      FROM fraud_alerts
    `).first();

    const fraudRecovery = await db.prepare(`
      SELECT
        COUNT(*) as total_investigations,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_investigations,
        COALESCE(SUM(recovery_amount), 0) as total_recovery
      FROM fraud_investigations
    `).first();

    // Section 6: Rejection Analysis
    const { results: rejectionReasons } = await db.prepare(`
      SELECT rejection_reason, COUNT(*) as count,
             SUM(claimed_amount) as total_amount
      FROM claims
      WHERE status = 'rejected' AND rejection_reason IS NOT NULL
      GROUP BY rejection_reason
      ORDER BY count DESC
    `).all();

    // Section 7: Portfolio Summary
    const portfolioSummary = await db.prepare(`
      SELECT
        COUNT(DISTINCT patient_id) as unique_claimants,
        COUNT(*) as total_claims,
        SUM(claimed_amount) as gross_claims,
        COUNT(DISTINCT payer_scheme) as active_schemes
      FROM claims
    `).first();

    const premiumSummary = await db.prepare(`
      SELECT
        SUM(premium_collected) as total_premium,
        (SELECT SUM(lives_covered) FROM premium_collections WHERE month = (SELECT MAX(month) FROM premium_collections)) as total_lives,
        SUM(new_policies) as new_policies,
        SUM(cancellations) as cancellations
      FROM premium_collections
    `).first();

    // IRDAI compliance checks
    const totalPremium = (premiumSummary as any)?.total_premium || 0;
    const totalClaimsPaid = (claimsSummary as any)?.net_settled_amount || 0;
    const overallLossRatio = totalPremium > 0 ? Math.round(totalClaimsPaid * 1000 / totalPremium) / 10 : 0;
    const totalReceived = (claimsSummary as any)?.total_received || 0;
    const totalSettled = (claimsSummary as any)?.total_settled || 0;
    const settlementRate = totalReceived > 0 ? Math.round(totalSettled * 1000 / totalReceived) / 10 : 0;

    return json({
      report_type: 'IRDAI Regulatory Report',
      period: period === 'ytd' ? 'Year to Date (FY 2025-26)' : period,
      generated_at: new Date().toISOString(),
      currency: 'INR',

      executive_summary: {
        total_premium_collected: totalPremium,
        total_claims_incurred: totalClaimsPaid,
        overall_loss_ratio: overallLossRatio,
        settlement_rate: settlementRate,
        total_lives_covered: (premiumSummary as any)?.total_lives || 0,
        unique_claimants: (portfolioSummary as any)?.unique_claimants || 0,
        fraud_cases_detected: (fraudSummary as any)?.total_alerts || 0,
        fraud_recovery: (fraudRecovery as any)?.total_recovery || 0,
      },

      claims_performance: {
        summary: claimsSummary || {},
        by_scheme: claimsByScheme || [],
        rejection_analysis: rejectionReasons || [],
      },

      loss_ratio_analysis: {
        overall: overallLossRatio,
        by_scheme: (lossRatioByScheme || []).map((r: any) => ({
          ...r,
          irdai_threshold: r.payer_scheme === 'ayushman_bharat' ? 95 : 85,
          compliant: r.loss_ratio <= (r.payer_scheme === 'ayushman_bharat' ? 95 : 85),
        })),
      },

      turnaround_time: {
        by_scheme: tatByScheme || [],
        irdai_threshold_days: 30,
      },

      fraud_detection: {
        alerts: fraudSummary || {},
        investigations: fraudRecovery || {},
      },

      compliance_scorecard: {
        loss_ratio: {
          value: overallLossRatio,
          threshold: 85,
          status: overallLossRatio <= 75 ? 'green' : overallLossRatio <= 85 ? 'amber' : 'red',
        },
        settlement_rate: {
          value: settlementRate,
          threshold: 75,
          status: settlementRate >= 85 ? 'green' : settlementRate >= 75 ? 'amber' : 'red',
        },
        tat_compliance: {
          value: (tatByScheme || []).reduce((sum: number, r: any) => sum + (r.tat_compliance_pct || 0), 0) / Math.max((tatByScheme || []).length, 1),
          threshold: 90,
          status: 'amber',
        },
        fraud_detection_rate: {
          value: ((fraudSummary as any)?.total_alerts || 0) > 0
            ? Math.round(((fraudSummary as any)?.confirmed_cases || 0) * 1000 / (fraudSummary as any).total_alerts) / 10
            : 0,
          threshold: 10,
          status: 'green',
        },
      },
    });
  } catch (error) {
    console.error('Error generating IRDAI report:', error);
    return json({ error: 'Failed to generate IRDAI report' }, 500);
  }
};
