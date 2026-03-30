interface Env { DB: D1Database; ANTHROPIC_API_KEY?: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Mock claim detail ───────────────────────────────────────────────────────

function getMockClaim(id: string) {
  return {
    id,
    claim_number: 'CLM-2026-00001',
    patient_id: 'pat-001',
    patient_name: 'Ramesh Sharma',
    patient_abha: '91-1234-5678-9012',
    patient_age: 58,
    patient_gender: 'male',
    payer_scheme: 'ayushman_bharat',
    payer_name: 'National Health Authority',
    provider_name: 'AIIMS New Delhi',
    provider_rohini_id: 'AIIMS-DEL-001',
    diagnosis_text: 'Type 2 Diabetes Mellitus with peripheral neuropathy and diabetic foot ulcer',
    icd10_codes: 'E11.9,G63,L97.529',
    cpt_codes: '99213,95904,11042',
    claimed_amount: 45000,
    approved_amount: 42000,
    package_code: 'AB-HBP-D-S-1-002',
    package_name: 'Diabetes management with complications',
    package_rate: 50000,
    status: 'approved',
    priority: 'normal',
    admission_date: '2026-03-10',
    discharge_date: '2026-03-14',
    submitted_at: '2026-03-15T10:30:00Z',
    processed_at: '2026-03-18T14:20:00Z',
    rejection_reason: null,
    notes: 'Patient stabilized. Follow-up required in 2 weeks for wound care.',
    created_by: 'usr-001',
    created_at: '2026-03-10T08:00:00Z',
    updated_at: '2026-03-18T14:20:00Z',
    documents: [
      {
        id: 'doc-001',
        claim_id: id,
        name: 'Discharge Summary',
        type: 'discharge_summary',
        file_url: '/uploads/claims/clm-001/discharge_summary.pdf',
        file_size: 245000,
        uploaded_at: '2026-03-15T09:00:00Z',
      },
      {
        id: 'doc-002',
        claim_id: id,
        name: 'Lab Reports - HbA1c & Blood Sugar',
        type: 'lab_report',
        file_url: '/uploads/claims/clm-001/lab_reports.pdf',
        file_size: 180000,
        uploaded_at: '2026-03-15T09:15:00Z',
      },
      {
        id: 'doc-003',
        claim_id: id,
        name: 'Pre-Authorization Letter',
        type: 'pre_auth',
        file_url: '/uploads/claims/clm-001/pre_auth.pdf',
        file_size: 120000,
        uploaded_at: '2026-03-10T10:00:00Z',
      },
      {
        id: 'doc-004',
        claim_id: id,
        name: 'Treatment Record & Prescription',
        type: 'treatment_record',
        file_url: '/uploads/claims/clm-001/treatment_record.pdf',
        file_size: 310000,
        uploaded_at: '2026-03-14T16:00:00Z',
      },
    ],
    timeline: [
      { event: 'claim_created', timestamp: '2026-03-10T08:00:00Z', actor: 'Dr. Rajesh Kumar', detail: 'Claim drafted from admission record' },
      { event: 'documents_uploaded', timestamp: '2026-03-15T09:15:00Z', actor: 'Nurse Priya', detail: '4 documents attached' },
      { event: 'claim_submitted', timestamp: '2026-03-15T10:30:00Z', actor: 'Dr. Rajesh Kumar', detail: 'Submitted to NHA via Ayushman Bharat portal' },
      { event: 'under_review', timestamp: '2026-03-16T08:00:00Z', actor: 'NHA System', detail: 'Claim picked up for adjudication' },
      { event: 'claim_approved', timestamp: '2026-03-18T14:20:00Z', actor: 'NHA Adjudicator', detail: 'Approved with minor deduction of INR 3,000' },
    ],
  };
}

// ── GET: Full claim detail with documents ───────────────────────────────────

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return json({ message: 'Claim ID is required' }, 400);

    // ── Try D1 database first ──
    if (context.env.DB) {
      try {
        const claim = await context.env.DB.prepare(
          'SELECT * FROM claims WHERE id = ?'
        ).bind(id).first();

        if (!claim) return json({ message: 'Claim not found' }, 404);

        // Fetch associated documents
        let documents: unknown[] = [];
        try {
          const docResult = await context.env.DB.prepare(
            'SELECT * FROM claim_documents WHERE claim_id = ? ORDER BY uploaded_at DESC'
          ).bind(id).all();
          documents = docResult.results || [];
        } catch {
          // claim_documents table may not exist yet
        }

        // Fetch timeline/audit log
        let timeline: unknown[] = [];
        try {
          const timelineResult = await context.env.DB.prepare(
            'SELECT * FROM claim_timeline WHERE claim_id = ? ORDER BY timestamp ASC'
          ).bind(id).all();
          timeline = timelineResult.results || [];
        } catch {
          // claim_timeline table may not exist yet
        }

        return json({ claim: { ...claim, documents, timeline } });
      } catch (dbErr) {
        console.error('D1 claim detail query failed, falling back to mock:', dbErr);
      }
    }

    // ── Mock fallback ──
    return json({ claim: getMockClaim(id) });
  } catch (err) {
    return json({ message: 'Failed to fetch claim', error: String(err) }, 500);
  }
};

// ── PUT: Update claim ───────────────────────────────────────────────────────

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return json({ message: 'Claim ID is required' }, 400);

    const body = await context.request.json() as Record<string, unknown>;

    // Allowed fields for update
    const UPDATABLE_FIELDS = [
      'status',
      'diagnosis', 'diagnosis_codes', 'procedure_codes',
      'claimed_amount', 'approved_amount',
      'payer_scheme', 'payer_name', 'policy_number',
      'admission_date', 'discharge_date',
      'rejection_reason', 'documents',
      'ai_coding_confidence', 'ai_completeness_score', 'fhir_bundle',
    ];

    const updates: string[] = [];
    const params: unknown[] = [];

    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return json({ message: 'No valid fields to update' }, 400);
    }

    // Always update timestamp
    updates.push('updated_at = ?');
    const now = new Date().toISOString();
    params.push(now);

    // If status is changing to approved/rejected, set resolved_at
    if (body.status === 'approved' || body.status === 'rejected') {
      updates.push('resolved_at = ?');
      params.push(now);
    }

    params.push(id); // WHERE id = ?

    // ── Try D1 database first ──
    if (context.env.DB) {
      try {
        // Verify claim exists
        const existing = await context.env.DB.prepare(
          'SELECT id, status FROM claims WHERE id = ?'
        ).bind(id).first();

        if (!existing) return json({ message: 'Claim not found' }, 404);

        await context.env.DB.prepare(
          `UPDATE claims SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...params).run();

        // Fetch updated claim
        const updated = await context.env.DB.prepare(
          'SELECT * FROM claims WHERE id = ?'
        ).bind(id).first();

        return json({ claim: updated, message: 'Claim updated successfully' });
      } catch (dbErr) {
        console.error('D1 update failed, falling back to mock:', dbErr);
      }
    }

    // ── Mock fallback ──
    const mockClaim = getMockClaim(id);
    const updatedClaim = { ...mockClaim };

    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        (updatedClaim as Record<string, unknown>)[field] = body[field];
      }
    }
    updatedClaim.updated_at = now;

    if (body.status === 'approved' || body.status === 'rejected') {
      updatedClaim.resolved_at = now;
    }

    return json({ claim: updatedClaim, message: 'Claim updated successfully (mock)' });
  } catch (err) {
    return json({ message: 'Failed to update claim', error: String(err) }, 500);
  }
};
