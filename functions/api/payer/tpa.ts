// TPA Partners API — GET list, POST create
interface Env { DB: D1Database; }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available', partners: [] }, { status: 503 });

  try {
    const { results } = await db.prepare(
      'SELECT * FROM tpa_partners ORDER BY name'
    ).all();

    const summary = {
      total: results.length,
      active: results.filter((r: Record<string, unknown>) => r.status === 'active').length,
      avg_settlement_rate: results.length > 0
        ? Number((results.reduce((sum: number, r: Record<string, unknown>) => sum + (r.settlement_rate as number || 0), 0) / results.length).toFixed(2))
        : 0,
      total_partner_hospitals: results.reduce((sum: number, r: Record<string, unknown>) => sum + (r.partner_hospitals as number || 0), 0),
    };

    return Response.json({ partners: results, summary });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch TPA partners', partners: [] }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available' }, { status: 503 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const id = `tpa-${Date.now()}`;
    await db.prepare(
      `INSERT INTO tpa_partners (id, name, code, region, partner_hospitals, settlement_rate, avg_tat_days, status, contact_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.name, body.code || null, body.region || null,
      body.partner_hospitals || 0, body.settlement_rate || 0,
      body.avg_tat_days || 0, body.status || 'active', body.contact_email || null
    ).run();

    const partner = await db.prepare('SELECT * FROM tpa_partners WHERE id = ?').bind(id).first();
    return Response.json({ partner }, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Failed to create TPA partner' }, { status: 500 });
  }
};
