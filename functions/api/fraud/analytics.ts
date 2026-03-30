interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: Fraud detection analytics
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    if (!db) {
      return json({ analytics: {} });
    }

    // Alert stats
    const alertStats = await db.prepare(`
      SELECT
        COUNT(*) as total_alerts,
        ROUND(AVG(risk_score), 2) as avg_risk_score,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_alerts,
        COUNT(CASE WHEN status = 'under_investigation' THEN 1 END) as investigating,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_fraud,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
      FROM fraud_alerts
    `).first();

    // Investigation stats
    const invStats = await db.prepare(`
      SELECT
        COUNT(*) as total_investigations,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_cases,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_cases,
        COALESCE(SUM(recovery_amount), 0) as total_recovery,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_priority,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
      FROM fraud_investigations
    `).first();

    // By alert type
    const { results: byType } = await db.prepare(`
      SELECT fa.alert_type, COUNT(*) as count,
             ROUND(AVG(fa.risk_score), 2) as avg_risk,
             COALESCE(SUM(c.claimed_amount), 0) as total_amount
      FROM fraud_alerts fa
      LEFT JOIN claims c ON fa.claim_id = c.id
      GROUP BY fa.alert_type
      ORDER BY count DESC
    `).all();

    // By payer scheme
    const { results: byScheme } = await db.prepare(`
      SELECT c.payer_scheme, COUNT(*) as count,
             COALESCE(SUM(c.claimed_amount), 0) as flagged_amount
      FROM fraud_alerts fa
      JOIN claims c ON fa.claim_id = c.id
      GROUP BY c.payer_scheme
      ORDER BY count DESC
    `).all();

    // Monthly trend
    const { results: monthlyTrend } = await db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month,
             COUNT(*) as alerts,
             COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed
      FROM fraud_alerts
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all();

    // Risk score distribution
    const { results: riskDist } = await db.prepare(`
      SELECT
        CASE
          WHEN risk_score >= 0.9 THEN 'Critical (90+)'
          WHEN risk_score >= 0.8 THEN 'High (80-89)'
          WHEN risk_score >= 0.7 THEN 'Medium (70-79)'
          ELSE 'Low (<70)'
        END as risk_band,
        COUNT(*) as count
      FROM fraud_alerts
      GROUP BY risk_band
      ORDER BY risk_score DESC
    `).all();

    return json({
      alerts: alertStats || {},
      investigations: invStats || {},
      by_type: byType || [],
      by_payer_scheme: byScheme || [],
      monthly_trend: monthlyTrend || [],
      risk_distribution: riskDist || [],
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching fraud analytics:', error);
    return json({ error: 'Failed to fetch fraud analytics' }, 500);
  }
};
