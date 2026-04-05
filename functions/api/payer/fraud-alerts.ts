interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const alertType = url.searchParams.get('alert_type');
    const status = url.searchParams.get('status');

    if (!db) {
      return json({ error: 'Database not available', alerts: [], summary: {}, currency: 'INR' }, 503);
    }

    let query = `SELECT fa.*, c.claim_number, c.claimed_amount, c.payer_scheme, c.payer_name,
                        c.diagnosis, p.name as patient_name,
                        u.name as investigator_name,
                        fi.id as investigation_id, fi.case_number, fi.status as investigation_status,
                        fi.priority as investigation_priority
                 FROM fraud_alerts fa
                 LEFT JOIN claims c ON fa.claim_id = c.id
                 LEFT JOIN patients p ON c.patient_id = p.id
                 LEFT JOIN users u ON fa.investigated_by = u.id
                 LEFT JOIN fraud_investigations fi ON fi.alert_id = fa.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (alertType) {
      query += ` AND fa.alert_type = ?`;
      bindings.push(alertType);
    }
    if (status) {
      query += ` AND fa.status = ?`;
      bindings.push(status);
    }

    query += ` ORDER BY fa.risk_score DESC, fa.created_at DESC LIMIT 50`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    const alerts = results || [];

    // Summary stats
    const summaryResult = await db.prepare(`
      SELECT
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN risk_score >= 0.9 THEN 1 END) as critical,
        COUNT(CASE WHEN risk_score >= 0.8 AND risk_score < 0.9 THEN 1 END) as high,
        COUNT(CASE WHEN risk_score >= 0.6 AND risk_score < 0.8 THEN 1 END) as medium,
        COUNT(CASE WHEN risk_score < 0.6 THEN 1 END) as low,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'under_investigation' THEN 1 END) as investigating,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
      FROM fraud_alerts
    `).first();

    // Total flagged amount
    const amountResult = await db.prepare(`
      SELECT COALESCE(SUM(c.claimed_amount), 0) as total_flagged_amount
      FROM fraud_alerts fa
      LEFT JOIN claims c ON fa.claim_id = c.id
      WHERE fa.status != 'resolved'
    `).first();

    // By alert type
    const { results: byType } = await db.prepare(`
      SELECT alert_type, COUNT(*) as count, AVG(risk_score) as avg_risk
      FROM fraud_alerts
      GROUP BY alert_type
      ORDER BY count DESC
    `).all();

    return json({
      alerts,
      summary: {
        ...(summaryResult || {}),
        total_flagged_amount: (amountResult as any)?.total_flagged_amount || 0,
      },
      by_type: byType || [],
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching fraud alerts:', error);
    return json({ error: 'Failed to fetch fraud alerts' }, 500);
  }
};

// PUT: Update fraud alert status, assign investigator
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      alert_id: string;
      status?: string;
      investigated_by?: string;
    };

    if (!body.alert_id) {
      return json({ error: 'alert_id is required' }, 400);
    }

    if (!db) {
      return json({ error: 'Database not available', alert: null }, 503);
    }

    const updates: string[] = [];
    const bindings: string[] = [];

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);
      if (body.status === 'resolved') {
        updates.push("resolved_at = datetime('now')");
      }
    }
    if (body.investigated_by) {
      updates.push('investigated_by = ?');
      bindings.push(body.investigated_by);
    }

    if (updates.length === 0) {
      return json({ error: 'No updates provided' }, 400);
    }

    bindings.push(body.alert_id);
    await db.prepare(
      `UPDATE fraud_alerts SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    const alert = await db.prepare(`SELECT * FROM fraud_alerts WHERE id = ?`).bind(body.alert_id).first();

    return json({ alert });
  } catch (error) {
    console.error('Error updating fraud alert:', error);
    return json({ error: 'Failed to update fraud alert' }, 500);
  }
};
