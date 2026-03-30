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
    const suiteId = url.searchParams.get('suite_id')
    const severity = url.searchParams.get('severity')
    const status = url.searchParams.get('status')
    const scriptId = url.searchParams.get('script_id')

    if (!db) {
      return json({ defects: [], total: 0 })
    }

    let query = `
      SELECT td.*, ts.name as suite_name, tsc.title as script_title
      FROM test_defects td
      LEFT JOIN test_suites ts ON td.suite_id = ts.id
      LEFT JOIN test_scripts tsc ON td.script_id = tsc.id
      WHERE 1=1`
    const bindings: string[] = []

    if (suiteId) {
      query += ` AND td.suite_id = ?`
      bindings.push(suiteId)
    }
    if (severity) {
      query += ` AND td.severity = ?`
      bindings.push(severity)
    }
    if (status) {
      query += ` AND td.status = ?`
      bindings.push(status)
    }
    if (scriptId) {
      query += ` AND td.script_id = ?`
      bindings.push(scriptId)
    }

    query += ` ORDER BY
      CASE td.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END,
      td.created_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ defects: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching test defects:', error)
    return json({ error: 'Failed to fetch test defects' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      script_id?: string
      suite_id: string
      title: string
      description?: string
      severity?: string
      assigned_to?: string
      reporter?: string
    }

    if (!body.title || !body.suite_id) {
      return json({ error: 'title and suite_id are required' }, 400)
    }

    const id = `def-${Date.now()}`

    if (!db) {
      return json({ defect: { id, ...body, status: 'open', created_at: new Date().toISOString() } }, 201)
    }

    await db.prepare(
      `INSERT INTO test_defects (id, script_id, suite_id, title, description, severity, assigned_to, reporter)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.script_id || null, body.suite_id, body.title,
      body.description || null, body.severity || 'medium',
      body.assigned_to || null, body.reporter || null
    ).run()

    const defect = await db.prepare('SELECT * FROM test_defects WHERE id = ?').bind(id).first()
    return json({ defect }, 201)
  } catch (error) {
    console.error('Error creating test defect:', error)
    return json({ error: 'Failed to create test defect' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string
      status?: string
      severity?: string
      assigned_to?: string
      resolution?: string
    }

    if (!body.id) {
      return json({ error: 'id is required' }, 400)
    }

    if (!db) {
      return json({ defect: { id: body.id, ...body } })
    }

    const updates: string[] = []
    const bindings: (string | null)[] = []

    if (body.status) {
      updates.push('status = ?')
      bindings.push(body.status)
      if (body.status === 'resolved' || body.status === 'closed') {
        updates.push('resolved_at = CURRENT_TIMESTAMP')
      }
    }
    if (body.severity) {
      updates.push('severity = ?')
      bindings.push(body.severity)
    }
    if (body.assigned_to) {
      updates.push('assigned_to = ?')
      bindings.push(body.assigned_to)
    }
    if (body.resolution !== undefined) {
      updates.push('resolution = ?')
      bindings.push(body.resolution)
    }

    if (updates.length === 0) {
      return json({ error: 'No fields to update' }, 400)
    }

    bindings.push(body.id)
    await db.prepare(`UPDATE test_defects SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const defect = await db.prepare('SELECT * FROM test_defects WHERE id = ?').bind(body.id).first()
    return json({ defect })
  } catch (error) {
    console.error('Error updating test defect:', error)
    return json({ error: 'Failed to update test defect' }, 500)
  }
}
