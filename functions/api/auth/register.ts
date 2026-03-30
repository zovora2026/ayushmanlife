interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password, name, role, department, phone } = await context.request.json() as Record<string, string>;
    if (!email || !password || !name) return json({ message: 'Email, password, and name required' }, 400);

    if (!context.env.DB) {
      return json({ message: 'Registration successful (demo mode)', user: { id: 'usr-new', email, name, role: role || 'staff' } });
    }

    // Check existing
    const existing = await context.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ message: 'Email already registered' }, 409);

    // Hash password with SHA-256
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const id = crypto.randomUUID();
    await context.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, department, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, email, hashHex, name, role || 'staff', department || null, phone || null).run();

    return json({ message: 'Registration successful', user: { id, email, name, role: role || 'staff', department } }, 201);
  } catch (err) {
    return json({ message: 'Registration failed', error: String(err) }, 500);
  }
};
