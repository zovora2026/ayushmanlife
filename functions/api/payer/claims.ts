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
    const payer = url.searchParams.get('payer');
    const adjudicationStatus = url.searchParams.get('adjudication_status');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');

    if (!db) {
      let claims = [
        {
          id: 'CLM-2026-10001',
          patient_name: 'Ramesh Prasad',
          patient_id: 'pat-1001',
          abha_id: 'ABHA-1234-5678-9012',
          policy: 'Ayushman Bharat PMJAY',
          payer: 'National Health Authority',
          procedure: 'Coronary Angioplasty with Stenting (Single)',
          icd_code: 'I25.1',
          package_code: 'PMJAY-CARD-005',
          claimed_amount: 120000,
          approved_amount: 115000,
          adjudication_status: 'approved',
          submitted_date: '2026-03-15',
          adjudicated_date: '2026-03-20',
          hospital: 'AyushmanLife General Hospital, Varanasi',
          treating_doctor: 'Dr. Priya Menon',
          admission_date: '2026-03-12',
          discharge_date: '2026-03-17',
          los_days: 5,
          remarks: 'Approved after pre-authorization verification. Amount adjusted for standard PMJAY package rate.',
        },
        {
          id: 'CLM-2026-10002',
          patient_name: 'Kamala Devi',
          patient_id: 'pat-1002',
          abha_id: 'ABHA-2345-6789-0123',
          policy: 'Ayushman Bharat PMJAY',
          payer: 'National Health Authority',
          procedure: 'COPD Exacerbation Management',
          icd_code: 'J44.1',
          package_code: 'PMJAY-PULM-003',
          claimed_amount: 45000,
          approved_amount: null,
          adjudication_status: 'under-review',
          submitted_date: '2026-03-25',
          adjudicated_date: null,
          hospital: 'AyushmanLife General Hospital, Patna',
          treating_doctor: 'Dr. Anil Kumar',
          admission_date: '2026-03-22',
          discharge_date: '2026-03-26',
          los_days: 4,
          remarks: 'Under clinical review — third admission in 6 months flagged for pattern review.',
        },
        {
          id: 'CLM-2026-10003',
          patient_name: 'Suresh Yadav',
          patient_id: 'pat-2002',
          abha_id: 'ABHA-3456-7890-1234',
          policy: 'Star Comprehensive Health',
          payer: 'Star Health & Allied Insurance',
          procedure: 'Total Knee Replacement — Right',
          icd_code: 'M17.1',
          package_code: 'TKR-001',
          claimed_amount: 285000,
          approved_amount: 250000,
          adjudication_status: 'partially-approved',
          submitted_date: '2026-03-10',
          adjudicated_date: '2026-03-18',
          hospital: 'AyushmanLife General Hospital, Jaipur',
          treating_doctor: 'Dr. Sunil Verma',
          admission_date: '2026-03-05',
          discharge_date: '2026-03-12',
          los_days: 7,
          remarks: 'Room rent capped as per policy sub-limit. Implant cost adjusted to scheduled rate. ₹35,000 disallowed.',
        },
        {
          id: 'CLM-2026-10004',
          patient_name: 'Meenakshi Sundaram',
          patient_id: 'pat-2003',
          abha_id: 'ABHA-4567-8901-2345',
          policy: 'New India Mediclaim',
          payer: 'New India Assurance Co. Ltd.',
          procedure: 'Rheumatoid Arthritis — IV Biologics Infusion',
          icd_code: 'M05.9',
          package_code: 'DAY-RHEUM-002',
          claimed_amount: 85000,
          approved_amount: null,
          adjudication_status: 'rejected',
          submitted_date: '2026-03-08',
          adjudicated_date: '2026-03-14',
          hospital: 'AyushmanLife General Hospital, Chennai',
          treating_doctor: 'Dr. Nandini Rao',
          admission_date: '2026-03-08',
          discharge_date: '2026-03-08',
          los_days: 0,
          remarks: 'Rejected — Day care procedure requires prior authorization which was not obtained. Hospital can appeal within 30 days.',
        },
        {
          id: 'CLM-2026-10005',
          patient_name: 'Harish Choudhary',
          patient_id: 'pat-4005',
          abha_id: 'ABHA-5678-9012-3456',
          policy: 'ICICI Lombard Health Protect',
          payer: 'ICICI Lombard General Insurance',
          procedure: 'Coronary Angiography',
          icd_code: 'I25.1',
          package_code: 'CARD-DIAG-001',
          claimed_amount: 48000,
          approved_amount: 48000,
          adjudication_status: 'approved',
          submitted_date: '2026-02-12',
          adjudicated_date: '2026-02-16',
          hospital: 'AyushmanLife General Hospital, Jodhpur',
          treating_doctor: 'Dr. Priya Menon',
          admission_date: '2026-02-10',
          discharge_date: '2026-02-11',
          los_days: 1,
          remarks: 'Full amount approved. Pre-authorization was in place.',
        },
        {
          id: 'CLM-2026-10006',
          patient_name: 'Gopal Krishnan',
          patient_id: 'pat-4003',
          abha_id: 'ABHA-6789-0123-4567',
          policy: 'CGHS Panel Agreement',
          payer: 'Central Government Health Scheme',
          procedure: 'Haemodialysis Sessions (8 sessions/month)',
          icd_code: 'N18.5',
          package_code: 'CGHS-NEPH-012',
          claimed_amount: 56000,
          approved_amount: 52000,
          adjudication_status: 'approved',
          submitted_date: '2026-03-01',
          adjudicated_date: '2026-03-10',
          hospital: 'AyushmanLife General Hospital, Coimbatore',
          treating_doctor: 'Dr. Arun Nair',
          admission_date: '2026-03-01',
          discharge_date: '2026-03-28',
          los_days: 0,
          remarks: 'Approved at CGHS scheduled rates. Consumables adjusted to ceiling rate.',
        },
        {
          id: 'CLM-2026-10007',
          patient_name: 'Rekha Mishra',
          patient_id: 'pat-4004',
          abha_id: 'ABHA-7890-1234-5678',
          policy: 'ESIC Medical Benefit',
          payer: "Employees' State Insurance Corporation",
          procedure: 'Laparoscopic Ovarian Cystectomy',
          icd_code: 'N83.2',
          package_code: 'ESIC-GYN-008',
          claimed_amount: 65000,
          approved_amount: null,
          adjudication_status: 'pending',
          submitted_date: '2026-03-28',
          adjudicated_date: null,
          hospital: 'AyushmanLife General Hospital, Bhopal',
          treating_doctor: 'Dr. Deepa Iyer',
          admission_date: '2026-03-25',
          discharge_date: '2026-03-27',
          los_days: 2,
          remarks: 'Claim submitted. Awaiting ESIC adjudication.',
        },
      ];

      if (payer) {
        claims = claims.filter((c) =>
          c.payer.toLowerCase().includes(payer.toLowerCase())
        );
      }
      if (adjudicationStatus) {
        claims = claims.filter(
          (c) => c.adjudication_status === adjudicationStatus
        );
      }
      if (dateFrom) {
        claims = claims.filter(
          (c) => c.submitted_date >= dateFrom
        );
      }
      if (dateTo) {
        claims = claims.filter((c) => c.submitted_date <= dateTo);
      }

      const summary = {
        total_claims: claims.length,
        total_claimed: claims.reduce(
          (sum, c) => sum + c.claimed_amount,
          0
        ),
        total_approved: claims.reduce(
          (sum, c) => sum + (c.approved_amount || 0),
          0
        ),
        approved_count: claims.filter(
          (c) => c.adjudication_status === 'approved'
        ).length,
        rejected_count: claims.filter(
          (c) => c.adjudication_status === 'rejected'
        ).length,
        pending_count: claims.filter(
          (c) =>
            c.adjudication_status === 'pending' ||
            c.adjudication_status === 'under-review'
        ).length,
      };

      return json({ claims, summary, currency: 'INR' });
    }

    let query = `SELECT c.id, p.name as patient_name, c.patient_id, p.abha_id,
                        pol.policy_name as policy, pol.payer,
                        c.procedure_name as procedure, c.icd_code, c.package_code,
                        c.claimed_amount, c.approved_amount, c.adjudication_status,
                        c.submitted_date, c.adjudicated_date,
                        c.hospital, s.name as treating_doctor,
                        c.admission_date, c.discharge_date, c.los_days, c.remarks
                 FROM claims c
                 JOIN patients p ON c.patient_id = p.id
                 LEFT JOIN policies pol ON c.policy_id = pol.id
                 LEFT JOIN staff s ON c.doctor_id = s.id
                 WHERE 1=1`;
    const bindings: string[] = [];

    if (payer) {
      query += ` AND pol.payer LIKE ?`;
      bindings.push(`%${payer}%`);
    }
    if (adjudicationStatus) {
      query += ` AND c.adjudication_status = ?`;
      bindings.push(adjudicationStatus);
    }
    if (dateFrom) {
      query += ` AND c.submitted_date >= ?`;
      bindings.push(dateFrom);
    }
    if (dateTo) {
      query += ` AND c.submitted_date <= ?`;
      bindings.push(dateTo);
    }

    query += ` ORDER BY c.submitted_date DESC LIMIT 100`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({
      claims: results || [],
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching payer claims:', error);
    return json({ error: 'Failed to fetch payer claims' }, 500);
  }
};
