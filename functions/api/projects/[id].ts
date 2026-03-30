interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: Project detail with team, milestones summary, budget, latest messages
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const id = context.params.id as string;

    if (!db) {
      return json({ error: 'Database not available' }, 503);
    }

    // Project detail
    const project = await db.prepare(`
      SELECT p.*,
             (SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id AND pa.status = 'active') as active_team_size
      FROM projects p WHERE p.id = ?
    `).bind(id).first();

    if (!project) {
      return json({ error: 'Project not found' }, 404);
    }

    // Team (assignments with consultant details)
    const { results: team } = await db.prepare(`
      SELECT pa.*, u.name as consultant_name, u.department, u.email, u.phone
      FROM project_assignments pa
      LEFT JOIN users u ON pa.consultant_id = u.id
      WHERE pa.project_id = ?
      ORDER BY pa.status ASC, pa.start_date ASC
    `).bind(id).all();

    // Milestones summary
    const milestoneSummary = await db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started,
        COUNT(CASE WHEN rag_status = 'red' THEN 1 END) as red,
        COUNT(CASE WHEN rag_status = 'amber' THEN 1 END) as amber,
        COUNT(CASE WHEN rag_status = 'green' THEN 1 END) as green,
        ROUND(AVG(percentage_complete), 0) as avg_completion
      FROM project_milestones WHERE project_id = ?
    `).bind(id).first();

    // Budget calculation from assignments
    const budgetCalc = await db.prepare(`
      SELECT
        COALESCE(SUM(
          pa.rate_per_day * (pa.utilization_pct / 100.0) *
          CASE
            WHEN pa.end_date IS NOT NULL THEN MAX(0, julianday(MIN(pa.end_date, date('now'))) - julianday(pa.start_date))
            ELSE MAX(0, julianday(date('now')) - julianday(pa.start_date))
          END
        ), 0) as actual_spend,
        COALESCE(SUM(
          pa.rate_per_day * (pa.utilization_pct / 100.0) *
          CASE
            WHEN pa.end_date IS NOT NULL THEN MAX(0, julianday(pa.end_date) - julianday(pa.start_date))
            ELSE 180
          END
        ), 0) as projected_total,
        COALESCE(AVG(pa.rate_per_day), 0) as avg_daily_rate,
        SUM(pa.utilization_pct) as total_utilization
      FROM project_assignments pa
      WHERE pa.project_id = ? AND pa.status = 'active'
    `).bind(id).first();

    const budget = (project as any).budget || 0;
    const actualSpend = (budgetCalc as any)?.actual_spend || 0;
    const projectedTotal = (budgetCalc as any)?.projected_total || 0;

    // Documents count
    const docCount = await db.prepare(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN document_type = 'sow' THEN 1 END) as sows,
             COUNT(CASE WHEN document_type = 'status_report' THEN 1 END) as status_reports
      FROM project_documents WHERE project_id = ?
    `).bind(id).first();

    // Recent messages (last 5)
    const { results: recentMessages } = await db.prepare(`
      SELECT * FROM project_messages
      WHERE project_id = ?
      ORDER BY created_at DESC LIMIT 5
    `).bind(id).all();

    return json({
      project,
      team: team || [],
      milestones_summary: milestoneSummary || {},
      budget: {
        budgeted: budget,
        actual_spend: Math.round(actualSpend),
        projected_total: Math.round(projectedTotal),
        variance: Math.round(budget - projectedTotal),
        burn_rate_pct: budget > 0 ? Math.round(actualSpend * 1000 / budget) / 10 : 0,
        avg_daily_rate: Math.round((budgetCalc as any)?.avg_daily_rate || 0),
      },
      documents_count: docCount || {},
      recent_messages: (recentMessages || []).reverse(),
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return json({ error: 'Failed to fetch project detail' }, 500);
  }
};

// PUT: Update project status
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const id = context.params.id as string;
    const body = (await context.request.json()) as { status?: string; description?: string };

    if (!db) {
      return json({ project: { id, ...body } });
    }

    const updates: string[] = [];
    const bindings: string[] = [];
    if (body.status) { updates.push('status = ?'); bindings.push(body.status); }
    if (body.description) { updates.push('description = ?'); bindings.push(body.description); }

    if (updates.length === 0) {
      return json({ error: 'No updates provided' }, 400);
    }

    bindings.push(id);
    await db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
    const project = await db.prepare(`SELECT * FROM projects WHERE id = ?`).bind(id).first();

    return json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return json({ error: 'Failed to update project' }, 500);
  }
};
