interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const status = url.searchParams.get('status')
    const severity = url.searchParams.get('severity')

    if (!db) return json({ incidents: [], total: 0 })

    let query = `
      SELECT si.*, u.name as assigned_to_name
      FROM security_incidents si
      LEFT JOIN users u ON si.assigned_to = u.id
      WHERE 1=1`
    const bindings: string[] = []

    if (status) { query += ` AND si.status = ?`; bindings.push(status) }
    if (severity) { query += ` AND si.severity = ?`; bindings.push(severity) }

    query += ` ORDER BY
      CASE si.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END,
      si.detected_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ incidents: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return json({ error: 'Failed to fetch incidents' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      title: string; description?: string; severity?: string; category: string;
      source?: string; affected_system?: string; assigned_to?: string
    }

    if (!body.title || !body.category) return json({ error: 'title and category are required' }, 400)

    const id = `sec-${Date.now()}`
    if (!db) return json({ incident: { id, ...body, status: 'open', detected_at: new Date().toISOString() } }, 201)

    await db.prepare(
      `INSERT INTO security_incidents (id, title, description, severity, category, source, affected_system, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.title, body.description || null, body.severity || 'medium', body.category, body.source || null, body.affected_system || null, body.assigned_to || null).run()

    const incident = await db.prepare('SELECT * FROM security_incidents WHERE id = ?').bind(id).first()
    return json({ incident }, 201)
  } catch (error) {
    console.error('Error creating incident:', error)
    return json({ error: 'Failed to create incident' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string; status?: string; severity?: string; assigned_to?: string; resolution?: string
    }

    if (!body.id) return json({ error: 'id is required' }, 400)
    if (!db) return json({ incident: body })

    const updates: string[] = []
    const bindings: (string | null)[] = []

    if (body.status) {
      updates.push('status = ?'); bindings.push(body.status)
      if (body.status === 'resolved') updates.push('resolved_at = CURRENT_TIMESTAMP')
    }
    if (body.severity) { updates.push('severity = ?'); bindings.push(body.severity) }
    if (body.assigned_to) { updates.push('assigned_to = ?'); bindings.push(body.assigned_to) }
    if (body.resolution !== undefined) { updates.push('resolution = ?'); bindings.push(body.resolution) }

    if (updates.length === 0) return json({ error: 'No fields to update' }, 400)

    bindings.push(body.id)
    await db.prepare(`UPDATE security_incidents SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const incident = await db.prepare('SELECT * FROM security_incidents WHERE id = ?').bind(body.id).first()
    return json({ incident })
  } catch (error) {
    console.error('Error updating incident:', error)
    return json({ error: 'Failed to update incident' }, 500)
  }
}
