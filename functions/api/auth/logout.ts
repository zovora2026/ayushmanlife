interface Env { DB: D1Database }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const sessionId = (context.data as any)?.sessionId;
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
