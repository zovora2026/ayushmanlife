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
    const status = url.searchParams.get('status');

    if (!db) {
      return json({
        projects: [
          {
            id: 'prj-001',
            name: 'Epic Go-Live Support',
            client_hospital: 'AIIMS New Delhi',
            city: 'New Delhi',
            state: 'Delhi',
            project_type: 'emr_implementation',
            status: 'active',
            start_date: '2026-01-15',
            end_date: '2026-06-30',
            budget: 4500000,
            team_size: 5,
            assigned_count: 3,
          },
        ],
        total: 1,
      });
    }

    let query = `
      SELECT p.*,
        (SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id AND pa.status IN ('active', 'planned')) as assigned_count
      FROM projects p
    `;
    const bindings: string[] = [];

    if (status) {
      query += ' WHERE p.status = ?';
      bindings.push(status);
    }

    query += ' ORDER BY p.start_date DESC';

    const result = await db.prepare(query).bind(...bindings).all();

    return json({
      projects: result.results || [],
      total: result.results?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return json({ error: 'Failed to fetch projects' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as Record<string, unknown>;

    const id = `prj-${Date.now()}`;
    const {
      name,
      client_hospital,
      location,
      city,
      state,
      project_type,
      description,
      start_date,
      end_date,
      budget,
      skills_required,
      team_size,
    } = body;

    if (!name || !client_hospital) {
      return json({ error: 'name and client_hospital are required' }, 400);
    }

    if (!db) {
      return json({
        project: { id, name, client_hospital, status: 'active' },
        message: 'Project created (mock)',
      }, 201);
    }

    await db
      .prepare(
        `INSERT INTO projects (id, name, client_hospital, location, city, state, project_type, description, start_date, end_date, status, budget, skills_required, team_size)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
      )
      .bind(
        id,
        name,
        client_hospital,
        location || null,
        city || null,
        state || null,
        project_type || 'emr_implementation',
        description || null,
        start_date || null,
        end_date || null,
        budget || null,
        skills_required || null,
        team_size || 1
      )
      .run();

    const project = await db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id)
      .first();

    return json({ project, message: 'Project created' }, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return json({ error: 'Failed to create project' }, 500);
  }
};
