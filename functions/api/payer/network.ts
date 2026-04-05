// Provider Network API — GET list, POST create
interface Env { DB: D1Database; }

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available', providers: [] }, { status: 503 });

  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');

    let query = 'SELECT * FROM provider_network WHERE 1=1';
    const params: string[] = [];
    if (state) { query += ' AND state = ?'; params.push(state); }
    if (type) { query += ' AND type = ?'; params.push(type); }
    if (status) { query += ' AND empanelment_status = ?'; params.push(status); }
    query += ' ORDER BY name';

    const { results } = await db.prepare(query).bind(...params).all();

    const summary = {
      total: results.length,
      active: results.filter((r: Record<string, unknown>) => r.empanelment_status === 'active').length,
      total_beds: results.reduce((sum: number, r: Record<string, unknown>) => sum + (r.bed_count as number || 0), 0),
      avg_utilization: results.length > 0
        ? Number((results.reduce((sum: number, r: Record<string, unknown>) => sum + (r.utilization_pct as number || 0), 0) / results.length).toFixed(1))
        : 0,
      by_state: Object.entries(
        results.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
          const s = (r.state as string) || 'Unknown';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([state, count]) => ({ state, count })),
      by_type: Object.entries(
        results.reduce((acc: Record<string, number>, r: Record<string, unknown>) => {
          const t = (r.type as string) || 'Unknown';
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count })),
    };

    return Response.json({ providers: results, summary });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch providers', providers: [] }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available' }, { status: 503 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const id = `hosp-${Date.now()}`;
    await db.prepare(
      `INSERT INTO provider_network (id, name, city, state, type, bed_count, specialties, empanelment_status, utilization_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.name, body.city, body.state || null, body.type || null,
      body.bed_count || 0, body.specialties || null,
      body.empanelment_status || 'active', body.utilization_pct || 0
    ).run();

    const provider = await db.prepare('SELECT * FROM provider_network WHERE id = ?').bind(id).first();
    return Response.json({ provider }, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Failed to create provider' }, { status: 500 });
  }
};
