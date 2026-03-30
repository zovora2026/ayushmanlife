interface Env { DB: D1Database; ANTHROPIC_API_KEY?: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Statuses that are allowed to transition to 'submitted'
const SUBMITTABLE_STATUSES = ['draft', 'pending'];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return json({ message: 'Claim ID is required' }, 400);

    // Optional body: payer_scheme override, notes, submitted_by
    let body: Record<string, unknown> = {};
    try {
      body = await context.request.json() as Record<string, unknown>;
    } catch {
      // Body can be empty for simple submit
    }

    const now = new Date().toISOString();

    // ── Try D1 database first ──
    if (context.env.DB) {
      try {
        // Fetch existing claim
        const claim = await context.env.DB.prepare(
          'SELECT * FROM claims WHERE id = ?'
        ).bind(id).first<Record<string, unknown>>();

        if (!claim) return json({ message: 'Claim not found' }, 404);

        // Validate current status allows submission
        if (!SUBMITTABLE_STATUSES.includes(claim.status as string)) {
          return json({
            message: `Cannot submit claim with status '${claim.status}'. Only claims with status ${SUBMITTABLE_STATUSES.map(s => `'${s}'`).join(' or ')} can be submitted.`,
            current_status: claim.status,
          }, 409);
        }

        // Validate required fields for submission
        const missingFields: string[] = [];
        if (!claim.patient_name) missingFields.push('patient_name');
        if (!claim.diagnosis_text) missingFields.push('diagnosis_text');
        if (!claim.claimed_amount || Number(claim.claimed_amount) <= 0) missingFields.push('claimed_amount');
        if (!claim.payer_scheme && !body.payer_scheme) missingFields.push('payer_scheme');

        if (missingFields.length > 0) {
          return json({
            message: 'Claim is missing required fields for submission',
            missing_fields: missingFields,
          }, 422);
        }

        // Build update query
        const updates = [
          'status = ?',
          'submitted_at = ?',
          'updated_at = ?',
        ];
        const params: unknown[] = ['submitted', now, now];

        if (body.payer_scheme) {
          updates.push('payer_scheme = ?');
          params.push(body.payer_scheme);
        }
        if (body.notes) {
          updates.push('notes = ?');
          params.push(body.notes);
        }

        params.push(id); // WHERE id = ?

        await context.env.DB.prepare(
          `UPDATE claims SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...params).run();

        // Try to add timeline entry
        try {
          await context.env.DB.prepare(
            `INSERT INTO claim_timeline (id, claim_id, event, timestamp, actor, detail)
             VALUES (?, ?, 'claim_submitted', ?, ?, ?)`
          ).bind(
            crypto.randomUUID(),
            id,
            now,
            (body.submitted_by as string) || 'system',
            `Claim submitted to ${(body.payer_scheme as string) || claim.payer_scheme || 'payer'}`,
          ).run();
        } catch {
          // claim_timeline table may not exist yet, non-critical
        }

        // Fetch updated claim
        const updated = await context.env.DB.prepare(
          'SELECT * FROM claims WHERE id = ?'
        ).bind(id).first();

        return json({
          claim: updated,
          message: 'Claim submitted successfully',
          submitted_at: now,
        });
      } catch (dbErr) {
        console.error('D1 submit failed, falling back to mock:', dbErr);
      }
    }

    // ── Mock fallback ──
    const mockClaim = {
      id,
      claim_number: 'CLM-2026-00001',
      patient_id: 'pat-001',
      patient_name: 'Ramesh Sharma',
      patient_abha: '91-1234-5678-9012',
      payer_scheme: (body.payer_scheme as string) || 'ayushman_bharat',
      provider_name: 'AIIMS New Delhi',
      diagnosis_text: 'Type 2 Diabetes Mellitus with peripheral neuropathy',
      icd10_codes: 'E11.9,G63',
      cpt_codes: '99213,95904',
      claimed_amount: 45000,
      approved_amount: null,
      status: 'submitted',
      priority: 'normal',
      admission_date: '2026-03-10',
      discharge_date: '2026-03-14',
      submitted_at: now,
      processed_at: null,
      notes: (body.notes as string) || null,
      created_at: '2026-03-10T08:00:00Z',
      updated_at: now,
    };

    return json({
      claim: mockClaim,
      message: 'Claim submitted successfully (mock)',
      submitted_at: now,
    });
  } catch (err) {
    return json({ message: 'Failed to submit claim', error: String(err) }, 500);
  }
};
