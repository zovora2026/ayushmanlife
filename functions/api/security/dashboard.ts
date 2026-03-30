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
    if (!db) {
      return json({ error: 'No database' }, 500)
    }

    // Incident summary
    const { results: incidentStats } = await db.prepare(`
      SELECT status, COUNT(*) as count FROM security_incidents GROUP BY status
    `).all()
    const incidentsByStatus: Record<string, number> = {}
    for (const r of incidentStats || []) incidentsByStatus[r.status as string] = r.count as number

    const { results: severityStats } = await db.prepare(`
      SELECT severity, COUNT(*) as count FROM security_incidents GROUP BY severity
    `).all()
    const incidentsBySeverity: Record<string, number> = {}
    for (const r of severityStats || []) incidentsBySeverity[r.severity as string] = r.count as number

    // Compliance summary
    const { results: complianceStats } = await db.prepare(`
      SELECT framework, status, COUNT(*) as count FROM compliance_checks GROUP BY framework, status
    `).all()
    const complianceByFramework: Record<string, Record<string, number>> = {}
    for (const r of complianceStats || []) {
      const fw = r.framework as string
      if (!complianceByFramework[fw]) complianceByFramework[fw] = { compliant: 0, partial: 0, non_compliant: 0 }
      complianceByFramework[fw][r.status as string] = r.count as number
    }

    const totalChecks = await db.prepare('SELECT COUNT(*) as c FROM compliance_checks').first() as any
    const compliantChecks = await db.prepare("SELECT COUNT(*) as c FROM compliance_checks WHERE status = 'compliant'").first() as any
    const complianceScore = totalChecks?.c > 0 ? Math.round((compliantChecks?.c / totalChecks.c) * 100) : 0

    // Infrastructure summary
    const { results: infraStats } = await db.prepare(`
      SELECT status, COUNT(*) as count FROM infra_services GROUP BY status
    `).all()
    const infraByStatus: Record<string, number> = {}
    for (const r of infraStats || []) infraByStatus[r.status as string] = r.count as number

    const avgUptime = await db.prepare("SELECT AVG(uptime_pct) as avg FROM infra_services WHERE environment = 'production'").first() as any

    // Cost summary (current month vs previous)
    const currentCost = await db.prepare("SELECT SUM(cost_amount) as total, SUM(budget_amount) as budget FROM cloud_costs WHERE month = '2026-03'").first() as any
    const prevCost = await db.prepare("SELECT SUM(cost_amount) as total FROM cloud_costs WHERE month = '2026-02'").first() as any
    const costTrend = prevCost?.total > 0 ? Math.round(((currentCost?.total - prevCost.total) / prevCost.total) * 100 * 10) / 10 : 0

    // DR readiness score (based on compliance checks for backup/recovery)
    const drChecks = await db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as compliant FROM compliance_checks WHERE category IN ('Business Continuity', 'Incident Response')").first() as any
    const drScore = drChecks?.total > 0 ? Math.round((drChecks.compliant / drChecks.total) * 100) : 0

    return json({
      incidents: {
        total: Object.values(incidentsByStatus).reduce((a, b) => a + b, 0),
        by_status: incidentsByStatus,
        by_severity: incidentsBySeverity,
        open_critical: await db.prepare("SELECT COUNT(*) as c FROM security_incidents WHERE severity = 'critical' AND status NOT IN ('resolved')").first().then((r: any) => r?.c || 0),
      },
      compliance: {
        score: complianceScore,
        total_checks: totalChecks?.c || 0,
        compliant: compliantChecks?.c || 0,
        by_framework: complianceByFramework,
      },
      infrastructure: {
        total_services: Object.values(infraByStatus).reduce((a, b) => a + b, 0),
        by_status: infraByStatus,
        avg_uptime: Math.round((avgUptime?.avg || 0) * 100) / 100,
      },
      costs: {
        current_month: currentCost?.total || 0,
        budget: currentCost?.budget || 0,
        variance: (currentCost?.total || 0) - (currentCost?.budget || 0),
        trend_pct: costTrend,
        currency: 'INR',
      },
      dr_readiness_score: drScore,
    })
  } catch (error) {
    console.error('Error fetching security dashboard:', error)
    return json({ error: 'Failed to fetch security dashboard' }, 500)
  }
}
