interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    if (!db) return json({ total: 0, by_status: {}, by_risk: {}, by_type: {} })

    const { results: changes } = await db.prepare('SELECT * FROM change_requests').all()

    const byStatus: Record<string, number> = {}
    const byRisk: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    let implementedCount = 0
    let incidentCount = 0
    let emergencyCount = 0

    for (const c of changes || []) {
      byStatus[c.status as string] = (byStatus[c.status as string] || 0) + 1
      byRisk[c.risk_level as string] = (byRisk[c.risk_level as string] || 0) + 1
      byType[c.change_type as string] = (byType[c.change_type as string] || 0) + 1
      if (c.category) byCategory[c.category as string] = (byCategory[c.category as string] || 0) + 1
      if (c.status === 'implemented') implementedCount++
      if (c.change_type === 'emergency') emergencyCount++
    }

    // Upcoming changes
    const { results: upcoming } = await db.prepare(`
      SELECT id, title, risk_level, risk_score, scheduled_date, change_type, status
      FROM change_requests
      WHERE status IN ('approved', 'scheduled') AND scheduled_date IS NOT NULL
      ORDER BY scheduled_date ASC
    `).all()

    // CAB meetings
    const { results: cabStats } = await db.prepare(`
      SELECT status, COUNT(*) as count FROM cab_meetings GROUP BY status
    `).all()
    const cabSummary: Record<string, number> = {}
    for (const r of cabStats || []) cabSummary[r.status as string] = r.count as number

    // Recent implementations
    const { results: recent } = await db.prepare(`
      SELECT id, title, risk_level, implemented_at, implementation_notes
      FROM change_requests
      WHERE status = 'implemented'
      ORDER BY implemented_at DESC LIMIT 5
    `).all()

    return json({
      total: changes?.length || 0,
      implemented: implementedCount,
      emergency_count: emergencyCount,
      incident_count: incidentCount,
      success_rate: changes?.length ? Math.round((implementedCount / changes.length) * 100) : 0,
      by_status: byStatus,
      by_risk: byRisk,
      by_type: byType,
      by_category: byCategory,
      upcoming: upcoming || [],
      cab_summary: cabSummary,
      recent_implementations: recent || [],
    })
  } catch (error) {
    console.error('Error fetching change dashboard:', error)
    return json({ error: 'Failed to fetch dashboard' }, 500)
  }
}
