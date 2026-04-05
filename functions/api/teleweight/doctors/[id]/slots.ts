// TeleWeight: Doctor Available Slots
// GET /api/teleweight/doctors/:id/slots?date=YYYY-MM-DD — Available consultation slots

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  const { id } = context.params as { id: string }
  const url = new URL(context.request.url)
  const dateParam = url.searchParams.get('date')
  const daysAhead = parseInt(url.searchParams.get('days') || '7')

  try {
    const doctor = await db.prepare('SELECT id, full_name, availability_slots, consultation_fee FROM doctors WHERE id = ? AND is_active = 1').bind(id).first() as any
    if (!doctor) return json({ error: 'Doctor not found or inactive' }, 404)

    const slots: Record<string, unknown> = {}
    let availabilityMap: Record<string, string[]> = {}
    try {
      availabilityMap = JSON.parse(doctor.availability_slots || '{}')
    } catch { /* empty */ }

    // Get booked consultations for date range
    const startDate = dateParam ? new Date(dateParam) : new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + daysAhead)

    const booked = await db.prepare(`
      SELECT scheduled_at FROM consultations
      WHERE doctor_id = ? AND status IN ('scheduled', 'in_progress')
        AND scheduled_at >= ? AND scheduled_at < ?
    `).bind(id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).all()

    const bookedTimes = new Set((booked.results || []).map((b: any) => b.scheduled_at))

    // Generate available slots for each day
    for (let d = 0; d < daysAhead; d++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = DAY_NAMES[date.getDay()]

      const daySlots = availabilityMap[dayName] || []
      const available = daySlots
        .map(time => ({
          time,
          datetime: `${dateStr} ${time}:00`,
          available: !bookedTimes.has(`${dateStr} ${time}:00`),
        }))

      if (available.length > 0) {
        slots[dateStr] = {
          day: dayName,
          slots: available,
          available_count: available.filter(s => s.available).length,
          total_count: available.length,
        }
      }
    }

    return json({
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      consultation_fee: doctor.consultation_fee,
      currency: 'INR',
      date_range: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      slots,
    })
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
