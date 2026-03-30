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
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const category = url.searchParams.get('category');

    if (!db) {
      let tickets = [
        {
          id: 'TKT-2026-0001',
          title: 'PMJAY claim rejected — incorrect package code',
          description:
            'Patient Ramesh Prasad (ABHA-1234-5678-9012) claim for knee replacement was rejected by SHA with reason code PKG_MISMATCH. Need correction and resubmission.',
          category: 'Claims',
          priority: 'high',
          status: 'open',
          patient_name: 'Ramesh Prasad',
          assigned_to: 'Neha Gupta',
          department: 'Claims Processing',
          created_at: '2026-03-30T08:30:00Z',
          updated_at: '2026-03-30T08:30:00Z',
          sla_due: '2026-03-31T08:30:00Z',
        },
        {
          id: 'TKT-2026-0002',
          title: 'Billing discrepancy — OPD charges double-billed',
          description:
            'Patient Sunita Devi reports being charged twice for consultation with Dr. Sharma on 28th March. Bill No: INV-2026-8845. Amount disputed: ₹600.',
          category: 'Billing',
          priority: 'medium',
          status: 'in-progress',
          patient_name: 'Sunita Devi',
          assigned_to: 'Ravi Shankar',
          department: 'Finance',
          created_at: '2026-03-29T14:00:00Z',
          updated_at: '2026-03-30T09:15:00Z',
          sla_due: '2026-03-31T14:00:00Z',
        },
        {
          id: 'TKT-2026-0003',
          title: 'Lab report delay — CBC pending for 48 hours',
          description:
            'Patient Mohammed Irfan CBC sample was collected on 28th March but report is still pending. Lab ticket ref: LAB-9923. Doctor needs report urgently for treatment plan.',
          category: 'Laboratory',
          priority: 'high',
          status: 'in-progress',
          patient_name: 'Mohammed Irfan',
          assigned_to: 'Dr. Kavita Singh',
          department: 'Pathology',
          created_at: '2026-03-29T16:00:00Z',
          updated_at: '2026-03-30T07:00:00Z',
          sla_due: '2026-03-30T16:00:00Z',
        },
        {
          id: 'TKT-2026-0004',
          title: 'Patient complaint — long OPD waiting time',
          description:
            'Mrs. Lakshmi Venkatesh complained about 3-hour waiting time at Orthopaedics OPD on 29th March. She is a senior citizen and PMJAY beneficiary. Suggests priority queue for elderly patients.',
          category: 'Patient Grievance',
          priority: 'medium',
          status: 'open',
          patient_name: 'Lakshmi Venkatesh',
          assigned_to: null,
          department: 'Patient Relations',
          created_at: '2026-03-29T18:00:00Z',
          updated_at: '2026-03-29T18:00:00Z',
          sla_due: '2026-04-01T18:00:00Z',
        },
        {
          id: 'TKT-2026-0005',
          title: 'Insurance pre-authorization pending — Star Health',
          description:
            'Pre-authorization for Amit Sharma (Policy: SH-2026-445566) for angiography scheduled on 2nd April is pending. Star Health TPA has not responded in 72 hours.',
          category: 'Insurance',
          priority: 'high',
          status: 'escalated',
          patient_name: 'Amit Sharma',
          assigned_to: 'Priyanka Mehta',
          department: 'Insurance Coordination',
          created_at: '2026-03-27T10:00:00Z',
          updated_at: '2026-03-30T09:00:00Z',
          sla_due: '2026-03-30T10:00:00Z',
        },
        {
          id: 'TKT-2026-0006',
          title: 'Pharmacy stock-out — Metformin 500mg',
          description:
            'Metformin 500mg tablets out of stock in hospital pharmacy since 29th March. Multiple diabetic patients affected. Jan Aushadhi generic available but branded not in stock.',
          category: 'Pharmacy',
          priority: 'medium',
          status: 'in-progress',
          patient_name: null,
          assigned_to: 'Vikram Reddy',
          department: 'Pharmacy',
          created_at: '2026-03-29T12:00:00Z',
          updated_at: '2026-03-30T08:00:00Z',
          sla_due: '2026-03-31T12:00:00Z',
        },
        {
          id: 'TKT-2026-0007',
          title: 'Discharge summary not provided — resolved',
          description:
            'Patient Fatima Begum discharge summary was not provided at the time of discharge on 25th March. Summary has now been generated and sent to patient via email and WhatsApp.',
          category: 'Documentation',
          priority: 'low',
          status: 'resolved',
          patient_name: 'Fatima Begum',
          assigned_to: 'Anjali Tiwari',
          department: 'Medical Records',
          created_at: '2026-03-25T16:00:00Z',
          updated_at: '2026-03-28T10:00:00Z',
          sla_due: '2026-03-27T16:00:00Z',
        },
      ];

      if (status) {
        tickets = tickets.filter((t) => t.status === status);
      }
      if (priority) {
        tickets = tickets.filter((t) => t.priority === priority);
      }
      if (category) {
        tickets = tickets.filter(
          (t) => t.category.toLowerCase() === category.toLowerCase()
        );
      }

      return json({ tickets, total: tickets.length });
    }

    // D1 query using actual schema:
    // tickets: id, ticket_number, title, description, category, priority, status,
    //          assigned_to (TEXT ref users.id), created_by (TEXT ref users.id),
    //          sla_hours, sla_breached, resolution, created_at, updated_at, resolved_at
    let query = `SELECT t.id, t.ticket_number, t.title, t.description, t.category,
                        t.priority, t.status,
                        t.assigned_to, u_assigned.name as assigned_to_name,
                        t.created_by, u_creator.name as created_by_name,
                        t.sla_hours, t.sla_breached, t.resolution,
                        t.created_at, t.updated_at, t.resolved_at
                 FROM tickets t
                 LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
                 LEFT JOIN users u_creator ON t.created_by = u_creator.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (status) {
      query += ` AND t.status = ?`;
      bindings.push(status);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      bindings.push(priority);
    }
    if (category) {
      query += ` AND t.category = ?`;
      bindings.push(category);
    }

    query += ` ORDER BY t.created_at DESC LIMIT 100`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({ tickets: results || [], total: results?.length || 0 });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return json({ error: 'Failed to fetch tickets' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      title: string;
      description: string;
      category: string;
      priority?: string;
      assigned_to?: string;
    };

    if (!body.title || !body.description || !body.category) {
      return json(
        { error: 'title, description, and category are required' },
        400
      );
    }

    const id = crypto.randomUUID();
    const ticketNumber = `TKT-${Date.now()}`;
    const priority = body.priority || 'medium';

    // Calculate SLA hours based on priority
    const slaHoursMap: Record<string, number> = {
      critical: 4,
      high: 24,
      medium: 48,
      low: 72,
    };
    const slaHours = slaHoursMap[priority] || 24;

    if (!db) {
      return json(
        {
          ticket: {
            id,
            ticket_number: ticketNumber,
            title: body.title,
            description: body.description,
            category: body.category,
            priority,
            status: 'open',
            assigned_to: body.assigned_to || null,
            created_by: null,
            sla_hours: slaHours,
            sla_breached: 0,
            resolution: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        201
      );
    }

    const userId = (context.data as any)?.currentUser?.id || null;

    await db
      .prepare(
        `INSERT INTO tickets (id, ticket_number, title, description, category, priority, status, assigned_to, created_by, sla_hours)
         VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)`
      )
      .bind(
        id,
        ticketNumber,
        body.title,
        body.description,
        body.category,
        priority,
        body.assigned_to || null,
        userId,
        slaHours
      )
      .run();

    const ticket = await db
      .prepare(`SELECT * FROM tickets WHERE id = ?`)
      .bind(id)
      .first();

    return json({ ticket }, 201);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return json({ error: 'Failed to create ticket' }, 500);
  }
};
