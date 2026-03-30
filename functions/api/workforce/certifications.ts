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
    const department = url.searchParams.get('department');

    if (!db) {
      let certifications = [
        {
          id: 'cert-001',
          staff_id: 'staff-001',
          staff_name: 'Dr. Priya Menon',
          department: 'Cardiology',
          certification_name: 'FSCAI (Fellow of Society for Cardiovascular Angiography)',
          issued_by: 'SCAI',
          issued_date: '2022-07-01',
          valid_until: '2027-06-30',
          status: 'active',
          days_until_expiry: 458,
          credential_id: 'FSCAI-2022-PM-7890',
        },
        {
          id: 'cert-002',
          staff_id: 'staff-001',
          staff_name: 'Dr. Priya Menon',
          department: 'Cardiology',
          certification_name: 'BLS & ACLS Provider',
          issued_by: 'American Heart Association',
          issued_date: '2024-12-31',
          valid_until: '2026-12-31',
          status: 'active',
          days_until_expiry: 276,
          credential_id: 'AHA-ACLS-2024-1234',
        },
        {
          id: 'cert-003',
          staff_id: 'staff-002',
          staff_name: 'Dr. Rajesh Sharma',
          department: 'General Medicine',
          certification_name: 'Certificate in Diabetology (CDE)',
          issued_by: 'RSSDI (Research Society for Study of Diabetes in India)',
          issued_date: '2024-04-01',
          valid_until: '2027-03-31',
          status: 'active',
          days_until_expiry: 366,
          credential_id: 'RSSDI-CDE-2024-5678',
        },
        {
          id: 'cert-004',
          staff_id: 'staff-004',
          staff_name: 'Dr. Anita Krishnan',
          department: 'Paediatrics',
          certification_name: 'PALS Provider (Paediatric Advanced Life Support)',
          issued_by: 'American Heart Association',
          issued_date: '2024-06-15',
          valid_until: '2026-06-15',
          status: 'expiring-soon',
          days_until_expiry: 77,
          credential_id: 'AHA-PALS-2024-3456',
        },
        {
          id: 'cert-005',
          staff_id: 'staff-005',
          staff_name: 'Sr. Nurse Kavita Singh',
          department: 'Emergency',
          certification_name: 'BLS & ACLS Provider',
          issued_by: 'Indian Resuscitation Council',
          issued_date: '2024-05-20',
          valid_until: '2026-05-20',
          status: 'expiring-soon',
          days_until_expiry: 51,
          credential_id: 'IRC-ACLS-2024-7890',
        },
        {
          id: 'cert-006',
          staff_id: 'staff-005',
          staff_name: 'Sr. Nurse Kavita Singh',
          department: 'Emergency',
          certification_name: 'Emergency Nursing Certification',
          issued_by: 'TNAI (Trained Nurses Association of India)',
          issued_date: '2024-12-31',
          valid_until: '2026-12-31',
          status: 'active',
          days_until_expiry: 276,
          credential_id: 'TNAI-ENC-2024-4567',
        },
        {
          id: 'cert-007',
          staff_id: 'staff-003',
          staff_name: 'Dr. Sunil Verma',
          department: 'Orthopaedics',
          certification_name: 'ATLS Provider (Advanced Trauma Life Support)',
          issued_by: 'American College of Surgeons',
          issued_date: '2023-01-15',
          valid_until: '2027-01-15',
          status: 'active',
          days_until_expiry: 291,
          credential_id: 'ACS-ATLS-2023-6789',
        },
        {
          id: 'cert-008',
          staff_id: 'staff-006',
          staff_name: 'Ravi Shankar',
          department: 'Finance',
          certification_name: 'Certified Medical Billing Specialist',
          issued_by: 'AHIMA India',
          issued_date: '2025-04-01',
          valid_until: '2027-03-31',
          status: 'active',
          days_until_expiry: 366,
          credential_id: 'AHIMA-CMBS-2025-2345',
        },
        {
          id: 'cert-009',
          staff_id: 'staff-006',
          staff_name: 'Ravi Shankar',
          department: 'Finance',
          certification_name: 'PMJAY Hospital Coordinator Training',
          issued_by: 'National Health Authority (NHA)',
          issued_date: '2025-01-01',
          valid_until: '2026-12-31',
          status: 'active',
          days_until_expiry: 276,
          credential_id: 'NHA-PMJAY-HC-2025-8901',
        },
        {
          id: 'cert-010',
          staff_id: 'staff-007',
          staff_name: 'Dr. Deepa Iyer',
          department: 'Gynaecology & Obstetrics',
          certification_name: 'FOGSI Membership',
          issued_by: 'Federation of Obstetric & Gynaecological Societies of India',
          issued_date: '2025-01-01',
          valid_until: '2027-12-31',
          status: 'active',
          days_until_expiry: 641,
          credential_id: 'FOGSI-2025-DI-0123',
        },
        {
          id: 'cert-011',
          staff_id: 'doc-012',
          staff_name: 'Dr. Nandini Rao',
          department: 'Rheumatology',
          certification_name: 'Indian Rheumatology Association Fellowship',
          issued_by: 'IRA',
          issued_date: '2023-08-01',
          valid_until: '2026-03-15',
          status: 'expired',
          days_until_expiry: -15,
          credential_id: 'IRA-FEL-2023-5678',
        },
      ];

      if (statusFilter) {
        certifications = certifications.filter(
          (c) => c.status === statusFilter
        );
      }
      if (department) {
        certifications = certifications.filter(
          (c) =>
            c.department.toLowerCase() === department.toLowerCase()
        );
      }

      const summary = {
        total: certifications.length,
        active: certifications.filter((c) => c.status === 'active').length,
        expiring_soon: certifications.filter(
          (c) => c.status === 'expiring-soon'
        ).length,
        expired: certifications.filter((c) => c.status === 'expired').length,
        compliance_rate:
          Math.round(
            (certifications.filter(
              (c) => c.status === 'active' || c.status === 'expiring-soon'
            ).length /
              certifications.length) *
              1000
          ) / 10,
      };

      return json({ certifications, summary });
    }

    let query = `SELECT c.id, c.staff_id, s.name as staff_name, d.name as department,
                        c.certification_name, c.issued_by, c.issued_date, c.valid_until,
                        c.credential_id,
                        CASE
                          WHEN c.valid_until < date('now') THEN 'expired'
                          WHEN c.valid_until < date('now', '+90 days') THEN 'expiring-soon'
                          ELSE 'active'
                        END as status,
                        CAST(julianday(c.valid_until) - julianday('now') AS INTEGER) as days_until_expiry
                 FROM certifications c
                 JOIN staff s ON c.staff_id = s.id
                 LEFT JOIN departments d ON s.department_id = d.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (statusFilter === 'expired') {
      query += ` AND c.valid_until < date('now')`;
    } else if (statusFilter === 'expiring-soon') {
      query += ` AND c.valid_until >= date('now') AND c.valid_until < date('now', '+90 days')`;
    } else if (statusFilter === 'active') {
      query += ` AND c.valid_until >= date('now', '+90 days')`;
    }

    if (department) {
      query += ` AND d.name = ?`;
      bindings.push(department);
    }

    query += ` ORDER BY c.valid_until ASC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({ certifications: results || [] });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return json({ error: 'Failed to fetch certifications' }, 500);
  }
};
