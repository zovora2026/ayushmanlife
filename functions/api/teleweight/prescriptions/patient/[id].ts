// TeleWeight: Patient Prescriptions
// GET /api/teleweight/prescriptions/patient/:id — Patient's prescription history

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', prescriptions: [] }, 503)

  const { id } = context.params as { id: string }

  try {
    // Verify patient exists
    const patient = await db.prepare('SELECT id, name FROM patients WHERE id = ?').bind(id).first()
    if (!patient) return json({ error: 'Patient not found' }, 404)

    const { results } = await db.prepare(`
      SELECT pr.*,
        d.full_name as doctor_name,
        d.specialty as doctor_specialty,
        d.registration_number as doctor_registration_number
      FROM prescriptions pr
      LEFT JOIN doctors d ON pr.doctor_id = d.id
      WHERE pr.patient_id = ?
      ORDER BY pr.prescription_date DESC
    `).bind(id).all()

    const prescriptions = results || []

    return json({
      patient_id: id,
      patient_name: (patient as any).name,
      prescriptions,
      total: prescriptions.length,
    })
  } catch (e: any) {
    return json({ error: e.message, prescriptions: [] }, 500)
  }
}
