// TeleWeight: Pharmacy Order Detail
// GET /api/teleweight/pharmacy-orders/:id — Single order detail with all JOINs

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  const { id } = context.params as { id: string }

  try {
    const order = await db.prepare(`
      SELECT po.*,
        pr.diagnosis, pr.medications, pr.status as prescription_status,
        pr.doctor_id, pr.special_instructions as prescription_notes,
        p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
        pp.name as pharmacy_name, pp.city as pharmacy_city, pp.state as pharmacy_state,
        pp.phone as pharmacy_phone, pp.license_number as pharmacy_license
      FROM pharmacy_orders po
      LEFT JOIN prescriptions pr ON po.prescription_id = pr.id
      LEFT JOIN patients p ON po.patient_id = p.id
      LEFT JOIN pharmacy_partners pp ON po.pharmacy_id = pp.id
      WHERE po.id = ?
    `).bind(id).first()

    if (!order) return json({ error: 'Order not found' }, 404)

    return json({ order })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
