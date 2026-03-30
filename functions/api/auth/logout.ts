interface Env { DB: D1Database }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Try to get sessionId from middleware context or parse cookie directly
  let sessionId = (context.data as any)?.sessionId;
  if (!sessionId) {
    const cookie = context.request.headers.get('Cookie') || '';
    const match = cookie.match(/session=([^;]+)/);
    sessionId = match ? match[1] : null;
  }

  if (sessionId && context.env.DB) {
    try {
      await context.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    } catch { /* ignore */ }
  }

  return new Response(JSON.stringify({ message: 'Logged out' }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0',
    },
  });
};
