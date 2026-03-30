interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Mock active medications — realistic Indian prescriptions
const MOCK_MEDICATIONS = [
  {
    id: 'med-001', patient_id: 'pat-001',
    name: 'Metformin 500mg', generic_name: 'Metformin Hydrochloride',
    dosage: '500mg', frequency: 'Twice daily', route: 'Oral',
    prescribed_by: 'Dr. Anita Verma', prescribed_by_id: 'doc-001',
    start_date: '2024-04-01', end_date: null,
    instructions: 'Take after meals. Monitor blood glucose levels regularly.',
    indication: 'Type 2 Diabetes Mellitus',
    status: 'active', refills_remaining: 3,
    pharmacy: 'Apollo Pharmacy, Nehru Nagar',
    created_at: '2024-04-01T10:00:00Z',
  },
  {
    id: 'med-002', patient_id: 'pat-001',
    name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate',
    dosage: '5mg', frequency: 'Once daily', route: 'Oral',
    prescribed_by: 'Dr. Anita Verma', prescribed_by_id: 'doc-001',
    start_date: '2024-04-01', end_date: null,
    instructions: 'Take in the morning. Avoid grapefruit juice.',
    indication: 'Hypertension',
    status: 'active', refills_remaining: 3,
    pharmacy: 'Apollo Pharmacy, Nehru Nagar',
    created_at: '2024-04-01T10:00:00Z',
  },
  {
    id: 'med-003', patient_id: 'pat-001',
    name: 'Atorvastatin 10mg', generic_name: 'Atorvastatin Calcium',
    dosage: '10mg', frequency: 'Once daily', route: 'Oral',
    prescribed_by: 'Dr. Anita Verma', prescribed_by_id: 'doc-001',
    start_date: '2024-06-15', end_date: null,
    instructions: 'Take at bedtime. Report any unexplained muscle pain.',
    indication: 'Dyslipidemia',
    status: 'active', refills_remaining: 2,
    pharmacy: 'Apollo Pharmacy, Nehru Nagar',
    created_at: '2024-06-15T11:00:00Z',
  },
  {
    id: 'med-004', patient_id: 'pat-001',
    name: 'Pantoprazole 40mg', generic_name: 'Pantoprazole Sodium',
    dosage: '40mg', frequency: 'Once daily', route: 'Oral',
    prescribed_by: 'Dr. Sanjay Mehra', prescribed_by_id: 'doc-003',
    start_date: '2025-09-10', end_date: '2025-12-10',
    instructions: 'Take 30 minutes before breakfast on empty stomach.',
    indication: 'GERD / Gastric protection',
    status: 'active', refills_remaining: 0,
    pharmacy: 'MedPlus, MG Road',
    created_at: '2025-09-10T14:30:00Z',
  },
  {
    id: 'med-005', patient_id: 'pat-001',
    name: 'Telmisartan 40mg', generic_name: 'Telmisartan',
    dosage: '40mg', frequency: 'Once daily', route: 'Oral',
    prescribed_by: 'Dr. Anita Verma', prescribed_by_id: 'doc-001',
    start_date: '2025-06-01', end_date: null,
    instructions: 'Take in the morning. Monitor BP and potassium levels.',
    indication: 'Hypertension with diabetic nephropathy prevention',
    status: 'active', refills_remaining: 4,
    pharmacy: 'Apollo Pharmacy, Nehru Nagar',
    created_at: '2025-06-01T09:00:00Z',
  },
  {
    id: 'med-006', patient_id: 'pat-001',
    name: 'Aspirin 75mg', generic_name: 'Acetylsalicylic Acid',
    dosage: '75mg', frequency: 'Once daily', route: 'Oral',
    prescribed_by: 'Dr. Anita Verma', prescribed_by_id: 'doc-001',
    start_date: '2024-04-01', end_date: null,
    instructions: 'Take after lunch. Do not take on empty stomach.',
    indication: 'Cardiovascular risk reduction',
    status: 'active', refills_remaining: 3,
    pharmacy: 'Apollo Pharmacy, Nehru Nagar',
    created_at: '2024-04-01T10:00:00Z',
  },
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params as { id: string };
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status') || 'active';
    const includeDiscontinued = url.searchParams.get('include_discontinued') === 'true';

    if (!id) {
      return json({ message: 'Patient ID is required' }, 400);
    }

    if (!context.env.DB) {
      // Mock fallback
      let medications = MOCK_MEDICATIONS.map(m => ({ ...m, patient_id: id }));
      if (!includeDiscontinued) {
        medications = medications.filter(m => m.status === status);
      }
      return json({ medications });
    }

    // Real D1 query
    const conditions: string[] = ['patient_id = ?'];
    const bindings: unknown[] = [id];

    if (!includeDiscontinued) {
      conditions.push('status = ?');
      bindings.push(status);
    }

    const where = conditions.join(' AND ');

    const result = await context.env.DB.prepare(
      `SELECT * FROM medications WHERE ${where} ORDER BY start_date DESC`
    ).bind(...bindings).all();

    return json({ medications: result.results });
  } catch (err) {
    return json({ message: 'Failed to fetch medications', error: String(err) }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { id: patientId } = context.params as { id: string };

    if (!patientId) {
      return json({ message: 'Patient ID is required' }, 400);
    }

    const body = await context.request.json() as Record<string, unknown>;
    const {
      name, generic_name, dosage, frequency, route,
      prescribed_by, prescribed_by_id, start_date, end_date,
      instructions, indication, refills_remaining, pharmacy,
    } = body;

    // Validate required fields
    if (!name || !dosage || !frequency) {
      return json({ message: 'Name, dosage, and frequency are required' }, 400);
    }

    const medId = `med-${crypto.randomUUID().split('-')[0]}`;
    const now = new Date().toISOString();
    const resolvedStartDate = (start_date as string) || now.split('T')[0];

    if (!context.env.DB) {
      // Mock fallback
      const medication = {
        id: medId,
        patient_id: patientId,
        name, generic_name: generic_name || null,
        dosage, frequency, route: route || 'Oral',
        prescribed_by: prescribed_by || 'Unknown',
        prescribed_by_id: prescribed_by_id || null,
        start_date: resolvedStartDate,
        end_date: end_date || null,
        instructions: instructions || null,
        indication: indication || null,
        status: 'active',
        refills_remaining: refills_remaining ?? 0,
        pharmacy: pharmacy || null,
        created_at: now,
      };
      return json({ medication, message: 'Medication prescribed (mock)' }, 201);
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
      `INSERT INTO medications (
        id, patient_id, name, generic_name, dosage, frequency, route,
        prescribed_by, prescribed_by_id, start_date, end_date,
        instructions, indication, status, refills_remaining, pharmacy, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
    ).bind(
      medId, patientId,
      name, generic_name || null, dosage, frequency, route || 'Oral',
      prescribed_by || 'Unknown', prescribed_by_id || null,
      resolvedStartDate, end_date || null,
      instructions || null, indication || null,
      refills_remaining ?? 0, pharmacy || null,
      now
    ).run();

    const medication = await context.env.DB.prepare(
      'SELECT * FROM medications WHERE id = ?'
    ).bind(medId).first();

    return json({ medication, message: 'Medication prescribed' }, 201);
  } catch (err) {
    return json({ message: 'Failed to prescribe medication', error: String(err) }, 500);
  }
};
