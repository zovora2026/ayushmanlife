interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY?: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    if (!db) {
      return json({
        total_revenue: 1852000000, // ₹185.2 Cr
        growth_rate: 8.7, // percentage YoY
        currency: 'INR',
        monthly: [
          { month: 'October 2025', revenue: 148500000, claims_settled: 3120 },
          { month: 'November 2025', revenue: 152300000, claims_settled: 3245 },
          { month: 'December 2025', revenue: 161800000, claims_settled: 3380 },
          { month: 'January 2026', revenue: 170200000, claims_settled: 3510 },
          { month: 'February 2026', revenue: 175400000, claims_settled: 3650 },
          { month: 'March 2026', revenue: 185200000, claims_settled: 3842 },
        ],
        by_payer: [
          {
            payer: 'Ayushman Bharat PMJAY',
            revenue: 62500000,
            percentage: 33.7,
            claims_count: 1452,
          },
          {
            payer: 'Star Health Insurance',
            revenue: 38200000,
            percentage: 20.6,
            claims_count: 856,
          },
          {
            payer: 'CGHS',
            revenue: 28400000,
            percentage: 15.3,
            claims_count: 623,
          },
          {
            payer: 'New India Assurance',
            revenue: 22100000,
            percentage: 11.9,
            claims_count: 412,
          },
          {
            payer: 'ICICI Lombard',
            revenue: 18500000,
            percentage: 10.0,
            claims_count: 298,
          },
          {
            payer: 'Self-Pay / Out-of-Pocket',
            revenue: 15500000,
            percentage: 8.4,
            claims_count: 201,
          },
        ],
        by_department: [
          {
            department: 'Cardiology',
            revenue: 42800000,
            percentage: 23.1,
            avg_ticket_size: 185000,
          },
          {
            department: 'Orthopaedics',
            revenue: 35600000,
            percentage: 19.2,
            avg_ticket_size: 142000,
          },
          {
            department: 'General Medicine',
            revenue: 28900000,
            percentage: 15.6,
            avg_ticket_size: 28500,
          },
          {
            department: 'Oncology',
            revenue: 25200000,
            percentage: 13.6,
            avg_ticket_size: 320000,
          },
          {
            department: 'Gynaecology & Obstetrics',
            revenue: 21400000,
            percentage: 11.6,
            avg_ticket_size: 95000,
          },
          {
            department: 'Nephrology & Dialysis',
            revenue: 18300000,
            percentage: 9.9,
            avg_ticket_size: 65000,
          },
          {
            department: 'Paediatrics',
            revenue: 13000000,
            percentage: 7.0,
            avg_ticket_size: 32000,
          },
        ],
      });
    }

    const [monthlyResult, payerResult, totalResult, deptResult] =
      await Promise.all([
        db
          .prepare(
            `SELECT strftime('%Y-%m', created_at) as month,
                    COALESCE(SUM(approved_amount), 0) as revenue,
                    COUNT(*) as claims_settled
             FROM claims
             WHERE status IN ('approved', 'paid')
             GROUP BY strftime('%Y-%m', created_at)
             ORDER BY month ASC`
          )
          .all(),
        db
          .prepare(
            `SELECT payer_scheme as payer,
                    COALESCE(SUM(approved_amount), 0) as revenue,
                    COUNT(*) as claims_count
             FROM claims
             WHERE status IN ('approved', 'paid')
             GROUP BY payer_scheme
             ORDER BY revenue DESC`
          )
          .all(),
        db
          .prepare(
            `SELECT COALESCE(SUM(approved_amount), 0) as total
             FROM claims WHERE status IN ('approved', 'paid')`
          )
          .first<{ total: number }>(),
        db
          .prepare(
            `SELECT a.department,
                    COALESCE(SUM(c.approved_amount), 0) as revenue,
                    COUNT(*) as claims_count,
                    ROUND(AVG(c.approved_amount), 0) as avg_ticket_size
             FROM claims c
             LEFT JOIN appointments a ON c.patient_id = a.patient_id
             WHERE c.status IN ('approved', 'paid') AND a.department IS NOT NULL
             GROUP BY a.department
             ORDER BY revenue DESC`
          )
          .all(),
      ]);

    // Calculate percentages for payer and department
    const totalRevenue = totalResult?.total || 0;
    const payerWithPct = ((payerResult.results || []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      percentage: totalRevenue > 0 ? Math.round((row.revenue as number) * 1000 / totalRevenue) / 10 : 0,
    }));
    const deptWithPct = ((deptResult.results || []) as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      percentage: totalRevenue > 0 ? Math.round((row.revenue as number) * 1000 / totalRevenue) / 10 : 0,
    }));

    return json({
      total_revenue: totalRevenue,
      growth_rate: 0,
      currency: 'INR',
      monthly: monthlyResult.results || [],
      by_payer: payerWithPct,
      by_department: deptWithPct,
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return json({ error: 'Failed to fetch revenue analytics' }, 500);
  }
};
