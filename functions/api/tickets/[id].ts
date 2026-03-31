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
    const ticketId = context.params.id as string;
    const db = context.env.DB;

    if (!db) {
      return json({
        ticket: {
          id: ticketId,
          ticket_number: 'TKT-2026-0001',
          title: 'Sample ticket',
          description: 'Sample ticket description',
          category: 'General',
          priority: 'medium',
          status: 'open',
          assigned_to: null,
          created_by: null,
          sla_hours: 24,
          sla_breached: 0,
          resolution: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolved_at: null,
        },
      });
    }

    const ticket = await db
      .prepare(
        `SELECT t.id, t.ticket_number, t.title, t.description, t.category,
                t.priority, t.status,
                t.assigned_to, u_assigned.name as assigned_to_name,
                t.created_by, u_creator.name as created_by_name,
                t.sla_hours, t.sla_breached, t.resolution,
                t.created_at, t.updated_at, t.resolved_at
         FROM tickets t
         LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
         LEFT JOIN users u_creator ON t.created_by = u_creator.id
         WHERE t.id = ?`
      )
      .bind(ticketId)
      .first();

    if (!ticket) {
      return json({ error: 'Ticket not found' }, 404);
    }

    // Fetch comments
    let comments: unknown[] = [];
    try {
      const commentsResult = await db
        .prepare('SELECT * FROM ticket_comments WHERE ticket_id = ? ORDER BY created_at ASC')
        .bind(ticketId)
        .all();
      comments = commentsResult.results || [];
    } catch {
      // table may not exist
    }

    return json({ ticket, comments });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return json({ error: 'Failed to fetch ticket' }, 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const ticketId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      status?: string;
      assigned_to?: string;
      priority?: string;
      resolution?: string;
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
          assigned_to: body.assigned_to || null,
          priority: body.priority || 'high',
          resolution: body.resolution || null,
          updated_at: new Date().toISOString(),
        },
      });
    }

    const updates: string[] = [];
    const bindings: (string | number | null)[] = [];

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);

      // Set resolved_at timestamp when resolving
      if (body.status === 'resolved' || body.status === 'closed') {
        updates.push("resolved_at = datetime('now')");
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
    if (body.resolution !== undefined) {
      updates.push('resolution = ?');
      bindings.push(body.resolution);
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
        `SELECT t.id, t.ticket_number, t.title, t.description, t.category,
                t.priority, t.status,
                t.assigned_to, u_assigned.name as assigned_to_name,
                t.created_by, u_creator.name as created_by_name,
                t.sla_hours, t.sla_breached, t.resolution,
                t.created_at, t.updated_at, t.resolved_at
         FROM tickets t
         LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
         LEFT JOIN users u_creator ON t.created_by = u_creator.id
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const ticketId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      author_name: string;
      author_id?: string;
      comment: string;
      type?: string;
    };

    if (!body.comment || !body.author_name) {
      return json({ error: 'comment and author_name are required' }, 400);
    }

    if (!db) {
      return json({
        comment: { id: `tc-${Date.now()}`, ticket_id: ticketId, ...body, created_at: new Date().toISOString() },
      });
    }

    const id = `tc-${Date.now()}`;
    await db
      .prepare(
        'INSERT INTO ticket_comments (id, ticket_id, author_id, author_name, comment, type) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, ticketId, body.author_id || null, body.author_name, body.comment, body.type || 'comment')
      .run();

    const comment = await db
      .prepare('SELECT * FROM ticket_comments WHERE id = ?')
      .bind(id)
      .first();

    return json({ comment, message: 'Comment added' });
  } catch (error) {
    console.error('Error adding comment:', error);
    return json({ error: 'Failed to add comment' }, 500);
  }
};
