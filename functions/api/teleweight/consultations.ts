// TeleWeight: Consultations API
// GET /api/teleweight/consultations — List consultations with filters
// POST /api/teleweight/consultations — Book a new consultation
// PUT /api/teleweight/consultations?id=X — Update consultation status

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

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')
  const doctorId = url.searchParams.get('doctor_id')
  const status = url.searchParams.get('status')

  let query = `
    SELECT c.*,
      p.name as patient_name,
      d.full_name as doctor_name,
      d.specialty as doctor_specialty,
      d.registration_number as doctor_registration_number
    FROM consultations c
    LEFT JOIN patients p ON c.patient_id = p.id
    LEFT JOIN doctors d ON c.doctor_id = d.id
    WHERE 1=1
  `
  const binds: unknown[] = []

  if (patientId) {
    query += ' AND c.patient_id = ?'
    binds.push(patientId)
  }
  if (doctorId) {
    query += ' AND c.doctor_id = ?'
    binds.push(doctorId)
  }
  if (status) {
    query += ' AND c.status = ?'
    binds.push(status)
  }

  query += ' ORDER BY c.scheduled_at DESC'

  try {
    const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
    const { results } = await stmt.all()
    const consultations = results || []

    // Compute summary
    const byStatus: Record<string, number> = {}
    let totalRevenue = 0
    for (const c of consultations as any[]) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1
      if (c.status === 'completed') {
        totalRevenue += c.consultation_fee || 0
      }
    }

    return json({
      consultations,
      total: consultations.length,
      summary: {
        total: consultations.length,
        by_status: byStatus,
        total_revenue: totalRevenue,
      },
    })
  } catch (e: any) {
    return json({ error: e.message, consultations: [] }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const {
      patient_id, doctor_id, consultation_type, mode, scheduled_at,
      patient_consent_telemedicine, patient_consent_data_sharing,
    } = body

    // Validate required fields
    if (!patient_id || !doctor_id || !consultation_type || !mode || !scheduled_at) {
      return json({
        error: 'Missing required fields: patient_id, doctor_id, consultation_type, mode, scheduled_at',
      }, 400)
    }

    // Validate consultation_type
    if (!['initial', 'follow_up'].includes(consultation_type)) {
      return json({ error: 'consultation_type must be "initial" or "follow_up"' }, 400)
    }

    // Validate mode
    if (!['video', 'audio', 'chat'].includes(mode)) {
      return json({ error: 'mode must be "video", "audio", or "chat"' }, 400)
    }

    // Telemedicine Practice Guidelines 2020: first consultation must be video
    if (consultation_type === 'initial' && mode !== 'video') {
      return json({
        error: 'First consultation must be video as per Telemedicine Practice Guidelines 2020',
      }, 400)
    }

    // Consent validation
    if (patient_consent_telemedicine !== 1 && patient_consent_telemedicine !== true) {
      return json({ error: 'Patient must consent to telemedicine (patient_consent_telemedicine must be 1)' }, 400)
    }
    if (patient_consent_data_sharing !== 1 && patient_consent_data_sharing !== true) {
      return json({ error: 'Patient must consent to data sharing (patient_consent_data_sharing must be 1)' }, 400)
    }

    // Look up doctor's consultation fee
    const doctor = await db.prepare('SELECT id, full_name, consultation_fee FROM doctors WHERE id = ?')
      .bind(doctor_id).first() as any
    if (!doctor) return json({ error: 'Doctor not found' }, 404)

    // Look up patient
    const patient = await db.prepare('SELECT id, name FROM patients WHERE id = ?')
      .bind(patient_id).first() as any
    if (!patient) return json({ error: 'Patient not found' }, 404)

    const consultationFee = doctor.consultation_fee
    const platformFee = Math.round(consultationFee * 0.25 * 100) / 100
    const doctorPayout = Math.round(consultationFee * 0.75 * 100) / 100

    const id = `consult-${Date.now()}`

    await db.prepare(`
      INSERT INTO consultations (
        id, patient_id, doctor_id, consultation_type, mode, status,
        scheduled_at, consultation_fee, platform_fee, doctor_payout,
        patient_consent_telemedicine, patient_consent_data_sharing,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      id, patient_id, doctor_id, consultation_type, mode,
      scheduled_at, consultationFee, platformFee, doctorPayout,
      patient_consent_telemedicine ? 1 : 0,
      patient_consent_data_sharing ? 1 : 0
    ).run()

    const consultation = await db.prepare('SELECT * FROM consultations WHERE id = ?').bind(id).first()

    return json({
      consultation,
      doctor_name: doctor.full_name,
      patient_name: patient.name,
    }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  const url = new URL(context.request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing consultation id query parameter' }, 400)

  try {
    const existing = await db.prepare('SELECT * FROM consultations WHERE id = ?').bind(id).first() as any
    if (!existing) return json({ error: 'Consultation not found' }, 404)

    const body = await context.request.json() as any
    const { status, consultation_notes, follow_up_recommended, follow_up_weeks, cancelled_by, cancellation_reason } = body

    const updates: string[] = []
    const binds: unknown[] = []

    // Status transitions
    if (status) {
      if (status === 'in_progress' && existing.status === 'scheduled') {
        updates.push('status = ?', 'started_at = datetime(\'now\')')
        binds.push('in_progress')
      } else if (status === 'completed' && existing.status === 'in_progress') {
        // Compute duration
        const startedAt = existing.started_at ? new Date(existing.started_at).getTime() : Date.now()
        const durationMinutes = Math.round((Date.now() - startedAt) / 60000)
        updates.push('status = ?', 'ended_at = datetime(\'now\')', 'duration_minutes = ?')
        binds.push('completed', durationMinutes)
      } else if (status === 'cancelled') {
        updates.push('status = ?')
        binds.push('cancelled')
        if (cancelled_by) {
          updates.push('cancelled_by = ?')
          binds.push(cancelled_by)
        }
        if (cancellation_reason) {
          updates.push('cancellation_reason = ?')
          binds.push(cancellation_reason)
        }
      } else if (status !== existing.status) {
        return json({
          error: `Invalid status transition from "${existing.status}" to "${status}"`,
        }, 400)
      }
    }

    // Optional field updates
    if (consultation_notes !== undefined) {
      updates.push('consultation_notes = ?')
      binds.push(consultation_notes)
    }
    if (follow_up_recommended !== undefined) {
      updates.push('follow_up_recommended = ?')
      binds.push(follow_up_recommended ? 1 : 0)
    }
    if (follow_up_weeks !== undefined) {
      updates.push('follow_up_weeks = ?')
      binds.push(follow_up_weeks)
    }

    if (updates.length === 0) {
      return json({ error: 'No valid fields to update' }, 400)
    }

    updates.push('updated_at = datetime(\'now\')')
    binds.push(id)

    await db.prepare(`UPDATE consultations SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...binds).run()

    const updated = await db.prepare('SELECT * FROM consultations WHERE id = ?').bind(id).first()
    return json({ consultation: updated })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
