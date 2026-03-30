interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    if (!db) return json({ total: 0, by_status: {}, by_department: {}, by_type: {} })

    // Overall counts
    const { results: requests } = await db.prepare('SELECT * FROM enhancement_requests').all()

    const byStatus: Record<string, number> = {}
    const byDepartment: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const byModule: Record<string, number> = {}
    let totalScore = 0
    let scoredCount = 0
    let completedCount = 0
    let totalEffortHours = 0

    for (const r of requests || []) {
      byStatus[r.status as string] = (byStatus[r.status as string] || 0) + 1
      byDepartment[r.department as string] = (byDepartment[r.department as string] || 0) + 1
      byType[r.request_type as string] = (byType[r.request_type as string] || 0) + 1
      if (r.emr_module) byModule[r.emr_module as string] = (byModule[r.emr_module as string] || 0) + 1
      if (r.priority_score) { totalScore += r.priority_score as number; scoredCount++ }
      if (r.status === 'completed') completedCount++
      if (r.effort_hours) totalEffortHours += r.effort_hours as number
    }

    // Backlog aging (days since created for non-completed requests)
    const { results: aging } = await db.prepare(`
      SELECT id, title, status, priority_score,
        CAST(julianday('now') - julianday(created_at) AS INTEGER) as age_days
      FROM enhancement_requests
      WHERE status NOT IN ('completed', 'deferred')
      ORDER BY age_days DESC
    `).all()

    // Sprint summary
    const { results: sprints } = await db.prepare(`
      SELECT sprint, COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(effort_hours) as total_hours
      FROM enhancement_requests
      WHERE sprint IS NOT NULL
      GROUP BY sprint
      ORDER BY sprint
    `).all()

    // Review pipeline
    const { results: reviewStats } = await db.prepare(`
      SELECT decision, COUNT(*) as count FROM governance_reviews GROUP BY decision
    `).all()
    const reviewSummary: Record<string, number> = {}
    for (const r of reviewStats || []) {
      reviewSummary[r.decision as string] = r.count as number
    }

    return json({
      total: requests?.length || 0,
      completed: completedCount,
      avg_priority_score: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
      total_effort_hours: totalEffortHours,
      by_status: byStatus,
      by_department: byDepartment,
      by_type: byType,
      by_module: byModule,
      backlog_aging: aging || [],
      sprints: sprints || [],
      review_summary: reviewSummary,
    })
  } catch (error) {
    console.error('Error fetching governance dashboard:', error)
    return json({ error: 'Failed to fetch dashboard' }, 500)
  }
}
