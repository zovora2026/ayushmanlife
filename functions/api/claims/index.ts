interface Env { DB: D1Database; ANTHROPIC_API_KEY?: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Mock data ───────────────────────────────────────────────────────────────

const MOCK_CLAIMS = [
  {
    id: 'clm-001', claim_number: 'CLM-2026-00001', patient_id: 'pat-001',
    patient_name: 'Ramesh Sharma', patient_abha: '91-1234-5678-9012',
    payer_scheme: 'ayushman_bharat', provider_name: 'AIIMS New Delhi',
    diagnosis_text: 'Type 2 Diabetes Mellitus with peripheral neuropathy',
    icd10_codes: 'E11.9,G63', cpt_codes: '99213,95904',
    claimed_amount: 25000, approved_amount: 22000,
    status: 'approved', priority: 'normal',
    admission_date: '2026-03-10', discharge_date: '2026-03-14',
    submitted_at: '2026-03-15T10:30:00Z', processed_at: '2026-03-18T14:20:00Z',
    created_at: '2026-03-10T08:00:00Z', updated_at: '2026-03-18T14:20:00Z',
  },
  {
    id: 'clm-002', claim_number: 'CLM-2026-00002', patient_id: 'pat-002',
    patient_name: 'Priya Patel', patient_abha: '91-2345-6789-0123',
    payer_scheme: 'cghs', provider_name: 'Safdarjung Hospital',
    diagnosis_text: 'Essential Hypertension with chronic kidney disease stage 3',
    icd10_codes: 'I10,N18.3', cpt_codes: '99214,80053',
    claimed_amount: 45000, approved_amount: null,
    status: 'pending', priority: 'high',
    admission_date: '2026-03-20', discharge_date: '2026-03-24',
    submitted_at: '2026-03-25T09:00:00Z', processed_at: null,
    created_at: '2026-03-20T07:30:00Z', updated_at: '2026-03-25T09:00:00Z',
  },
  {
    id: 'clm-003', claim_number: 'CLM-2026-00003', patient_id: 'pat-003',
    patient_name: 'Anjali Verma', patient_abha: '91-3456-7890-1234',
    payer_scheme: 'ayushman_bharat', provider_name: 'Ram Manohar Lohia Hospital',
    diagnosis_text: 'Dengue hemorrhagic fever with thrombocytopenia',
    icd10_codes: 'A91,D69.6', cpt_codes: '99223,85025',
    claimed_amount: 35000, approved_amount: 35000,
    status: 'approved', priority: 'urgent',
    admission_date: '2026-03-05', discharge_date: '2026-03-10',
    submitted_at: '2026-03-11T08:15:00Z', processed_at: '2026-03-13T11:00:00Z',
    created_at: '2026-03-05T06:00:00Z', updated_at: '2026-03-13T11:00:00Z',
  },
  {
    id: 'clm-004', claim_number: 'CLM-2026-00004', patient_id: 'pat-004',
    patient_name: 'Suresh Reddy', patient_abha: '91-4567-8901-2345',
    payer_scheme: 'esis', provider_name: 'Gandhi Hospital Hyderabad',
    diagnosis_text: 'Acute myocardial infarction, anterior wall',
    icd10_codes: 'I21.0', cpt_codes: '92928,93458',
    claimed_amount: 250000, approved_amount: null,
    status: 'under_review', priority: 'urgent',
    admission_date: '2026-03-22', discharge_date: '2026-03-28',
    submitted_at: '2026-03-29T07:00:00Z', processed_at: null,
    created_at: '2026-03-22T04:30:00Z', updated_at: '2026-03-29T07:00:00Z',
  },
  {
    id: 'clm-005', claim_number: 'CLM-2026-00005', patient_id: 'pat-005',
    patient_name: 'Meena Kumari', patient_abha: '91-5678-9012-3456',
    payer_scheme: 'ayushman_bharat', provider_name: 'Rajiv Gandhi Government General Hospital Chennai',
    diagnosis_text: 'Typhoid fever with intestinal perforation',
    icd10_codes: 'A01.0,K63.1', cpt_codes: '44120,99222',
    claimed_amount: 75000, approved_amount: 70000,
    status: 'approved', priority: 'high',
    admission_date: '2026-03-01', discharge_date: '2026-03-08',
    submitted_at: '2026-03-09T10:00:00Z', processed_at: '2026-03-12T16:45:00Z',
    created_at: '2026-03-01T05:00:00Z', updated_at: '2026-03-12T16:45:00Z',
  },
  {
    id: 'clm-006', claim_number: 'CLM-2026-00006', patient_id: 'pat-006',
    patient_name: 'Vikram Singh', patient_abha: '91-6789-0123-4567',
    payer_scheme: 'private_insurance', provider_name: 'Fortis Hospital Gurugram',
    diagnosis_text: 'Lumbar disc herniation with radiculopathy',
    icd10_codes: 'M51.16', cpt_codes: '63030,72148',
    claimed_amount: 180000, approved_amount: null,
    status: 'rejected', priority: 'normal',
    admission_date: '2026-02-25', discharge_date: '2026-03-02',
    submitted_at: '2026-03-03T11:00:00Z', processed_at: '2026-03-06T09:30:00Z',
    created_at: '2026-02-25T08:00:00Z', updated_at: '2026-03-06T09:30:00Z',
  },
  {
    id: 'clm-007', claim_number: 'CLM-2026-00007', patient_id: 'pat-007',
    patient_name: 'Lakshmi Nair', patient_abha: '91-7890-1234-5678',
    payer_scheme: 'ayushman_bharat', provider_name: 'Medical College Thiruvananthapuram',
    diagnosis_text: 'Gestational diabetes mellitus, diet controlled',
    icd10_codes: 'O24.410', cpt_codes: '59400,82947',
    claimed_amount: 30000, approved_amount: 30000,
    status: 'approved', priority: 'normal',
    admission_date: '2026-03-15', discharge_date: '2026-03-18',
    submitted_at: '2026-03-19T08:30:00Z', processed_at: '2026-03-21T10:00:00Z',
    created_at: '2026-03-15T06:00:00Z', updated_at: '2026-03-21T10:00:00Z',
  },
  {
    id: 'clm-008', claim_number: 'CLM-2026-00008', patient_id: 'pat-008',
    patient_name: 'Mohammed Iqbal', patient_abha: '91-8901-2345-6789',
    payer_scheme: 'cghs', provider_name: 'JNMC Aligarh',
    diagnosis_text: 'Pulmonary tuberculosis, bacteriologically confirmed',
    icd10_codes: 'A15.0', cpt_codes: '99221,87116',
    claimed_amount: 15000, approved_amount: null,
    status: 'pending', priority: 'normal',
    admission_date: '2026-03-26', discharge_date: null,
    submitted_at: null, processed_at: null,
    created_at: '2026-03-26T09:00:00Z', updated_at: '2026-03-26T09:00:00Z',
  },
  {
    id: 'clm-009', claim_number: 'CLM-2026-00009', patient_id: 'pat-009',
    patient_name: 'Sunita Devi', patient_abha: '91-9012-3456-7890',
    payer_scheme: 'ayushman_bharat', provider_name: 'IGIMS Patna',
    diagnosis_text: 'Malaria due to Plasmodium falciparum with cerebral complications',
    icd10_codes: 'B50.0', cpt_codes: '99223,87207',
    claimed_amount: 55000, approved_amount: 50000,
    status: 'approved', priority: 'urgent',
    admission_date: '2026-03-08', discharge_date: '2026-03-13',
    submitted_at: '2026-03-14T07:00:00Z', processed_at: '2026-03-16T12:00:00Z',
    created_at: '2026-03-08T04:00:00Z', updated_at: '2026-03-16T12:00:00Z',
  },
  {
    id: 'clm-010', claim_number: 'CLM-2026-00010', patient_id: 'pat-010',
    patient_name: 'Arjun Mehta', patient_abha: '91-0123-4567-8901',
    payer_scheme: 'private_insurance', provider_name: 'Apollo Hospital Mumbai',
    diagnosis_text: 'Acute appendicitis with generalized peritonitis',
    icd10_codes: 'K35.20', cpt_codes: '44970,49320',
    claimed_amount: 120000, approved_amount: null,
    status: 'submitted', priority: 'high',
    admission_date: '2026-03-27', discharge_date: '2026-03-29',
    submitted_at: '2026-03-29T15:00:00Z', processed_at: null,
    created_at: '2026-03-27T10:00:00Z', updated_at: '2026-03-29T15:00:00Z',
  },
  {
    id: 'clm-011', claim_number: 'CLM-2026-00011', patient_id: 'pat-011',
    patient_name: 'Kavita Joshi', patient_abha: '91-1122-3344-5566',
    payer_scheme: 'ayushman_bharat', provider_name: 'SMS Hospital Jaipur',
    diagnosis_text: 'Cholecystitis with cholelithiasis',
    icd10_codes: 'K80.10', cpt_codes: '47562,74177',
    claimed_amount: 40000, approved_amount: 38000,
    status: 'approved', priority: 'normal',
    admission_date: '2026-03-12', discharge_date: '2026-03-15',
    submitted_at: '2026-03-16T08:00:00Z', processed_at: '2026-03-19T13:30:00Z',
    created_at: '2026-03-12T07:00:00Z', updated_at: '2026-03-19T13:30:00Z',
  },
  {
    id: 'clm-012', claim_number: 'CLM-2026-00012', patient_id: 'pat-012',
    patient_name: 'Ravi Gupta', patient_abha: '91-2233-4455-6677',
    payer_scheme: 'esis', provider_name: 'ESI Hospital Faridabad',
    diagnosis_text: 'Fracture of neck of femur, right side',
    icd10_codes: 'S72.001A', cpt_codes: '27236,73502',
    claimed_amount: 95000, approved_amount: null,
    status: 'rejected', priority: 'high',
    admission_date: '2026-02-20', discharge_date: '2026-03-01',
    submitted_at: '2026-03-02T09:30:00Z', processed_at: '2026-03-05T15:00:00Z',
    created_at: '2026-02-20T11:00:00Z', updated_at: '2026-03-05T15:00:00Z',
  },
  {
    id: 'clm-013', claim_number: 'CLM-2026-00013', patient_id: 'pat-013',
    patient_name: 'Deepa Menon', patient_abha: '91-3344-5566-7788',
    payer_scheme: 'ayushman_bharat', provider_name: 'Amrita Hospital Kochi',
    diagnosis_text: 'Chronic obstructive pulmonary disease with acute exacerbation',
    icd10_codes: 'J44.1', cpt_codes: '99222,94726',
    claimed_amount: 28000, approved_amount: null,
    status: 'draft', priority: 'normal',
    admission_date: '2026-03-28', discharge_date: null,
    submitted_at: null, processed_at: null,
    created_at: '2026-03-28T12:00:00Z', updated_at: '2026-03-28T12:00:00Z',
  },
  {
    id: 'clm-014', claim_number: 'CLM-2026-00014', patient_id: 'pat-014',
    patient_name: 'Amit Choudhury', patient_abha: '91-4455-6677-8899',
    payer_scheme: 'cghs', provider_name: 'PGI Chandigarh',
    diagnosis_text: 'Ischemic stroke, left middle cerebral artery territory',
    icd10_codes: 'I63.512', cpt_codes: '99223,70553',
    claimed_amount: 185000, approved_amount: 175000,
    status: 'approved', priority: 'urgent',
    admission_date: '2026-03-02', discharge_date: '2026-03-12',
    submitted_at: '2026-03-13T07:00:00Z', processed_at: '2026-03-17T10:00:00Z',
    created_at: '2026-03-02T03:00:00Z', updated_at: '2026-03-17T10:00:00Z',
  },
  {
    id: 'clm-015', claim_number: 'CLM-2026-00015', patient_id: 'pat-015',
    patient_name: 'Fatima Begum', patient_abha: '91-5566-7788-9900',
    payer_scheme: 'ayushman_bharat', provider_name: 'Osmania General Hospital Hyderabad',
    diagnosis_text: 'Iron deficiency anemia with menorrhagia',
    icd10_codes: 'D50.0,N92.0', cpt_codes: '99213,85018',
    claimed_amount: 18000, approved_amount: null,
    status: 'under_review', priority: 'normal',
    admission_date: '2026-03-25', discharge_date: '2026-03-27',
    submitted_at: '2026-03-28T10:00:00Z', processed_at: null,
    created_at: '2026-03-25T08:00:00Z', updated_at: '2026-03-28T10:00:00Z',
  },
];

// ── GET: List claims with filters & pagination ──────────────────────────────

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const status = url.searchParams.get('status');
    const payer_scheme = url.searchParams.get('payer_scheme');
    const patient_id = url.searchParams.get('patient_id');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const search = url.searchParams.get('search');

    // ── Try D1 database first ──
    if (context.env.DB) {
      try {
        const conditions: string[] = [];
        const params: unknown[] = [];

        if (status) {
          conditions.push('c.status = ?');
          params.push(status);
        }
        if (payer_scheme) {
          conditions.push('c.payer_scheme = ?');
          params.push(payer_scheme);
        }
        if (patient_id) {
          conditions.push('c.patient_id = ?');
          params.push(patient_id);
        }
        if (date_from) {
          conditions.push('c.created_at >= ?');
          params.push(date_from);
        }
        if (date_to) {
          conditions.push('c.created_at <= ?');
          params.push(date_to + 'T23:59:59Z');
        }
        if (search) {
          conditions.push('(c.claim_number LIKE ? OR c.diagnosis LIKE ?)');
          const searchTerm = `%${search}%`;
          params.push(searchTerm, searchTerm);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        // Count total
        const countResult = await context.env.DB.prepare(
          `SELECT COUNT(*) as total FROM claims c ${whereClause}`
        ).bind(...params).first<{ total: number }>();
        const total = countResult?.total ?? 0;

        // Fetch page
        const { results } = await context.env.DB.prepare(
          `SELECT c.* FROM claims c ${whereClause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`
        ).bind(...params, limit, offset).all();

        return json({ claims: results || [], total, page, limit });
      } catch (dbErr) {
        console.error('D1 query failed, falling back to mock:', dbErr);
      }
    }

    // ── Mock fallback ──
    let filtered = [...MOCK_CLAIMS];

    if (status) filtered = filtered.filter(c => c.status === status);
    if (payer_scheme) filtered = filtered.filter(c => c.payer_scheme === payer_scheme);
    if (patient_id) filtered = filtered.filter(c => c.patient_id === patient_id);
    if (date_from) filtered = filtered.filter(c => c.created_at >= date_from);
    if (date_to) filtered = filtered.filter(c => c.created_at <= date_to + 'T23:59:59Z');
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.patient_name.toLowerCase().includes(s) ||
        c.claim_number.toLowerCase().includes(s) ||
        c.diagnosis_text.toLowerCase().includes(s)
      );
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return json({ claims: paginated, total, page, limit });
  } catch (err) {
    return json({ message: 'Failed to list claims', error: String(err) }, 500);
  }
};

