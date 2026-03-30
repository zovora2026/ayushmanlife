interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Mock data: 10 realistic Indian patients
const MOCK_PATIENTS = [
  {
    id: 'pat-001', name: 'Rajesh Kumar Sharma', age: 58, gender: 'Male',
    phone: '+91-9876543210', email: 'rajesh.sharma@email.com',
    aadhaar_last4: '4832', abha_id: '91-4832-7651-9023',
    address: '42, Nehru Nagar, Jaipur, Rajasthan 302016',
    insurance_type: 'ayushman_bharat', insurance_id: 'AB-RJ-2024-00198',
    blood_group: 'B+', conditions: ['Type 2 Diabetes', 'Hypertension'],
    created_at: '2024-03-15T10:30:00Z', updated_at: '2025-11-20T14:00:00Z',
  },
  {
    id: 'pat-002', name: 'Priya Devi Gupta', age: 45, gender: 'Female',
    phone: '+91-9123456789', email: 'priya.gupta@email.com',
    aadhaar_last4: '7215', abha_id: '91-7215-3048-6192',
    address: '15, MG Road, Lucknow, Uttar Pradesh 226001',
    insurance_type: 'private', insurance_id: 'SBI-HP-2023-45210',
    blood_group: 'O+', conditions: ['Hypothyroidism', 'GERD'],
    created_at: '2024-05-22T09:15:00Z', updated_at: '2025-10-18T11:30:00Z',
  },
  {
    id: 'pat-003', name: 'Amit Singh Yadav', age: 34, gender: 'Male',
    phone: '+91-8765432109', email: 'amit.yadav@email.com',
    aadhaar_last4: '3901', abha_id: '91-3901-5274-8136',
    address: '7, Saket Colony, Bhopal, Madhya Pradesh 462001',
    insurance_type: 'ayushman_bharat', insurance_id: 'AB-MP-2024-00342',
    blood_group: 'A+', conditions: ['Asthma'],
    created_at: '2024-07-10T08:00:00Z', updated_at: '2025-12-01T16:45:00Z',
  },
  {
    id: 'pat-004', name: 'Sunita Bai Patel', age: 62, gender: 'Female',
    phone: '+91-7654321098', email: 'sunita.patel@email.com',
    aadhaar_last4: '6148', abha_id: '91-6148-2937-5061',
    address: '23, Ashram Road, Ahmedabad, Gujarat 380009',
    insurance_type: 'cghs', insurance_id: 'CGHS-GJ-2022-11045',
    blood_group: 'AB+', conditions: ['Osteoarthritis', 'Hypertension', 'Type 2 Diabetes'],
    created_at: '2023-11-05T12:00:00Z', updated_at: '2025-09-25T10:20:00Z',
  },
  {
    id: 'pat-005', name: 'Mohammed Irfan Khan', age: 41, gender: 'Male',
    phone: '+91-6543210987', email: 'irfan.khan@email.com',
    aadhaar_last4: '8523', abha_id: '91-8523-1746-3905',
    address: '88, Charminar Road, Hyderabad, Telangana 500002',
    insurance_type: 'esis', insurance_id: 'ESIS-TS-2024-78321',
    blood_group: 'O-', conditions: ['Chronic Kidney Disease Stage 2'],
    created_at: '2024-01-20T11:30:00Z', updated_at: '2025-11-10T09:00:00Z',
  },
  {
    id: 'pat-006', name: 'Lakshmi Venkatesh Iyer', age: 55, gender: 'Female',
    phone: '+91-9988776655', email: 'lakshmi.iyer@email.com',
    aadhaar_last4: '2047', abha_id: '91-2047-6381-9254',
    address: '12, T. Nagar, Chennai, Tamil Nadu 600017',
    insurance_type: 'private', insurance_id: 'STAR-TN-2023-56789',
    blood_group: 'B-', conditions: ['Rheumatoid Arthritis', 'Anaemia'],
    created_at: '2024-02-14T15:00:00Z', updated_at: '2025-10-30T13:15:00Z',
  },
  {
    id: 'pat-007', name: 'Vikram Joshi', age: 29, gender: 'Male',
    phone: '+91-8877665544', email: 'vikram.joshi@email.com',
    aadhaar_last4: '5639', abha_id: '91-5639-8102-4367',
    address: '5, FC Road, Pune, Maharashtra 411004',
    insurance_type: 'ayushman_bharat', insurance_id: 'AB-MH-2024-00567',
    blood_group: 'A-', conditions: ['Migraine'],
    created_at: '2024-09-01T07:45:00Z', updated_at: '2025-12-05T08:30:00Z',
  },
  {
    id: 'pat-008', name: 'Ananya Das', age: 38, gender: 'Female',
    phone: '+91-7766554433', email: 'ananya.das@email.com',
    aadhaar_last4: '1478', abha_id: '91-1478-9520-6843',
    address: '30, Salt Lake, Kolkata, West Bengal 700091',
    insurance_type: 'private', insurance_id: 'HDFC-WB-2024-23456',
    blood_group: 'O+', conditions: ['PCOD', 'Vitamin D Deficiency'],
    created_at: '2024-06-18T10:00:00Z', updated_at: '2025-11-28T17:00:00Z',
  },
  {
    id: 'pat-009', name: 'Harjeet Singh Bedi', age: 67, gender: 'Male',
    phone: '+91-6655443322', email: 'harjeet.bedi@email.com',
    aadhaar_last4: '9361', abha_id: '91-9361-4078-2516',
    address: '18, Model Town, Ludhiana, Punjab 141002',
    insurance_type: 'cghs', insurance_id: 'CGHS-PB-2021-09876',
    blood_group: 'AB-', conditions: ['COPD', 'Ischaemic Heart Disease', 'Type 2 Diabetes'],
    created_at: '2023-08-10T14:30:00Z', updated_at: '2025-12-10T11:45:00Z',
  },
  {
    id: 'pat-010', name: 'Meena Kumari Reddy', age: 50, gender: 'Female',
    phone: '+91-5544332211', email: 'meena.reddy@email.com',
    aadhaar_last4: '7082', abha_id: '91-7082-3169-5498',
    address: '9, Banjara Hills, Hyderabad, Telangana 500034',
    insurance_type: 'ayushman_bharat', insurance_id: 'AB-TS-2024-00891',
    blood_group: 'B+', conditions: ['Hypertension', 'Hyperlipidemia'],
    created_at: '2024-04-25T13:00:00Z', updated_at: '2025-11-15T15:30:00Z',
  },
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const q = url.searchParams.get('q')?.toLowerCase() || '';
    const insuranceType = url.searchParams.get('insurance_type') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    if (!context.env.DB) {
      // Mock fallback
      let filtered = MOCK_PATIENTS;
      if (q) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.abha_id.includes(q) ||
          p.conditions.some(c => c.toLowerCase().includes(q))
        );
      }
      if (insuranceType) {
        filtered = filtered.filter(p => p.insurance_type === insuranceType);
      }
      const total = filtered.length;
      const patients = filtered.slice(offset, offset + limit);
      return json({ patients, total, page });
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
      // Mock fallback — return the patient as if created
      const patient = {
        id, name, age, gender, phone, email, address,
        insurance_type, insurance_id, aadhaar_last4: body.aadhaar_last4, abha_id: body.abha_id,
        blood_group, conditions: body.conditions || [],
        created_at: now, updated_at: now,
      };
      return json({ patient, message: 'Patient created (mock)' }, 201);
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
