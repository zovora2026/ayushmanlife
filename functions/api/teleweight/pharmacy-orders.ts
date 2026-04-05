// TeleWeight: Pharmacy Orders API
// GET /api/teleweight/pharmacy-orders — List orders with filters
// POST /api/teleweight/pharmacy-orders — Route prescription to pharmacy
// PUT /api/teleweight/pharmacy-orders?id=X — Update delivery status

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', orders: [] }, 503)

  const url = new URL(context.request.url)
  const patientId = url.searchParams.get('patient_id')
  const pharmacyId = url.searchParams.get('pharmacy_id')
  const orderStatus = url.searchParams.get('order_status')

  let query = `
    SELECT po.*,
      pr.diagnosis, pr.medications, pr.status as prescription_status,
      p.name as patient_name,
      pp.name as pharmacy_name, pp.city as pharmacy_city
    FROM pharmacy_orders po
    LEFT JOIN prescriptions pr ON po.prescription_id = pr.id
    LEFT JOIN patients p ON po.patient_id = p.id
    LEFT JOIN pharmacy_partners pp ON po.pharmacy_id = pp.id
    WHERE 1=1
  `
  const binds: unknown[] = []

  if (patientId) {
    query += ' AND po.patient_id = ?'
    binds.push(patientId)
  }
  if (pharmacyId) {
    query += ' AND po.pharmacy_id = ?'
    binds.push(pharmacyId)
  }
  if (orderStatus) {
    query += ' AND po.order_status = ?'
    binds.push(orderStatus)
  }

  query += ' ORDER BY po.created_at DESC'

  try {
    const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
    const { results } = await stmt.all()
    const orders = results || []

    return json({
      orders,
      total: orders.length,
    })
  } catch (e: any) {
    return json({ error: e.message, orders: [] }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const { prescription_id, patient_id, pharmacy_id, delivery_address, delivery_pincode, payment_method } = body

    if (!prescription_id || !patient_id || !pharmacy_id || !delivery_address || !delivery_pincode || !payment_method) {
      return json({
        error: 'Missing required fields: prescription_id, patient_id, pharmacy_id, delivery_address, delivery_pincode, payment_method',
      }, 400)
    }

    // Look up pharmacy for avg_delivery_days
    const pharmacy = await db.prepare(
      'SELECT avg_delivery_days FROM pharmacy_partners WHERE id = ? AND is_active = 1'
    ).bind(pharmacy_id).first() as any

    if (!pharmacy) {
      return json({ error: 'Pharmacy not found or inactive' }, 404)
    }

    // Look up prescription for medication details
    const prescription = await db.prepare(
      'SELECT * FROM prescriptions WHERE id = ?'
    ).bind(prescription_id).first() as any

    if (!prescription) {
      return json({ error: 'Prescription not found' }, 404)
    }

    // Compute estimated delivery date
    const deliveryDays = pharmacy.avg_delivery_days || 3
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays)
    const estimatedDeliveryDate = estimatedDate.toISOString().split('T')[0]

    const id = `po-${Date.now()}`
    const now = new Date().toISOString()

    // total_amount comes from client (actual pricing is pharmacy-side)
    const totalAmount = body.total_amount || 0

    await db.prepare(`
      INSERT INTO pharmacy_orders (
        id, prescription_id, patient_id, pharmacy_id, order_status,
        delivery_address, delivery_pincode, estimated_delivery_date,
        total_amount, payment_method, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
      id, prescription_id, patient_id, pharmacy_id,
      delivery_address, delivery_pincode, estimatedDeliveryDate,
      totalAmount, payment_method, now, now
    ).run()

    const order = await db.prepare('SELECT * FROM pharmacy_orders WHERE id = ?').bind(id).first()
    return json({ order }, 201)
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
    const existing = await db.prepare('SELECT * FROM pharmacy_orders WHERE id = ?').bind(id).first() as any
    if (!existing) return json({ error: 'Order not found' }, 404)

    const body = await context.request.json() as any
    const { order_status, tracking_number, payment_status, total_amount } = body

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['dispatched', 'cancelled'],
      dispatched: ['delivered', 'cancelled'],
    }

    if (order_status) {
      const allowed = validTransitions[existing.order_status]
      if (!allowed || !allowed.includes(order_status)) {
        return json({
          error: `Invalid status transition: ${existing.order_status} → ${order_status}. Allowed: ${(allowed || []).join(', ')}`,
        }, 400)
      }
    }

    const now = new Date().toISOString()
    const updates: string[] = ['updated_at = ?']
    const binds: unknown[] = [now]

    if (order_status) {
      updates.push('order_status = ?')
      binds.push(order_status)

      // Set actual_delivery_date when delivered
      if (order_status === 'delivered') {
        updates.push('actual_delivery_date = ?')
        binds.push(now.split('T')[0])
      }
    }
    if (tracking_number !== undefined) {
      updates.push('tracking_number = ?')
      binds.push(tracking_number)
    }
    if (payment_status !== undefined) {
      updates.push('payment_status = ?')
      binds.push(payment_status)
    }
    if (total_amount !== undefined) {
      updates.push('total_amount = ?')
      binds.push(total_amount)
    }

    binds.push(id)
    await db.prepare(`UPDATE pharmacy_orders SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run()

    const order = await db.prepare('SELECT * FROM pharmacy_orders WHERE id = ?').bind(id).first()
    return json({ order })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
