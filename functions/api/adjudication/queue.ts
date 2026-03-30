interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: Claims queue for adjudication — pending, submitted, under_review
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const payerScheme = url.searchParams.get('payer_scheme');
    const sortBy = url.searchParams.get('sort') || 'submitted_at';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!db) {
      return json({ claims: [], summary: {}, queue_stats: {} });
    }

    // Build query for adjudication queue
    let query = `SELECT c.id, c.claim_number, c.patient_id, p.name as patient_name,
                        c.payer_scheme, c.payer_name, c.policy_number,
                        c.diagnosis, c.diagnosis_codes, c.procedure_codes,
                        c.claimed_amount, c.approved_amount, c.status,
                        c.admission_date, c.discharge_date,
                        c.submitted_at, c.resolved_at, c.rejection_reason,
                        c.ai_coding_confidence, c.ai_completeness_score,
                        julianday('now') - julianday(c.submitted_at) as days_pending,
                        (SELECT COUNT(*) FROM fraud_alerts fa WHERE fa.claim_id = c.id AND fa.status != 'resolved') as active_fraud_alerts,
                        (SELECT MAX(fa.risk_score) FROM fraud_alerts fa WHERE fa.claim_id = c.id) as max_fraud_score
                 FROM claims c
                 LEFT JOIN patients p ON c.patient_id = p.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (status) {
      query += ` AND c.status = ?`;
      bindings.push(status);
    } else {
      // Default: show claims needing adjudication
      query += ` AND c.status IN ('submitted', 'under_review', 'pre_auth_pending', 'appealed')`;
    }

    if (payerScheme) {
      query += ` AND c.payer_scheme = ?`;
      bindings.push(payerScheme);
    }

    // Sort
    const validSorts: Record<string, string> = {
      submitted_at: 'c.submitted_at ASC',
      amount_desc: 'c.claimed_amount DESC',
      amount_asc: 'c.claimed_amount ASC',
      fraud_score: 'max_fraud_score DESC',
      days_pending: 'days_pending DESC',
    };
    query += ` ORDER BY ${validSorts[sortBy] || validSorts.submitted_at}`;
    query += ` LIMIT ${Math.min(limit, 100)}`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    const claims = results || [];

    // Queue summary stats
    const statsResult = await db.prepare(`
      SELECT
        COUNT(*) as total_pending,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'pre_auth_pending' THEN 1 END) as pre_auth_pending,
        COUNT(CASE WHEN status = 'appealed' THEN 1 END) as appealed,
        COALESCE(SUM(claimed_amount), 0) as total_amount_pending,
        COALESCE(ROUND(AVG(julianday('now') - julianday(submitted_at)), 1), 0) as avg_days_pending
      FROM claims
      WHERE status IN ('submitted', 'under_review', 'pre_auth_pending', 'appealed')
    `).first();

    // By payer scheme
    const { results: byScheme } = await db.prepare(`
      SELECT payer_scheme, COUNT(*) as count, SUM(claimed_amount) as total_amount
      FROM claims
      WHERE status IN ('submitted', 'under_review', 'pre_auth_pending', 'appealed')
      GROUP BY payer_scheme
      ORDER BY count DESC
    `).all();

    return json({
      claims,
      queue_stats: statsResult || {},
      by_payer_scheme: byScheme || [],
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching adjudication queue:', error);
    return json({ error: 'Failed to fetch adjudication queue' }, 500);
  }
};
