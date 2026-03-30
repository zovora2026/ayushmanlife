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
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');

    if (!db) {
      return json({ articles: [], total: 0, categories: [] });
    }

    // Get categories with counts
    const catResult = await db
      .prepare(
        `SELECT category, COUNT(*) as count FROM knowledge_base GROUP BY category ORDER BY category`
      )
      .all();

    // Build article query
    let query = `SELECT * FROM knowledge_base WHERE 1=1`;
    const bindings: string[] = [];

    if (category) {
      query += ` AND category = ?`;
      bindings.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)`;
      const term = `%${search}%`;
      bindings.push(term, term, term);
    }

    query += ` ORDER BY views DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({
      articles: results || [],
      total: results?.length || 0,
      categories: catResult.results || [],
    });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return json({ error: 'Failed to fetch knowledge base' }, 500);
  }
};
