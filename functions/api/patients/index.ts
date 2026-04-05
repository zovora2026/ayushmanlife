interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const q = url.searchParams.get('q')?.toLowerCase() || '';
    const insuranceType = url.searchParams.get('insurance_type') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    if (!context.env.DB) {
      return json({ error: 'Database not available', patients: [], total: 0, page: 1 }, 503);
    }

    // Real D1 query
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (q) {
      conditions.push(`(
        LOWER(name) LIKE ? OR
        phone LIKE ? OR
        LOWER(email) LIKE ?
      )`);
      const like = `%${q}%`;
      bindings.push(like, like, like);
    }
    if (insuranceType) {
      conditions.push('insurance_type = ?');
      bindings.push(insuranceType);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await context.env.DB.prepare(
      `SELECT COUNT(*) as total FROM patients ${where}`
    ).bind(...bindings).first<{ total: number }>();
    const total = countResult?.total ?? 0;

    // Get paginated results
    const patients = await context.env.DB.prepare(
      `SELECT * FROM patients ${where} ORDER BY registered_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset).all();

    return json({ patients: patients.results, total, page });
  } catch (err) {
    return json({ message: 'Failed to fetch patients', error: String(err) }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as Record<string, unknown>;
    const { name, age, gender, phone, email, address, insurance_type, insurance_id,
            insurance_provider, blood_group, emergency_contact, medical_history,
            allergies, chronic_conditions } = body;

    if (!name || !phone) {
      return json({ message: 'Name and phone are required' }, 400);
    }

    const id = `pat-${crypto.randomUUID().split('-')[0]}`;
    const now = new Date().toISOString();

    if (!context.env.DB) {
      return json({ error: 'Database not available', patient: null }, 503);
    }

    // Real D1 insert
    await context.env.DB.prepare(
      `INSERT INTO patients (id, name, age, gender, phone, email, address,
        insurance_type, insurance_id, insurance_provider, blood_group,
        emergency_contact, medical_history, allergies, chronic_conditions,
        registered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      name, age || null, gender || null, phone, email || null, address || null,
      insurance_type || null, insurance_id || null, insurance_provider || null,
      blood_group || null,
      emergency_contact || null, medical_history || null,
      allergies || null, chronic_conditions || null,
      now
    ).run();

    const patient = await context.env.DB.prepare(
      'SELECT * FROM patients WHERE id = ?'
    ).bind(id).first();

    return json({ patient, message: 'Patient created' }, 201);
  } catch (err) {
    return json({ message: 'Failed to create patient', error: String(err) }, 500);
  }
};
