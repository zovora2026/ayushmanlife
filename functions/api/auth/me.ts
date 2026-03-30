interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const user = (context.data as any)?.currentUser;
  if (user) {
    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Mock user if no DB
  if (!context.env.DB) {
    const cookie = context.request.headers.get('Cookie') || '';
    if (cookie.includes('session=')) {
      return new Response(JSON.stringify({
        user: { id: 'usr-001', email: 'demo@ayushmanlife.in', name: 'Dr. Rajesh Kumar', role: 'admin', department: 'Administration' }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ user: null }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};
