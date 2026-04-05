// TeleWeight: Subscriptions API
// GET /api/teleweight/subscriptions — List subscriptions with summary
// POST /api/teleweight/subscriptions — Subscribe to a plan
// PUT /api/teleweight/subscriptions?id=X — Pause/cancel/renew subscription

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', subscriptions: [] }, 503)

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')

  let query = `
    SELECT s.*,
      p.name as patient_name,
      sp.name as plan_name, sp.price_monthly
    FROM patient_subscriptions s
    LEFT JOIN patients p ON s.patient_id = p.id
    LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE 1=1
  `
  const binds: unknown[] = []

  if (patientId) {
    query += ' AND s.patient_id = ?'
    binds.push(patientId)
  }

  query += ' ORDER BY s.created_at DESC'

  try {
    const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
    const { results } = await stmt.all()
    const subscriptions = results || []

    // Compute summary
    const totalActive = subscriptions.filter((s: any) => s.status === 'active').length
    const totalRevenue = subscriptions
      .filter((s: any) => s.status === 'active')
      .reduce((sum: number, s: any) => sum + (s.price_monthly || 0), 0)

    return json({
      subscriptions,
      total: subscriptions.length,
      summary: {
        total_active: totalActive,
        total_revenue: totalRevenue,
      },
    })
  } catch (e: any) {
    return json({ error: e.message, subscriptions: [] }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const { patient_id, plan_id, payment_method } = body

    if (!patient_id || !plan_id || !payment_method) {
      return json({ error: 'Missing required fields: patient_id, plan_id, payment_method' }, 400)
    }

    // Verify plan exists and is active
    const plan = await db.prepare(
      'SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1'
    ).bind(plan_id).first() as any

    if (!plan) {
      return json({ error: 'Plan not found or inactive' }, 404)
    }

    // Check for existing active subscription
    const existingSub = await db.prepare(
      "SELECT id FROM patient_subscriptions WHERE patient_id = ? AND status IN ('active', 'paused')"
    ).bind(patient_id).first()

    if (existingSub) {
      return json({ error: 'Patient already has an active or paused subscription. Cancel or update it first.' }, 409)
    }

    const id = `sub-${Date.now()}`
    const now = new Date()
    const startDate = now.toISOString().split('T')[0]

    // end_date: 3 months from now (quarterly)
    const endDate = new Date(now)
    endDate.setMonth(endDate.getMonth() + 3)
    const endDateStr = endDate.toISOString().split('T')[0]

    // next_payment_date: 1 month from now
    const nextPayment = new Date(now)
    nextPayment.setMonth(nextPayment.getMonth() + 1)
    const nextPaymentStr = nextPayment.toISOString().split('T')[0]

    const createdAt = now.toISOString()

    await db.prepare(`
      INSERT INTO patient_subscriptions (
        id, patient_id, plan_id, status, start_date, end_date,
        auto_renew, payment_method, last_payment_date, next_payment_date, created_at
      ) VALUES (?, ?, ?, 'active', ?, ?, 1, ?, ?, ?, ?)
    `).bind(
      id, patient_id, plan_id, startDate, endDateStr,
      payment_method, startDate, nextPaymentStr, createdAt
    ).run()

    const subscription = await db.prepare('SELECT * FROM patient_subscriptions WHERE id = ?').bind(id).first()
    return json({ subscription }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  const url = new URL(context.request.url)
  const id = url.searchParams.get('id')
  if (!id) return json({ error: 'Missing required query param: id' }, 400)

  try {
    const existing = await db.prepare('SELECT * FROM patient_subscriptions WHERE id = ?').bind(id).first() as any
    if (!existing) return json({ error: 'Subscription not found' }, 404)

    const body = await context.request.json() as any
    const { status } = body

    if (!status) {
      return json({ error: 'Missing required field: status' }, 400)
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      active: ['paused', 'cancelled'],
      paused: ['active'],
    }

    const allowed = validTransitions[existing.status]
    if (!allowed || !allowed.includes(status)) {
      return json({
        error: `Invalid status transition: ${existing.status} → ${status}. Allowed: ${(allowed || []).join(', ')}`,
      }, 400)
    }

    const now = new Date().toISOString()
    const updates: string[] = ['status = ?']
    const binds: unknown[] = [status]

    if (status === 'cancelled') {
      updates.push('cancellation_date = ?')
      binds.push(now.split('T')[0])

      if (body.cancellation_reason) {
        updates.push('cancellation_reason = ?')
        binds.push(body.cancellation_reason)
      }
    }

    // When reactivating from paused, refresh next_payment_date
    if (status === 'active' && existing.status === 'paused') {
      const nextPayment = new Date()
      nextPayment.setMonth(nextPayment.getMonth() + 1)
      updates.push('next_payment_date = ?')
      binds.push(nextPayment.toISOString().split('T')[0])
    }

    binds.push(id)
    await db.prepare(`UPDATE patient_subscriptions SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run()

    const subscription = await db.prepare('SELECT * FROM patient_subscriptions WHERE id = ?').bind(id).first()
    return json({ subscription })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
