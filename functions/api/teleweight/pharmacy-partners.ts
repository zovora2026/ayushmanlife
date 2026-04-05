// TeleWeight: Pharmacy Partners API
// GET /api/teleweight/pharmacy-partners — List partner pharmacies with filters

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', pharmacies: [] }, 503)

  const url = new URL(context.request.url)
  const city = url.searchParams.get('city')
  const state = url.searchParams.get('state')
  const pincode = url.searchParams.get('pincode')

  let query = 'SELECT * FROM pharmacy_partners WHERE is_active = 1'
  const binds: unknown[] = []

  if (city) {
    query += ' AND LOWER(city) = LOWER(?)'
    binds.push(city)
  }
  if (state) {
    query += ' AND LOWER(state) = LOWER(?)'
    binds.push(state)
  }
  if (pincode) {
    query += ' AND pincode = ?'
    binds.push(pincode)
  }

  query += ' ORDER BY name ASC'

  try {
    const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
    const { results } = await stmt.all()
    const pharmacies = results || []

    // Compute summary
    const cities = [...new Set(pharmacies.map((p: any) => p.city))]
    const states = [...new Set(pharmacies.map((p: any) => p.state))]
    const avgDeliveryDays = pharmacies.length > 0
      ? +(pharmacies.reduce((sum: number, p: any) => sum + (p.avg_delivery_days || 0), 0) / pharmacies.length).toFixed(1)
      : 0

    return json({
      pharmacies,
      total: pharmacies.length,
      summary: {
        total_active: pharmacies.length,
        cities,
        states,
        avg_delivery_days: avgDeliveryDays,
      },
    })
  } catch (e: any) {
    return json({ error: e.message, pharmacies: [] }, 500)
  }
}
