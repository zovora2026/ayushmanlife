// TeleWeight: Doctor Detail + Slots
// GET /api/teleweight/doctors/:id — Doctor profile detail

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  const { id } = context.params as { id: string }

  try {
    const doctor = await db.prepare('SELECT * FROM doctors WHERE id = ?').bind(id).first()
    if (!doctor) return json({ error: 'Doctor not found' }, 404)

    // Get recent consultation stats
    const stats = await db.prepare(`
      SELECT
        COUNT(*) as total_consultations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as upcoming,
        AVG(CASE WHEN status = 'completed' THEN duration_minutes END) as avg_duration
      FROM consultations WHERE doctor_id = ?
    `).bind(id).first()

    // Get upcoming schedule
    const upcoming = await db.prepare(`
      SELECT c.id, c.patient_id, p.name as patient_name, c.consultation_type,
        c.mode, c.status, c.scheduled_at, c.consultation_fee
      FROM consultations c
      LEFT JOIN patients p ON c.patient_id = p.id
      WHERE c.doctor_id = ? AND c.status = 'scheduled' AND c.scheduled_at >= datetime('now')
      ORDER BY c.scheduled_at LIMIT 10
    `).bind(id).all()

    return json({
      doctor,
      consultation_stats: stats,
      upcoming_appointments: upcoming.results || [],
    })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
