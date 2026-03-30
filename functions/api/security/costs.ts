interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    if (!db) return json({ costs: [], trend: [], summary: {} })

    // Monthly trend
    const { results: trend } = await db.prepare(`
      SELECT month, SUM(cost_amount) as total_cost, SUM(budget_amount) as total_budget
      FROM cloud_costs
      GROUP BY month
      ORDER BY month
    `).all()

    // By provider (current month)
    const { results: byProvider } = await db.prepare(`
      SELECT provider, SUM(cost_amount) as total_cost, SUM(budget_amount) as total_budget
      FROM cloud_costs
      WHERE month = '2026-03'
      GROUP BY provider
    `).all()

    // By category (current month)
    const { results: byCategory } = await db.prepare(`
      SELECT service_category, SUM(cost_amount) as total_cost, SUM(budget_amount) as total_budget
      FROM cloud_costs
      WHERE month = '2026-03'
      GROUP BY service_category
    `).all()

    // Detail for current month
    const { results: currentDetail } = await db.prepare(`
      SELECT * FROM cloud_costs WHERE month = '2026-03' ORDER BY cost_amount DESC
    `).all()

    // Over-budget items
    const overBudget = (currentDetail || []).filter((r: any) => r.cost_amount > r.budget_amount)

    return json({
      trend: trend || [],
      by_provider: byProvider || [],
      by_category: byCategory || [],
      current_month: currentDetail || [],
      over_budget: overBudget,
      currency: 'INR',
    })
  } catch (error) {
    console.error('Error fetching costs:', error)
    return json({ error: 'Failed to fetch cost data' }, 500)
  }
}
