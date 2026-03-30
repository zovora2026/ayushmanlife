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
    const ticketId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      status?: string;
      assigned_to?: string;
      priority?: string;
      resolution_notes?: string;
      notes?: string;
    };

    const validStatuses = [
      'open',
      'in-progress',
      'escalated',
      'resolved',
      'closed',
    ];
    if (body.status && !validStatuses.includes(body.status)) {
      return json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        400
      );
    }

    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return json(
        {
          error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        },
        400
      );
    }

    if (!db) {
      return json({
        ticket: {
          id: ticketId,
          status: body.status || 'in-progress',
          assigned_to: body.assigned_to || 'Neha Gupta',
          priority: body.priority || 'high',
          resolution_notes: body.resolution_notes || null,
          notes: body.notes || null,
          updated_at: new Date().toISOString(),
        },
      });
    }

    const updates: string[] = [];
    const bindings: (string | null)[] = [];

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);

      // Set resolved/closed timestamps
      if (body.status === 'resolved') {
        updates.push("resolved_at = datetime('now')");
      } else if (body.status === 'closed') {
        updates.push("closed_at = datetime('now')");
      }
    }
    if (body.assigned_to) {
      updates.push('assigned_to = ?');
      bindings.push(body.assigned_to);
    }
    if (body.priority) {
      updates.push('priority = ?');
      bindings.push(body.priority);
    }
    if (body.resolution_notes) {
      updates.push('resolution_notes = ?');
      bindings.push(body.resolution_notes);
    }
    if (body.notes) {
      updates.push('notes = ?');
      bindings.push(body.notes);
    }

    if (updates.length === 0) {
      return json(
        { error: 'At least one field is required for update' },
        400
      );
    }

    updates.push("updated_at = datetime('now')");
    bindings.push(ticketId);

    await db
      .prepare(
        `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`
      )
      .bind(...bindings)
      .run();

    const ticket = await db
      .prepare(
        `SELECT t.*, p.name as patient_name, s.name as assigned_to_name
         FROM tickets t
         LEFT JOIN patients p ON t.patient_id = p.id
         LEFT JOIN staff s ON t.assigned_to = s.id
         WHERE t.id = ?`
      )
      .bind(ticketId)
      .first();

    if (!ticket) {
      return json({ error: 'Ticket not found' }, 404);
    }

    return json({ ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return json({ error: 'Failed to update ticket' }, 500);
  }
};
