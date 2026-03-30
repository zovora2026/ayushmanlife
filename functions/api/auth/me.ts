interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async (context) => {
  // The middleware (_middleware.ts) already looks up the session and attaches currentUser
  const currentUser = (context.data as any)?.currentUser;
  if (currentUser) {
    return new Response(JSON.stringify({ user: currentUser }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // If middleware didn't find a user but we have a session cookie, try DB lookup directly
  const cookie = context.request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;

  if (sessionId && context.env.DB) {
    try {
      const user = await context.env.DB.prepare(
        `SELECT u.id, u.email, u.name, u.role, u.department, u.phone, u.avatar_url
         FROM sessions s JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.expires_at > datetime('now')`
      ).bind(sessionId).first();

      if (user) {
        return new Response(JSON.stringify({ user }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // DB error, fall through
    }
  }

  // Mock user if no DB and session cookie exists
  if (!context.env.DB && sessionId) {
    return new Response(JSON.stringify({
      user: { id: 'usr-001', email: 'demo@ayushmanlife.in', name: 'Dr. Demo User', role: 'admin', department: 'Administration' }
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ user: null }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};
