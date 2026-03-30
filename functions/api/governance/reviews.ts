interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const requestId = url.searchParams.get('request_id')
    const committee = url.searchParams.get('committee')
    const decision = url.searchParams.get('decision')

    if (!db) return json({ reviews: [], total: 0 })

    let query = `
      SELECT gr.*, er.title as request_title, er.department, er.status as request_status,
        er.priority_score as request_priority
      FROM governance_reviews gr
      JOIN enhancement_requests er ON gr.request_id = er.id
      WHERE 1=1`
    const bindings: string[] = []

    if (requestId) { query += ` AND gr.request_id = ?`; bindings.push(requestId) }
    if (committee) { query += ` AND gr.committee = ?`; bindings.push(committee) }
    if (decision) { query += ` AND gr.decision = ?`; bindings.push(decision) }

    query += ` ORDER BY gr.created_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    // Committee summary
    const byCommittee: Record<string, { total: number; approved: number; pending: number; deferred: number }> = {}
    for (const r of results || []) {
      const c = r.committee as string
      if (!byCommittee[c]) byCommittee[c] = { total: 0, approved: 0, pending: 0, deferred: 0 }
      byCommittee[c].total++
      if (r.decision === 'approved') byCommittee[c].approved++
      if (r.decision === 'pending') byCommittee[c].pending++
      if (r.decision === 'deferred') byCommittee[c].deferred++
    }

    return json({ reviews: results || [], total: results?.length || 0, by_committee: byCommittee })
  } catch (error) {
    console.error('Error fetching governance reviews:', error)
    return json({ error: 'Failed to fetch reviews' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      request_id: string; committee: string; reviewer_id?: string; reviewer_name?: string;
      decision: string; priority_override?: number; comments?: string; meeting_date?: string
    }

    if (!body.request_id || !body.committee || !body.decision) {
      return json({ error: 'request_id, committee, and decision are required' }, 400)
    }

    const id = `rev-${Date.now()}`

    if (!db) return json({ review: { id, ...body } }, 201)

    await db.prepare(
      `INSERT INTO governance_reviews (id, request_id, committee, reviewer_id, reviewer_name, decision, priority_override, comments, meeting_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.request_id, body.committee,
      body.reviewer_id || null, body.reviewer_name || null,
      body.decision, body.priority_override || null,
      body.comments || null, body.meeting_date || null
    ).run()

    // Update request status based on decision
    if (body.decision === 'approved') {
      await db.prepare(
        `UPDATE enhancement_requests SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('submitted', 'in_review')`
      ).bind(body.request_id).run()
    } else if (body.decision === 'deferred') {
      await db.prepare(
        `UPDATE enhancement_requests SET status = 'deferred', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('submitted', 'in_review')`
      ).bind(body.request_id).run()
    }

    const review = await db.prepare(
      `SELECT gr.*, er.title as request_title, er.department
       FROM governance_reviews gr JOIN enhancement_requests er ON gr.request_id = er.id
       WHERE gr.id = ?`
    ).bind(id).first()
    return json({ review }, 201)
  } catch (error) {
    console.error('Error creating governance review:', error)
    return json({ error: 'Failed to create review' }, 500)
  }
}
