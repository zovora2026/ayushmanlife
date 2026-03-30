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
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')

    if (!db) {
      return json({ scripts: [], total: 0 })
    }

    let query = `
      SELECT tsc.*, ts.name as suite_name, ts.workstream,
        (SELECT COUNT(*) FROM test_defects td WHERE td.script_id = tsc.id AND td.status NOT IN ('resolved', 'closed')) as open_defects
      FROM test_scripts tsc
      JOIN test_suites ts ON tsc.suite_id = ts.id
      WHERE 1=1`
    const bindings: string[] = []

    if (suiteId) {
      query += ` AND tsc.suite_id = ?`
      bindings.push(suiteId)
    }
    if (status) {
      query += ` AND tsc.status = ?`
      bindings.push(status)
    }
    if (priority) {
      query += ` AND tsc.priority = ?`
      bindings.push(priority)
    }

    query += ` ORDER BY tsc.id`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    return json({ scripts: results || [], total: results?.length || 0 })
  } catch (error) {
    console.error('Error fetching test scripts:', error)
    return json({ error: 'Failed to fetch test scripts' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      suite_id: string
      title: string
      description?: string
      preconditions?: string
      steps?: string
      expected_result?: string
      assigned_to?: string
      tester_name?: string
      priority?: string
    }

    if (!body.suite_id || !body.title) {
      return json({ error: 'suite_id and title are required' }, 400)
    }

    const id = `scr-${Date.now()}`

    if (!db) {
      return json({ script: { id, ...body, status: 'not_run', created_at: new Date().toISOString() } }, 201)
    }

    await db.prepare(
      `INSERT INTO test_scripts (id, suite_id, title, description, preconditions, steps, expected_result, assigned_to, tester_name, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.suite_id, body.title, body.description || null, body.preconditions || null,
      body.steps || null, body.expected_result || null, body.assigned_to || null,
      body.tester_name || null, body.priority || 'medium'
    ).run()

    // Update suite total_scripts count
    await db.prepare(
      `UPDATE test_suites SET total_scripts = (SELECT COUNT(*) FROM test_scripts WHERE suite_id = ?) WHERE id = ?`
    ).bind(body.suite_id, body.suite_id).run()

    const script = await db.prepare('SELECT * FROM test_scripts WHERE id = ?').bind(id).first()
    return json({ script }, 201)
  } catch (error) {
    console.error('Error creating test script:', error)
    return json({ error: 'Failed to create test script' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string
      status?: string
      notes?: string
      tester_name?: string
      assigned_to?: string
    }

    if (!body.id) {
      return json({ error: 'id is required' }, 400)
    }

    if (!db) {
      return json({ script: { id: body.id, ...body } })
    }

    const updates: string[] = []
    const bindings: (string | null)[] = []

    if (body.status) {
      updates.push('status = ?')
      bindings.push(body.status)
      if (['pass', 'fail', 'blocked'].includes(body.status)) {
        updates.push('execution_date = CURRENT_TIMESTAMP')
      }
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?')
      bindings.push(body.notes)
    }
    if (body.tester_name) {
      updates.push('tester_name = ?')
      bindings.push(body.tester_name)
    }
    if (body.assigned_to) {
      updates.push('assigned_to = ?')
      bindings.push(body.assigned_to)
    }

    if (updates.length === 0) {
      return json({ error: 'No fields to update' }, 400)
    }

    bindings.push(body.id)
    await db.prepare(`UPDATE test_scripts SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const script = await db.prepare('SELECT * FROM test_scripts WHERE id = ?').bind(body.id).first()
    return json({ script })
  } catch (error) {
    console.error('Error updating test script:', error)
    return json({ error: 'Failed to update test script' }, 500)
  }
}
