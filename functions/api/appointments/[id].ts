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

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const appointmentId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      status?: string;
      time_slot?: string;
      doctor_id?: string;
      visit_reason?: string;
      notes?: string;
    };

    if (!body.status && !body.time_slot && !body.doctor_id) {
      return json(
        {
          error:
            'At least one field (status, time_slot, doctor_id) is required for update',
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
          time_slot: body.time_slot || '10:00 AM',
          doctor_id: body.doctor_id || 'doc-001',
          visit_reason: body.visit_reason || 'Routine consultation',
          notes: body.notes || '',
          updated_at: new Date().toISOString(),
        },
      });
    }

    const updates: string[] = [];
    const bindings: (string | null)[] = [];

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);
    }
    if (body.time_slot) {
      updates.push('time_slot = ?');
      bindings.push(body.time_slot);
    }
    if (body.doctor_id) {
      updates.push('doctor_id = ?');
      bindings.push(body.doctor_id);
    }
    if (body.visit_reason) {
      updates.push('visit_reason = ?');
      bindings.push(body.visit_reason);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      bindings.push(body.notes);
    }

    updates.push("updated_at = datetime('now')");
    bindings.push(appointmentId);

    await db
      .prepare(
        `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`
      )
      .bind(...bindings)
      .run();

    const appointment = await db
      .prepare(`SELECT * FROM appointments WHERE id = ?`)
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
