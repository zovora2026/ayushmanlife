interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Mock full patient profile with related data
function getMockPatient(id: string) {
  return {
    patient: {
      id,
      name: 'Rajesh Kumar Sharma',
      age: 58,
      gender: 'Male',
      date_of_birth: '1967-08-14',
      phone: '+91-9876543210',
      email: 'rajesh.sharma@email.com',
      aadhaar_last4: '4832',
      abha_id: '91-4832-7651-9023',
      address: '42, Nehru Nagar, Jaipur, Rajasthan 302016',
      insurance_type: 'ayushman_bharat',
      insurance_id: 'AB-RJ-2024-00198',
      blood_group: 'B+',
      emergency_contact_name: 'Sunita Sharma',
      emergency_contact_phone: '+91-9876543211',
      emergency_contact_relation: 'Wife',
      conditions: ['Type 2 Diabetes', 'Hypertension'],
      allergies: ['Sulfonamides', 'Dust'],
      created_at: '2024-03-15T10:30:00Z',
      updated_at: '2025-11-20T14:00:00Z',
    },
    recent_vitals: [
      { id: 'vit-001', type: 'bp_systolic', value: 142, unit: 'mmHg', recorded_at: '2025-12-08T09:30:00Z' },
      { id: 'vit-002', type: 'bp_diastolic', value: 88, unit: 'mmHg', recorded_at: '2025-12-08T09:30:00Z' },
      { id: 'vit-003', type: 'blood_glucose_fasting', value: 156, unit: 'mg/dL', recorded_at: '2025-12-08T09:30:00Z' },
      { id: 'vit-004', type: 'hba1c', value: 7.2, unit: '%', recorded_at: '2025-11-15T10:00:00Z' },
      { id: 'vit-005', type: 'heart_rate', value: 78, unit: 'bpm', recorded_at: '2025-12-08T09:30:00Z' },
      { id: 'vit-006', type: 'weight', value: 82.5, unit: 'kg', recorded_at: '2025-12-08T09:30:00Z' },
      { id: 'vit-007', type: 'spo2', value: 97, unit: '%', recorded_at: '2025-12-08T09:30:00Z' },
      { id: 'vit-008', type: 'temperature', value: 98.4, unit: 'F', recorded_at: '2025-12-08T09:30:00Z' },
    ],
    active_medications: [
      {
        id: 'med-001', name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily',
        route: 'Oral', prescribed_by: 'Dr. Anita Verma', start_date: '2024-04-01',
        instructions: 'Take after meals', status: 'active',
      },
      {
        id: 'med-002', name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily',
        route: 'Oral', prescribed_by: 'Dr. Anita Verma', start_date: '2024-04-01',
        instructions: 'Take in the morning', status: 'active',
      },
      {
        id: 'med-003', name: 'Atorvastatin 10mg', dosage: '10mg', frequency: 'Once daily',
        route: 'Oral', prescribed_by: 'Dr. Anita Verma', start_date: '2024-06-15',
        instructions: 'Take at bedtime', status: 'active',
      },
      {
        id: 'med-004', name: 'Pantoprazole 40mg', dosage: '40mg', frequency: 'Once daily',
        route: 'Oral', prescribed_by: 'Dr. Sanjay Mehra', start_date: '2025-09-10',
        instructions: 'Take 30 minutes before breakfast on empty stomach', status: 'active',
      },
    ],
    upcoming_appointments: [
      {
        id: 'apt-001', doctor_name: 'Dr. Anita Verma', department: 'Endocrinology',
        date: '2026-01-10', time: '10:30', type: 'follow_up',
        status: 'scheduled', notes: 'HbA1c review and medication adjustment',
      },
      {
        id: 'apt-002', doctor_name: 'Dr. Pradeep Nair', department: 'Ophthalmology',
        date: '2026-01-25', time: '14:00', type: 'screening',
        status: 'scheduled', notes: 'Annual diabetic retinopathy screening',
      },
    ],
    recent_claims: [
      {
        id: 'clm-001', claim_number: 'CLM-2025-RJ-04521',
        type: 'opd', amount: 2850, status: 'approved',
        insurance_type: 'ayushman_bharat', filed_date: '2025-11-20',
        description: 'Monthly consultation and blood work',
      },
      {
        id: 'clm-002', claim_number: 'CLM-2025-RJ-03187',
        type: 'pharmacy', amount: 1420, status: 'paid',
        insurance_type: 'ayushman_bharat', filed_date: '2025-10-18',
        description: 'Monthly medication refill',
      },
      {
        id: 'clm-003', claim_number: 'CLM-2025-RJ-01893',
        type: 'lab', amount: 3200, status: 'paid',
        insurance_type: 'ayushman_bharat', filed_date: '2025-09-05',
        description: 'Quarterly HbA1c, lipid profile, and renal function tests',
      },
    ],
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params as { id: string };

    if (!id) {
      return json({ message: 'Patient ID is required' }, 400);
    }

    if (!context.env.DB) {
      // Mock fallback
      return json(getMockPatient(id));
    }

    // Real D1 query — fetch patient
    const patient = await context.env.DB.prepare(
      'SELECT * FROM patients WHERE id = ?'
    ).bind(id).first();

    if (!patient) {
      return json({ message: 'Patient not found' }, 404);
    }

    // Fetch related data in parallel
    const [vitalsResult, medsResult, appointmentsResult, claimsResult] = await Promise.all([
      context.env.DB.prepare(
        'SELECT * FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 10'
      ).bind(id).all(),

      context.env.DB.prepare(
        "SELECT * FROM medications WHERE patient_id = ? AND status = 'active' ORDER BY start_date DESC"
      ).bind(id).all(),

      context.env.DB.prepare(
        "SELECT * FROM appointments WHERE patient_id = ? AND date >= date('now') ORDER BY date ASC LIMIT 5"
      ).bind(id).all(),

      context.env.DB.prepare(
        'SELECT * FROM claims WHERE patient_id = ? ORDER BY filed_date DESC LIMIT 5'
      ).bind(id).all(),
    ]);

    return json({
      patient,
      recent_vitals: vitalsResult.results,
      active_medications: medsResult.results,
      upcoming_appointments: appointmentsResult.results,
      recent_claims: claimsResult.results,
    });
  } catch (err) {
    return json({ message: 'Failed to fetch patient', error: String(err) }, 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params as { id: string };

    if (!id) {
      return json({ message: 'Patient ID is required' }, 400);
    }

    const body = await context.request.json() as Record<string, unknown>;

    // Fields allowed to be updated
    const allowedFields = [
      'name', 'age', 'gender', 'phone', 'email', 'address',
      'insurance_type', 'insurance_id', 'insurance_provider', 'blood_group',
      'emergency_contact', 'medical_history', 'allergies', 'chronic_conditions',
      'risk_score', 'churn_risk', 'satisfaction_score',
    ];

    const updates: string[] = [];
    const bindings: unknown[] = [];

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        const value = body[field];
        // Serialize arrays/objects to JSON
        bindings.push(
          Array.isArray(value) || (typeof value === 'object' && value !== null)
            ? JSON.stringify(value)
            : value
        );
      }
    }

    if (updates.length === 0) {
      return json({ message: 'No valid fields to update' }, 400);
    }

    // Always update last_visit
    updates.push('last_visit = ?');
    const now = new Date().toISOString();
    bindings.push(now);

    // Add patient ID for WHERE clause
    bindings.push(id);

    if (!context.env.DB) {
      // Mock fallback — merge updates into mock patient
      const mock = getMockPatient(id);
      const updatedPatient = { ...mock.patient, ...body, updated_at: now };
      return json({ patient: updatedPatient, message: 'Patient updated (mock)' });
    }

    // Real D1 update
    const result = await context.env.DB.prepare(
      `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    if (result.meta.changes === 0) {
      return json({ message: 'Patient not found' }, 404);
    }

    const patient = await context.env.DB.prepare(
      'SELECT * FROM patients WHERE id = ?'
    ).bind(id).first();

    return json({ patient, message: 'Patient updated' });
  } catch (err) {
    return json({ message: 'Failed to update patient', error: String(err) }, 500);
  }
};
