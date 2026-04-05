// TeleWeight: Consent Management API (DPDP Compliance)
// GET /api/teleweight/consent — Consent history for a patient
// POST /api/teleweight/consent — Record consent given or withdrawn

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const VALID_CONSENT_TYPES = [
  'telemedicine',
  'data_sharing',
  'recording',
  'prescription_routing',
  'marketing',
]

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', consents: [] }, 503)

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')

  if (!patientId) {
    return json({ error: 'Missing required query param: patient_id' }, 400)
  }

  try {
    const { results } = await db.prepare(
      'SELECT * FROM consent_audit_log WHERE patient_id = ? ORDER BY given_at DESC'
    ).bind(patientId).all()

    const consents = results || []

    return json({
      consents,
      total: consents.length,
    })
  } catch (e: any) {
    return json({ error: e.message, consents: [] }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const { patient_id, consent_type, consent_given, consent_text } = body

    if (!patient_id || !consent_type || consent_given === undefined || consent_given === null || !consent_text) {
      return json({
        error: 'Missing required fields: patient_id, consent_type, consent_given, consent_text',
      }, 400)
    }

    // Validate consent_type
    if (!VALID_CONSENT_TYPES.includes(consent_type)) {
      return json({
        error: `Invalid consent_type. Must be one of: ${VALID_CONSENT_TYPES.join(', ')}`,
      }, 400)
    }

    // Validate consent_given is 0 or 1
    if (consent_given !== 0 && consent_given !== 1) {
      return json({ error: 'consent_given must be 0 or 1' }, 400)
    }

    // Extract IP and user agent from request headers
    const ipAddress =
      context.request.headers.get('CF-Connecting-IP') ||
      context.request.headers.get('X-Forwarded-For') ||
      'unknown'
    const userAgent = context.request.headers.get('User-Agent') || 'unknown'

    const now = new Date().toISOString()

    // If consent is being withdrawn (consent_given = 0), mark existing consent of same type as withdrawn
    if (consent_given === 0) {
      await db.prepare(`
        UPDATE consent_audit_log
        SET withdrawn_at = ?
        WHERE patient_id = ? AND consent_type = ? AND consent_given = 1 AND withdrawn_at IS NULL
      `).bind(now, patient_id, consent_type).run()
    }

    const id = `consent-${Date.now()}`

    await db.prepare(`
      INSERT INTO consent_audit_log (
        id, patient_id, consent_type, consent_given, consent_text,
        ip_address, user_agent, given_at, withdrawn_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, patient_id, consent_type, consent_given, consent_text,
      ipAddress, userAgent, now,
      consent_given === 0 ? now : null
    ).run()

    const consent = await db.prepare('SELECT * FROM consent_audit_log WHERE id = ?').bind(id).first()
    return json({ consent }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
