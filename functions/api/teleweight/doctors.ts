// TeleWeight: Doctors API
// GET /api/teleweight/doctors — List active specialists with filters
// POST /api/teleweight/doctors — Create a new doctor (admin only)

interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available', doctors: [] }, 503)

  const url = new URL(context.request.url)
  const specialty = url.searchParams.get('specialty')
  const language = url.searchParams.get('language')
  const maxFee = url.searchParams.get('max_fee')
  const activeOnly = url.searchParams.get('active') !== '0'

  let query = 'SELECT * FROM doctors WHERE 1=1'
  const binds: unknown[] = []

  if (activeOnly) {
    query += ' AND is_active = 1'
  }
  if (specialty) {
    query += ' AND specialty = ?'
    binds.push(specialty)
  }
  if (maxFee) {
    query += ' AND consultation_fee <= ?'
    binds.push(parseInt(maxFee))
  }

  query += ' ORDER BY rating DESC, total_consultations DESC'

  try {
    const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query)
    const { results } = await stmt.all()

    // Filter by language client-side (JSON field)
    let doctors = results || []
    if (language) {
      doctors = doctors.filter((d: any) => {
        try {
          const langs = JSON.parse(d.languages || '[]')
          return langs.some((l: string) => l.toLowerCase().includes(language.toLowerCase()))
        } catch { return false }
      })
    }

    // Compute summary
    const specialties = [...new Set(doctors.map((d: any) => d.specialty))]
    const avgFee = doctors.length > 0
      ? Math.round(doctors.reduce((sum: number, d: any) => sum + d.consultation_fee, 0) / doctors.length)
      : 0

    return json({
      doctors,
      total: doctors.length,
      summary: {
        total_active: doctors.filter((d: any) => d.is_active).length,
        specialties,
        avg_consultation_fee: avgFee,
        avg_rating: doctors.length > 0
          ? +(doctors.reduce((sum: number, d: any) => sum + (d.rating || 0), 0) / doctors.length).toFixed(1)
          : 0,
      },
    })
  } catch (e: any) {
    return json({ error: e.message, doctors: [] }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = context.env.DB
  if (!db) return json({ error: 'Database not available' }, 503)

  try {
    const body = await context.request.json() as any
    const { full_name, registration_number, council_name, specialty, qualifications, consultation_fee } = body
    if (!full_name || !registration_number || !council_name || !specialty || !qualifications || !consultation_fee) {
      return json({ error: 'Missing required fields: full_name, registration_number, council_name, specialty, qualifications, consultation_fee' }, 400)
    }

    const id = `doc-tw-${Date.now()}`
    await db.prepare(`
      INSERT INTO doctors (id, full_name, registration_number, council_name, specialty, qualifications,
        experience_years, languages, consultation_fee, platform_commission_pct, availability_slots, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, full_name, registration_number, council_name, specialty, qualifications,
      body.experience_years || null, body.languages || null, consultation_fee,
      body.platform_commission_pct || 25, body.availability_slots || null, body.bio || null
    ).run()

    const doctor = await db.prepare('SELECT * FROM doctors WHERE id = ?').bind(id).first()
    return json({ doctor }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 500)
  }
}
