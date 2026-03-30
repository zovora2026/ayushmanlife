interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: Adjudication analytics and metrics
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    if (!db) {
      return json({ analytics: {} });
    }

    // Overall adjudication stats
    const overallStats = await db.prepare(`
      SELECT
        COUNT(*) as total_adjudicated,
        COUNT(CASE WHEN action = 'approve' THEN 1 END) as approved,
        COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejected,
        COUNT(CASE WHEN action = 'partially_approve' THEN 1 END) as partially_approved,
        COALESCE(SUM(amount_approved), 0) as total_approved_amount,
        ROUND(AVG(amount_approved), 0) as avg_approved_amount,
        ROUND(100.0 * COUNT(CASE WHEN action = 'approve' THEN 1 END) / COUNT(*), 1) as approval_rate,
        ROUND(100.0 * COUNT(CASE WHEN rules_applied IS NOT NULL AND rules_applied != '' THEN 1 END) / COUNT(*), 1) as auto_adjudication_rate
      FROM claim_adjudications
    `).first();

    // Pending queue size
    const pendingStats = await db.prepare(`
      SELECT
        COUNT(*) as total_pending,
        COALESCE(SUM(claimed_amount), 0) as pending_amount,
        COALESCE(ROUND(AVG(julianday('now') - julianday(submitted_at)), 1), 0) as avg_days_in_queue
      FROM claims
      WHERE status IN ('submitted', 'under_review', 'pre_auth_pending', 'appealed')
    `).first();

    // By payer scheme
    const { results: byScheme } = await db.prepare(`
      SELECT c.payer_scheme,
             COUNT(ca.id) as total,
             COUNT(CASE WHEN ca.action = 'approve' THEN 1 END) as approved,
             COUNT(CASE WHEN ca.action = 'reject' THEN 1 END) as rejected,
             COALESCE(SUM(ca.amount_approved), 0) as total_approved_amount,
             ROUND(100.0 * COUNT(CASE WHEN ca.action = 'approve' THEN 1 END) / COUNT(*), 1) as approval_rate
      FROM claim_adjudications ca
      JOIN claims c ON ca.claim_id = c.id
      GROUP BY c.payer_scheme
      ORDER BY total DESC
    `).all();

    // Monthly trend (last 6 months)
    const { results: monthlyTrend } = await db.prepare(`
      SELECT
        strftime('%Y-%m', decision_date) as month,
        COUNT(*) as total,
        COUNT(CASE WHEN action = 'approve' THEN 1 END) as approved,
        COUNT(CASE WHEN action = 'reject' THEN 1 END) as rejected,
        COALESCE(SUM(amount_approved), 0) as amount_approved
      FROM claim_adjudications
      WHERE decision_date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', decision_date)
      ORDER BY month ASC
    `).all();

    // Rules engine performance
    const { results: rulesPerf } = await db.prepare(`
      SELECT rule_name, action, times_triggered, confidence_threshold
      FROM adjudication_rules
      WHERE enabled = 1
      ORDER BY times_triggered DESC
      LIMIT 10
    `).all();

    // Average TAT (turnaround time) for resolved claims
    const tatStats = await db.prepare(`
      SELECT
        ROUND(AVG(julianday(resolved_at) - julianday(submitted_at)), 1) as avg_tat_days,
        MIN(julianday(resolved_at) - julianday(submitted_at)) as min_tat_days,
        MAX(julianday(resolved_at) - julianday(submitted_at)) as max_tat_days
      FROM claims
      WHERE resolved_at IS NOT NULL AND submitted_at IS NOT NULL
    `).first();

    // Recent adjudications
    const { results: recent } = await db.prepare(`
      SELECT ca.*, c.claim_number, c.claimed_amount, c.payer_scheme,
             u.name as adjudicator_name
      FROM claim_adjudications ca
      JOIN claims c ON ca.claim_id = c.id
      LEFT JOIN users u ON ca.adjudicated_by = u.id
      ORDER BY ca.decision_date DESC
      LIMIT 10
    `).all();

    return json({
      overall: overallStats || {},
      pending: pendingStats || {},
      by_payer_scheme: byScheme || [],
      monthly_trend: monthlyTrend || [],
      rules_performance: rulesPerf || [],
      turnaround_time: tatStats || {},
      recent_adjudications: recent || [],
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching adjudication analytics:', error);
    return json({ error: 'Failed to fetch adjudication analytics' }, 500);
  }
};
