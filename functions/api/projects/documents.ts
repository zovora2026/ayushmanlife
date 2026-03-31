interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List documents for a project
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const projectId = url.searchParams.get('project_id');

    if (!db) {
      return json({ documents: [] });
    }

    let query = `SELECT pd.*, u.name as uploader_name
                 FROM project_documents pd
                 LEFT JOIN users u ON pd.uploaded_by = u.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (projectId) {
      query += ` AND pd.project_id = ?`;
      bindings.push(projectId);
    }

    query += ` ORDER BY pd.created_at DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all();

    return json({ documents: results || [] });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return json({ error: 'Failed to fetch documents' }, 500);
  }
};

// POST: Create document record
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      project_id: string;
      document_type: string;
      title: string;
      filename?: string;
      description?: string;
      version?: string;
      uploaded_by?: string;
      status?: string;
      uploader_name?: string;
    };

    if (!db) {
      return json({ document: { id: `doc-${Date.now()}`, ...body, created_at: new Date().toISOString() } }, 201);
    }

    if (!body.project_id || !body.title || !body.document_type) {
      return json({ error: 'project_id, title, and document_type are required' }, 400);
    }

    const id = `doc-${Date.now()}`;
    await db.prepare(`
      INSERT INTO project_documents (id, project_id, document_type, title, filename, description, version, uploaded_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.project_id, body.document_type, body.title,
      body.filename || null, body.description || null, body.version || '1.0', body.uploaded_by || 'usr-001', body.status || 'current').run();

    const document = await db.prepare(`
      SELECT pd.*, u.name as uploader_name
      FROM project_documents pd LEFT JOIN users u ON pd.uploaded_by = u.id
      WHERE pd.id = ?
    `).bind(id).first();
    return json({ document }, 201);
  } catch (error) {
    console.error('Error creating document:', error);
    return json({ error: 'Failed to create document' }, 500);
  }
};
