interface Env { DB: D1Database }

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password } = await context.request.json() as { email: string; password: string };
    if (!email || !password) return json({ message: 'Email and password required' }, 400);

    // Check if DB is available
    if (!context.env.DB) {
      // Mock login for demo
      if (email === 'demo@ayushmanlife.in' && password === 'demo123') {
        const sessionId = 'mock-session-' + Date.now();
        return json({
          user: { id: 'usr-001', email, name: 'Dr. Demo User', role: 'admin', department: 'Administration' },
          message: 'Login successful',
        }, 200, {
          'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
        });
      }
      return json({ message: 'Invalid credentials' }, 401);
    }

    // Real D1 login
    const user = await context.env.DB.prepare(
      'SELECT id, email, name, role, department, phone, avatar_url, password_hash FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) return json({ message: 'Invalid credentials' }, 401);

    // Password verification:
    // 1. For demo seed data: password_hash is 'demo123_hashed', accept password 'demo123'
    // 2. For registered users: password_hash is SHA-256 hex, compare hashed input
    const storedHash = user.password_hash as string;
    let passwordMatch = false;

    // Check demo-style placeholder hash (e.g., 'demo123_hashed')
    if (storedHash === password + '_hashed') {
      passwordMatch = true;
    } else {
      // Check SHA-256 hash for properly registered users
      const inputHash = await hashPassword(password);
      passwordMatch = inputHash === storedHash;
    }

    if (!passwordMatch) return json({ message: 'Invalid credentials' }, 401);

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await context.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt).run();

    // Update last_login
    await context.env.DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run();

    const { password_hash: _, ...safeUser } = user as Record<string, unknown>;
    return json({ user: safeUser, message: 'Login successful' }, 200, {
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    });
  } catch (err) {
    return json({ message: 'Login failed', error: String(err) }, 500);
  }
};
