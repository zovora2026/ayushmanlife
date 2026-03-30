interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: Comprehensive payer analytics — loss ratios, portfolio, high-cost claimants, trends
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    if (!db) {
      return json({ error: 'Database not available' }, 503);
    }

    // 1. Loss Ratio by month: claims paid / premium collected
    const { results: lossRatioMonthly } = await db.prepare(`
      SELECT pc.month,
             pc.payer_scheme,
             pc.premium_collected,
             COALESCE(SUM(c.approved_amount), 0) as claims_paid,
             CASE WHEN pc.premium_collected > 0
               THEN ROUND(COALESCE(SUM(c.approved_amount), 0) * 100.0 / pc.premium_collected, 1)
               ELSE 0
             END as loss_ratio
      FROM premium_collections pc
      LEFT JOIN claims c ON c.payer_scheme = pc.payer_scheme
        AND strftime('%Y-%m', c.submitted_at) = pc.month
        AND c.status IN ('approved', 'paid')
      GROUP BY pc.month, pc.payer_scheme
      ORDER BY pc.month ASC, pc.payer_scheme
    `).all();

    // 2. Aggregate monthly loss ratio (all schemes combined)
    const { results: monthlyAggregate } = await db.prepare(`
      SELECT pc.month,
             SUM(pc.premium_collected) as total_premium,
             COALESCE(SUM(c.approved_amount), 0) as total_claims_paid,
             SUM(pc.lives_covered) as total_lives,
             CASE WHEN SUM(pc.premium_collected) > 0
               THEN ROUND(COALESCE(SUM(c.approved_amount), 0) * 100.0 / SUM(pc.premium_collected), 1)
               ELSE 0
             END as loss_ratio
      FROM premium_collections pc
      LEFT JOIN claims c ON c.payer_scheme = pc.payer_scheme
        AND strftime('%Y-%m', c.submitted_at) = pc.month
        AND c.status IN ('approved', 'paid')
      GROUP BY pc.month
      ORDER BY pc.month ASC
    `).all();

    // 3. Loss ratio by scheme (YTD) — use subqueries to avoid cross-join
    const { results: lossRatioByScheme } = await db.prepare(`
      SELECT pc_agg.payer_scheme,
             pc_agg.total_premium,
             COALESCE(cl_agg.total_claims_paid, 0) as total_claims_paid,
             pc_agg.total_lives,
             pc_agg.total_new_policies,
             pc_agg.total_renewals,
             pc_agg.total_cancellations,
             CASE WHEN pc_agg.total_premium > 0
               THEN ROUND(COALESCE(cl_agg.total_claims_paid, 0) * 100.0 / pc_agg.total_premium, 1)
               ELSE 0
             END as loss_ratio
      FROM (
        SELECT payer_scheme,
               SUM(premium_collected) as total_premium,
               SUM(lives_covered) as total_lives,
               SUM(new_policies) as total_new_policies,
               SUM(renewals) as total_renewals,
               SUM(cancellations) as total_cancellations
        FROM premium_collections GROUP BY payer_scheme
      ) pc_agg
      LEFT JOIN (
        SELECT payer_scheme, SUM(approved_amount) as total_claims_paid
        FROM claims WHERE status IN ('approved', 'paid')
        GROUP BY payer_scheme
      ) cl_agg ON cl_agg.payer_scheme = pc_agg.payer_scheme
      ORDER BY loss_ratio DESC
    `).all();

    // 4. YTD totals (separate queries to avoid cross-join)
    const ytdTotals = await db.prepare(`
      SELECT
        SUM(premium_collected) as total_premium,
        MAX(lives_covered) as total_lives,
        SUM(new_policies) as total_new_policies,
        SUM(renewals) as total_renewals,
        SUM(cancellations) as total_cancellations
      FROM premium_collections
    `).first();

    // Latest month lives (sum across schemes for latest month)
    const latestLives = await db.prepare(`
      SELECT SUM(lives_covered) as current_lives
      FROM premium_collections
      WHERE month = (SELECT MAX(month) FROM premium_collections)
    `).first();

    const ytdClaims = await db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('approved', 'paid') THEN approved_amount ELSE 0 END), 0) as total_claims_paid,
        COALESCE(SUM(claimed_amount), 0) as total_claimed,
        COUNT(*) as total_claims,
        COUNT(CASE WHEN status IN ('approved', 'paid') THEN 1 END) as claims_settled,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as claims_rejected,
        COUNT(CASE WHEN status IN ('submitted', 'under_review', 'pre_auth_pending') THEN 1 END) as claims_pending
      FROM claims
    `).first();

    const ytdPremium = (ytdTotals as any)?.total_premium || 0;
    const ytdClaimsPaid = (ytdClaims as any)?.total_claims_paid || 0;
    const ytdLossRatio = ytdPremium > 0 ? Math.round(ytdClaimsPaid * 1000 / ytdPremium) / 10 : 0;

    // 5. Portfolio distribution — claims by scheme
    const { results: portfolioByScheme } = await db.prepare(`
      SELECT payer_scheme,
             COUNT(*) as claims_count,
             SUM(claimed_amount) as total_claimed,
             COALESCE(SUM(approved_amount), 0) as total_approved,
             COUNT(CASE WHEN status IN ('approved', 'paid') THEN 1 END) as settled_count,
             ROUND(AVG(claimed_amount), 0) as avg_claim_amount
      FROM claims
      GROUP BY payer_scheme
      ORDER BY total_claimed DESC
    `).all();

    const totalClaimed = (portfolioByScheme || []).reduce((sum: number, r: any) => sum + (r.total_claimed || 0), 0);
    const portfolioWithPct = (portfolioByScheme || []).map((r: any) => ({
      ...r,
      percentage: totalClaimed > 0 ? Math.round(r.total_claimed * 1000 / totalClaimed) / 10 : 0,
    }));

    // 6. High-cost claimants (top 10 by total claimed)
    const { results: highCostClaimants } = await db.prepare(`
      SELECT p.name as patient_name,
             p.insurance_type as scheme,
             COUNT(c.id) as claim_count,
             SUM(c.claimed_amount) as total_claimed,
             COALESCE(SUM(c.approved_amount), 0) as total_approved,
             ROUND(AVG(c.claimed_amount), 0) as avg_claim,
             MAX(c.submitted_at) as last_claim_date
      FROM claims c
      JOIN patients p ON c.patient_id = p.id
      GROUP BY c.patient_id
      HAVING COUNT(c.id) >= 2
      ORDER BY total_claimed DESC
      LIMIT 10
    `).all();

    // 7. Claims trend — monthly submission and settlement
    const { results: claimsTrend } = await db.prepare(`
      SELECT strftime('%Y-%m', submitted_at) as month,
             COUNT(*) as submitted,
             COUNT(CASE WHEN status IN ('approved', 'paid') THEN 1 END) as settled,
             COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
             SUM(claimed_amount) as amount_submitted,
             COALESCE(SUM(CASE WHEN status IN ('approved', 'paid') THEN approved_amount ELSE 0 END), 0) as amount_settled
      FROM claims
      WHERE submitted_at IS NOT NULL
        AND submitted_at >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `).all();

    // 8. Claims by department
    const { results: byDepartment } = await db.prepare(`
      SELECT c.diagnosis as department,
             COUNT(*) as claim_count,
             SUM(c.claimed_amount) as total_claimed,
             COALESCE(SUM(c.approved_amount), 0) as total_approved,
             ROUND(AVG(c.claimed_amount), 0) as avg_claim
      FROM claims c
      WHERE c.diagnosis IS NOT NULL
      GROUP BY c.diagnosis
      ORDER BY total_claimed DESC
      LIMIT 10
    `).all();

    // 9. IRDAI compliance thresholds
    const irdaiThresholds = {
      loss_ratio_max: 100,
      loss_ratio_warning: 85,
      tat_max_days: 30,
      settlement_rate_min: 75,
    };

    // 10. TAT (turnaround time) analysis
    const tatStats = await db.prepare(`
      SELECT
        ROUND(AVG(julianday(resolved_at) - julianday(submitted_at)), 1) as avg_tat_days,
        MIN(CAST(julianday(resolved_at) - julianday(submitted_at) AS INTEGER)) as min_tat_days,
        MAX(CAST(julianday(resolved_at) - julianday(submitted_at) AS INTEGER)) as max_tat_days,
        COUNT(CASE WHEN julianday(resolved_at) - julianday(submitted_at) <= 30 THEN 1 END) as within_30_days,
        COUNT(*) as resolved_total
      FROM claims
      WHERE resolved_at IS NOT NULL AND submitted_at IS NOT NULL
    `).first();

    const resolvedTotal = (tatStats as any)?.resolved_total || 1;
    const within30 = (tatStats as any)?.within_30_days || 0;
    const tatCompliance = Math.round(within30 * 1000 / resolvedTotal) / 10;

    const totalClaimsCount = (ytdClaims as any)?.total_claims || 0;
    const settledCount = (ytdClaims as any)?.claims_settled || 0;
    const settlementRate = totalClaimsCount > 0 ? Math.round(settledCount * 1000 / totalClaimsCount) / 10 : 0;

    return json({
      loss_ratio: {
        ytd: ytdLossRatio,
        monthly: monthlyAggregate || [],
        by_scheme: (lossRatioByScheme || []).map((r: any) => ({
          ...r,
          threshold: r.payer_scheme === 'ayushman_bharat' ? 95 : r.payer_scheme === 'cghs' ? 90 : 85,
          compliant: r.loss_ratio <= (r.payer_scheme === 'ayushman_bharat' ? 95 : r.payer_scheme === 'cghs' ? 90 : 85),
        })),
        detailed_monthly: lossRatioMonthly || [],
      },
      portfolio: {
        by_scheme: portfolioWithPct,
        by_department: byDepartment || [],
        total_claimed: totalClaimed,
      },
      high_cost_claimants: highCostClaimants || [],
      claims_summary: {
        total_claims: totalClaimsCount,
        total_claimed: (ytdClaims as any)?.total_claimed || 0,
        total_paid: ytdClaimsPaid,
        settled: settledCount,
        rejected: (ytdClaims as any)?.claims_rejected || 0,
        pending: (ytdClaims as any)?.claims_pending || 0,
        settlement_rate: settlementRate,
      },
      claims_trend: claimsTrend || [],
      premium_summary: {
        total_premium: ytdPremium,
        total_lives: (latestLives as any)?.current_lives || (ytdTotals as any)?.total_lives || 0,
        new_policies: (ytdTotals as any)?.total_new_policies || 0,
        renewals: (ytdTotals as any)?.total_renewals || 0,
        cancellations: (ytdTotals as any)?.total_cancellations || 0,
      },
      tat: {
        avg_days: (tatStats as any)?.avg_tat_days || 0,
        min_days: (tatStats as any)?.min_tat_days || 0,
        max_days: (tatStats as any)?.max_tat_days || 0,
        compliance_pct: tatCompliance,
        threshold_days: irdaiThresholds.tat_max_days,
      },
      irdai_compliance: {
        loss_ratio: {
          value: ytdLossRatio,
          threshold: irdaiThresholds.loss_ratio_max,
          warning: irdaiThresholds.loss_ratio_warning,
          status: ytdLossRatio <= irdaiThresholds.loss_ratio_warning ? 'compliant' : ytdLossRatio <= irdaiThresholds.loss_ratio_max ? 'warning' : 'breach',
        },
        tat: {
          value: tatCompliance,
          threshold: 90,
          status: tatCompliance >= 90 ? 'compliant' : tatCompliance >= 75 ? 'warning' : 'breach',
        },
        settlement_rate: {
          value: settlementRate,
          threshold: irdaiThresholds.settlement_rate_min,
          status: settlementRate >= irdaiThresholds.settlement_rate_min ? 'compliant' : 'breach',
        },
      },
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching payer analytics:', error);
    return json({ error: 'Failed to fetch payer analytics' }, 500);
  }
};
