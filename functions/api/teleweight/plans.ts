// TeleWeight: Subscription Plans API
// GET /api/teleweight/plans — List active subscription plans

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', plans: [] }, 503)

  try {
    const { results } = await db.prepare(
      'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_monthly ASC'
    ).all()

    const plans = (results || []).map((plan: any) => {
      let features = []
      try {
        features = JSON.parse(plan.features || '[]')
      } catch { /* features stays empty */ }
      return { ...plan, features_parsed: features }
    })

    return json({
      plans,
      total: plans.length,
    })
  } catch (e: any) {
    return json({ error: e.message, plans: [] }, 500)
  }
}
