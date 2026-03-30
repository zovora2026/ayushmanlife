interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const scheme = url.searchParams.get('scheme')
    const status = url.searchParams.get('status')

    if (!db) return json({ policies: [], total: 0 })

    let query = `
      SELECT p.*, pt.name as patient_name, pt.age as patient_age, pt.gender as patient_gender
      FROM policies p
      LEFT JOIN patients pt ON p.patient_id = pt.id
      WHERE 1=1`
    const bindings: string[] = []
    if (scheme) { query += ` AND p.scheme = ?`; bindings.push(scheme) }
    if (status) { query += ` AND p.status = ?`; bindings.push(status) }
    query += ` ORDER BY p.created_at DESC`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    // Summary
    const byStatus: Record<string, number> = {}
    const byScheme: Record<string, number> = {}
    let totalCoverage = 0
    let totalPremium = 0
    for (const r of results || []) {
      byStatus[r.status as string] = (byStatus[r.status as string] || 0) + 1
      byScheme[r.scheme as string] = (byScheme[r.scheme as string] || 0) + 1
      totalCoverage += (r.coverage_amount as number) || 0
      totalPremium += (r.premium_amount as number) || 0
    }

    return json({
      policies: results || [],
      total: results?.length || 0,
      summary: { by_status: byStatus, by_scheme: byScheme, total_coverage: totalCoverage, total_premium: totalPremium },
    })
  } catch (error) {
    console.error('Error fetching policies:', error)
    return json({ error: 'Failed to fetch policies' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as {
      scheme: string; provider_name: string; holder_name: string; patient_id?: string;
      coverage_amount: number; premium_amount?: number; start_date: string; end_date?: string; benefits?: string
    }

    if (!body.scheme || !body.holder_name || !body.start_date) {
      return json({ error: 'scheme, holder_name, and start_date are required' }, 400)
    }

    const id = `pol-${Date.now()}`
    const policyNumber = `POL-${Date.now()}`

    if (!db) return json({ policy: { id, policy_number: policyNumber, ...body, status: 'active' } }, 201)

    await db.prepare(
      `INSERT INTO policies (id, policy_number, scheme, provider_name, holder_name, holder_id, patient_id, coverage_amount, premium_amount, start_date, end_date, benefits)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, policyNumber, body.scheme, body.provider_name || '', body.holder_name,
      null, body.patient_id || null, body.coverage_amount || 0,
      body.premium_amount || 0, body.start_date, body.end_date || null, body.benefits || null
    ).run()

    const policy = await db.prepare('SELECT * FROM policies WHERE id = ?').bind(id).first()
    return json({ policy }, 201)
  } catch (error) {
    console.error('Error creating policy:', error)
    return json({ error: 'Failed to create policy' }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const body = await context.request.json() as { id: string; status?: string; end_date?: string }

    if (!body.id) return json({ error: 'id is required' }, 400)
    if (!db) return json({ policy: body })

    const updates: string[] = []
    const bindings: (string | null)[] = []

    if (body.status) { updates.push('status = ?'); bindings.push(body.status) }
    if (body.end_date) { updates.push('end_date = ?'); bindings.push(body.end_date) }

    if (updates.length === 0) return json({ error: 'No fields to update' }, 400)

    bindings.push(body.id)
    await db.prepare(`UPDATE policies SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run()

    const policy = await db.prepare('SELECT * FROM policies WHERE id = ?').bind(body.id).first()
    return json({ policy })
  } catch (error) {
    console.error('Error updating policy:', error)
    return json({ error: 'Failed to update policy' }, 500)
  }
}
