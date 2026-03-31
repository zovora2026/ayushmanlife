interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const status = url.searchParams.get('status')
    const risk = url.searchParams.get('risk_level')
    const type = url.searchParams.get('change_type')

    if (!db) return json({ changes: [], total: 0 })

    let query = `SELECT cr.*,
      (SELECT COUNT(*) FROM cab_decisions cd WHERE cd.change_id = cr.id) as cab_review_count,
      (SELECT cd.decision FROM cab_decisions cd WHERE cd.change_id = cr.id ORDER BY cd.created_at DESC LIMIT 1) as cab_decision
      FROM change_requests cr WHERE 1=1`
    const bindings: string[] = []

    if (status) { query += ` AND cr.status = ?`; bindings.push(status) }
    if (risk) { query += ` AND cr.risk_level = ?`; bindings.push(risk) }
    if (type) { query += ` AND cr.change_type = ?`; bindings.push(type) }

    query += ` ORDER BY CASE cr.status
      WHEN 'draft' THEN 1 WHEN 'pending' THEN 2 WHEN 'in_review' THEN 3
      WHEN 'approved' THEN 4 WHEN 'scheduled' THEN 5 WHEN 'implemented' THEN 6
      ELSE 7 END, cr.risk_score DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ changes: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching change requests:', error)
    return json({ error: 'Failed to fetch changes' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      title: string; description?: string; change_type?: string; category?: string;
      emr_system?: string; environment?: string; risk_level?: string;
      impact_assessment?: string; rollback_plan?: string; testing_plan?: string;
      requested_by?: string; requester_name?: string; scheduled_date?: string; cab_required?: number
    }

    if (!body.title) return json({ error: 'title is required' }, 400)

    const id = `chg-${Date.now()}`
    const riskLevel = body.risk_level || 'medium'
    const riskScore = riskLevel === 'critical' ? 85 : riskLevel === 'high' ? 65 : riskLevel === 'medium' ? 40 : 15

    if (!db) return json({ change: { id, ...body, risk_score: riskScore, status: 'draft' } }, 201)

    await db.prepare(
      `INSERT INTO change_requests (id, title, description, change_type, category, emr_system, environment, risk_level, risk_score, impact_assessment, rollback_plan, testing_plan, requested_by, requester_name, scheduled_date, cab_required)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.title, body.description || null, body.change_type || 'normal',
      body.category || null, body.emr_system || null, body.environment || 'production',
      riskLevel, riskScore, body.impact_assessment || null, body.rollback_plan || null,
      body.testing_plan || null, body.requested_by || null, body.requester_name || null,
      body.scheduled_date || null, body.cab_required ?? 1
    ).run()

    const change = await db.prepare('SELECT * FROM change_requests WHERE id = ?').bind(id).first()
    return json({ change }, 201)
  } catch (error) {
    console.error('Error creating change request:', error)
    return json({ error: 'Failed to create change' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string; status?: string; assigned_to?: string; assignee_name?: string;
      scheduled_date?: string; implementation_notes?: string; risk_level?: string; cab_meeting_id?: string
    }

    if (!body.id) return json({ error: 'id is required' }, 400)
    if (!db) return json({ change: body })

    const updates = ['updated_at = CURRENT_TIMESTAMP']
    const bindings: (string | number | null)[] = []

    if (body.status) { updates.push('status = ?'); bindings.push(body.status) }
    if (body.status === 'implemented') { updates.push('implemented_at = CURRENT_TIMESTAMP') }
    if (body.title !== undefined) { updates.push('title = ?'); bindings.push(body.title) }
    if (body.description !== undefined) { updates.push('description = ?'); bindings.push(body.description) }
    if (body.impact_assessment !== undefined) { updates.push('impact_assessment = ?'); bindings.push(body.impact_assessment) }
    if (body.rollback_plan !== undefined) { updates.push('rollback_plan = ?'); bindings.push(body.rollback_plan) }
    if (body.testing_plan !== undefined) { updates.push('testing_plan = ?'); bindings.push(body.testing_plan) }
    if (body.category !== undefined) { updates.push('category = ?'); bindings.push(body.category) }
    if (body.assigned_to !== undefined) { updates.push('assigned_to = ?'); bindings.push(body.assigned_to) }
    if (body.assignee_name !== undefined) { updates.push('assignee_name = ?'); bindings.push(body.assignee_name) }
    if (body.scheduled_date !== undefined) { updates.push('scheduled_date = ?'); bindings.push(body.scheduled_date) }
    if (body.implementation_notes) { updates.push('implementation_notes = ?'); bindings.push(body.implementation_notes) }
    if (body.risk_level) {
      updates.push('risk_level = ?'); bindings.push(body.risk_level)
      const score = body.risk_level === 'critical' ? 85 : body.risk_level === 'high' ? 65 : body.risk_level === 'medium' ? 40 : 15
      updates.push('risk_score = ?'); bindings.push(score)
    }
    if (body.cab_meeting_id !== undefined) { updates.push('cab_meeting_id = ?'); bindings.push(body.cab_meeting_id) }

    bindings.push(body.id)
    await db.prepare(`UPDATE change_requests SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const change = await db.prepare('SELECT * FROM change_requests WHERE id = ?').bind(body.id).first()
    return json({ change })
  } catch (error) {
    console.error('Error updating change request:', error)
    return json({ error: 'Failed to update change' }, 500)
  }
}
