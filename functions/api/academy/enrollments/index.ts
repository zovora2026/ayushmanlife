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
    const statusFilter = url.searchParams.get('status');

    if (!db) {
      let enrollments = [
        {
          id: 'enr-001',
          staff_id: 'staff-006',
          staff_name: 'Ravi Shankar',
          department: 'Finance',
          path_id: 'path-001',
          path_title: 'PMJAY Claims Processing Masterclass',
          status: 'completed',
          progress: 100,
          modules_completed: 8,
          total_modules: 8,
          enrolled_at: '2025-11-01T10:00:00Z',
          completed_at: '2026-01-15T14:30:00Z',
          certificate_issued: true,
          score: 92,
          time_spent_hours: 14.5,
        },
        {
          id: 'enr-002',
          staff_id: 'staff-005',
          staff_name: 'Sr. Nurse Kavita Singh',
          department: 'Emergency',
          path_id: 'path-002',
          path_title: 'BLS & ACLS Refresher Course',
          status: 'in-progress',
          progress: 60,
          modules_completed: 3,
          total_modules: 5,
          enrolled_at: '2026-03-10T09:00:00Z',
          completed_at: null,
          certificate_issued: false,
          score: null,
          time_spent_hours: 5.2,
        },
        {
          id: 'enr-003',
          staff_id: 'staff-008',
          staff_name: 'Neha Gupta',
          department: 'Claims Processing',
          path_id: 'path-003',
          path_title: 'ICD-10 and Medical Coding for Indian Healthcare',
          status: 'in-progress',
          progress: 42,
          modules_completed: 5,
          total_modules: 12,
          enrolled_at: '2026-01-20T11:00:00Z',
          completed_at: null,
          certificate_issued: false,
          score: null,
          time_spent_hours: 10.8,
        },
        {
          id: 'enr-004',
          staff_id: 'staff-002',
          staff_name: 'Dr. Rajesh Sharma',
          department: 'General Medicine',
          path_id: 'path-005',
          path_title: 'Hospital Infection Control & NABH Standards',
          status: 'completed',
          progress: 100,
          modules_completed: 6,
          total_modules: 6,
          enrolled_at: '2025-10-15T08:00:00Z',
          completed_at: '2025-12-20T16:00:00Z',
          certificate_issued: true,
          score: 88,
          time_spent_hours: 11.3,
        },
        {
          id: 'enr-005',
          staff_id: 'staff-004',
          staff_name: 'Dr. Anita Krishnan',
          department: 'Paediatrics',
          path_id: 'path-004',
          path_title: 'Patient Communication & Cultural Sensitivity',
          status: 'completed',
          progress: 100,
          modules_completed: 4,
          total_modules: 4,
          enrolled_at: '2025-08-01T10:00:00Z',
          completed_at: '2025-09-15T12:00:00Z',
          certificate_issued: true,
          score: 95,
          time_spent_hours: 7.0,
        },
        {
          id: 'enr-006',
          staff_id: 'staff-001',
          staff_name: 'Dr. Priya Menon',
          department: 'Cardiology',
          path_id: 'path-006',
          path_title: 'ABHA Integration & Digital Health Records',
          status: 'in-progress',
          progress: 33,
          modules_completed: 1,
          total_modules: 3,
          enrolled_at: '2026-03-20T14:00:00Z',
          completed_at: null,
          certificate_issued: false,
          score: null,
          time_spent_hours: 1.5,
        },
        {
          id: 'enr-007',
          staff_id: 'staff-002',
          staff_name: 'Dr. Rajesh Sharma',
          department: 'General Medicine',
          path_id: 'path-007',
          path_title: 'Advanced Diabetes Management for Primary Care',
          status: 'in-progress',
          progress: 75,
          modules_completed: 6,
          total_modules: 8,
          enrolled_at: '2026-01-10T09:00:00Z',
          completed_at: null,
          certificate_issued: false,
          score: null,
          time_spent_hours: 12.5,
        },
        {
          id: 'enr-008',
          staff_id: 'staff-007',
          staff_name: 'Dr. Deepa Iyer',
          department: 'Gynaecology & Obstetrics',
          path_id: 'path-005',
          path_title: 'Hospital Infection Control & NABH Standards',
          status: 'not-started',
          progress: 0,
          modules_completed: 0,
          total_modules: 6,
          enrolled_at: '2026-03-28T10:00:00Z',
          completed_at: null,
          certificate_issued: false,
          score: null,
          time_spent_hours: 0,
        },
      ];

      if (statusFilter) {
        enrollments = enrollments.filter(
          (e) => e.status === statusFilter
        );
      }

      const summary = {
        total_enrollments: enrollments.length,
        completed: enrollments.filter((e) => e.status === 'completed')
          .length,
        in_progress: enrollments.filter(
          (e) => e.status === 'in-progress'
        ).length,
        not_started: enrollments.filter(
          (e) => e.status === 'not-started'
        ).length,
        avg_progress: Math.round(
          enrollments.reduce((sum, e) => sum + e.progress, 0) /
            enrollments.length
        ),
        certificates_issued: enrollments.filter(
          (e) => e.certificate_issued
        ).length,
      };

      return json({ enrollments, summary });
    }

    const url2 = new URL(context.request.url);
    const userId = url2.searchParams.get('user_id') || (context.data as any)?.user?.id;
    let query = `SELECT e.id, e.user_id, u.name as user_name, u.department, e.path_id,
                        lp.name as path_title, lp.category, lp.difficulty,
                        lp.modules_count as total_modules, lp.estimated_hours,
                        e.status, e.progress_percent,
                        e.started_at, e.completed_at
                 FROM learning_enrollments e
                 JOIN learning_paths lp ON e.path_id = lp.id
                 JOIN users u ON e.user_id = u.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (userId) {
      query += ` AND e.user_id = ?`;
      bindings.push(userId);
    }
    if (statusFilter) {
      query += ` AND e.status = ?`;
      bindings.push(statusFilter);
    }

    query += ` ORDER BY e.started_at DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    const enrollments = results || [];
    const summary = {
      total_enrollments: enrollments.length,
      completed: enrollments.filter((e: any) => e.status === 'completed').length,
      in_progress: enrollments.filter((e: any) => e.status === 'in_progress').length,
      not_started: enrollments.filter((e: any) => e.status === 'not_started').length,
      avg_progress: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress_percent || 0), 0) / enrollments.length)
        : 0,
    };

    return json({ enrollments, summary });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return json({ error: 'Failed to fetch enrollments' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      staff_id?: string;
      path_id: string;
    };

    if (!body.path_id) {
      return json({ error: 'path_id is required' }, 400);
    }

    const staffId =
      body.staff_id ||
      (context.data as any)?.user?.id ||
      'anonymous';
    const id = `enr-${Date.now()}`;

    if (!db) {
      return json(
        {
          enrollment: {
            id,
            staff_id: staffId,
            path_id: body.path_id,
            status: 'not-started',
            progress: 0,
            modules_completed: 0,
            enrolled_at: new Date().toISOString(),
            completed_at: null,
            certificate_issued: false,
            score: null,
            time_spent_hours: 0,
          },
        },
        201
      );
    }

    // Check if already enrolled
    const existing = await db
      .prepare(
        `SELECT id FROM learning_enrollments WHERE user_id = ? AND path_id = ? AND status != 'dropped'`
      )
      .bind(staffId, body.path_id)
      .first();

    if (existing) {
      return json(
        { error: 'Already enrolled in this learning path' },
        409
      );
    }

    await db
      .prepare(
        `INSERT INTO learning_enrollments (id, user_id, path_id, status, progress_percent, started_at)
         VALUES (?, ?, ?, 'not-started', 0, datetime('now'))`
      )
      .bind(id, staffId, body.path_id)
      .run();

    const enrollment = await db
      .prepare(`SELECT * FROM learning_enrollments WHERE id = ?`)
      .bind(id)
      .first();

    return json({ enrollment }, 201);
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return json({ error: 'Failed to create enrollment' }, 500);
  }
};
