interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const meetingId = url.searchParams.get('meeting_id')

    if (!db) return json({ meetings: [], decisions: [], total: 0 })

    if (meetingId) {
      // Get specific meeting with its decisions
      const meeting = await db.prepare('SELECT * FROM cab_meetings WHERE id = ?').bind(meetingId).first()
      const { results: decisions } = await db.prepare(`
        SELECT cd.*, cr.title as change_title, cr.risk_level, cr.risk_score, cr.change_type
        FROM cab_decisions cd
        JOIN change_requests cr ON cd.change_id = cr.id
        WHERE cd.meeting_id = ?
        ORDER BY cr.risk_score DESC
      `).bind(meetingId).all()
      return json({ meeting, decisions: decisions || [] })
    }

    // List all meetings
    const { results: meetings } = await db.prepare(`
      SELECT cm.*,
        (SELECT COUNT(*) FROM cab_decisions cd WHERE cd.meeting_id = cm.id) as decision_count,
        (SELECT COUNT(*) FROM cab_decisions cd WHERE cd.meeting_id = cm.id AND cd.decision = 'approved') as approved_count
      FROM cab_meetings cm
      ORDER BY cm.meeting_date DESC
    `).all()

    return json({ meetings: meetings || [], total: meetings?.length || 0 })
  } catch (error) {
    console.error('Error fetching CAB data:', error)
    return json({ error: 'Failed to fetch CAB data' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      type: 'meeting' | 'decision';
      // Meeting fields
      meeting_date?: string; meeting_type?: string; chair_name?: string; agenda?: string; attendees?: string;
      // Decision fields
      meeting_id?: string; change_id?: string; decision?: string; conditions?: string; risk_accepted?: number; voter_summary?: string
    }

    if (body.type === 'meeting') {
      if (!body.meeting_date) return json({ error: 'meeting_date is required' }, 400)
      const id = `cab-${Date.now()}`
      if (!db) return json({ meeting: { id, ...body, status: 'scheduled' } }, 201)

      await db.prepare(
        `INSERT INTO cab_meetings (id, meeting_date, meeting_type, chair_name, agenda, attendees)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, body.meeting_date, body.meeting_type || 'regular', body.chair_name || null, body.agenda || null, body.attendees || null).run()

      const meeting = await db.prepare('SELECT * FROM cab_meetings WHERE id = ?').bind(id).first()
      return json({ meeting }, 201)
    }

    if (body.type === 'decision') {
      if (!body.meeting_id || !body.change_id || !body.decision) {
        return json({ error: 'meeting_id, change_id, and decision are required' }, 400)
      }
      const id = `dec-${Date.now()}`
      if (!db) return json({ decision: { id, ...body } }, 201)

      await db.prepare(
        `INSERT INTO cab_decisions (id, meeting_id, change_id, decision, conditions, risk_accepted, voter_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, body.meeting_id, body.change_id, body.decision, body.conditions || null, body.risk_accepted || 0, body.voter_summary || null).run()

      // Update change request status based on decision
      if (body.decision === 'approved') {
        await db.prepare(
          `UPDATE change_requests SET status = 'approved', cab_meeting_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(body.meeting_id, body.change_id).run()
      } else if (body.decision === 'rejected') {
        await db.prepare(
          `UPDATE change_requests SET status = 'rejected', cab_meeting_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(body.meeting_id, body.change_id).run()
      }

      const decision = await db.prepare(
        `SELECT cd.*, cr.title as change_title FROM cab_decisions cd JOIN change_requests cr ON cd.change_id = cr.id WHERE cd.id = ?`
      ).bind(id).first()
      return json({ decision }, 201)
    }

    return json({ error: 'type must be meeting or decision' }, 400)
  } catch (error) {
    console.error('Error creating CAB record:', error)
    return json({ error: 'Failed to create CAB record' }, 500)
  }
}
