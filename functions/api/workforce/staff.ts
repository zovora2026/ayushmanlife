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
    const department = url.searchParams.get('department');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    if (!db) {
      let staff = [
        {
          id: 'staff-001',
          name: 'Dr. Priya Menon',
          role: 'Consultant',
          department: 'Cardiology',
          designation: 'Senior Consultant & HOD',
          qualification: 'MBBS, MD (Medicine), DM (Cardiology) — AIIMS Delhi',
          nmc_registration: 'NMC-2008-KL-12345',
          experience_years: 18,
          specializations: [
            'Interventional Cardiology',
            'Electrophysiology',
            'Heart Failure Management',
          ],
          certifications: [
            {
              name: 'FSCAI (Fellow of Society for Cardiovascular Angiography)',
              issued_by: 'SCAI',
              valid_until: '2027-06-30',
              status: 'active',
            },
            {
              name: 'BLS & ACLS Provider',
              issued_by: 'American Heart Association',
              valid_until: '2026-12-31',
              status: 'active',
            },
          ],
          skills: [
            'Coronary Angioplasty',
            'Pacemaker Implantation',
            'Echocardiography',
            'Cardiac Catheterization',
          ],
          status: 'active',
          contact: 'priya.menon@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-002',
          name: 'Dr. Rajesh Sharma',
          role: 'Consultant',
          department: 'General Medicine',
          designation: 'Consultant Physician',
          qualification: 'MBBS, MD (Internal Medicine) — BHU Varanasi',
          nmc_registration: 'NMC-2005-UP-67890',
          experience_years: 21,
          specializations: [
            'Internal Medicine',
            'Diabetology',
            'Infectious Diseases',
          ],
          certifications: [
            {
              name: 'Certificate in Diabetology (CDE)',
              issued_by: 'RSSDI',
              valid_until: '2027-03-31',
              status: 'active',
            },
            {
              name: 'BLS Provider',
              issued_by: 'Indian Resuscitation Council',
              valid_until: '2026-08-15',
              status: 'active',
            },
          ],
          skills: [
            'Diabetes Management',
            'Critical Care',
            'Tropical Medicine',
            'Geriatric Care',
          ],
          status: 'active',
          contact: 'rajesh.sharma@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-003',
          name: 'Dr. Sunil Verma',
          role: 'Consultant',
          department: 'Orthopaedics',
          designation: 'Consultant Orthopaedic Surgeon',
          qualification:
            'MBBS, MS (Orthopaedics) — PGIMER Chandigarh, Fellowship Joint Replacement (Germany)',
          nmc_registration: 'NMC-2010-PB-34567',
          experience_years: 16,
          specializations: [
            'Joint Replacement Surgery',
            'Arthroscopy',
            'Sports Medicine',
          ],
          certifications: [
            {
              name: 'Fellowship in Joint Replacement',
              issued_by: 'Schon Klinik, Munich',
              valid_until: null,
              status: 'lifetime',
            },
            {
              name: 'ATLS Provider',
              issued_by: 'American College of Surgeons',
              valid_until: '2027-01-15',
              status: 'active',
            },
          ],
          skills: [
            'Total Knee Replacement',
            'Total Hip Replacement',
            'ACL Reconstruction',
            'Fracture Fixation',
            'Arthroscopic Surgery',
          ],
          status: 'active',
          contact: 'sunil.verma@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-004',
          name: 'Dr. Anita Krishnan',
          role: 'Consultant',
          department: 'Paediatrics',
          designation: 'Consultant Paediatrician',
          qualification: 'MBBS, DCH, DNB (Paediatrics) — ICH Mumbai',
          nmc_registration: 'NMC-2012-MH-78901',
          experience_years: 14,
          specializations: [
            'General Paediatrics',
            'Neonatology',
            'Paediatric Infectious Diseases',
          ],
          certifications: [
            {
              name: 'NRP (Neonatal Resuscitation Program)',
              issued_by: 'NNF India',
              valid_until: '2026-09-30',
              status: 'active',
            },
            {
              name: 'PALS Provider',
              issued_by: 'American Heart Association',
              valid_until: '2026-06-15',
              status: 'expiring-soon',
            },
          ],
          skills: [
            'Neonatal Care',
            'Paediatric Vaccination',
            'Growth Assessment',
            'Paediatric Emergency',
          ],
          status: 'active',
          contact: 'anita.krishnan@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-005',
          name: 'Sr. Nurse Kavita Singh',
          role: 'Nursing',
          department: 'Emergency',
          designation: 'Senior Staff Nurse',
          qualification: 'B.Sc Nursing — KGMU Lucknow',
          registration: 'UP-NRC-2015-45678',
          experience_years: 11,
          specializations: ['Emergency Nursing', 'Trauma Care'],
          certifications: [
            {
              name: 'Emergency Nursing Certification',
              issued_by: 'TNAI',
              valid_until: '2026-12-31',
              status: 'active',
            },
            {
              name: 'BLS & ACLS Provider',
              issued_by: 'Indian Resuscitation Council',
              valid_until: '2026-05-20',
              status: 'expiring-soon',
            },
          ],
          skills: [
            'Triage',
            'IV Cannulation',
            'Wound Care',
            'Ventilator Management',
            'CPR',
          ],
          status: 'active',
          contact: 'kavita.singh@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-006',
          name: 'Ravi Shankar',
          role: 'Administrative',
          department: 'Finance',
          designation: 'Senior Billing Executive',
          qualification: 'B.Com, MBA (Hospital Administration) — IIHMR Jaipur',
          experience_years: 8,
          specializations: [
            'Medical Billing',
            'Insurance Claims Processing',
            'PMJAY Coordination',
          ],
          certifications: [
            {
              name: 'Certified Medical Billing Specialist',
              issued_by: 'AHIMA India',
              valid_until: '2027-03-31',
              status: 'active',
            },
            {
              name: 'PMJAY Hospital Coordinator Training',
              issued_by: 'NHA',
              valid_until: '2026-12-31',
              status: 'active',
            },
          ],
          skills: [
            'PMJAY Claims',
            'CGHS Billing',
            'TPA Coordination',
            'ICD-10 Coding',
            'Hospital ERP',
          ],
          status: 'active',
          contact: 'ravi.shankar@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-007',
          name: 'Dr. Deepa Iyer',
          role: 'Consultant',
          department: 'Gynaecology & Obstetrics',
          designation: 'Consultant Obstetrician & Gynaecologist',
          qualification:
            'MBBS, MS (OBG), Fellowship in Reproductive Medicine — CMC Vellore',
          nmc_registration: 'NMC-2009-TN-56789',
          experience_years: 17,
          specializations: [
            'High-Risk Pregnancy',
            'Laparoscopic Surgery',
            'Infertility Management',
          ],
          certifications: [
            {
              name: 'FOGSI Membership',
              issued_by: 'Federation of Obstetric & Gynaecological Societies of India',
              valid_until: '2027-12-31',
              status: 'active',
            },
            {
              name: 'BLS Provider',
              issued_by: 'Indian Resuscitation Council',
              valid_until: '2026-11-30',
              status: 'active',
            },
          ],
          skills: [
            'Laparoscopic Hysterectomy',
            'High-Risk Delivery',
            'Antenatal Care',
            'IVF Counselling',
          ],
          status: 'active',
          contact: 'deepa.iyer@ayushmanlife.in',
          city: 'Varanasi',
        },
        {
          id: 'staff-008',
          name: 'Neha Gupta',
          role: 'Administrative',
          department: 'Claims Processing',
          designation: 'Claims Manager',
          qualification: 'B.Sc, PG Diploma Health Insurance — III Hyderabad',
          experience_years: 6,
          specializations: [
            'Claims Adjudication',
            'Pre-Authorization',
            'Fraud Detection',
          ],
          certifications: [
            {
              name: 'Certified Health Insurance Professional',
              issued_by: 'Insurance Institute of India',
              valid_until: '2027-06-30',
              status: 'active',
            },
          ],
          skills: [
            'Claims Processing',
            'TPA Coordination',
            'Fraud Analysis',
            'PMJAY Portal',
            'Medical Coding',
          ],
          status: 'active',
          contact: 'neha.gupta@ayushmanlife.in',
          city: 'Varanasi',
        },
      ];

      if (department) {
        staff = staff.filter(
          (s) =>
            s.department.toLowerCase() === department.toLowerCase()
        );
      }
      if (role) {
        staff = staff.filter(
          (s) => s.role.toLowerCase() === role.toLowerCase()
        );
      }
      if (status) {
        staff = staff.filter((s) => s.status === status);
      }

      return json({ staff, total: staff.length });
    }

    // Query staff skills grouped by user, and staff certifications for a combined view
    let query = `SELECT DISTINCT ss.user_id as id, ss.user_id, ss.category as department
                 FROM staff_skills ss
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (department) {
      query += ` AND ss.category = ?`;
      bindings.push(department);
    }

    query += ` ORDER BY ss.user_id ASC LIMIT 100`;

    const stmt = db.prepare(query);
    const { results: staffIds } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    // For each unique user, get their skills and certifications
    const staffList = [];
    if (staffIds && staffIds.length > 0) {
      for (const s of staffIds) {
        const userId = (s as any).user_id;
        const [skills, certs] = await Promise.all([
          db.prepare(`SELECT skill_name, category, proficiency FROM staff_skills WHERE user_id = ?`).bind(userId).all(),
          db.prepare(`SELECT certification_name, issuing_body, expiry_date, status FROM staff_certifications WHERE user_id = ?`).bind(userId).all(),
        ]);
        staffList.push({
          id: userId,
          user_id: userId,
          department: (s as any).department,
          skills: skills.results || [],
          certifications: certs.results || [],
        });
      }
    }

    return json({ staff: staffList, total: staffList.length });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return json({ error: 'Failed to fetch staff' }, 500);
  }
};
