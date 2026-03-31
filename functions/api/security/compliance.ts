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
    const framework = url.searchParams.get('framework')

    if (!db) return json({ checks: [], total: 0 })

    let query = `SELECT * FROM compliance_checks WHERE 1=1`
    const bindings: string[] = []

    if (framework) { query += ` AND framework = ?`; bindings.push(framework) }

    query += ` ORDER BY framework, control_id`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    // Summary per framework
    const summary: Record<string, { total: number; compliant: number; partial: number; non_compliant: number; score: number }> = {}
    for (const r of results || []) {
      const fw = r.framework as string
      if (!summary[fw]) summary[fw] = { total: 0, compliant: 0, partial: 0, non_compliant: 0, score: 0 }
      summary[fw].total++
      if (r.status === 'compliant') summary[fw].compliant++
      else if (r.status === 'partial') summary[fw].partial++
      else summary[fw].non_compliant++
    }
    for (const fw of Object.keys(summary)) {
      summary[fw].score = summary[fw].total > 0 ? Math.round((summary[fw].compliant / summary[fw].total) * 100) : 0
    }

    return json({ checks: results || [], total: results?.length || 0, summary })
  } catch (error) {
    console.error('Error fetching compliance:', error)
    return json({ error: 'Failed to fetch compliance data' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string
      status?: string
      notes?: string
      evidence?: string
      next_review?: string
    }

    if (!body.id) return json({ error: 'id is required' }, 400)
    if (!db) return json({ check: body })

    const updates: string[] = []
    const bindings: (string | null)[] = []

    const validStatuses = ['compliant', 'partial', 'non_compliant']
    if (body.status) {
      if (!validStatuses.includes(body.status)) return json({ error: 'Invalid status' }, 400)
      updates.push('status = ?'); bindings.push(body.status)
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?'); bindings.push(body.notes)
    }
    if (body.evidence !== undefined) {
      updates.push('evidence = ?'); bindings.push(body.evidence)
    }
    if (body.next_review !== undefined) {
      updates.push('next_review = ?'); bindings.push(body.next_review)
    }
    updates.push('last_checked = CURRENT_TIMESTAMP')

    if (updates.length <= 1) return json({ error: 'At least one field to update' }, 400)

    bindings.push(body.id)
    await db.prepare(`UPDATE compliance_checks SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const check = await db.prepare('SELECT * FROM compliance_checks WHERE id = ?').bind(body.id).first()
    return json({ check, message: 'Compliance control updated' })
  } catch (error) {
    console.error('Error updating compliance:', error)
    return json({ error: 'Failed to update compliance control' }, 500)
  }
}
