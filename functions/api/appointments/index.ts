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
      return json({ error: 'Database not available', appointments: [] }, 503);
    }

    // D1 query using actual schema:
    // appointments: id, patient_id, doctor_id, department, date, time, duration_minutes, type, status, notes, created_at
    // Join patients for patient_name, join users for doctor_name
    let query = `SELECT a.id, a.patient_id, p.name as patient_name,
                        a.doctor_id, u.name as doctor_name,
                        a.department, a.date, a.time, a.duration_minutes,
                        a.type, a.status, a.notes, a.created_at
                 FROM appointments a
                 LEFT JOIN patients p ON a.patient_id = p.id
                 LEFT JOIN users u ON a.doctor_id = u.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (date) {
      query += ` AND a.date = ?`;
      bindings.push(date);
    }
    if (department) {
      query += ` AND a.department = ?`;
      bindings.push(department);
    }
    if (status) {
      query += ` AND a.status = ?`;
      bindings.push(status);
    }

    query += ` ORDER BY a.date ASC, a.time ASC LIMIT 100`;

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
      department: string;
      date: string;
      time: string;
      duration_minutes?: number;
      type?: string;
      notes?: string;
    };

    if (!body.patient_id || !body.department || !body.date || !body.time) {
      return json(
        {
          error:
            'patient_id, department, date, and time are required',
        },
        400
      );
    }

    const id = `apt-${Date.now()}`;

    if (!db) {
      return json({ error: 'Database not available', appointment: null }, 503);
    }

    await db
      .prepare(
        `INSERT INTO appointments (id, patient_id, doctor_id, department, date, time, duration_minutes, type, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`
      )
      .bind(
        id,
        body.patient_id,
        body.doctor_id || null,
        body.department,
        body.date,
        body.time,
        body.duration_minutes || 30,
        body.type || 'consultation',
        body.notes || null
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
