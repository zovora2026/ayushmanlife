// TeleWeight: Doctor Schedule / Consultation List
// GET /api/teleweight/consultations/doctor/:id — Doctor's consultation schedule

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', consultations: [] }, 503)

  const { id } = context.params as { id: string }

  const url = new URL(context.request.url)
  const status = url.searchParams.get('status')
  const dateFrom = url.searchParams.get('date_from')
  const dateTo = url.searchParams.get('date_to')

  try {
    // Verify doctor exists
    const doctor = await db.prepare('SELECT id, full_name FROM doctors WHERE id = ?').bind(id).first()
    if (!doctor) return json({ error: 'Doctor not found' }, 404)

    let query = `
      SELECT c.*,
        p.name as patient_name
      FROM consultations c
      LEFT JOIN patients p ON c.patient_id = p.id
      WHERE c.doctor_id = ?
    `
    const binds: unknown[] = [id]

    if (status) {
      query += ' AND c.status = ?'
      binds.push(status)
    }
    if (dateFrom) {
      query += ' AND c.scheduled_at >= ?'
      binds.push(dateFrom)
    }
    if (dateTo) {
      query += ' AND c.scheduled_at <= ?'
      binds.push(dateTo)
    }

    query += ' ORDER BY c.scheduled_at'

    const stmt = db.prepare(query).bind(...binds)
    const { results } = await stmt.all()
    const consultations = results || []

    return json({
      doctor_id: id,
      doctor_name: (doctor as any).full_name,
      consultations,
      total: consultations.length,
    })
  } catch (e: any) {
    return json({ error: e.message, consultations: [] }, 500)
  }
}
