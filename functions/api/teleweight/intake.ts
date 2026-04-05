// TeleWeight: Patient Weight Management Intake API
// POST /api/teleweight/intake — Submit weight management intake form
// GET /api/teleweight/intake?patient_id=X — Get patient's intake/profile
// PUT /api/teleweight/intake?patient_id=X — Update intake

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function computeBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return +(weightKg / (heightM * heightM)).toFixed(1)
}

function computeRiskFlags(
  bmi: number,
  comorbidities: string,
  currentMedications: string,
  smokingStatus: string,
  exerciseFrequency: string,
  familyHistory: string
): string[] {
  const flags: string[] = []

  if (bmi >= 30) flags.push('obesity_bmi_30_plus')
  if (bmi >= 40) flags.push('severe_obesity_bmi_40_plus')

  try {
    const comorbs = JSON.parse(comorbidities || '[]')
    if (comorbs.length > 0) {
      flags.push('has_comorbidities')
      const serious = ['diabetes', 'hypertension', 'heart_disease', 'sleep_apnea', 'pcos']
      for (const c of comorbs) {
        if (serious.some((s) => String(c).toLowerCase().includes(s))) {
          flags.push(`comorbidity_${String(c).toLowerCase().replace(/\s+/g, '_')}`)
        }
      }
    }
  } catch { /* ignore parse errors */ }

  try {
    const meds = JSON.parse(currentMedications || '[]')
    if (meds.length > 0) flags.push('on_medications')
  } catch { /* ignore parse errors */ }

  if (smokingStatus === 'current') flags.push('current_smoker')

  if (exerciseFrequency === 'sedentary') flags.push('sedentary_lifestyle')

  try {
    const fh = JSON.parse(familyHistory || '[]')
    if (fh.length > 0) flags.push('family_history_present')
  } catch { /* ignore parse errors */ }

  return flags
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const {
      patient_id, height_cm, current_weight_kg, target_weight_kg,
      dietary_preference, exercise_frequency, smoking_status, alcohol_status,
      waist_circumference_cm,
    } = body

    if (!patient_id || !height_cm || !current_weight_kg || !target_weight_kg) {
      return json({
        error: 'Missing required fields: patient_id, height_cm, current_weight_kg, target_weight_kg',
      }, 400)
    }

    const bmi = computeBmi(current_weight_kg, height_cm)
    const comorbidities = typeof body.comorbidities === 'string'
      ? body.comorbidities : JSON.stringify(body.comorbidities || [])
    const currentMedications = typeof body.current_medications === 'string'
      ? body.current_medications : JSON.stringify(body.current_medications || [])
    const allergies = typeof body.allergies === 'string'
      ? body.allergies : JSON.stringify(body.allergies || [])
    const previousWeightTreatments = typeof body.previous_weight_treatments === 'string'
      ? body.previous_weight_treatments : JSON.stringify(body.previous_weight_treatments || [])
    const familyHistory = typeof body.family_history === 'string'
      ? body.family_history : JSON.stringify(body.family_history || [])

    const riskFlags = computeRiskFlags(
      bmi, comorbidities, currentMedications,
      smoking_status || '', exercise_frequency || '', familyHistory
    )

    const id = `twp-${Date.now()}`
    const now = new Date().toISOString()

    await db.prepare(`
      INSERT INTO patient_weight_profiles (
        id, patient_id, height_cm, current_weight_kg, target_weight_kg, bmi,
        comorbidities, current_medications, allergies, previous_weight_treatments,
        dietary_preference, exercise_frequency, smoking_status, alcohol_status,
        family_history, waist_circumference_cm, risk_flags,
        intake_completed, intake_completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).bind(
      id, patient_id, height_cm, current_weight_kg, target_weight_kg, bmi,
      comorbidities, currentMedications, allergies, previousWeightTreatments,
      dietary_preference || null, exercise_frequency || null,
      smoking_status || null, alcohol_status || null,
      familyHistory, waist_circumference_cm || null, JSON.stringify(riskFlags),
      now, now, now
    ).run()

    const profile = await db.prepare(
      'SELECT * FROM patient_weight_profiles WHERE id = ?'
    ).bind(id).first()

    return json({ profile }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', profile: null }, 503)

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')

  if (!patientId) {
    return json({ error: 'Missing required query parameter: patient_id' }, 400)
  }

  try {
    const profile = await db.prepare(`
      SELECT
        pwp.*,
        p.name AS patient_name,
        p.age AS patient_age,
        p.gender AS patient_gender
      FROM patient_weight_profiles pwp
      LEFT JOIN patients p ON p.id = pwp.patient_id
      WHERE pwp.patient_id = ?
      ORDER BY pwp.created_at DESC
      LIMIT 1
    `).bind(patientId).first()

    if (!profile) {
      return json({ error: 'No intake profile found for this patient', profile: null }, 404)
    }

    return json({ profile })
  } catch (e: any) {
    return json({ error: e.message, profile: null }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')

  if (!patientId) {
    return json({ error: 'Missing required query parameter: patient_id' }, 400)
  }

  try {
    const existing = await db.prepare(
      'SELECT * FROM patient_weight_profiles WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(patientId).first() as any

    if (!existing) {
      return json({ error: 'No intake profile found for this patient' }, 404)
    }

    const body = await context.request.json() as any

    const heightCm = body.height_cm ?? existing.height_cm
    const currentWeightKg = body.current_weight_kg ?? existing.current_weight_kg
    const targetWeightKg = body.target_weight_kg ?? existing.target_weight_kg
    const comorbidities = body.comorbidities !== undefined
      ? (typeof body.comorbidities === 'string' ? body.comorbidities : JSON.stringify(body.comorbidities))
      : existing.comorbidities
    const currentMedications = body.current_medications !== undefined
      ? (typeof body.current_medications === 'string' ? body.current_medications : JSON.stringify(body.current_medications))
      : existing.current_medications
    const allergies = body.allergies !== undefined
      ? (typeof body.allergies === 'string' ? body.allergies : JSON.stringify(body.allergies))
      : existing.allergies
    const previousWeightTreatments = body.previous_weight_treatments !== undefined
      ? (typeof body.previous_weight_treatments === 'string' ? body.previous_weight_treatments : JSON.stringify(body.previous_weight_treatments))
      : existing.previous_weight_treatments
    const familyHistory = body.family_history !== undefined
      ? (typeof body.family_history === 'string' ? body.family_history : JSON.stringify(body.family_history))
      : existing.family_history
    const dietaryPreference = body.dietary_preference ?? existing.dietary_preference
    const exerciseFrequency = body.exercise_frequency ?? existing.exercise_frequency
    const smokingStatus = body.smoking_status ?? existing.smoking_status
    const alcoholStatus = body.alcohol_status ?? existing.alcohol_status
    const waistCircumferenceCm = body.waist_circumference_cm ?? existing.waist_circumference_cm

    const bmi = computeBmi(currentWeightKg, heightCm)
    const riskFlags = computeRiskFlags(
      bmi, comorbidities, currentMedications,
      smokingStatus || '', exerciseFrequency || '', familyHistory
    )
    const now = new Date().toISOString()

    await db.prepare(`
      UPDATE patient_weight_profiles SET
        height_cm = ?, current_weight_kg = ?, target_weight_kg = ?, bmi = ?,
        comorbidities = ?, current_medications = ?, allergies = ?,
        previous_weight_treatments = ?, dietary_preference = ?,
        exercise_frequency = ?, smoking_status = ?, alcohol_status = ?,
        family_history = ?, waist_circumference_cm = ?, risk_flags = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      heightCm, currentWeightKg, targetWeightKg, bmi,
      comorbidities, currentMedications, allergies,
      previousWeightTreatments, dietaryPreference,
      exerciseFrequency, smokingStatus, alcoholStatus,
      familyHistory, waistCircumferenceCm, JSON.stringify(riskFlags),
      now, existing.id
    ).run()

    const profile = await db.prepare(
      'SELECT * FROM patient_weight_profiles WHERE id = ?'
    ).bind(existing.id).first()

    return json({ profile })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
