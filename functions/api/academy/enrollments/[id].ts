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
    const enrollmentId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      progress?: number;
      modules_completed?: number;
      status?: string;
      score?: number;
      time_spent_hours?: number;
    };

    const validStatuses = [
      'not-started',
      'in-progress',
      'completed',
      'dropped',
    ];
    if (body.status && !validStatuses.includes(body.status)) {
      return json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        400
      );
    }

    if (
      body.progress !== undefined &&
      (body.progress < 0 || body.progress > 100)
    ) {
      return json(
        { error: 'Progress must be between 0 and 100' },
        400
      );
    }

    if (!db) {
      const isCompleted =
        body.status === 'completed' || body.progress === 100;

      return json({
        enrollment: {
          id: enrollmentId,
          progress: body.progress ?? 50,
          modules_completed: body.modules_completed ?? 3,
          status: isCompleted
            ? 'completed'
            : body.status || 'in-progress',
          score: isCompleted ? body.score || 85 : body.score || null,
          time_spent_hours: body.time_spent_hours ?? 6.5,
          completed_at: isCompleted
            ? new Date().toISOString()
            : null,
          certificate_issued: isCompleted,
          updated_at: new Date().toISOString(),
        },
      });
    }

    const updates: string[] = [];
    const bindings: (string | number | null)[] = [];

    if (body.progress !== undefined) {
      updates.push('progress_percent = ?');
      bindings.push(body.progress);

      // Auto-set status based on progress
      if (body.progress === 100 && !body.status) {
        updates.push("status = 'completed'");
        updates.push("completed_at = datetime('now')");
      } else if (body.progress > 0 && !body.status) {
        updates.push("status = 'in-progress'");
      }
    }

    if (body.status) {
      updates.push('status = ?');
      bindings.push(body.status);

      if (body.status === 'completed') {
        updates.push("completed_at = datetime('now')");
      }
    }

    if (updates.length === 0) {
      return json(
        { error: 'At least one field is required for update' },
        400
      );
    }

    bindings.push(enrollmentId);

    await db
      .prepare(
        `UPDATE learning_enrollments SET ${updates.join(', ')} WHERE id = ?`
      )
      .bind(...bindings)
      .run();

    const enrollment = await db
      .prepare(
        `SELECT e.*, lp.name as path_title
         FROM learning_enrollments e
         JOIN learning_paths lp ON e.path_id = lp.id
         WHERE e.id = ?`
      )
      .bind(enrollmentId)
      .first();

    if (!enrollment) {
      return json({ error: 'Enrollment not found' }, 404);
    }

    return json({ enrollment });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return json({ error: 'Failed to update enrollment' }, 500);
  }
};
