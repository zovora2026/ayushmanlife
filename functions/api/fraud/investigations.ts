interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List investigations with details
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const alertId = url.searchParams.get('alert_id');

    if (!db) {
      return json({ investigations: [], total: 0 });
    }

    let query = `SELECT fi.*, fa.alert_type, fa.risk_score, fa.description as alert_description,
                        fa.claim_id, c.claim_number, c.claimed_amount, c.payer_scheme,
                        p.name as patient_name, u.name as investigator_name,
                        (SELECT COUNT(*) FROM fraud_investigation_notes n WHERE n.investigation_id = fi.id) as notes_count
                 FROM fraud_investigations fi
                 JOIN fraud_alerts fa ON fi.alert_id = fa.id
                 LEFT JOIN claims c ON fa.claim_id = c.id
                 LEFT JOIN patients p ON c.patient_id = p.id
                 LEFT JOIN users u ON fi.investigator_id = u.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (status) {
      query += ` AND fi.status = ?`;
      bindings.push(status);
    }
    if (alertId) {
      query += ` AND fi.alert_id = ?`;
      bindings.push(alertId);
    }

    query += ` ORDER BY fi.opened_at DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    // Summary
    const summary = await db.prepare(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COALESCE(SUM(recovery_amount), 0) as total_recovery
      FROM fraud_investigations
    `).first();

    return json({
      investigations: results || [],
      summary: summary || {},
    });
  } catch (error) {
    console.error('Error fetching investigations:', error);
    return json({ error: 'Failed to fetch investigations' }, 500);
  }
};

// POST: Create investigation or add note
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      type: 'investigation' | 'note';
      // For new investigation
      alert_id?: string;
      investigator_id?: string;
      priority?: string;
      // For adding note
      investigation_id?: string;
      note_type?: string;
      content?: string;
      // For updating investigation
      status?: string;
      findings?: string;
      action_taken?: string;
      recovery_amount?: number;
    };

    if (!db) {
      return json({ id: `inv-${Date.now()}` }, 201);
    }

    if (body.type === 'note') {
      if (!body.investigation_id || !body.content) {
        return json({ error: 'investigation_id and content are required for notes' }, 400);
      }
      const id = `note-${Date.now()}`;
      await db.prepare(`
        INSERT INTO fraud_investigation_notes (id, investigation_id, author_id, note_type, content)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, body.investigation_id, body.investigator_id || 'usr-001', body.note_type || 'note', body.content).run();

      return json({ note: { id, investigation_id: body.investigation_id, content: body.content } }, 201);
    }

    // Create new investigation
    if (!body.alert_id) {
      return json({ error: 'alert_id is required' }, 400);
    }

    // Check if investigation already exists for this alert
    const existing = await db.prepare(`SELECT id FROM fraud_investigations WHERE alert_id = ?`).bind(body.alert_id).first();
    if (existing) {
      // Update existing investigation
      const updates: string[] = [];
      const bindings: string[] = [];
      if (body.status) { updates.push('status = ?'); bindings.push(body.status); }
      if (body.findings) { updates.push('findings = ?'); bindings.push(body.findings); }
      if (body.action_taken) { updates.push('action_taken = ?'); bindings.push(body.action_taken); }
      if (body.recovery_amount !== undefined) { updates.push('recovery_amount = ?'); bindings.push(String(body.recovery_amount)); }
      if (body.status === 'closed') { updates.push("closed_at = datetime('now')"); }

      if (updates.length > 0) {
        bindings.push(existing.id as string);
        await db.prepare(`UPDATE fraud_investigations SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
      }

      const updated = await db.prepare(`SELECT * FROM fraud_investigations WHERE id = ?`).bind(existing.id).first();
      return json({ investigation: updated });
    }

    const id = `inv-${Date.now()}`;
    const caseNumber = `SIU-2026-${String(Date.now()).slice(-3)}`;
    const investigatorId = body.investigator_id || 'usr-001';

    await db.prepare(`
      INSERT INTO fraud_investigations (id, alert_id, investigator_id, case_number, priority)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, body.alert_id, investigatorId, caseNumber, body.priority || 'medium').run();

    // Update alert status to under_investigation
    await db.prepare(`UPDATE fraud_alerts SET status = 'under_investigation', investigated_by = ? WHERE id = ?`)
      .bind(investigatorId, body.alert_id).run();

    const investigation = await db.prepare(`
      SELECT fi.*, fa.alert_type, fa.risk_score
      FROM fraud_investigations fi
      JOIN fraud_alerts fa ON fi.alert_id = fa.id
      WHERE fi.id = ?
    `).bind(id).first();

    return json({ investigation }, 201);
  } catch (error) {
    console.error('Error creating investigation:', error);
    return json({ error: 'Failed to create/update investigation' }, 500);
  }
};
