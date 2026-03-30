interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Valid vital types and their expected units
const VITAL_TYPES: Record<string, string> = {
  bp_systolic: 'mmHg',
  bp_diastolic: 'mmHg',
  heart_rate: 'bpm',
  temperature: 'F',
  spo2: '%',
  respiratory_rate: 'breaths/min',
  blood_glucose_fasting: 'mg/dL',
  blood_glucose_pp: 'mg/dL',
  blood_glucose_random: 'mg/dL',
  hba1c: '%',
  weight: 'kg',
  height: 'cm',
  bmi: 'kg/m2',
};

// Mock vitals history for a diabetic hypertensive patient
const MOCK_VITALS = [
  { id: 'vit-101', patient_id: 'pat-001', type: 'bp_systolic', value: 142, unit: 'mmHg', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Dr. Anita Verma' },
  { id: 'vit-102', patient_id: 'pat-001', type: 'bp_diastolic', value: 88, unit: 'mmHg', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Dr. Anita Verma' },
  { id: 'vit-103', patient_id: 'pat-001', type: 'heart_rate', value: 78, unit: 'bpm', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Nurse Kavitha' },
  { id: 'vit-104', patient_id: 'pat-001', type: 'blood_glucose_fasting', value: 156, unit: 'mg/dL', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Lab Tech' },
  { id: 'vit-105', patient_id: 'pat-001', type: 'spo2', value: 97, unit: '%', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Nurse Kavitha' },
  { id: 'vit-106', patient_id: 'pat-001', type: 'weight', value: 82.5, unit: 'kg', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Nurse Kavitha' },
  { id: 'vit-107', patient_id: 'pat-001', type: 'temperature', value: 98.4, unit: 'F', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Nurse Kavitha' },
  { id: 'vit-108', patient_id: 'pat-001', type: 'hba1c', value: 7.2, unit: '%', recorded_at: '2025-11-15T10:00:00Z', recorded_by: 'Lab Tech' },
  { id: 'vit-109', patient_id: 'pat-001', type: 'bp_systolic', value: 148, unit: 'mmHg', recorded_at: '2025-11-10T10:15:00Z', recorded_by: 'Dr. Anita Verma' },
  { id: 'vit-110', patient_id: 'pat-001', type: 'bp_diastolic', value: 92, unit: 'mmHg', recorded_at: '2025-11-10T10:15:00Z', recorded_by: 'Dr. Anita Verma' },
  { id: 'vit-111', patient_id: 'pat-001', type: 'blood_glucose_fasting', value: 168, unit: 'mg/dL', recorded_at: '2025-11-10T10:15:00Z', recorded_by: 'Lab Tech' },
  { id: 'vit-112', patient_id: 'pat-001', type: 'heart_rate', value: 82, unit: 'bpm', recorded_at: '2025-11-10T10:15:00Z', recorded_by: 'Nurse Kavitha' },
  { id: 'vit-113', patient_id: 'pat-001', type: 'bp_systolic', value: 150, unit: 'mmHg', recorded_at: '2025-10-12T09:00:00Z', recorded_by: 'Dr. Anita Verma' },
  { id: 'vit-114', patient_id: 'pat-001', type: 'bp_diastolic', value: 94, unit: 'mmHg', recorded_at: '2025-10-12T09:00:00Z', recorded_by: 'Dr. Anita Verma' },
  { id: 'vit-115', patient_id: 'pat-001', type: 'blood_glucose_fasting', value: 174, unit: 'mg/dL', recorded_at: '2025-10-12T09:00:00Z', recorded_by: 'Lab Tech' },
  { id: 'vit-116', patient_id: 'pat-001', type: 'weight', value: 83.1, unit: 'kg', recorded_at: '2025-10-12T09:00:00Z', recorded_by: 'Nurse Kavitha' },
  { id: 'vit-117', patient_id: 'pat-001', type: 'hba1c', value: 7.6, unit: '%', recorded_at: '2025-08-20T10:00:00Z', recorded_by: 'Lab Tech' },
  { id: 'vit-118', patient_id: 'pat-001', type: 'respiratory_rate', value: 18, unit: 'breaths/min', recorded_at: '2025-12-08T09:30:00Z', recorded_by: 'Nurse Kavitha' },
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params as { id: string };
    const url = new URL(context.request.url);
    const type = url.searchParams.get('type') || '';
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));

    if (!id) {
      return json({ message: 'Patient ID is required' }, 400);
    }

    if (!context.env.DB) {
      // Mock fallback
      let vitals = MOCK_VITALS.map(v => ({ ...v, patient_id: id }));
      if (type) {
        vitals = vitals.filter(v => v.type === type);
      }
      return json({ vitals: vitals.slice(0, limit) });
    }

    // Real D1 query
    const conditions: string[] = ['patient_id = ?'];
    const bindings: unknown[] = [id];

    if (type) {
      conditions.push('type = ?');
      bindings.push(type);
    }

    const where = conditions.join(' AND ');
    bindings.push(limit);

    const result = await context.env.DB.prepare(
      `SELECT * FROM vitals WHERE ${where} ORDER BY recorded_at DESC LIMIT ?`
    ).bind(...bindings).all();

    return json({ vitals: result.results });
  } catch (err) {
    return json({ message: 'Failed to fetch vitals', error: String(err) }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { id: patientId } = context.params as { id: string };

    if (!patientId) {
      return json({ message: 'Patient ID is required' }, 400);
    }

    const body = await context.request.json() as Record<string, unknown>;
    const { type, value, unit, recorded_by, source } = body;

    // Validate required fields
    if (!type || value === undefined || value === null) {
      return json({ message: 'Type and value are required' }, 400);
    }

    // Validate vital type
    if (!VITAL_TYPES[type as string]) {
      return json({
        message: `Invalid vital type: ${type}. Valid types: ${Object.keys(VITAL_TYPES).join(', ')}`,
      }, 400);
    }

    // Validate value is numeric
    if (typeof value !== 'number' || isNaN(value)) {
      return json({ message: 'Value must be a valid number' }, 400);
    }

    const vitalId = `vit-${crypto.randomUUID().split('-')[0]}`;
    const resolvedUnit = (unit as string) || VITAL_TYPES[type as string];
    const now = new Date().toISOString();

    if (!context.env.DB) {
      // Mock fallback
      const vital = {
        id: vitalId,
        patient_id: patientId,
        type,
        value,
        unit: resolvedUnit,
        recorded_at: now,
        recorded_by: recorded_by || 'System',
        notes: body.notes || null,
      };
      return json({ vital, message: 'Vital recorded (mock)' }, 201);
    }

    // Verify patient exists
    const patient = await context.env.DB.prepare(
      'SELECT id FROM patients WHERE id = ?'
    ).bind(patientId).first();

    if (!patient) {
      return json({ message: 'Patient not found' }, 404);
    }

    // Real D1 insert
    await context.env.DB.prepare(
      `INSERT INTO vitals (id, patient_id, type, value, unit, recorded_at, recorded_by, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      vitalId, patientId, type, value, resolvedUnit, now,
      recorded_by || null, source || 'manual'
    ).run();

    const vital = await context.env.DB.prepare(
      'SELECT * FROM vitals WHERE id = ?'
    ).bind(vitalId).first();

    return json({ vital, message: 'Vital recorded' }, 201);
  } catch (err) {
    return json({ message: 'Failed to record vital', error: String(err) }, 500);
  }
};
