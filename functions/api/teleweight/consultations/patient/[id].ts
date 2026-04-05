// TeleWeight: Patient Consultation History
// GET /api/teleweight/consultations/patient/:id — Patient's consultation history

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

  try {
    // Verify patient exists
    const patient = await db.prepare('SELECT id, name FROM patients WHERE id = ?').bind(id).first()
    if (!patient) return json({ error: 'Patient not found' }, 404)

    const { results } = await db.prepare(`
      SELECT c.*,
        d.full_name as doctor_name,
        d.specialty as doctor_specialty
      FROM consultations c
      LEFT JOIN doctors d ON c.doctor_id = d.id
      WHERE c.patient_id = ?
      ORDER BY c.scheduled_at DESC
    `).bind(id).all()

    const consultations = results || []

    return json({
      patient_id: id,
      patient_name: (patient as any).name,
      consultations,
      total: consultations.length,
    })
  } catch (e: any) {
    return json({ error: e.message, consultations: [] }, 500)
  }
}
