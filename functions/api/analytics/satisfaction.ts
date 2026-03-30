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
        nps_score: 72,
        avg_rating: 4.3,
        total_responses: 8432,
        response_rate: 34.2, // percentage
        by_department: [
          {
            department: 'Paediatrics',
            avg_rating: 4.7,
            nps: 82,
            responses: 645,
          },
          {
            department: 'Cardiology',
            avg_rating: 4.5,
            nps: 78,
            responses: 1230,
          },
          {
            department: 'General Medicine',
            avg_rating: 4.3,
            nps: 71,
            responses: 2890,
          },
          {
            department: 'Orthopaedics',
            avg_rating: 4.2,
            nps: 68,
            responses: 1120,
          },
          {
            department: 'Gynaecology & Obstetrics',
            avg_rating: 4.4,
            nps: 75,
            responses: 980,
          },
          {
            department: 'Emergency',
            avg_rating: 3.8,
            nps: 55,
            responses: 1567,
          },
        ],
        recent_feedback: [
          {
            id: 'fb-001',
            patient_name: 'Rajesh Kumar',
            department: 'Cardiology',
            rating: 5,
            comment:
              'Dr. Priya Menon was extremely thorough with my ECG and echo results. She explained everything in Hindi which I appreciated. Excellent experience at the Cardiology OPD.',
            date: '2026-03-30',
            sentiment: 'positive',
          },
          {
            id: 'fb-002',
            patient_name: 'Sunita Devi',
            department: 'General Medicine',
            rating: 4,
            comment:
              'Good treatment but the waiting time at the OPD was almost 2 hours. The Ayushman card process was smooth though. Doctor sahab was very caring.',
            date: '2026-03-29',
            sentiment: 'positive',
          },
          {
            id: 'fb-003',
            patient_name: 'Mohammed Irfan',
            department: 'Emergency',
            rating: 3,
            comment:
              'Came in with my father who had breathing difficulty. Treatment was good but the emergency ward was very crowded and we had to wait 45 minutes. Need more staff in night shift.',
            date: '2026-03-29',
            sentiment: 'neutral',
          },
          {
            id: 'fb-004',
            patient_name: 'Lakshmi Venkatesh',
            department: 'Orthopaedics',
            rating: 5,
            comment:
              'My knee replacement surgery by Dr. Sunil Verma was successful. The physiotherapy team guided me very well during recovery. The PMJAY cashless process was hassle-free.',
            date: '2026-03-28',
            sentiment: 'positive',
          },
          {
            id: 'fb-005',
            patient_name: 'Amit Sharma',
            department: 'Paediatrics',
            rating: 5,
            comment:
              'Dr. Anita Krishnan is wonderful with children. My 3-year-old was scared but she made him comfortable. Vaccination was painless. Highly recommend.',
            date: '2026-03-28',
            sentiment: 'positive',
          },
          {
            id: 'fb-006',
            patient_name: 'Fatima Begum',
            department: 'Gynaecology & Obstetrics',
            rating: 2,
            comment:
              'The delivery ward was not clean enough. Nursing staff was helpful but the bathroom facilities need improvement. Billing counter took too long for CGHS claims.',
            date: '2026-03-27',
            sentiment: 'negative',
          },
        ],
        rating_distribution: {
          '5_star': 3420,
          '4_star': 2680,
          '3_star': 1350,
          '2_star': 620,
          '1_star': 362,
        },
      });
    }

    const [npsResult, avgResult, byDeptResult, feedbackResult, distResult] =
      await Promise.all([
        db
          .prepare(
            `SELECT
              ROUND(
                (CAST(SUM(CASE WHEN nps_score >= 9 THEN 1 ELSE 0 END) AS REAL) -
                 CAST(SUM(CASE WHEN nps_score <= 6 THEN 1 ELSE 0 END) AS REAL)) /
                NULLIF(COUNT(*), 0) * 100, 0
              ) as nps
             FROM feedback
             WHERE created_at >= date('now', '-30 days') AND nps_score IS NOT NULL`
          )
          .first<{ nps: number }>(),
        db
          .prepare(
            `SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_responses
             FROM feedback
             WHERE created_at >= date('now', '-30 days')`
          )
          .first<{ avg_rating: number; total_responses: number }>(),
        db
          .prepare(
            `SELECT f.department, ROUND(AVG(f.rating), 1) as avg_rating, COUNT(*) as responses
             FROM feedback f
             WHERE f.created_at >= date('now', '-30 days') AND f.department IS NOT NULL
             GROUP BY f.department
             ORDER BY avg_rating DESC`
          )
          .all(),
        db
          .prepare(
            `SELECT f.id, p.name as patient_name, f.department,
                    f.rating, f.comment, f.created_at as date, f.sentiment
             FROM feedback f
             LEFT JOIN patients p ON f.patient_id = p.id
             ORDER BY f.created_at DESC
             LIMIT 10`
          )
          .all(),
        db
          .prepare(
            `SELECT rating, COUNT(*) as count
             FROM feedback
             WHERE created_at >= date('now', '-30 days')
             GROUP BY rating
             ORDER BY rating DESC`
          )
          .all(),
      ]);

    return json({
      nps_score: npsResult?.nps || 0,
      avg_rating: avgResult?.avg_rating || 0,
      total_responses: avgResult?.total_responses || 0,
      by_department: byDeptResult.results || [],
      recent_feedback: feedbackResult.results || [],
      rating_distribution: distResult.results || [],
    });
  } catch (error) {
    console.error('Error fetching satisfaction analytics:', error);
    return json(
      { error: 'Failed to fetch satisfaction analytics' },
      500
    );
  }
};
