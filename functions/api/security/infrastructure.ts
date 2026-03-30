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
    if (!db) return json({ services: [], total: 0 })

    const { results } = await db.prepare(
      `SELECT * FROM infra_services ORDER BY
        CASE status WHEN 'degraded' THEN 1 WHEN 'down' THEN 2 WHEN 'healthy' THEN 3 WHEN 'standby' THEN 4 END,
        service_name`
    ).all()

    // Summary
    const byProvider: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let totalCost = 0
    for (const r of results || []) {
      const provider = r.provider as string
      const status = r.status as string
      byProvider[provider] = (byProvider[provider] || 0) + 1
      byStatus[status] = (byStatus[status] || 0) + 1
      totalCost += (r.monthly_cost as number) || 0
    }

    return json({
      services: results || [],
      total: results?.length || 0,
      summary: { by_provider: byProvider, by_status: byStatus, total_monthly_cost: totalCost },
    })
  } catch (error) {
    console.error('Error fetching infrastructure:', error)
    return json({ error: 'Failed to fetch infrastructure data' }, 500)
  }
}
