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
    const url = new URL(context.request.url);
    const projectId = url.searchParams.get('project_id');
    const consultantId = url.searchParams.get('consultant_id');
    const status = url.searchParams.get('status');

    if (!db) {
      return json({ assignments: [], total: 0 });
    }

    let query = `
      SELECT pa.*,
        u.name as consultant_name,
        u.department as consultant_department,
        u.role as consultant_role,
        p.name as project_name,
        p.client_hospital,
        p.city as project_city,
        p.status as project_status
      FROM project_assignments pa
      JOIN users u ON pa.consultant_id = u.id
      JOIN projects p ON pa.project_id = p.id
    `;
    const conditions: string[] = [];
    const bindings: string[] = [];

    if (projectId) {
      conditions.push('pa.project_id = ?');
      bindings.push(projectId);
    }
    if (consultantId) {
      conditions.push('pa.consultant_id = ?');
      bindings.push(consultantId);
    }
    if (status) {
      conditions.push('pa.status = ?');
      bindings.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY pa.start_date DESC';

    const result = await db.prepare(query).bind(...bindings).all();

    return json({
      assignments: result.results || [],
      total: result.results?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return json({ error: 'Failed to fetch assignments' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as Record<string, unknown>;

    const id = `asgn-${Date.now()}`;
    const {
      project_id,
      consultant_id,
      role,
      start_date,
      end_date,
      rate_per_day,
      utilization_pct,
      notes,
    } = body;

    if (!project_id || !consultant_id || !role) {
      return json(
        { error: 'project_id, consultant_id, and role are required' },
        400
      );
    }

    if (!db) {
      return json({
        assignment: { id, project_id, consultant_id, role, status: 'active' },
        message: 'Assignment created (mock)',
      }, 201);
    }

    // Check for double-booking: consultant already assigned to another active project during same period
    if (start_date && end_date) {
      const conflicts = await db
        .prepare(
          `SELECT pa.id, p.name as project_name
           FROM project_assignments pa
           JOIN projects p ON pa.project_id = p.id
           WHERE pa.consultant_id = ?
             AND pa.status = 'active'
             AND pa.start_date <= ?
             AND pa.end_date >= ?`
        )
        .bind(consultant_id, end_date, start_date)
        .all();

      const totalUtil =
        ((conflicts.results || []) as Array<Record<string, unknown>>).reduce(
          (sum, r) => sum + ((r.utilization_pct as number) || 100),
          0
        ) + ((utilization_pct as number) || 100);

      if (totalUtil > 100) {
        return json(
          {
            error: 'Consultant over-allocated',
            message: `Total utilization would be ${totalUtil}%. Existing assignments: ${(conflicts.results || []).map((r: Record<string, unknown>) => r.project_name).join(', ')}`,
            conflicts: conflicts.results,
          },
          409
        );
      }
    }

    await db
      .prepare(
        `INSERT INTO project_assignments (id, project_id, consultant_id, role, start_date, end_date, rate_per_day, status, utilization_pct, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
      )
      .bind(
        id,
        project_id,
        consultant_id,
        role,
        start_date || null,
        end_date || null,
        rate_per_day || null,
        utilization_pct || 100,
        notes || null
      )
      .run();

    // Fetch back with joins
    const assignment = await db
      .prepare(
        `SELECT pa.*, u.name as consultant_name, p.name as project_name
         FROM project_assignments pa
         JOIN users u ON pa.consultant_id = u.id
         JOIN projects p ON pa.project_id = p.id
         WHERE pa.id = ?`
      )
      .bind(id)
      .first();

    return json({ assignment, message: 'Assignment created' }, 201);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return json({ error: 'Failed to create assignment' }, 500);
  }
};
