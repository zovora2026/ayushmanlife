interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: Get single claim details with adjudication history and timeline
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const claimId = context.params.id as string;

    if (!db) {
      return json({ error: 'Database not available' }, 503);
    }

    // Get claim with patient details
    const claim = await db.prepare(`
      SELECT c.*, p.name as patient_name, p.age, p.gender,
             p.insurance_type
      FROM claims c
      LEFT JOIN patients p ON c.patient_id = p.id
      WHERE c.id = ?
    `).bind(claimId).first();

    if (!claim) {
      return json({ error: 'Claim not found' }, 404);
    }

    // Get adjudication history
    const { results: adjudications } = await db.prepare(`
      SELECT ca.*, u.name as adjudicator_name
      FROM claim_adjudications ca
      LEFT JOIN users u ON ca.adjudicated_by = u.id
      WHERE ca.claim_id = ?
      ORDER BY ca.decision_date DESC
    `).bind(claimId).all();

    // Get timeline
    const { results: timeline } = await db.prepare(`
      SELECT * FROM claim_timeline
      WHERE claim_id = ?
      ORDER BY created_at ASC
    `).bind(claimId).all();

    // Get fraud alerts
    const { results: fraudAlerts } = await db.prepare(`
      SELECT * FROM fraud_alerts
      WHERE claim_id = ?
      ORDER BY created_at DESC
    `).bind(claimId).all();

    // Get policy info if available
    const policy = claim.policy_number
      ? await db.prepare(`
          SELECT * FROM policies WHERE policy_number = ?
        `).bind(claim.policy_number).first()
      : null;

    return json({
      claim,
      adjudications: adjudications || [],
      timeline: timeline || [],
      fraud_alerts: fraudAlerts || [],
      policy,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching claim details:', error);
    return json({ error: 'Failed to fetch claim details' }, 500);
  }
};

// POST: Adjudicate a claim (approve/reject/partially_approve/pend)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const claimId = context.params.id as string;
    const body = (await context.request.json()) as {
      action: 'approve' | 'reject' | 'partially_approve' | 'pend' | 'flag_review';
      amount_approved?: number;
      remarks: string;
      adjudicated_by?: string;
      rules_applied?: string;
    };

    if (!body.action || !body.remarks) {
      return json({ error: 'action and remarks are required' }, 400);
    }

    if (!db) {
      return json({ error: 'Database not available' }, 503);
    }

    // Verify claim exists and is in adjudicable state
    const claim = await db.prepare(`SELECT * FROM claims WHERE id = ?`).bind(claimId).first();
    if (!claim) {
      return json({ error: 'Claim not found' }, 404);
    }

    const adjudicableStatuses = ['submitted', 'under_review', 'pre_auth_pending', 'appealed'];
    if (!adjudicableStatuses.includes(claim.status as string)) {
      return json({ error: `Claim status '${claim.status}' cannot be adjudicated` }, 400);
    }

    // Map action to claim status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      partially_approve: 'partially_approved',
      pend: 'under_review',
      flag_review: 'under_review',
    };
    const newStatus = statusMap[body.action];
    const approvedAmount = body.action === 'reject' ? 0 : (body.amount_approved || claim.claimed_amount);
    const adjudicatedBy = body.adjudicated_by || (context.data as any)?.user?.id || 'usr-001';

    // Create adjudication record
    const adjId = `adj-${Date.now()}`;
    await db.prepare(`
      INSERT INTO claim_adjudications (id, claim_id, action, adjudicated_by, amount_approved, remarks, rules_applied)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(adjId, claimId, body.action, adjudicatedBy, approvedAmount, body.remarks, body.rules_applied || null).run();

    // Update claim status
    const rejectionReason = body.action === 'reject' ? body.remarks : null;
    await db.prepare(`
      UPDATE claims SET
        status = ?,
        approved_amount = ?,
        rejection_reason = COALESCE(?, rejection_reason),
        resolved_at = CASE WHEN ? IN ('approved', 'rejected', 'partially_approved') THEN datetime('now') ELSE resolved_at END,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(newStatus, approvedAmount, rejectionReason, newStatus, claimId).run();

    // Add timeline entry
    const tlId = `tl-${Date.now()}`;
    await db.prepare(`
      INSERT INTO claim_timeline (id, claim_id, event, actor, detail)
      VALUES (?, ?, ?, ?, ?)
    `).bind(tlId, claimId, newStatus, adjudicatedBy, body.remarks).run();

    // Fetch updated claim
    const updatedClaim = await db.prepare(`
      SELECT c.*, p.name as patient_name
      FROM claims c
      LEFT JOIN patients p ON c.patient_id = p.id
      WHERE c.id = ?
    `).bind(claimId).first();

    return json({
      adjudication: { id: adjId, action: body.action, amount_approved: approvedAmount, status: newStatus },
      claim: updatedClaim,
      message: `Claim ${body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : body.action === 'partially_approve' ? 'partially approved' : 'updated'}`,
    }, 201);
  } catch (error) {
    console.error('Error adjudicating claim:', error);
    return json({ error: 'Failed to adjudicate claim' }, 500);
  }
};