// ── POST: Create new claim ──────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as Record<string, unknown>;

    const {
      patient_id, payer_scheme, payer_name, policy_number,
      diagnosis, diagnosis_codes, procedure_codes,
      claimed_amount,
      admission_date, discharge_date,
    } = body;

    // Validate required fields
    if (!patient_id) return json({ message: 'patient_id is required' }, 400);
    if (!payer_scheme) return json({ message: 'payer_scheme is required' }, 400);
    if (!diagnosis) return json({ message: 'diagnosis is required' }, 400);
    if (!claimed_amount || Number(claimed_amount) <= 0) {
      return json({ message: 'claimed_amount must be a positive number' }, 400);
    }

    const id = crypto.randomUUID();
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    const claim_number = `CLM-2026-${seq}`;
    const now = new Date().toISOString();
    const status = 'draft';

    // ── Try D1 database first ──
    if (context.env.DB) {
      try {
        await context.env.DB.prepare(
          `INSERT INTO claims (
            id, claim_number, patient_id,
            payer_scheme, payer_name, policy_number,
            diagnosis, diagnosis_codes, procedure_codes,
            claimed_amount, approved_amount, status,
            admission_date, discharge_date,
            submitted_at, resolved_at,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, ?, ?)`
        ).bind(
          id, claim_number,
          patient_id,
          payer_scheme, payer_name || null, policy_number || null,
          diagnosis, diagnosis_codes || null, procedure_codes || null,
          Number(claimed_amount), status,
          admission_date || null, discharge_date || null,
          now, now,
        ).run();

        // Fetch the created claim
        const created = await context.env.DB.prepare(
          'SELECT * FROM claims WHERE id = ?'
        ).bind(id).first();

        return json({ claim: created, message: 'Claim created successfully' }, 201);
      } catch (dbErr) {
        console.error('D1 insert failed, falling back to mock:', dbErr);
      }
    }

    // ── Mock fallback ──
    const newClaim = {
      id,
      claim_number,
      patient_id,
      payer_scheme,
      payer_name: payer_name || null,
      policy_number: policy_number || null,
      diagnosis,
      diagnosis_codes: diagnosis_codes || null,
      procedure_codes: procedure_codes || null,
      claimed_amount: Number(claimed_amount),
      approved_amount: null,
      status,
      admission_date: admission_date || null,
      discharge_date: discharge_date || null,
      submitted_at: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    };

    return json({ claim: newClaim, message: 'Claim created successfully (mock)' }, 201);
  } catch (err) {
    return json({ message: 'Failed to create claim', error: String(err) }, 500);
  }
};
