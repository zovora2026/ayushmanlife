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
    const projectId = url.searchParams.get('project_id')

    if (!db) {
      return json({ suites: [], total: 0 })
    }

    let query = `
      SELECT ts.*,
        COALESCE(SUM(CASE WHEN tsc.status = 'pass' THEN 1 ELSE 0 END), 0) as passed,
        COALESCE(SUM(CASE WHEN tsc.status = 'fail' THEN 1 ELSE 0 END), 0) as failed,
        COALESCE(SUM(CASE WHEN tsc.status = 'blocked' THEN 1 ELSE 0 END), 0) as blocked,
        COALESCE(SUM(CASE WHEN tsc.status = 'not_run' THEN 1 ELSE 0 END), 0) as not_run
      FROM test_suites ts
      LEFT JOIN test_scripts tsc ON tsc.suite_id = ts.id
      WHERE 1=1`
    const bindings: string[] = []

    if (projectId) {
      query += ` AND ts.project_id = ?`
      bindings.push(projectId)
    }

    query += ` GROUP BY ts.id ORDER BY ts.name`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ suites: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching test suites:', error)
    return json({ error: 'Failed to fetch test suites' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      project_id: string
      name: string
      workstream: string
      description?: string
      assigned_to?: string
      target_date?: string
    }

    if (!body.name || !body.workstream) {
      return json({ error: 'name and workstream are required' }, 400)
    }

    const id = `ts-${Date.now()}`

    if (!db) {
      return json({ suite: { id, ...body, status: 'not_started', total_scripts: 0, created_at: new Date().toISOString() } }, 201)
    }

    await db.prepare(
      `INSERT INTO test_suites (id, project_id, name, workstream, description, assigned_to, target_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.project_id || null, body.name, body.workstream, body.description || null, body.assigned_to || null, body.target_date || null).run()

    const suite = await db.prepare('SELECT * FROM test_suites WHERE id = ?').bind(id).first()
    return json({ suite }, 201)
  } catch (error) {
    console.error('Error creating test suite:', error)
    return json({ error: 'Failed to create test suite' }, 500)
  }
}
