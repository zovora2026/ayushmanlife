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
    const payer = url.searchParams.get('payer');
    const status = url.searchParams.get('status');

    if (!db) {
      return json({ error: 'Database not available', policies: [], total: 0, currency: 'INR' }, 503);
    }

    let query = `SELECT * FROM policies WHERE 1=1`;
    const bindings: string[] = [];

    if (payer) {
      query += ` AND provider_name LIKE ?`;
      bindings.push(`%${payer}%`);
    }
    if (status === 'active') {
      query += ` AND status = 'active'`;
    } else if (status === 'inactive') {
      query += ` AND status != 'active'`;
    }

    query += ` ORDER BY coverage_amount DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({
      policies: results || [],
      total: results?.length || 0,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return json({ error: 'Failed to fetch policies' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      policy_name: string;
      payer: string;
      type: string;
      coverage_amount: number;
      start_date: string;
      end_date: string;
      description?: string;
      packages_covered?: number;
    };

    if (
      !body.policy_name ||
      !body.payer ||
      !body.type ||
      !body.start_date ||
      !body.end_date
    ) {
      return json(
        {
          error:
            'policy_name, payer, type, start_date, and end_date are required',
        },
        400
      );
    }

    const id = `POL-${Date.now()}`;

    if (!db) {
      return json({ error: 'Database not available', policy: null }, 503);
    }

    const policyNumber = `POL-${Date.now()}`;

    await db
      .prepare(
        `INSERT INTO policies (id, policy_number, scheme, provider_name, holder_name, coverage_amount, start_date, end_date, status, benefits, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, datetime('now'))`
      )
      .bind(
        id,
        policyNumber,
        body.type || '',
        body.payer,
        body.policy_name,
        body.coverage_amount || 0,
        body.start_date,
        body.end_date,
        body.description || ''
      )
      .run();

    const policy = await db
      .prepare(`SELECT * FROM policies WHERE id = ?`)
      .bind(id)
      .first();

    return json({ policy }, 201);
  } catch (error) {
    console.error('Error creating policy:', error);
    return json({ error: 'Failed to create policy' }, 500);
  }
};
