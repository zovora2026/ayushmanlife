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
    const appointmentId = context.params.id as string;
    const db = context.env.DB;

    if (!db) {
      return json({
        appointment: {
          id: appointmentId,
          patient_id: 'pat-1010',
          doctor_id: 'usr-002',
          department: 'Cardiology',
          date: '2026-03-30',
          time: '10:00 AM',
          duration_minutes: 30,
          type: 'consultation',
          status: 'scheduled',
          notes: null,
        },
      });
    }

    const appointment = await db
      .prepare(
        `SELECT a.id, a.patient_id, p.name as patient_name,
                a.doctor_id, u.name as doctor_name,
                a.department, a.date, a.time, a.duration_minutes,
                a.type, a.status, a.notes, a.created_at
         FROM appointments a
         LEFT JOIN patients p ON a.patient_id = p.id
         LEFT JOIN users u ON a.doctor_id = u.id
         WHERE a.id = ?`
      )
      .bind(appointmentId)
      .first();

    if (!appointment) {
      return json({ error: 'Appointment not found' }, 404);
    }

    return json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return json({ error: 'Failed to fetch appointment' }, 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const appointmentId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      status?: string;
      time?: string;
      doctor_id?: string;
      notes?: string;
      department?: string;
      date?: string;
      duration_minutes?: number;
      type?: string;
    };

    if (!body.status && !body.time && !body.doctor_id && !body.notes && !body.department && !body.date) {
      return json(
        {
          error:
            'At least one field (status, time, doctor_id, notes, department, date) is required for update',
        },
        400
      );
    }

    const validStatuses = [
      'scheduled',
      'confirmed',
      'checked-in',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
    ];
    if (body.status && !validStatuses.includes(body.status)) {
      return json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        400
      );
    }

    if (!db) {
      return json({
        appointment: {
          id: appointmentId,
          status: body.status || 'confirmed',
          time: body.time || '10:00 AM',
          doctor_id: body.doctor_id || 'usr-002',
          notes: body.notes || '',
          department: body.department || 'Cardiology',
        },
      });
    }

    const updates: string[] = [];
    const bindings: (string | number | null)[] = [];

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);
    }
    if (body.time) {
      updates.push('time = ?');
      bindings.push(body.time);
    }
    if (body.doctor_id) {
      updates.push('doctor_id = ?');
      bindings.push(body.doctor_id);
    }
    if (body.department) {
      updates.push('department = ?');
      bindings.push(body.department);
    }
    if (body.date) {
      updates.push('date = ?');
      bindings.push(body.date);
    }
    if (body.duration_minutes !== undefined) {
      updates.push('duration_minutes = ?');
      bindings.push(body.duration_minutes);
    }
    if (body.type) {
      updates.push('type = ?');
      bindings.push(body.type);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      bindings.push(body.notes);
    }

    bindings.push(appointmentId);

    await db
      .prepare(
        `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`
      )
      .bind(...bindings)
      .run();

    const appointment = await db
      .prepare(
        `SELECT a.id, a.patient_id, p.name as patient_name,
                a.doctor_id, u.name as doctor_name,
                a.department, a.date, a.time, a.duration_minutes,
                a.type, a.status, a.notes, a.created_at
         FROM appointments a
         LEFT JOIN patients p ON a.patient_id = p.id
         LEFT JOIN users u ON a.doctor_id = u.id
         WHERE a.id = ?`
      )
      .bind(appointmentId)
      .first();

    if (!appointment) {
      return json({ error: 'Appointment not found' }, 404);
    }

    return json({ appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return json({ error: 'Failed to update appointment' }, 500);
  }
};
