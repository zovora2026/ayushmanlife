// TeleWeight: Patient Dashboard — Aggregated view
// GET /api/teleweight/dashboard/:patientId

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

  const { patientId } = context.params as { patientId: string }

  try {
    // Verify patient exists
    const patient = await db.prepare('SELECT id, name, age, gender FROM patients WHERE id = ?').bind(patientId).first()
    if (!patient) return json({ error: 'Patient not found' }, 404)

    // Weight profile
    const profile = await db.prepare('SELECT * FROM patient_weight_profiles WHERE patient_id = ?').bind(patientId).first()

    // Weight trend (last 10 entries)
    const weightLogs = await db.prepare(`
      SELECT weight_kg, bmi, waist_cm, blood_glucose, hba1c,
        blood_pressure_systolic, blood_pressure_diastolic, notes, logged_at
      FROM weight_logs WHERE patient_id = ?
      ORDER BY logged_at DESC LIMIT 10
    `).bind(patientId).all()

    // Weight progress summary
    const weightProgress = await db.prepare(`
      SELECT
        MIN(weight_kg) as min_weight,
        MAX(weight_kg) as max_weight,
        COUNT(*) as total_entries
      FROM weight_logs WHERE patient_id = ?
    `).bind(patientId).first()

    // First and latest weight for change calculation
    const firstWeight = await db.prepare(`
      SELECT weight_kg, bmi, logged_at FROM weight_logs
      WHERE patient_id = ? ORDER BY logged_at ASC LIMIT 1
    `).bind(patientId).first() as any

    const latestWeight = await db.prepare(`
      SELECT weight_kg, bmi, logged_at FROM weight_logs
      WHERE patient_id = ? ORDER BY logged_at DESC LIMIT 1
    `).bind(patientId).first() as any

    const weightChange = firstWeight && latestWeight
      ? {
          start_weight: firstWeight.weight_kg,
          current_weight: latestWeight.weight_kg,
          change_kg: +(latestWeight.weight_kg - firstWeight.weight_kg).toFixed(1),
          start_bmi: firstWeight.bmi,
          current_bmi: latestWeight.bmi,
          bmi_change: firstWeight.bmi && latestWeight.bmi ? +(latestWeight.bmi - firstWeight.bmi).toFixed(1) : null,
          tracking_since: firstWeight.logged_at,
        }
      : null

    // Upcoming consultations
    const upcomingConsults = await db.prepare(`
      SELECT c.id, c.doctor_id, d.full_name as doctor_name, d.specialty,
        c.consultation_type, c.mode, c.status, c.scheduled_at, c.consultation_fee
      FROM consultations c
      JOIN doctors d ON c.doctor_id = d.id
      WHERE c.patient_id = ? AND c.status = 'scheduled' AND c.scheduled_at >= datetime('now')
      ORDER BY c.scheduled_at ASC
    `).bind(patientId).all()

    // Past consultations count
    const consultStats = await db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM consultations WHERE patient_id = ?
    `).bind(patientId).first()

    // Active prescriptions
    const activePrescriptions = await db.prepare(`
      SELECT p.id, p.diagnosis, p.medications, p.lifestyle_recommendations,
        p.lab_tests_ordered, p.follow_up_date, p.prescription_date, p.status,
        d.full_name as doctor_name, d.registration_number as doctor_reg_no
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      WHERE p.patient_id = ? AND p.status = 'active'
      ORDER BY p.prescription_date DESC
    `).bind(patientId).all()

    // Pharmacy orders
    const recentOrders = await db.prepare(`
      SELECT po.id, po.order_status, po.total_amount, po.payment_status,
        po.estimated_delivery_date, po.actual_delivery_date, po.tracking_number,
        pp.name as pharmacy_name, pp.city as pharmacy_city
      FROM pharmacy_orders po
      JOIN pharmacy_partners pp ON po.pharmacy_id = pp.id
      WHERE po.patient_id = ?
      ORDER BY po.created_at DESC LIMIT 5
    `).bind(patientId).all()

    // Subscription status
    const subscription = await db.prepare(`
      SELECT ps.id, ps.status, ps.start_date, ps.end_date, ps.next_payment_date,
        sp.name as plan_name, sp.price_monthly, sp.consultations_included,
        sp.features
      FROM patient_subscriptions ps
      JOIN subscription_plans sp ON ps.plan_id = sp.id
      WHERE ps.patient_id = ? AND ps.status IN ('active', 'paused')
      ORDER BY ps.start_date DESC LIMIT 1
    `).bind(patientId).first()

    // Target progress
    const targetProgress = profile && latestWeight
      ? {
          target_weight: (profile as any).target_weight_kg,
          current_weight: latestWeight.weight_kg,
          start_weight: firstWeight?.weight_kg || latestWeight.weight_kg,
          remaining_kg: +((latestWeight.weight_kg - (profile as any).target_weight_kg).toFixed(1)),
          progress_pct: firstWeight
            ? Math.min(100, Math.max(0, Math.round(
                ((firstWeight.weight_kg - latestWeight.weight_kg) /
                (firstWeight.weight_kg - (profile as any).target_weight_kg)) * 100
              )))
            : 0,
        }
      : null

    return json({
      patient,
      profile,
      weight_trend: (weightLogs.results || []).reverse(), // chronological for charts
      weight_change: weightChange,
      weight_progress: weightProgress,
      target_progress: targetProgress,
      upcoming_consultations: upcomingConsults.results || [],
      consultation_stats: consultStats,
      active_prescriptions: activePrescriptions.results || [],
      recent_pharmacy_orders: recentOrders.results || [],
      subscription,
    })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
