// TeleWeight: Prescriptions API
// GET /api/teleweight/prescriptions — List prescriptions with filters
// POST /api/teleweight/prescriptions — Doctor creates a prescription

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

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')
  const doctorId = url.searchParams.get('doctor_id')
  const status = url.searchParams.get('status')

  let query = `
    SELECT pr.*,
      p.name as patient_name,
      d.full_name as doctor_name,
      d.registration_number as doctor_registration_number
    FROM prescriptions pr
    LEFT JOIN patients p ON pr.patient_id = p.id
    LEFT JOIN doctors d ON pr.doctor_id = d.id
    WHERE 1=1
  `
  const binds: unknown[] = []

  if (patientId) {
    query += ' AND pr.patient_id = ?'
    binds.push(patientId)
  }
  if (doctorId) {
    query += ' AND pr.doctor_id = ?'
    binds.push(doctorId)
  }
  if (status) {
    query += ' AND pr.status = ?'
    binds.push(status)
  }

  query += ' ORDER BY pr.prescription_date DESC'

  try {
    const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
    const { results } = await stmt.all()
    const prescriptions = results || []

    return json({
      prescriptions,
      total: prescriptions.length,
    })
  } catch (e: any) {
    return json({ error: e.message, prescriptions: [] }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const {
      consultation_id, patient_id, doctor_id, diagnosis, medications,
      lifestyle_recommendations, lab_tests_ordered, follow_up_date,
      special_instructions,
    } = body

    // Validate required fields
    if (!consultation_id || !patient_id || !doctor_id || !diagnosis || !medications) {
      return json({
        error: 'Missing required fields: consultation_id, patient_id, doctor_id, diagnosis, medications',
      }, 400)
    }

    // Look up doctor registration number
    const doctor = await db.prepare('SELECT id, full_name, registration_number FROM doctors WHERE id = ?')
      .bind(doctor_id).first() as any
    if (!doctor) return json({ error: 'Doctor not found' }, 404)

    // Verify patient exists
    const patient = await db.prepare('SELECT id, name FROM patients WHERE id = ?')
      .bind(patient_id).first() as any
    if (!patient) return json({ error: 'Patient not found' }, 404)

    // Verify consultation exists
    const consultation = await db.prepare('SELECT id FROM consultations WHERE id = ?')
      .bind(consultation_id).first()
    if (!consultation) return json({ error: 'Consultation not found' }, 404)

    // Check for controlled substances (Schedule H1)
    let isControlledSubstance = 0
    try {
      const meds = typeof medications === 'string' ? JSON.parse(medications) : medications
      if (Array.isArray(meds)) {
        for (const med of meds) {
          if (med.schedule_category === 'Schedule H1') {
            isControlledSubstance = 1
            break
          }
        }
      }
    } catch {
      // medications is not valid JSON array, proceed without controlled substance check
    }

    const id = `rx-${Date.now()}`
    const prescriptionDate = new Date().toISOString().split('T')[0]
    const medicationsJson = typeof medications === 'string' ? medications : JSON.stringify(medications)
    const lifestyleJson = lifestyle_recommendations
      ? (typeof lifestyle_recommendations === 'string' ? lifestyle_recommendations : JSON.stringify(lifestyle_recommendations))
      : null
    const labTestsJson = lab_tests_ordered
      ? (typeof lab_tests_ordered === 'string' ? lab_tests_ordered : JSON.stringify(lab_tests_ordered))
      : null

    await db.prepare(`
      INSERT INTO prescriptions (
        id, consultation_id, patient_id, doctor_id, doctor_registration_number,
        prescription_date, diagnosis, medications, lifestyle_recommendations,
        lab_tests_ordered, follow_up_date, special_instructions,
        is_controlled_substance, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))
    `).bind(
      id, consultation_id, patient_id, doctor_id, doctor.registration_number,
      prescriptionDate, diagnosis, medicationsJson, lifestyleJson,
      labTestsJson, follow_up_date || null, special_instructions || null,
      isControlledSubstance
    ).run()

    const prescription = await db.prepare('SELECT * FROM prescriptions WHERE id = ?').bind(id).first()

    return json({ prescription }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
