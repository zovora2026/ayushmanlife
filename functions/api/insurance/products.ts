interface Env { DB: D1Database }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB
    const url = new URL(context.request.url)
    const scheme = url.searchParams.get('scheme')

    if (!db) return json({ products: [], total: 0 })

    let query = `SELECT * FROM insurance_products WHERE 1=1`
    const bindings: string[] = []
    if (scheme) { query += ` AND scheme = ?`; bindings.push(scheme) }
    query += ` ORDER BY scheme, product_name`

    const stmt = db.prepare(query)
    const { results } = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    // Summary
    const byScheme: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    for (const r of results || []) {
      byScheme[r.scheme as string] = (byScheme[r.scheme as string] || 0) + 1
      byCategory[r.category as string] = (byCategory[r.category as string] || 0) + 1
    }

    return json({ products: results || [], total: results?.length || 0, by_scheme: byScheme, by_category: byCategory })
  } catch (error) {
    console.error('Error fetching products:', error)
    return json({ error: 'Failed to fetch products' }, 500)
  }
}
