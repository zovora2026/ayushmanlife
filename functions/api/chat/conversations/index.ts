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

    if (!db) {
      return json({
        conversations: [
          {
            id: 'conv-001',
            title: 'Symptom Assessment - Chest Pain',
            mode: 'symptom-check',
            status: 'active',
            updated_at: '2026-03-30T09:15:00Z',
          },
          {
            id: 'conv-002',
            title: 'Claim Query - PMJAY Policy',
            mode: 'claims-assist',
            status: 'active',
            updated_at: '2026-03-29T14:30:00Z',
          },
          {
            id: 'conv-003',
            title: 'Appointment Booking - Dr. Sharma',
            mode: 'appointment',
            status: 'resolved',
            updated_at: '2026-03-28T11:00:00Z',
          },
          {
            id: 'conv-004',
            title: 'Medication Inquiry - Metformin Dosage',
            mode: 'medication',
            status: 'resolved',
            updated_at: '2026-03-27T16:45:00Z',
          },
          {
            id: 'conv-005',
            title: 'Lab Report Interpretation',
            mode: 'general',
            status: 'active',
            updated_at: '2026-03-26T10:20:00Z',
          },
        ],
      });
    }

    const userId = (context.data as any)?.currentUser?.id || 'anonymous';

    const { results } = await db
      .prepare(
        `SELECT id, title, mode, status, updated_at
         FROM chat_conversations
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT 50`
      )
      .bind(userId)
      .all();

    return json({ conversations: results || [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return json({ error: 'Failed to fetch conversations' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      patient_id?: string;
      title?: string;
      mode?: string;
    };

    const id = `conv-${Date.now()}`;
    const title = body.title || 'New Conversation';
    const mode = body.mode || 'general';

    if (!db) {
      return json(
        {
          conversation: {
            id,
            title,
            mode,
            status: 'active',
            patient_id: body.patient_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        201
      );
    }

    const userId = (context.data as any)?.currentUser?.id || 'anonymous';

    await db
      .prepare(
        `INSERT INTO chat_conversations (id, user_id, patient_id, title, mode, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`
      )
      .bind(id, userId, body.patient_id || null, title, mode)
      .run();

    const conversation = await db
      .prepare(`SELECT * FROM chat_conversations WHERE id = ?`)
      .bind(id)
      .first();

    return json({ conversation }, 201);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return json({ error: 'Failed to create conversation' }, 500);
  }
};
