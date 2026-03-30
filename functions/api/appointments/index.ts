interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY?: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const date = url.searchParams.get('date');
    const department = url.searchParams.get('department');
    const status = url.searchParams.get('status');

    if (!db) {
      let appointments = [
        {
          id: 'apt-001',
          patient_name: 'Rajesh Kumar',
          patient_id: 'pat-1010',
          doctor_name: 'Dr. Priya Menon',
          department: 'Cardiology',
          appointment_date: '2026-03-30',
          time_slot: '10:00 AM',
          status: 'confirmed',
          type: 'Follow-up',
          visit_reason: 'Post-angioplasty review',
          abha_id: 'ABHA-1234-5678-9012',
          insurance: 'PMJAY',
        },
        {
          id: 'apt-002',
          patient_name: 'Sunita Devi',
          patient_id: 'pat-1011',
          doctor_name: 'Dr. Rajesh Sharma',
          department: 'General Medicine',
          appointment_date: '2026-03-30',
          time_slot: '10:30 AM',
          status: 'checked-in',
          type: 'New Consultation',
          visit_reason: 'Persistent fever and body ache',
          abha_id: 'ABHA-2345-6789-0123',
          insurance: 'Self-Pay',
        },
        {
          id: 'apt-003',
          patient_name: 'Mohammed Irfan',
          patient_id: 'pat-1012',
          doctor_name: 'Dr. Sunil Verma',
          department: 'Orthopaedics',
          appointment_date: '2026-03-30',
          time_slot: '11:00 AM',
          status: 'confirmed',
          type: 'Follow-up',
          visit_reason: 'Post knee replacement physiotherapy assessment',
          abha_id: 'ABHA-3456-7890-1234',
          insurance: 'Star Health',
        },
        {
          id: 'apt-004',
          patient_name: 'Lakshmi Venkatesh',
          patient_id: 'pat-1013',
          doctor_name: 'Dr. Anita Krishnan',
          department: 'Paediatrics',
          appointment_date: '2026-03-30',
          time_slot: '11:30 AM',
          status: 'confirmed',
          type: 'Vaccination',
          visit_reason: 'DPT booster dose for child (age 5)',
          abha_id: 'ABHA-4567-8901-2345',
          insurance: 'CGHS',
        },
        {
          id: 'apt-005',
          patient_name: 'Amit Sharma',
          patient_id: 'pat-1014',
          doctor_name: 'Dr. Deepa Iyer',
          department: 'Gynaecology & Obstetrics',
          appointment_date: '2026-03-30',
          time_slot: '02:00 PM',
          status: 'scheduled',
          type: 'Antenatal Checkup',
          visit_reason: 'Routine ANC visit — 28 weeks',
          abha_id: 'ABHA-5678-9012-3456',
          insurance: 'ICICI Lombard',
        },
        {
          id: 'apt-006',
          patient_name: 'Gopal Krishnan',
          patient_id: 'pat-1015',
          doctor_name: 'Dr. Arun Nair',
          department: 'Nephrology',
          appointment_date: '2026-03-31',
          time_slot: '09:00 AM',
          status: 'scheduled',
          type: 'Dialysis Session',
          visit_reason: 'Routine haemodialysis — twice weekly',
          abha_id: 'ABHA-6789-0123-4567',
          insurance: 'PMJAY',
        },
        {
          id: 'apt-007',
          patient_name: 'Fatima Begum',
          patient_id: 'pat-1016',
          doctor_name: 'Dr. Rajesh Sharma',
          department: 'General Medicine',
          appointment_date: '2026-03-31',
          time_slot: '10:00 AM',
          status: 'scheduled',
          type: 'New Consultation',
          visit_reason: 'Diabetes management — HbA1c review',
          abha_id: 'ABHA-7890-1234-5678',
          insurance: 'New India Assurance',
        },
      ];

      // Apply filters
      if (date) {
        appointments = appointments.filter(
          (a) => a.appointment_date === date
        );
      }
      if (department) {
        appointments = appointments.filter(
          (a) =>
            a.department.toLowerCase() === department.toLowerCase()
        );
      }
      if (status) {
        appointments = appointments.filter(
          (a) => a.status === status
        );
      }

      return json({ appointments });
    }

    let query = `SELECT a.id, p.name as patient_name, a.patient_id,
                        d_staff.name as doctor_name, dept.name as department,
                        a.appointment_date, a.time_slot, a.status, a.type, a.visit_reason,
                        p.abha_id, a.insurance
                 FROM appointments a
                 JOIN patients p ON a.patient_id = p.id
                 LEFT JOIN staff d_staff ON a.doctor_id = d_staff.id
                 LEFT JOIN departments dept ON a.department_id = dept.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (date) {
      query += ` AND date(a.appointment_date) = ?`;
      bindings.push(date);
    }
    if (department) {
      query += ` AND dept.name = ?`;
      bindings.push(department);
    }
    if (status) {
      query += ` AND a.status = ?`;
      bindings.push(status);
    }

    query += ` ORDER BY a.appointment_date ASC, a.time_slot ASC LIMIT 100`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({ appointments: results || [] });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return json({ error: 'Failed to fetch appointments' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      patient_id: string;
      doctor_id?: string;
      department_id?: string;
      appointment_date: string;
      time_slot: string;
      type?: string;
      visit_reason?: string;
      insurance?: string;
    };

    if (!body.patient_id || !body.appointment_date || !body.time_slot) {
      return json(
        {
          error:
            'patient_id, appointment_date, and time_slot are required',
        },
        400
      );
    }

    const id = `apt-${Date.now()}`;

    if (!db) {
      return json(
        {
          appointment: {
            id,
            patient_id: body.patient_id,
            doctor_id: body.doctor_id || null,
            department_id: body.department_id || null,
            appointment_date: body.appointment_date,
            time_slot: body.time_slot,
            type: body.type || 'New Consultation',
            visit_reason: body.visit_reason || '',
            insurance: body.insurance || 'Self-Pay',
            status: 'scheduled',
            created_at: new Date().toISOString(),
          },
        },
        201
      );
    }

    await db
      .prepare(
        `INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, time_slot, type, visit_reason, insurance, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', datetime('now'))`
      )
      .bind(
        id,
        body.patient_id,
        body.doctor_id || null,
        body.department_id || null,
        body.appointment_date,
        body.time_slot,
        body.type || 'New Consultation',
        body.visit_reason || '',
        body.insurance || 'Self-Pay'
      )
      .run();

    const appointment = await db
      .prepare(`SELECT * FROM appointments WHERE id = ?`)
      .bind(id)
      .first();

    return json({ appointment }, 201);
  } catch (error) {
    console.error('Error booking appointment:', error);
    return json({ error: 'Failed to book appointment' }, 500);
  }
};
