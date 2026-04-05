// TeleWeight: Patient Subscription Detail
// GET /api/teleweight/subscriptions/:patientId — Current subscription for a patient

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
    // Find the current active or paused subscription
    const subscription = await db.prepare(`
      SELECT s.*,
        sp.name as plan_name, sp.price_monthly, sp.price_quarterly, sp.price_annual,
        sp.features, sp.consultations_included, sp.messaging_unlimited,
        sp.nutrition_coaching, sp.priority_booking, sp.wearable_integration
      FROM patient_subscriptions s
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.patient_id = ? AND s.status IN ('active', 'paused')
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(patientId).first() as any

    if (!subscription) {
      return json({ error: 'No active subscription found for this patient', subscription: null }, 404)
    }

    // Parse plan features from JSON
    let featuresParsed = []
    try {
      featuresParsed = JSON.parse(subscription.features || '[]')
    } catch { /* keep empty */ }

    return json({
      subscription: {
        ...subscription,
        features_parsed: featuresParsed,
      },
    })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
