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
    const pathId = url.searchParams.get('path_id');

    if (!db) {
      return json({ modules: [], total: 0 });
    }

    let query = `SELECT m.*, lp.name as path_name
                 FROM learning_modules m
                 JOIN learning_paths lp ON m.path_id = lp.id`;
    const bindings: string[] = [];

    if (pathId) {
      query += ` WHERE m.path_id = ?`;
      bindings.push(pathId);
    }

    query += ` ORDER BY m.path_id, m.order_num`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({
      modules: results || [],
      total: results?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return json({ error: 'Failed to fetch modules' }, 500);
  }
};
