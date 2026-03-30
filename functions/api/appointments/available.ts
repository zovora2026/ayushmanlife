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

    if (!db) {
      const allSlots = [
        {
          department: 'General Medicine',
          doctor: 'Dr. Rajesh Sharma',
          doctor_id: 'doc-001',
          qualification: 'MBBS, MD (Internal Medicine)',
          slots: [
            { time: '09:00 AM', available: true },
            { time: '09:30 AM', available: false },
            { time: '10:00 AM', available: true },
            { time: '10:30 AM', available: true },
            { time: '11:00 AM', available: false },
            { time: '11:30 AM', available: true },
            { time: '02:00 PM', available: true },
            { time: '02:30 PM', available: true },
            { time: '03:00 PM', available: false },
            { time: '03:30 PM', available: true },
          ],
          consultation_fee: 300,
          room: 'OPD-102',
        },
        {
          department: 'Cardiology',
          doctor: 'Dr. Priya Menon',
          doctor_id: 'doc-002',
          qualification: 'MBBS, MD, DM (Cardiology) — AIIMS Delhi',
          slots: [
            { time: '10:00 AM', available: false },
            { time: '10:30 AM', available: false },
            { time: '11:00 AM', available: true },
            { time: '11:30 AM', available: true },
            { time: '02:00 PM', available: false },
            { time: '02:30 PM', available: true },
            { time: '03:00 PM', available: true },
          ],
          consultation_fee: 800,
          room: 'OPD-205',
        },
        {
          department: 'Orthopaedics',
          doctor: 'Dr. Sunil Verma',
          doctor_id: 'doc-003',
          qualification: 'MBBS, MS (Orthopaedics) — PGIMER Chandigarh',
          slots: [
            { time: '09:00 AM', available: true },
            { time: '09:30 AM', available: true },
            { time: '10:00 AM', available: false },
            { time: '10:30 AM', available: true },
            { time: '11:00 AM', available: false },
            { time: '02:00 PM', available: true },
            { time: '02:30 PM', available: false },
            { time: '03:00 PM', available: true },
          ],
          consultation_fee: 600,
          room: 'OPD-108',
        },
        {
          department: 'Paediatrics',
          doctor: 'Dr. Anita Krishnan',
          doctor_id: 'doc-004',
          qualification: 'MBBS, DCH, DNB (Paediatrics)',
          slots: [
            { time: '09:00 AM', available: false },
            { time: '09:30 AM', available: true },
            { time: '10:00 AM', available: true },
            { time: '10:30 AM', available: true },
            { time: '11:00 AM', available: true },
            { time: '11:30 AM', available: false },
            { time: '02:00 PM', available: true },
            { time: '02:30 PM', available: true },
          ],
          consultation_fee: 400,
          room: 'OPD-115',
        },
        {
          department: 'Gynaecology & Obstetrics',
          doctor: 'Dr. Deepa Iyer',
          doctor_id: 'doc-005',
          qualification: 'MBBS, MS (OBG), Fellowship in Reproductive Medicine',
          slots: [
            { time: '10:00 AM', available: true },
            { time: '10:30 AM', available: false },
            { time: '11:00 AM', available: true },
            { time: '11:30 AM', available: true },
            { time: '02:00 PM', available: false },
            { time: '02:30 PM', available: true },
            { time: '03:00 PM', available: true },
          ],
          consultation_fee: 500,
          room: 'OPD-210',
        },
        {
          department: 'Nephrology',
          doctor: 'Dr. Arun Nair',
          doctor_id: 'doc-006',
          qualification: 'MBBS, MD, DM (Nephrology) — CMC Vellore',
          slots: [
            { time: '09:00 AM', available: true },
            { time: '09:30 AM', available: false },
            { time: '10:00 AM', available: true },
            { time: '02:00 PM', available: true },
            { time: '02:30 PM', available: true },
          ],
          consultation_fee: 700,
          room: 'OPD-312',
        },
      ];

      let filtered = allSlots;
      if (department) {
        filtered = allSlots.filter(
          (s) =>
            s.department.toLowerCase() === department.toLowerCase()
        );
      }

      return json({
        date,
        currency: 'INR',
        slots: filtered,
      });
    }

    let query = `SELECT s.id as doctor_id, s.name as doctor, s.qualification, d.name as department,
                        ts.time_slot as time, ts.is_available as available,
                        s.consultation_fee, s.room
                 FROM time_slots ts
                 JOIN staff s ON ts.doctor_id = s.id
                 JOIN departments d ON s.department_id = d.id
                 WHERE ts.slot_date = ?`;
    const bindings: string[] = [date];

    if (department) {
      query += ` AND d.name = ?`;
      bindings.push(department);
    }

    query += ` ORDER BY d.name, ts.time_slot ASC`;

    const { results } = await db
      .prepare(query)
      .bind(...bindings)
      .all();

    return json({
      date,
      currency: 'INR',
      slots: results || [],
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return json({ error: 'Failed to fetch available slots' }, 500);
  }
};
