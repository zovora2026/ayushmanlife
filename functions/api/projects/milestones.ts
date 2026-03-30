interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List milestones for a project
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const projectId = url.searchParams.get('project_id');

    if (!db) {
      return json({ milestones: [], summary: {} });
    }

    let query = `SELECT * FROM project_milestones WHERE 1=1`;
    const bindings: string[] = [];

    if (projectId) {
      query += ` AND project_id = ?`;
      bindings.push(projectId);
    }

    query += ` ORDER BY target_date ASC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();

    // Summary
    const milestones = results || [];
    const summary = {
      total: milestones.length,
      completed: milestones.filter((m: any) => m.status === 'completed').length,
      in_progress: milestones.filter((m: any) => m.status === 'in_progress').length,
      not_started: milestones.filter((m: any) => m.status === 'not_started').length,
      red: milestones.filter((m: any) => m.rag_status === 'red').length,
      amber: milestones.filter((m: any) => m.rag_status === 'amber').length,
      green: milestones.filter((m: any) => m.rag_status === 'green').length,
      avg_completion: milestones.length > 0
        ? Math.round(milestones.reduce((sum: number, m: any) => sum + (m.percentage_complete || 0), 0) / milestones.length)
        : 0,
    };

    return json({ milestones, summary });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return json({ error: 'Failed to fetch milestones' }, 500);
  }
};

// POST: Create or update milestone
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      id?: string;
      project_id: string;
      title: string;
      description?: string;
      target_date?: string;
      actual_date?: string;
      status?: string;
      rag_status?: string;
      percentage_complete?: number;
      owner?: string;
    };

    if (!db) {
      return json({ milestone: { id: `ms-${Date.now()}`, ...body } }, 201);
    }

    if (!body.project_id || !body.title) {
      return json({ error: 'project_id and title are required' }, 400);
    }

    // Update existing
    if (body.id) {
      const updates: string[] = [];
      const bindings: (string | number)[] = [];
      if (body.title) { updates.push('title = ?'); bindings.push(body.title); }
      if (body.description !== undefined) { updates.push('description = ?'); bindings.push(body.description); }
      if (body.target_date) { updates.push('target_date = ?'); bindings.push(body.target_date); }
      if (body.actual_date) { updates.push('actual_date = ?'); bindings.push(body.actual_date); }
      if (body.status) { updates.push('status = ?'); bindings.push(body.status); }
      if (body.rag_status) { updates.push('rag_status = ?'); bindings.push(body.rag_status); }
      if (body.percentage_complete !== undefined) { updates.push('percentage_complete = ?'); bindings.push(body.percentage_complete); }
      if (body.owner) { updates.push('owner = ?'); bindings.push(body.owner); }

      if (updates.length > 0) {
        bindings.push(body.id);
        await db.prepare(`UPDATE project_milestones SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
      }
      const milestone = await db.prepare(`SELECT * FROM project_milestones WHERE id = ?`).bind(body.id).first();
      return json({ milestone });
    }

    // Create new
    const id = `ms-${Date.now()}`;
    await db.prepare(`
      INSERT INTO project_milestones (id, project_id, title, description, target_date, status, rag_status, percentage_complete, owner)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.project_id, body.title, body.description || null, body.target_date || null,
      body.status || 'not_started', body.rag_status || 'green', body.percentage_complete || 0, body.owner || null).run();

    const milestone = await db.prepare(`SELECT * FROM project_milestones WHERE id = ?`).bind(id).first();
    return json({ milestone }, 201);
  } catch (error) {
    console.error('Error creating/updating milestone:', error);
    return json({ error: 'Failed to create/update milestone' }, 500);
  }
};
