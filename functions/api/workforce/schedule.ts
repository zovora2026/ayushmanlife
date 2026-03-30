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
    const department = url.searchParams.get('department');
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const week = url.searchParams.get('week');

    if (!db) {
      const schedule = {
        date,
        shifts: [
          {
            shift: 'Morning',
            time: '07:00 AM — 02:00 PM',
            staff: [
              {
                id: 'staff-001',
                name: 'Dr. Priya Menon',
                role: 'Consultant',
                department: 'Cardiology',
                status: 'on-duty',
                location: 'OPD-205',
              },
              {
                id: 'staff-002',
                name: 'Dr. Rajesh Sharma',
                role: 'Consultant',
                department: 'General Medicine',
                status: 'on-duty',
                location: 'OPD-102',
              },
              {
                id: 'staff-003',
                name: 'Dr. Sunil Verma',
                role: 'Consultant',
                department: 'Orthopaedics',
                status: 'on-duty',
                location: 'OPD-108',
              },
              {
                id: 'staff-004',
                name: 'Dr. Anita Krishnan',
                role: 'Consultant',
                department: 'Paediatrics',
                status: 'on-duty',
                location: 'OPD-115',
              },
              {
                id: 'staff-005',
                name: 'Sr. Nurse Kavita Singh',
                role: 'Nursing',
                department: 'Emergency',
                status: 'on-duty',
                location: 'ER-Main',
              },
              {
                id: 'nurse-002',
                name: 'Nurse Meera Joshi',
                role: 'Nursing',
                department: 'General Medicine',
                status: 'on-duty',
                location: 'Ward-3A',
              },
              {
                id: 'nurse-003',
                name: 'Nurse Pooja Rani',
                role: 'Nursing',
                department: 'Paediatrics',
                status: 'on-duty',
                location: 'Ward-5',
              },
              {
                id: 'tech-001',
                name: 'Anil Pandey',
                role: 'Technician',
                department: 'Pathology',
                status: 'on-duty',
                location: 'Lab-1',
              },
            ],
          },
          {
            shift: 'Afternoon',
            time: '02:00 PM — 09:00 PM',
            staff: [
              {
                id: 'staff-007',
                name: 'Dr. Deepa Iyer',
                role: 'Consultant',
                department: 'Gynaecology & Obstetrics',
                status: 'on-duty',
                location: 'OPD-210',
              },
              {
                id: 'doc-008',
                name: 'Dr. Arun Nair',
                role: 'Consultant',
                department: 'Nephrology',
                status: 'on-duty',
                location: 'Dialysis Unit',
              },
              {
                id: 'doc-009',
                name: 'Dr. Manish Tiwari',
                role: 'Registrar',
                department: 'General Medicine',
                status: 'on-duty',
                location: 'Ward-3B',
              },
              {
                id: 'nurse-004',
                name: 'Nurse Sunita Rawat',
                role: 'Nursing',
                department: 'Emergency',
                status: 'on-duty',
                location: 'ER-Main',
              },
              {
                id: 'nurse-005',
                name: 'Nurse Rekha Verma',
                role: 'Nursing',
                department: 'ICU',
                status: 'on-duty',
                location: 'ICU-1',
              },
              {
                id: 'tech-002',
                name: 'Sanjay Kumar',
                role: 'Technician',
                department: 'Radiology',
                status: 'on-duty',
                location: 'X-Ray-1',
              },
            ],
          },
          {
            shift: 'Night',
            time: '09:00 PM — 07:00 AM',
            staff: [
              {
                id: 'doc-010',
                name: 'Dr. Vivek Mishra',
                role: 'Duty Medical Officer',
                department: 'Emergency',
                status: 'on-duty',
                location: 'ER-Main',
              },
              {
                id: 'doc-011',
                name: 'Dr. Sneha Patil',
                role: 'Registrar',
                department: 'Obstetrics',
                status: 'on-call',
                location: 'Labour Room',
              },
              {
                id: 'nurse-006',
                name: 'Nurse Priti Sinha',
                role: 'Nursing',
                department: 'Emergency',
                status: 'on-duty',
                location: 'ER-Main',
              },
              {
                id: 'nurse-007',
                name: 'Nurse Geeta Devi',
                role: 'Nursing',
                department: 'ICU',
                status: 'on-duty',
                location: 'ICU-1',
              },
              {
                id: 'nurse-008',
                name: 'Nurse Asha Kumari',
                role: 'Nursing',
                department: 'General Ward',
                status: 'on-duty',
                location: 'Ward-2',
              },
              {
                id: 'tech-003',
                name: 'Ramesh Gupta',
                role: 'Technician',
                department: 'Pathology',
                status: 'on-call',
                location: 'Lab-1',
              },
            ],
          },
        ],
        on_leave: [
          {
            id: 'doc-012',
            name: 'Dr. Nandini Rao',
            role: 'Consultant',
            department: 'Rheumatology',
            leave_type: 'Planned Leave',
            leave_from: '2026-03-28',
            leave_to: '2026-04-02',
          },
          {
            id: 'nurse-009',
            name: 'Nurse Babita Devi',
            role: 'Nursing',
            department: 'Orthopaedics',
            leave_type: 'Sick Leave',
            leave_from: '2026-03-30',
            leave_to: '2026-03-31',
          },
        ],
        summary: {
          total_on_duty: 20,
          total_on_call: 2,
          total_on_leave: 2,
          coverage_pct: 92.5,
          departments_fully_staffed: 8,
          departments_understaffed: 2,
        },
      };

      return json(schedule);
    }

    const { results } = await db
      .prepare(
        `SELECT sch.id, sch.shift, sch.shift_time, sch.location, sch.status,
                s.id as staff_id, s.name, s.role, d.name as department
         FROM schedule sch
         JOIN staff s ON sch.staff_id = s.id
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE sch.schedule_date = ?
         ${department ? 'AND d.name = ?' : ''}
         ORDER BY sch.shift ASC, s.name ASC`
      )
      .bind(...(department ? [date, department] : [date]))
      .all();

    const onLeave = await db
      .prepare(
        `SELECT l.*, s.name, s.role, d.name as department
         FROM leaves l
         JOIN staff s ON l.staff_id = s.id
         LEFT JOIN departments d ON s.department_id = d.id
         WHERE ? BETWEEN l.leave_from AND l.leave_to`
      )
      .bind(date)
      .all();

    return json({
      date,
      staff_schedule: results || [],
      on_leave: onLeave.results || [],
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return json({ error: 'Failed to fetch schedule' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      staff_id: string;
      schedule_date: string;
      shift: string;
      shift_time?: string;
      location?: string;
    };

    if (!body.staff_id || !body.schedule_date || !body.shift) {
      return json(
        { error: 'staff_id, schedule_date, and shift are required' },
        400
      );
    }

    const validShifts = ['Morning', 'Afternoon', 'Night'];
    if (!validShifts.includes(body.shift)) {
      return json(
        {
          error: `Invalid shift. Must be one of: ${validShifts.join(', ')}`,
        },
        400
      );
    }

    const id = `sch-${Date.now()}`;

    const shiftTimes: Record<string, string> = {
      Morning: '07:00 AM — 02:00 PM',
      Afternoon: '02:00 PM — 09:00 PM',
      Night: '09:00 PM — 07:00 AM',
    };

    if (!db) {
      return json(
        {
          schedule_entry: {
            id,
            staff_id: body.staff_id,
            schedule_date: body.schedule_date,
            shift: body.shift,
            shift_time: body.shift_time || shiftTimes[body.shift],
            location: body.location || 'TBD',
            status: 'scheduled',
            created_at: new Date().toISOString(),
          },
        },
        201
      );
    }

    await db
      .prepare(
        `INSERT INTO schedule (id, staff_id, schedule_date, shift, shift_time, location, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'scheduled', datetime('now'))`
      )
      .bind(
        id,
        body.staff_id,
        body.schedule_date,
        body.shift,
        body.shift_time || shiftTimes[body.shift],
        body.location || 'TBD'
      )
      .run();

    const entry = await db
      .prepare(`SELECT * FROM schedule WHERE id = ?`)
      .bind(id)
      .first();

    return json({ schedule_entry: entry }, 201);
  } catch (error) {
    console.error('Error creating schedule entry:', error);
    return json({ error: 'Failed to create schedule entry' }, 500);
  }
};
