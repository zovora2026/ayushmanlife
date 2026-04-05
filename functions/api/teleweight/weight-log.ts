// TeleWeight: Weight Tracking Log API
// POST /api/teleweight/weight-log — Log weight/vitals entry
// GET /api/teleweight/weight-log?patient_id=X — Weight history with trends
// GET /api/teleweight/weight-log?patient_id=X&chart=1 — Chart-ready weekly data

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const { patient_id, weight_kg } = body

    if (!patient_id || !weight_kg) {
      return json({ error: 'Missing required fields: patient_id, weight_kg' }, 400)
    }

    // Fetch patient's height from their weight profile
    const profile = await db.prepare(
      'SELECT id, height_cm FROM patient_weight_profiles WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(patient_id).first() as any

    if (!profile) {
      return json({
        error: 'No intake profile found for this patient. Complete intake first.',
      }, 404)
    }

    const bmi = computeBmi(weight_kg, profile.height_cm)
    const id = `twl-${Date.now()}`
    const now = new Date().toISOString()

    await db.prepare(`
      INSERT INTO weight_logs (
        id, patient_id, weight_kg, bmi, waist_cm,
        blood_glucose, hba1c, blood_pressure_systolic, blood_pressure_diastolic,
        notes, logged_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, patient_id, weight_kg, bmi,
      body.waist_cm || null,
      body.blood_glucose || null,
      body.hba1c || null,
      body.blood_pressure_systolic || null,
      body.blood_pressure_diastolic || null,
      body.notes || null,
      now, now
    ).run()

    // Update current_weight_kg and bmi in the patient's weight profile
    await db.prepare(`
      UPDATE patient_weight_profiles
      SET current_weight_kg = ?, bmi = ?, updated_at = ?
      WHERE id = ?
    `).bind(weight_kg, bmi, now, profile.id).run()

    const log = await db.prepare(
      'SELECT * FROM weight_logs WHERE id = ?'
    ).bind(id).first()

    return json({ log }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', logs: [] }, 503)

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')
  const chartMode = url.searchParams.get('chart') === '1'

  if (!patientId) {
    return json({ error: 'Missing required query parameter: patient_id' }, 400)
  }

  try {
    if (chartMode) {
      // Chart-ready weekly aggregation
      const { results } = await db.prepare(`
        SELECT
          strftime('%Y-%W', logged_at) AS week,
          MIN(DATE(logged_at)) AS week_start,
          ROUND(AVG(weight_kg), 1) AS avg_weight,
          ROUND(AVG(bmi), 1) AS avg_bmi,
          ROUND(AVG(blood_glucose), 1) AS avg_glucose,
          ROUND(AVG(blood_pressure_systolic), 0) AS avg_bp_systolic,
          COUNT(*) AS entries
        FROM weight_logs
        WHERE patient_id = ?
        GROUP BY strftime('%Y-%W', logged_at)
        ORDER BY week ASC
      `).bind(patientId).all()

      const dataPoints = results || []

      return json({
        chart_data: dataPoints.map((row: any) => ({
          date: row.week_start,
          avg_weight: row.avg_weight,
          avg_bmi: row.avg_bmi,
          avg_glucose: row.avg_glucose,
          avg_bp_systolic: row.avg_bp_systolic,
          entries: row.entries,
        })),
        total_weeks: dataPoints.length,
        patient_id: patientId,
      })
    }

    // Standard history with trends
    const { results } = await db.prepare(`
      SELECT * FROM weight_logs
      WHERE patient_id = ?
      ORDER BY logged_at DESC
    `).bind(patientId).all()

    const logs = results || []

    // Compute trends from first to latest entry
    let trend = null
    if (logs.length >= 2) {
      const latest = logs[0] as any
      const earliest = logs[logs.length - 1] as any

      trend = {
        weight_change: +(latest.weight_kg - earliest.weight_kg).toFixed(1),
        bmi_change: +(latest.bmi - earliest.bmi).toFixed(1),
        entries_count: logs.length,
        date_range: {
          first: earliest.logged_at,
          latest: latest.logged_at,
        },
      }
    } else if (logs.length === 1) {
      trend = {
        weight_change: 0,
        bmi_change: 0,
        entries_count: 1,
        date_range: {
          first: (logs[0] as any).logged_at,
          latest: (logs[0] as any).logged_at,
        },
      }
    }

    return json({ logs, total: logs.length, trend })
  } catch (e: any) {
    return json({ error: e.message, logs: [] }, 500)
  }
}
