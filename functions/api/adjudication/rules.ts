interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List adjudication rules
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const scheme = url.searchParams.get('payer_scheme');
    const enabledOnly = url.searchParams.get('enabled') !== 'false';

    if (!db) {
      return json({ rules: [], total: 0 });
    }

    let query = `SELECT * FROM adjudication_rules WHERE 1=1`;
    const bindings: string[] = [];

    if (enabledOnly) {
      query += ` AND enabled = 1`;
    }
    if (scheme) {
      query += ` AND (payer_scheme = ? OR payer_scheme IS NULL)`;
      bindings.push(scheme);
    }

    query += ` ORDER BY priority ASC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    const rules = results || [];

    // Summary
    const summary = {
      total_rules: rules.length,
      enabled: rules.filter((r: any) => r.enabled).length,
      total_triggered: rules.reduce((sum: number, r: any) => sum + (r.times_triggered || 0), 0),
      by_action: {
        auto_approve: rules.filter((r: any) => r.action === 'auto_approve').length,
        flag_review: rules.filter((r: any) => r.action === 'flag_review').length,
        flag_fraud: rules.filter((r: any) => r.action === 'flag_fraud').length,
        reject: rules.filter((r: any) => r.action === 'reject').length,
        pend: rules.filter((r: any) => r.action === 'pend').length,
      },
    };

    return json({ rules, summary });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return json({ error: 'Failed to fetch adjudication rules' }, 500);
  }
};

// POST: Create a new adjudication rule
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      rule_name: string;
      description?: string;
      payer_scheme?: string;
      condition_type: string;
      condition_value: string;
      action: string;
      confidence_threshold?: number;
      priority?: number;
    };

    if (!body.rule_name || !body.condition_type || !body.condition_value) {
      return json({ error: 'rule_name, condition_type, and condition_value are required' }, 400);
    }

    if (!db) {
      return json({ rule: { id: `rule-${Date.now()}`, ...body } }, 201);
    }

    const id = `rule-${Date.now()}`;
    await db.prepare(`
      INSERT INTO adjudication_rules (id, rule_name, description, payer_scheme, condition_type, condition_value, action, confidence_threshold, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.rule_name,
      body.description || null,
      body.payer_scheme || null,
      body.condition_type,
      body.condition_value,
      body.action || 'auto_approve',
      body.confidence_threshold || 80,
      body.priority || 10,
    ).run();

    const rule = await db.prepare(`SELECT * FROM adjudication_rules WHERE id = ?`).bind(id).first();

    return json({ rule }, 201);
  } catch (error) {
    console.error('Error creating rule:', error);
    return json({ error: 'Failed to create adjudication rule' }, 500);
  }
};
