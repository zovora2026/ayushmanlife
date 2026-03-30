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
    const url = new URL(context.request.url)
    const projectId = url.searchParams.get('project_id')

    if (!db) {
      return json({
        summary: { total_suites: 8, total_scripts: 60, total_defects: 14 },
        script_status: { pass: 28, fail: 8, blocked: 6, not_run: 18 },
        defect_severity: { critical: 5, high: 4, medium: 3, low: 2 },
        defect_status: { open: 8, in_progress: 3, resolved: 2, closed: 1 },
        suites: [],
      })
    }

    let suiteFilter = ''
    const bindings: string[] = []
    if (projectId) {
      suiteFilter = ' WHERE ts.project_id = ?'
      bindings.push(projectId)
    }

    // Suite summary with script counts
    const suiteQuery = `
      SELECT ts.id, ts.name, ts.workstream, ts.status, ts.target_date, ts.assigned_to,
        ts.total_scripts,
        COALESCE(SUM(CASE WHEN tsc.status = 'pass' THEN 1 ELSE 0 END), 0) as passed,
        COALESCE(SUM(CASE WHEN tsc.status = 'fail' THEN 1 ELSE 0 END), 0) as failed,
        COALESCE(SUM(CASE WHEN tsc.status = 'blocked' THEN 1 ELSE 0 END), 0) as blocked,
        COALESCE(SUM(CASE WHEN tsc.status = 'not_run' THEN 1 ELSE 0 END), 0) as not_run,
        COALESCE((SELECT COUNT(*) FROM test_defects td WHERE td.suite_id = ts.id AND td.status != 'resolved' AND td.status != 'closed'), 0) as open_defects
      FROM test_suites ts
      LEFT JOIN test_scripts tsc ON tsc.suite_id = ts.id
      ${suiteFilter}
      GROUP BY ts.id
      ORDER BY ts.id`

    const suiteStmt = db.prepare(suiteQuery)
    const { results: suites } = await (bindings.length > 0 ? suiteStmt.bind(...bindings) : suiteStmt).all()

    // Overall script status counts
    const scriptStatusQuery = projectId
      ? `SELECT tsc.status, COUNT(*) as count FROM test_scripts tsc JOIN test_suites ts ON tsc.suite_id = ts.id WHERE ts.project_id = ? GROUP BY tsc.status`
      : `SELECT status, COUNT(*) as count FROM test_scripts GROUP BY status`
    const scriptStmt = db.prepare(scriptStatusQuery)
    const { results: scriptStatusRows } = await (projectId ? scriptStmt.bind(projectId) : scriptStmt).all()

    const scriptStatus: Record<string, number> = { pass: 0, fail: 0, blocked: 0, not_run: 0 }
    for (const row of scriptStatusRows || []) {
      scriptStatus[row.status as string] = row.count as number
    }

    // Defect severity counts
    const defectSevQuery = projectId
      ? `SELECT td.severity, COUNT(*) as count FROM test_defects td JOIN test_suites ts ON td.suite_id = ts.id WHERE ts.project_id = ? GROUP BY td.severity`
      : `SELECT severity, COUNT(*) as count FROM test_defects GROUP BY severity`
    const sevStmt = db.prepare(defectSevQuery)
    const { results: sevRows } = await (projectId ? sevStmt.bind(projectId) : sevStmt).all()

    const defectSeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    for (const row of sevRows || []) {
      defectSeverity[row.severity as string] = row.count as number
    }

    // Defect status counts
    const defectStatQuery = projectId
      ? `SELECT td.status, COUNT(*) as count FROM test_defects td JOIN test_suites ts ON td.suite_id = ts.id WHERE ts.project_id = ? GROUP BY td.status`
      : `SELECT status, COUNT(*) as count FROM test_defects GROUP BY status`
    const statStmt = db.prepare(defectStatQuery)
    const { results: statRows } = await (projectId ? statStmt.bind(projectId) : statStmt).all()

    const defectStatus: Record<string, number> = { open: 0, in_progress: 0, resolved: 0, closed: 0 }
    for (const row of statRows || []) {
      defectStatus[row.status as string] = row.count as number
    }

    const totalScripts = Object.values(scriptStatus).reduce((a, b) => a + b, 0)
    const totalDefects = Object.values(defectSeverity).reduce((a, b) => a + b, 0)

    return json({
      summary: {
        total_suites: suites?.length || 0,
        total_scripts: totalScripts,
        total_defects: totalDefects,
        pass_rate: totalScripts > 0 ? Math.round((scriptStatus.pass / totalScripts) * 100 * 10) / 10 : 0,
        execution_rate: totalScripts > 0 ? Math.round(((totalScripts - scriptStatus.not_run) / totalScripts) * 100 * 10) / 10 : 0,
      },
      script_status: scriptStatus,
      defect_severity: defectSeverity,
      defect_status: defectStatus,
      suites: suites || [],
    })
  } catch (error) {
    console.error('Error fetching test dashboard:', error)
    return json({ error: 'Failed to fetch test dashboard' }, 500)
  }
}
