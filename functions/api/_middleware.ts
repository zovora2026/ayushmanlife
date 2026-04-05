// Global API middleware: CORS + auth context
interface Env {
  DB: D1Database;
  UPLOADS?: R2Bucket;
  ANTHROPIC_API_KEY?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Cookie',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Parse session cookie for auth context
  const cookie = context.request.headers.get('Cookie') || '';
  const sessionMatch = cookie.match(/session=([^;]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;

  let currentUser = null;
  if (sessionId && context.env.DB) {
    try {
      const result = await context.env.DB.prepare(
        `SELECT u.id, u.email, u.name, u.role, u.department, u.phone, u.avatar_url
         FROM sessions s JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.expires_at > datetime('now')`
      ).bind(sessionId).first();
      if (result) currentUser = result;
    } catch {
      // DB not available, continue without auth
    }
  }

  // Attach to context.data
  context.data = { ...context.data, currentUser, sessionId };

  // Continue to route handler
  const response = await context.next();

  // Add CORS headers to response
  const newResponse = new Response(response.body, response);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
};
