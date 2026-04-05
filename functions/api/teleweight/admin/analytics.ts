// TeleWeight: Admin Analytics
// GET /api/teleweight/admin/analytics — Platform-wide metrics

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

  try {
    // Consultation metrics
    const consultMetrics = await db.prepare(`
      SELECT
        COUNT(*) as total_consultations,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN consultation_fee ELSE 0 END) as total_consultation_revenue,
        SUM(CASE WHEN status = 'completed' THEN platform_fee ELSE 0 END) as total_platform_fees,
        SUM(CASE WHEN status = 'completed' THEN doctor_payout ELSE 0 END) as total_doctor_payouts,
        AVG(CASE WHEN status = 'completed' THEN duration_minutes END) as avg_duration_minutes,
        COUNT(DISTINCT patient_id) as unique_patients,
        COUNT(DISTINCT doctor_id) as active_doctors
      FROM consultations
    `).first()

    // Doctor utilization
    const doctorUtilization = await db.prepare(`
      SELECT d.id, d.full_name, d.specialty, d.consultation_fee, d.rating,
        COUNT(c.id) as total_consultations,
        COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_consultations,
        SUM(CASE WHEN c.status = 'completed' THEN c.consultation_fee ELSE 0 END) as revenue_generated,
        AVG(CASE WHEN c.status = 'completed' THEN c.duration_minutes END) as avg_session_minutes
      FROM doctors d
      LEFT JOIN consultations c ON d.id = c.doctor_id
      WHERE d.is_active = 1
      GROUP BY d.id
      ORDER BY completed_consultations DESC
    `).all()

    // Subscription metrics
    const subMetrics = await db.prepare(`
      SELECT
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN ps.status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN ps.status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN ps.status = 'paused' THEN 1 END) as paused
      FROM patient_subscriptions ps
    `).first()

    // Revenue by plan
    const revenueByPlan = await db.prepare(`
      SELECT sp.name as plan_name, sp.price_monthly,
        COUNT(ps.id) as subscriber_count,
        COUNT(CASE WHEN ps.status = 'active' THEN 1 END) as active_count,
        SUM(CASE WHEN ps.status = 'active' THEN sp.price_monthly ELSE 0 END) as monthly_recurring_revenue
      FROM subscription_plans sp
      LEFT JOIN patient_subscriptions ps ON sp.id = ps.plan_id
      GROUP BY sp.id
      ORDER BY sp.price_monthly ASC
    `).all()

    // Pharmacy order metrics
    const pharmacyMetrics = await db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN order_status = 'dispatched' THEN 1 END) as in_transit,
        COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_pharmacy_revenue
      FROM pharmacy_orders
    `).first()

    // Patient intake stats
    const intakeStats = await db.prepare(`
      SELECT
        COUNT(*) as total_profiles,
        COUNT(CASE WHEN intake_completed = 1 THEN 1 END) as intake_completed,
        COUNT(CASE WHEN intake_completed = 0 THEN 1 END) as intake_pending,
        AVG(bmi) as avg_bmi,
        AVG(current_weight_kg) as avg_weight
      FROM patient_weight_profiles
    `).first()

    // BMI distribution
    const bmiDistribution = await db.prepare(`
      SELECT
        COUNT(CASE WHEN bmi < 25 THEN 1 END) as normal,
        COUNT(CASE WHEN bmi >= 25 AND bmi < 30 THEN 1 END) as overweight,
        COUNT(CASE WHEN bmi >= 30 AND bmi < 35 THEN 1 END) as obese_class1,
        COUNT(CASE WHEN bmi >= 35 AND bmi < 40 THEN 1 END) as obese_class2,
        COUNT(CASE WHEN bmi >= 40 THEN 1 END) as obese_class3
      FROM patient_weight_profiles WHERE bmi IS NOT NULL
    `).first()

    // Prescription stats
    const rxStats = await db.prepare(`
      SELECT
        COUNT(*) as total_prescriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'dispensed' THEN 1 END) as dispensed,
        COUNT(CASE WHEN is_controlled_substance = 1 THEN 1 END) as controlled_substance_count
      FROM prescriptions
    `).first()

    // Consent compliance
    const consentStats = await db.prepare(`
      SELECT
        consent_type,
        COUNT(*) as total,
        COUNT(CASE WHEN consent_given = 1 THEN 1 END) as consented,
        COUNT(CASE WHEN withdrawn_at IS NOT NULL THEN 1 END) as withdrawn
      FROM consent_audit_log
      GROUP BY consent_type
    `).all()

    // Monthly consultation trend (last 6 months)
    const monthlyTrend = await db.prepare(`
      SELECT
        strftime('%Y-%m', scheduled_at) as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        SUM(CASE WHEN status = 'completed' THEN consultation_fee ELSE 0 END) as revenue
      FROM consultations
      GROUP BY strftime('%Y-%m', scheduled_at)
      ORDER BY month DESC
      LIMIT 6
    `).all()

    // Total revenue calculation
    const totalRevenue = {
      consultation_fees: (consultMetrics as any)?.total_platform_fees || 0,
      subscription_mrr: (revenueByPlan.results || []).reduce((sum: number, p: any) => sum + (p.monthly_recurring_revenue || 0), 0),
      pharmacy_commissions: Math.round(((pharmacyMetrics as any)?.total_pharmacy_revenue || 0) * 0.08), // ~8% commission
    }

    return json({
      overview: {
        total_patients: (intakeStats as any)?.total_profiles || 0,
        active_subscriptions: (subMetrics as any)?.active || 0,
        total_consultations: (consultMetrics as any)?.total_consultations || 0,
        total_revenue: totalRevenue.consultation_fees + totalRevenue.subscription_mrr + totalRevenue.pharmacy_commissions,
        currency: 'INR',
      },
      consultation_metrics: consultMetrics,
      doctor_utilization: doctorUtilization.results || [],
      subscription_metrics: {
        ...subMetrics,
        by_plan: revenueByPlan.results || [],
      },
      pharmacy_metrics: pharmacyMetrics,
      patient_stats: {
        ...intakeStats,
        bmi_distribution: bmiDistribution,
      },
      prescription_stats: rxStats,
      consent_compliance: consentStats.results || [],
      monthly_trend: (monthlyTrend.results || []).reverse(),
      revenue_breakdown: totalRevenue,
    })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
