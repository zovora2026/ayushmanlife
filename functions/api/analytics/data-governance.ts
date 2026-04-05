// Data Governance Analytics — counts from actual D1 tables
interface Env { DB: D1Database; }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available', stats: {} }, { status: 503 });

  try {
    // Count records across core tables
    const [patients, claims, appointments, policies, users, tickets, staff, projects] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM patients').first(),
      db.prepare('SELECT COUNT(*) as count FROM claims').first(),
      db.prepare('SELECT COUNT(*) as count FROM appointments').first(),
      db.prepare('SELECT COUNT(*) as count FROM policies').first(),
      db.prepare('SELECT COUNT(*) as count FROM users').first(),
      db.prepare('SELECT COUNT(*) as count FROM tickets').first(),
      db.prepare("SELECT COUNT(*) as count FROM users WHERE role IN ('doctor','nurse','technician','consultant')").first(),
      db.prepare('SELECT COUNT(*) as count FROM projects').first(),
    ]);

    // Get table list for data catalog
    const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

    return Response.json({
      stats: {
        total_patients: (patients as Record<string, unknown>)?.count || 0,
        total_claims: (claims as Record<string, unknown>)?.count || 0,
        total_appointments: (appointments as Record<string, unknown>)?.count || 0,
        total_policies: (policies as Record<string, unknown>)?.count || 0,
        total_users: (users as Record<string, unknown>)?.count || 0,
        total_tickets: (tickets as Record<string, unknown>)?.count || 0,
        total_staff: (staff as Record<string, unknown>)?.count || 0,
        total_projects: (projects as Record<string, unknown>)?.count || 0,
        total_tables: tables.results.length,
        database_type: 'Cloudflare D1 (SQLite)',
        region: 'APAC',
      },
      tables: tables.results.map((t: Record<string, unknown>) => t.name),
    });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch data governance stats' }, { status: 500 });
  }
};
