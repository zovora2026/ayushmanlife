interface Env { DB: D1Database; ANTHROPIC_API_KEY?: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── GET: List claims with filters & pagination ──────────────────────────────

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const status = url.searchParams.get('status');
    const payer_scheme = url.searchParams.get('payer_scheme');
    const patient_id = url.searchParams.get('patient_id');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const search = url.searchParams.get('search');

    if (!context.env.DB) {
      return json({ error: 'Database not available', claims: [], total: 0, page: 1, limit }, 503);
    }

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }
    if (payer_scheme) {
      conditions.push('c.payer_scheme = ?');
      params.push(payer_scheme);
    }
    if (patient_id) {
      conditions.push('c.patient_id = ?');
      params.push(patient_id);
    }
    if (date_from) {
      conditions.push('c.created_at >= ?');
      params.push(date_from);
    }
    if (date_to) {
      conditions.push('c.created_at <= ?');
      params.push(date_to + 'T23:59:59Z');
    }
    if (search) {
      conditions.push('(c.claim_number LIKE ? OR c.diagnosis LIKE ? OR p.name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Count total
    const countResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as total FROM claims c LEFT JOIN patients p ON c.patient_id = p.id ${whereClause}`
    ).bind(...params).first<{ total: number }>();
    const total = countResult?.total ?? 0;

    // Fetch page with patient name via JOIN
    const { results } = await context.env.DB.prepare(
      `SELECT c.*, p.name as patient_name FROM claims c
       LEFT JOIN patients p ON c.patient_id = p.id
       ${whereClause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    return json({ claims: results || [], total, page, limit });
  } catch (err) {
    return json({ message: 'Failed to list claims', error: String(err) }, 500);
  }
};

// ── POST: Create new claim ──────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as Record<string, unknown>;

    const {
      patient_id, payer_scheme, payer_name, policy_number,
      diagnosis, diagnosis_codes, procedure_codes,
      claimed_amount,
      admission_date, discharge_date,
    } = body;

    // Validate required fields
    if (!patient_id) return json({ message: 'patient_id is required' }, 400);
    if (!payer_scheme) return json({ message: 'payer_scheme is required' }, 400);
    if (!diagnosis) return json({ message: 'diagnosis is required' }, 400);
    if (!claimed_amount || Number(claimed_amount) <= 0) {
      return json({ message: 'claimed_amount must be a positive number' }, 400);
    }

    const id = crypto.randomUUID();
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    const claim_number = `CLM-2026-${seq}`;
    const now = new Date().toISOString();
    const status = 'draft';

    if (!context.env.DB) {
      return json({ error: 'Database not available', claim: null }, 503);
    }

    await context.env.DB.prepare(
      `INSERT INTO claims (
        id, claim_number, patient_id,
        payer_scheme, payer_name, policy_number,
        diagnosis, diagnosis_codes, procedure_codes,
        claimed_amount, approved_amount, status,
        admission_date, discharge_date,
        submitted_at, resolved_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, ?, ?)`
    ).bind(
      id, claim_number,
      patient_id,
      payer_scheme, payer_name || null, policy_number || null,
      diagnosis, diagnosis_codes || null, procedure_codes || null,
      Number(claimed_amount), status,
      admission_date || null, discharge_date || null,
      now, now,
    ).run();

    // Fetch the created claim
    const created = await context.env.DB.prepare(
      'SELECT * FROM claims WHERE id = ?'
    ).bind(id).first();

    return json({ claim: created, message: 'Claim created successfully' }, 201);
  } catch (err) {
    return json({ message: 'Failed to create claim', error: String(err) }, 500);
  }
};
