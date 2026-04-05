// Pre-Authorization Requests API — GET list, POST create, PUT approve/reject
interface Env { DB: D1Database; }

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available', requests: [] }, { status: 503 });

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const patientId = url.searchParams.get('patient_id');

    let query = `SELECT pa.*, p.name as patient_name, c.claim_number
                 FROM pre_auth_requests pa
                 LEFT JOIN patients p ON pa.patient_id = p.id
                 LEFT JOIN claims c ON pa.claim_id = c.id
                 WHERE 1=1`;
    const params: string[] = [];
    if (status) { query += ' AND pa.status = ?'; params.push(status); }
    if (patientId) { query += ' AND pa.patient_id = ?'; params.push(patientId); }
    query += ' ORDER BY pa.requested_at DESC';

    const { results } = await db.prepare(query).bind(...params).all();

    const summary = {
      total: results.length,
      pending: results.filter((r: Record<string, unknown>) => r.status === 'pending').length,
      approved: results.filter((r: Record<string, unknown>) => r.status === 'approved').length,
      rejected: results.filter((r: Record<string, unknown>) => r.status === 'rejected').length,
      total_estimated: results.reduce((sum: number, r: Record<string, unknown>) => sum + (r.estimated_cost as number || 0), 0),
      total_approved: results.reduce((sum: number, r: Record<string, unknown>) => sum + (r.approved_amount as number || 0), 0),
    };

    return Response.json({ requests: results, summary });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch pre-auth requests', requests: [] }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available' }, { status: 503 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const id = `pa-${Date.now()}`;
    await db.prepare(
      `INSERT INTO pre_auth_requests (id, claim_id, patient_id, policy_id, procedure_name, estimated_cost, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).bind(
      id, body.claim_id || null, body.patient_id || null, body.policy_id || null,
      body.procedure_name, body.estimated_cost || 0, body.remarks || null
    ).run();

    const req = await db.prepare('SELECT * FROM pre_auth_requests WHERE id = ?').bind(id).first();
    return Response.json({ request: req }, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Failed to create pre-auth request' }, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available' }, { status: 503 });

  try {
    const body = await request.json() as Record<string, unknown>;
    if (!body.id) return Response.json({ error: 'Pre-auth request ID required' }, { status: 400 });

    const updates: string[] = [];
    const params: unknown[] = [];

    if (body.status) { updates.push('status = ?'); params.push(body.status); }
    if (body.reviewer) { updates.push('reviewer = ?'); params.push(body.reviewer); }
    if (body.approved_amount !== undefined) { updates.push('approved_amount = ?'); params.push(body.approved_amount); }
    if (body.remarks) { updates.push('remarks = ?'); params.push(body.remarks); }
    if (body.status === 'approved' || body.status === 'rejected') {
      updates.push("decided_at = datetime('now')");
    }

    if (updates.length === 0) return Response.json({ error: 'No fields to update' }, { status: 400 });

    params.push(body.id);
    await db.prepare(
      `UPDATE pre_auth_requests SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();

    const req = await db.prepare('SELECT * FROM pre_auth_requests WHERE id = ?').bind(body.id).first();
    return Response.json({ request: req });
  } catch (err) {
    return Response.json({ error: 'Failed to update pre-auth request' }, { status: 500 });
  }
};
