interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const status = url.searchParams.get('status')
    const department = url.searchParams.get('department')
    const type = url.searchParams.get('type')

    if (!db) return json({ requests: [], total: 0 })

    let query = `SELECT er.*,
      (SELECT COUNT(*) FROM governance_reviews gr WHERE gr.request_id = er.id) as review_count,
      (SELECT COUNT(*) FROM governance_reviews gr WHERE gr.request_id = er.id AND gr.decision = 'approved') as approved_count
      FROM enhancement_requests er WHERE 1=1`
    const bindings: string[] = []

    if (status) { query += ` AND er.status = ?`; bindings.push(status) }
    if (department) { query += ` AND er.department = ?`; bindings.push(department) }
    if (type) { query += ` AND er.request_type = ?`; bindings.push(type) }

    query += ` ORDER BY er.priority_score DESC, er.created_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ requests: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching enhancement requests:', error)
    return json({ error: 'Failed to fetch requests' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      title: string; description?: string; department: string; requested_by?: string;
      requester_name?: string; request_type?: string; emr_module?: string;
      clinical_impact?: number; operational_impact?: number; regulatory_impact?: number;
      effort_estimate?: string; effort_hours?: number
    }

    if (!body.title || !body.department) {
      return json({ error: 'title and department are required' }, 400)
    }

    const id = `enh-${Date.now()}`
    const clinical = body.clinical_impact || 0
    const operational = body.operational_impact || 0
    const regulatory = body.regulatory_impact || 0
    const priorityScore = Math.round((clinical * 4 + operational * 3 + regulatory * 3) / 10 * 10)

    if (!db) return json({ request: { id, ...body, priority_score: priorityScore, status: 'submitted' } }, 201)

    await db.prepare(
      `INSERT INTO enhancement_requests (id, title, description, department, requested_by, requester_name, request_type, emr_module, priority_score, clinical_impact, operational_impact, regulatory_impact, effort_estimate, effort_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.title, body.description || null, body.department,
      body.requested_by || null, body.requester_name || null,
      body.request_type || 'enhancement', body.emr_module || null,
      priorityScore, clinical, operational, regulatory,
      body.effort_estimate || null, body.effort_hours || null
    ).run()

    const request = await db.prepare('SELECT * FROM enhancement_requests WHERE id = ?').bind(id).first()
    return json({ request }, 201)
  } catch (error) {
    console.error('Error creating enhancement request:', error)
    return json({ error: 'Failed to create request' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string; status?: string; assigned_to?: string; assignee_name?: string;
      sprint?: string; target_date?: string; priority_score?: number;
      effort_estimate?: string; effort_hours?: number
    }

    if (!body.id) return json({ error: 'id is required' }, 400)
    if (!db) return json({ request: body })

    const updates = ['updated_at = CURRENT_TIMESTAMP']
    const bindings: (string | number | null)[] = []

    if (body.status) { updates.push('status = ?'); bindings.push(body.status) }
    if (body.status === 'completed') { updates.push('completed_at = CURRENT_TIMESTAMP') }
    if (body.assigned_to !== undefined) { updates.push('assigned_to = ?'); bindings.push(body.assigned_to) }
    if (body.assignee_name !== undefined) { updates.push('assignee_name = ?'); bindings.push(body.assignee_name) }
    if (body.sprint !== undefined) { updates.push('sprint = ?'); bindings.push(body.sprint) }
    if (body.target_date !== undefined) { updates.push('target_date = ?'); bindings.push(body.target_date) }
    if (body.priority_score !== undefined) { updates.push('priority_score = ?'); bindings.push(body.priority_score) }
    if (body.effort_estimate !== undefined) { updates.push('effort_estimate = ?'); bindings.push(body.effort_estimate) }
    if (body.effort_hours !== undefined) { updates.push('effort_hours = ?'); bindings.push(body.effort_hours) }

    bindings.push(body.id)
    await db.prepare(`UPDATE enhancement_requests SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const request = await db.prepare('SELECT * FROM enhancement_requests WHERE id = ?').bind(body.id).first()
    return json({ request })
  } catch (error) {
    console.error('Error updating enhancement request:', error)
    return json({ error: 'Failed to update request' }, 500)
  }
}
