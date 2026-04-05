interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY?: string;
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
    const department = url.searchParams.get('department');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    if (!db) {
      return json({ error: 'Database not available', staff: [], total: 0 }, 503);
    }

    // Query staff skills grouped by user, and staff certifications for a combined view
    let query = `SELECT DISTINCT ss.user_id as id, ss.user_id, ss.category as department
                 FROM staff_skills ss
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (department) {
      query += ` AND ss.category = ?`;
      bindings.push(department);
    }

    query += ` ORDER BY ss.user_id ASC LIMIT 100`;

    const stmt = db.prepare(query);
    const { results: staffIds } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    // For each unique user, get their skills and certifications
    const staffList = [];
    if (staffIds && staffIds.length > 0) {
      for (const s of staffIds) {
        const userId = (s as any).user_id;
        const [skills, certs] = await Promise.all([
          db.prepare(`SELECT skill_name, category, proficiency FROM staff_skills WHERE user_id = ?`).bind(userId).all(),
          db.prepare(`SELECT certification_name, issuing_body, expiry_date, status FROM staff_certifications WHERE user_id = ?`).bind(userId).all(),
        ]);
        staffList.push({
          id: userId,
          user_id: userId,
          department: (s as any).department,
          skills: skills.results || [],
          certifications: certs.results || [],
        });
      }
    }

    return json({ staff: staffList, total: staffList.length });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return json({ error: 'Failed to fetch staff' }, 500);
  }
};
