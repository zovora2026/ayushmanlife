interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const decision = url.searchParams.get('decision')

    if (!db) return json({ requests: [], total: 0 })

    let query = `
      SELECT uw.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
        ip.product_name, ip.scheme as product_scheme, ip.coverage_amount as product_coverage,
        pol.policy_number, u.name as underwriter_name
      FROM underwriting_requests uw
      LEFT JOIN patients p ON uw.patient_id = p.id
      LEFT JOIN insurance_products ip ON uw.product_id = ip.id
      LEFT JOIN policies pol ON uw.policy_id = pol.id
      LEFT JOIN users u ON uw.underwriter_id = u.id
      WHERE 1=1`
    const bindings: string[] = []
    if (decision) { query += ` AND uw.decision = ?`; bindings.push(decision) }
    query += ` ORDER BY CASE uw.decision WHEN 'pending' THEN 1 ELSE 2 END, uw.created_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    // Summary
    const byDecision: Record<string, number> = {}
    const byRisk: Record<string, number> = {}
    for (const r of results || []) {
      byDecision[r.decision as string] = (byDecision[r.decision as string] || 0) + 1
      byRisk[r.risk_category as string] = (byRisk[r.risk_category as string] || 0) + 1
    }

    return json({
      requests: results || [],
      total: results?.length || 0,
      summary: { by_decision: byDecision, by_risk: byRisk },
    })
  } catch (error) {
    console.error('Error fetching underwriting:', error)
    return json({ error: 'Failed to fetch underwriting requests' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      patient_id: string; product_id: string; request_type: string;
      medical_history?: string; pre_existing_conditions?: string; bmi?: number; smoker?: number
    }

    if (!body.patient_id || !body.product_id || !body.request_type) {
      return json({ error: 'patient_id, product_id, and request_type are required' }, 400)
    }

    const id = `uw-${Date.now()}`
    // Simple risk scoring
    let riskScore = 30
    if (body.pre_existing_conditions) riskScore += 25
    if (body.smoker) riskScore += 20
    if (body.bmi && body.bmi > 30) riskScore += 15
    if (body.bmi && body.bmi > 35) riskScore += 10
    const riskCategory = riskScore >= 70 ? 'high_risk' : riskScore >= 50 ? 'substandard' : riskScore >= 35 ? 'standard' : 'preferred'

    if (!db) return json({ request: { id, ...body, risk_score: riskScore, risk_category: riskCategory, decision: 'pending' } }, 201)

    await db.prepare(
      `INSERT INTO underwriting_requests (id, patient_id, product_id, request_type, risk_score, risk_category, medical_history, pre_existing_conditions, bmi, smoker)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.patient_id, body.product_id, body.request_type, riskScore, riskCategory, body.medical_history || null, body.pre_existing_conditions || null, body.bmi || null, body.smoker || 0).run()

    const request = await db.prepare('SELECT * FROM underwriting_requests WHERE id = ?').bind(id).first()
    return json({ request }, 201)
  } catch (error) {
    console.error('Error creating underwriting request:', error)
    return json({ error: 'Failed to create underwriting request' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      id: string; decision: string; premium_loading?: number; remarks?: string; underwriter_id?: string
    }

    if (!body.id || !body.decision) return json({ error: 'id and decision are required' }, 400)
    if (!db) return json({ request: body })

    const updates = ['decision = ?', 'decided_at = CURRENT_TIMESTAMP']
    const bindings: (string | number | null)[] = [body.decision]

    if (body.premium_loading !== undefined) { updates.push('premium_loading = ?'); bindings.push(body.premium_loading) }
    if (body.remarks) { updates.push('remarks = ?'); bindings.push(body.remarks) }
    if (body.underwriter_id) { updates.push('underwriter_id = ?'); bindings.push(body.underwriter_id) }

    bindings.push(body.id)
    await db.prepare(`UPDATE underwriting_requests SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const request = await db.prepare('SELECT * FROM underwriting_requests WHERE id = ?').bind(body.id).first()
    return json({ request })
  } catch (error) {
    console.error('Error updating underwriting request:', error)
    return json({ error: 'Failed to update underwriting request' }, 500)
  }
}
