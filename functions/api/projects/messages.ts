interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List messages for a project
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const projectId = url.searchParams.get('project_id');

    if (!db) {
      return json({ messages: [] });
    }

    if (!projectId) {
      return json({ error: 'project_id is required' }, 400);
    }

    const { results } = await db.prepare(`
      SELECT * FROM project_messages
      WHERE project_id = ?
      ORDER BY created_at ASC
    `).bind(projectId).all();

    return json({ messages: results || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return json({ error: 'Failed to fetch messages' }, 500);
  }
};

// POST: Send a message
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      project_id: string;
      sender_id?: string;
      sender_name: string;
      sender_role?: string;
      message: string;
      message_type?: string;
    };

    if (!db) {
      return json({ message: { id: `msg-${Date.now()}`, ...body } }, 201);
    }

    if (!body.project_id || !body.message || !body.sender_name) {
      return json({ error: 'project_id, sender_name, and message are required' }, 400);
    }

    const id = `msg-${Date.now()}`;
    await db.prepare(`
      INSERT INTO project_messages (id, project_id, sender_id, sender_name, sender_role, message, message_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.project_id, body.sender_id || null, body.sender_name,
      body.sender_role || 'team', body.message, body.message_type || 'update').run();

    const msg = await db.prepare(`SELECT * FROM project_messages WHERE id = ?`).bind(id).first();
    return json({ message: msg }, 201);
  } catch (error) {
    console.error('Error sending message:', error);
    return json({ error: 'Failed to send message' }, 500);
  }
};
