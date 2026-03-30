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
    const category = url.searchParams.get('category');
    const role = url.searchParams.get('role');

    if (!db) {
      let paths = [
        {
          id: 'path-001',
          title: 'PMJAY Claims Processing Masterclass',
          description:
            'Complete training on Ayushman Bharat PMJAY claims — from pre-authorization to settlement. Covers package rates, documentation requirements, SHA portals, and common rejection reasons.',
          category: 'Insurance & Claims',
          target_role: 'Administrative',
          difficulty: 'Intermediate',
          duration_hours: 12,
          modules: 8,
          enrolled: 145,
          completed: 89,
          rating: 4.6,
          instructor: 'Neha Gupta, Claims Manager',
          certification: 'PMJAY Certified Claims Coordinator',
          topics: [
            'PMJAY Package Codes and Rates',
            'Pre-Authorization Process',
            'Documentation Requirements (ICD-10, Procedure Codes)',
            'SHA Portal Navigation',
            'Common Rejection Reasons and Appeals',
            'Fraud Prevention in Claims',
            'Cashless vs Reimbursement Claims',
            'Audit Preparation',
          ],
          created_at: '2025-10-01',
          updated_at: '2026-03-15',
        },
        {
          id: 'path-002',
          title: 'BLS & ACLS Refresher Course',
          description:
            'Mandatory refresher course for all clinical staff on Basic Life Support and Advanced Cardiac Life Support protocols as per Indian Resuscitation Council guidelines.',
          category: 'Clinical Skills',
          target_role: 'Clinical',
          difficulty: 'Intermediate',
          duration_hours: 8,
          modules: 5,
          enrolled: 220,
          completed: 178,
          rating: 4.8,
          instructor: 'Dr. Vivek Mishra, Emergency Medicine',
          certification: 'BLS/ACLS Provider (IRC)',
          topics: [
            'Adult BLS Algorithm',
            'Paediatric BLS',
            'ACLS Cardiac Arrest Algorithm',
            'Acute Coronary Syndrome Management',
            'Post-Resuscitation Care',
          ],
          created_at: '2025-08-01',
          updated_at: '2026-02-20',
        },
        {
          id: 'path-003',
          title: 'ICD-10 and Medical Coding for Indian Healthcare',
          description:
            'Learn ICD-10-CM coding specific to Indian disease patterns. Covers tropical diseases, NCD coding, surgical procedure coding, and DRG concepts relevant to Indian insurance frameworks.',
          category: 'Medical Coding',
          target_role: 'Administrative',
          difficulty: 'Advanced',
          duration_hours: 24,
          modules: 12,
          enrolled: 68,
          completed: 32,
          rating: 4.4,
          instructor: 'Ravi Shankar, Sr. Billing Executive & Certified Coder',
          certification: 'Certified ICD-10 Medical Coder',
          topics: [
            'ICD-10-CM Fundamentals',
            'Coding Tropical & Infectious Diseases (Dengue, Malaria, TB)',
            'NCD Coding (Diabetes, Hypertension, CAD)',
            'Surgical Procedure Coding',
            'Obstetric and Gynaecology Coding',
            'Oncology Coding',
            'Paediatric Coding',
            'DRG Concepts for India',
            'Coding for PMJAY Packages',
            'CGHS and ESIC Coding Requirements',
            'Audit and Compliance',
            'Coding Ethics and Best Practices',
          ],
          created_at: '2025-11-15',
          updated_at: '2026-03-10',
        },
        {
          id: 'path-004',
          title: 'Patient Communication & Cultural Sensitivity',
          description:
            'Training on effective patient communication in diverse Indian healthcare settings. Covers multilingual communication, breaking bad news, informed consent, and handling grievances.',
          category: 'Soft Skills',
          target_role: 'All',
          difficulty: 'Beginner',
          duration_hours: 6,
          modules: 4,
          enrolled: 310,
          completed: 245,
          rating: 4.5,
          instructor: 'Dr. Anita Krishnan, Paediatrics & Patient Relations Committee',
          certification: 'Patient Communication Certificate',
          topics: [
            'Empathetic Communication in Indian Healthcare Context',
            'Breaking Bad News — SPIKES Protocol',
            'Informed Consent — Legal and Ethical Requirements',
            'Handling Patient Grievances and De-escalation',
          ],
          created_at: '2025-07-01',
          updated_at: '2026-01-30',
        },
        {
          id: 'path-005',
          title: 'Hospital Infection Control & NABH Standards',
          description:
            'Comprehensive training on infection prevention and control protocols as per NABH (National Accreditation Board for Hospitals) standards. Mandatory for all hospital staff.',
          category: 'Quality & Safety',
          target_role: 'All',
          difficulty: 'Intermediate',
          duration_hours: 10,
          modules: 6,
          enrolled: 280,
          completed: 195,
          rating: 4.3,
          instructor: 'Dr. Kavita Singh, Infection Control Officer',
          certification: 'NABH Infection Control Certification',
          topics: [
            'Standard Precautions & Hand Hygiene (WHO 5 Moments)',
            'Biomedical Waste Management (BMW Rules 2016)',
            'Surgical Site Infection Prevention',
            'Catheter-Associated Infection Prevention (CAUTI, CLABSI)',
            'Antimicrobial Stewardship Programme',
            'Outbreak Investigation and Management',
          ],
          created_at: '2025-09-01',
          updated_at: '2026-03-01',
        },
        {
          id: 'path-006',
          title: 'ABHA Integration & Digital Health Records',
          description:
            'Training on Ayushman Bharat Health Account (ABHA) integration, Health Information Exchange, and maintaining digital health records as per ABDM (Ayushman Bharat Digital Mission) standards.',
          category: 'Digital Health',
          target_role: 'All',
          difficulty: 'Beginner',
          duration_hours: 4,
          modules: 3,
          enrolled: 190,
          completed: 142,
          rating: 4.2,
          instructor: 'IT Department — AyushmanLife',
          certification: 'ABDM Digital Health Certificate',
          topics: [
            'ABHA ID Creation and Linking',
            'Health Information Exchange and Consent Management',
            'Digital Health Records — Standards and Privacy (DISHA)',
          ],
          created_at: '2026-01-15',
          updated_at: '2026-03-20',
        },
        {
          id: 'path-007',
          title: 'Advanced Diabetes Management for Primary Care',
          description:
            'Evidence-based diabetes management training for primary care physicians. Covers ICMR guidelines, insulin initiation, complication screening, and patient education.',
          category: 'Clinical Skills',
          target_role: 'Clinical',
          difficulty: 'Advanced',
          duration_hours: 16,
          modules: 8,
          enrolled: 95,
          completed: 58,
          rating: 4.7,
          instructor: 'Dr. Rajesh Sharma, Consultant Physician & Diabetologist',
          certification: 'Certificate in Diabetes Management (RSSDI-affiliated)',
          topics: [
            'ICMR Guidelines for Type 2 Diabetes 2024',
            'Oral Hypoglycaemic Agents — Selection and Titration',
            'When and How to Initiate Insulin',
            'Diabetic Foot Care and Prevention',
            'Screening for Diabetic Retinopathy and Nephropathy',
            'Gestational Diabetes Management',
            'Diabetes in the Elderly — Special Considerations',
            'Patient Education and Self-Management Support',
          ],
          created_at: '2025-12-01',
          updated_at: '2026-03-25',
        },
      ];

      if (category) {
        paths = paths.filter(
          (p) =>
            p.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (role) {
        paths = paths.filter(
          (p) =>
            p.target_role.toLowerCase() === role.toLowerCase() ||
            p.target_role === 'All'
        );
      }

      return json({ paths, total: paths.length });
    }

    let query = `SELECT * FROM learning_paths WHERE 1=1`;
    const bindings: string[] = [];

    if (category) {
      query += ` AND category = ?`;
      bindings.push(category);
    }
    if (role) {
      query += ` AND (difficulty = ? OR difficulty = 'All')`;
      bindings.push(role);
    }

    query += ` ORDER BY modules_count DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({ paths: results || [], total: results?.length || 0 });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return json({ error: 'Failed to fetch learning paths' }, 500);
  }
};
