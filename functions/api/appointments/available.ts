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
      return json({ error: 'Database not available', date, currency: 'INR', slots: [] }, 503);
    }

    // D1 query: find doctors (users with role='doctor') and their booked appointments for the date
    // Then compute available slots from a standard time grid
    let doctorQuery = `SELECT id as doctor_id, name as doctor, department
                       FROM users
                       WHERE role = 'doctor'`;
    const doctorBindings: string[] = [];

    if (department) {
      doctorQuery += ` AND department = ?`;
      doctorBindings.push(department);
    }

    doctorQuery += ` ORDER BY department, name`;

    const doctorStmt = db.prepare(doctorQuery);
    const { results: doctors } = await (doctorBindings.length > 0
      ? doctorStmt.bind(...doctorBindings)
      : doctorStmt
    ).all();

    // Get booked times for the given date
    const { results: bookedAppointments } = await db
      .prepare(
        `SELECT doctor_id, time FROM appointments
         WHERE date = ? AND status NOT IN ('cancelled', 'no-show')`
      )
      .bind(date)
      .all();

    // Standard time slots
    const standardSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM',
    ];

    // Build booked times map: doctor_id -> Set of booked times
    const bookedMap = new Map<string, Set<string>>();
    for (const appt of (bookedAppointments || [])) {
      const docId = appt.doctor_id as string;
      if (!bookedMap.has(docId)) bookedMap.set(docId, new Set());
      bookedMap.get(docId)!.add(appt.time as string);
    }

    // Build response grouped by doctor
    const slots = (doctors || []).map((doc: any) => ({
      department: doc.department,
      doctor: doc.doctor,
      doctor_id: doc.doctor_id,
      slots: standardSlots.map((time) => ({
        time,
        available: !(bookedMap.get(doc.doctor_id)?.has(time)),
      })),
    }));

    return json({
      date,
      currency: 'INR',
      slots,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return json({ error: 'Failed to fetch available slots' }, 500);
  }
};
