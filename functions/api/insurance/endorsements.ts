interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const policyId = url.searchParams.get('policy_id')
    const status = url.searchParams.get('status')

    if (!db) return json({ endorsements: [], total: 0 })

    let query = `
      SELECT pe.*, p.policy_number, p.holder_name, p.scheme, u.name as approved_by_name
      FROM policy_endorsements pe
      JOIN policies p ON pe.policy_id = p.id
      LEFT JOIN users u ON pe.approved_by = u.id
      WHERE 1=1`
    const bindings: string[] = []
    if (policyId) { query += ` AND pe.policy_id = ?`; bindings.push(policyId) }
    if (status) { query += ` AND pe.status = ?`; bindings.push(status) }
    query += ` ORDER BY pe.created_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ endorsements: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching endorsements:', error)
    return json({ error: 'Failed to fetch endorsements' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      policy_id: string; endorsement_type: string; description: string;
      old_value?: string; new_value?: string; effective_date: string; premium_impact?: number
    }

    if (!body.policy_id || !body.endorsement_type || !body.description || !body.effective_date) {
      return json({ error: 'policy_id, endorsement_type, description, and effective_date are required' }, 400)
    }

    const id = `end-${Date.now()}`
    if (!db) return json({ endorsement: { id, ...body, status: 'pending' } }, 201)

    await db.prepare(
      `INSERT INTO policy_endorsements (id, policy_id, endorsement_type, description, old_value, new_value, effective_date, premium_impact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.policy_id, body.endorsement_type, body.description, body.old_value || null, body.new_value || null, body.effective_date, body.premium_impact || 0).run()

    const endorsement = await db.prepare(
      `SELECT pe.*, p.policy_number, p.holder_name FROM policy_endorsements pe JOIN policies p ON pe.policy_id = p.id WHERE pe.id = ?`
    ).bind(id).first()
    return json({ endorsement }, 201)
  } catch (error) {
    console.error('Error creating endorsement:', error)
    return json({ error: 'Failed to create endorsement' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as { id: string; status: string; approved_by?: string }

    if (!body.id || !body.status) return json({ error: 'id and status are required' }, 400)
    if (!db) return json({ endorsement: body })

    const updates = ['status = ?']
    const bindings: (string | null)[] = [body.status]

    if (body.status === 'approved') {
      updates.push('approved_at = CURRENT_TIMESTAMP')
      if (body.approved_by) { updates.push('approved_by = ?'); bindings.push(body.approved_by) }
    }

    bindings.push(body.id)
    await db.prepare(`UPDATE policy_endorsements SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const endorsement = await db.prepare('SELECT * FROM policy_endorsements WHERE id = ?').bind(body.id).first()
    return json({ endorsement })
  } catch (error) {
    console.error('Error updating endorsement:', error)
    return json({ error: 'Failed to update endorsement' }, 500)
  }
}
