interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    if (!db) {
      return json({
        total_tickets: 0,
        by_status: [],
        by_priority: [],
        by_category: [],
        sla_compliance: { total: 0, breached: 0, compliance_pct: 0 },
        avg_resolution_hours: 0,
        recent_activity: [],
      });
    }

    // Get ticket counts by status
    const byStatus = await db
      .prepare(
        `SELECT status, COUNT(*) as count FROM tickets GROUP BY status ORDER BY count DESC`
      )
      .all();

    // Get ticket counts by priority
    const byPriority = await db
      .prepare(
        `SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority ORDER BY
          CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END`
      )
      .all();

    // Get ticket counts by category
    const byCategory = await db
      .prepare(
        `SELECT category, COUNT(*) as count FROM tickets GROUP BY category ORDER BY count DESC`
      )
      .all();

    // SLA compliance: check which tickets have breached based on time elapsed
    const slaResult = await db
      .prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN sla_breached = 1 THEN 1 ELSE 0 END) as breached_stored,
          SUM(CASE
            WHEN status IN ('open', 'in-progress', 'escalated')
              AND (julianday('now') - julianday(created_at)) * 24 > sla_hours
            THEN 1 ELSE 0 END) as breached_computed,
          SUM(CASE
            WHEN status IN ('resolved', 'closed')
              AND resolved_at IS NOT NULL
              AND (julianday(resolved_at) - julianday(created_at)) * 24 <= sla_hours
            THEN 1 ELSE 0 END) as resolved_within_sla
        FROM tickets`
      )
      .first();

    const total = (slaResult?.total as number) || 0;
    const breachedStored = (slaResult?.breached_stored as number) || 0;
    const breachedComputed = (slaResult?.breached_computed as number) || 0;
    const breached = Math.max(breachedStored, breachedComputed);
    const compliancePct = total > 0 ? Math.round(((total - breached) / total) * 100) : 0;

    // Average resolution time for resolved tickets
    const avgRes = await db
      .prepare(
        `SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg_hours
         FROM tickets WHERE resolved_at IS NOT NULL`
      )
      .first();

    // Recent ticket activity (last 10 updated)
    const recentActivity = await db
      .prepare(
        `SELECT t.id, t.ticket_number, t.title, t.status, t.priority, t.category,
                t.updated_at, u.name as assigned_to_name
         FROM tickets t
         LEFT JOIN users u ON t.assigned_to = u.id
         ORDER BY t.updated_at DESC LIMIT 10`
      )
      .all();

    // Tickets opened per day (last 7 days)
    const dailyTrend = await db
      .prepare(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM tickets
         GROUP BY DATE(created_at)
         ORDER BY date DESC LIMIT 7`
      )
      .all();

    return json({
      total_tickets: total,
      by_status: byStatus.results || [],
      by_priority: byPriority.results || [],
      by_category: byCategory.results || [],
      sla_compliance: {
        total,
        breached,
        compliant: total - breached,
        compliance_pct: compliancePct,
      },
      avg_resolution_hours: Math.round(((avgRes?.avg_hours as number) || 0) * 10) / 10,
      recent_activity: recentActivity.results || [],
      daily_trend: dailyTrend.results || [],
    });
  } catch (error) {
    console.error('Error fetching ticket analytics:', error);
    return json({ error: 'Failed to fetch ticket analytics' }, 500);
  }
};
