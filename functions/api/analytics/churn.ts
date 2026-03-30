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
        churn_rate: 6.8, // percentage
        retention_rate: 93.2,
        at_risk_count: 342,
        total_active_patients: 24853,
        at_risk_patients: [
          {
            id: 'pat-4001',
            name: 'Dinesh Patel',
            age: 58,
            gender: 'Male',
            city: 'Ahmedabad',
            churn_probability: 0.89,
            last_visit: '2025-12-15',
            days_since_visit: 105,
            conditions: ['Type 2 Diabetes', 'Hypertension'],
            risk_factors: [
              'Missed 3 consecutive follow-ups',
              'Prescription not refilled in 90 days',
              'Negative feedback on last visit (long wait time)',
            ],
            recommended_retention: [
              'Immediate outreach call by care coordinator',
              'Offer teleconsultation with Dr. Sharma',
              'Send medication refill reminder via WhatsApp',
              'Offer priority appointment slot to reduce wait time',
            ],
          },
          {
            id: 'pat-4002',
            name: 'Savitri Kumari',
            age: 45,
            gender: 'Female',
            city: 'Ranchi',
            churn_probability: 0.82,
            last_visit: '2026-01-08',
            days_since_visit: 81,
            conditions: ['Hypothyroidism', 'Iron Deficiency Anaemia'],
            risk_factors: [
              'Switched to competitor hospital for last lab test',
              'PMJAY card renewal pending',
              'Expressed dissatisfaction about billing process',
            ],
            recommended_retention: [
              'Assist with PMJAY card renewal through Ayushman Mitra',
              'Offer complimentary health checkup package',
              'Assign dedicated billing coordinator for cashless claims',
              'Follow up on thyroid medication compliance',
            ],
          },
          {
            id: 'pat-4003',
            name: 'Gopal Krishnan',
            age: 65,
            gender: 'Male',
            city: 'Coimbatore',
            churn_probability: 0.78,
            last_visit: '2026-01-22',
            days_since_visit: 67,
            conditions: [
              'Chronic Kidney Disease Stage 3',
              'Diabetic Nephropathy',
            ],
            risk_factors: [
              'Missed dialysis preparedness counselling',
              'Insurance claim rejected — appeal pending',
              'Lives 45 km from hospital — transportation barrier',
            ],
            recommended_retention: [
              'Expedite insurance claim appeal',
              'Arrange transport assistance through CSR programme',
              'Schedule home visit by community health worker (ASHA)',
              'Offer telemedicine nephrology consultation',
            ],
          },
          {
            id: 'pat-4004',
            name: 'Rekha Mishra',
            age: 38,
            gender: 'Female',
            city: 'Bhopal',
            churn_probability: 0.75,
            last_visit: '2026-02-05',
            days_since_visit: 53,
            conditions: ['PCOS', 'Anxiety Disorder'],
            risk_factors: [
              'Cancelled last 2 appointments',
              'Incomplete treatment course for anxiety',
              'Low engagement with patient portal',
            ],
            recommended_retention: [
              'Gentle outreach via preferred communication channel (WhatsApp)',
              'Offer flexible appointment timing (evening/weekend)',
              'Connect with female counsellor for mental health follow-up',
              'Send health education content about PCOS management',
            ],
          },
          {
            id: 'pat-4005',
            name: 'Harish Choudhary',
            age: 52,
            gender: 'Male',
            city: 'Jodhpur',
            churn_probability: 0.71,
            last_visit: '2026-02-10',
            days_since_visit: 48,
            conditions: ['Coronary Artery Disease', 'Hyperlipidaemia'],
            risk_factors: [
              'Did not collect post-angiography medications',
              'No cardiac rehabilitation enrolment',
              'Insurance pre-authorization delayed for follow-up',
            ],
            recommended_retention: [
              'Pharmacy outreach for medication collection',
              'Fast-track insurance pre-authorization',
              'Enrol in cardiac rehabilitation programme',
              'Schedule cardiologist teleconsultation within 1 week',
            ],
          },
        ],
        churn_by_reason: [
          { reason: 'Long waiting times', percentage: 28.4 },
          { reason: 'Insurance/billing issues', percentage: 22.1 },
          { reason: 'Moved to competitor', percentage: 18.6 },
          { reason: 'Transportation barriers', percentage: 12.3 },
          { reason: 'Dissatisfaction with staff', percentage: 9.8 },
          { reason: 'Treatment cost concerns', percentage: 8.8 },
        ],
        monthly_trend: [
          { month: 'October 2025', churn_rate: 7.2, retained: 22850 },
          { month: 'November 2025', churn_rate: 7.0, retained: 23120 },
          { month: 'December 2025', churn_rate: 6.9, retained: 23480 },
          { month: 'January 2026', churn_rate: 7.1, retained: 23750 },
          { month: 'February 2026', churn_rate: 6.5, retained: 24200 },
          { month: 'March 2026', churn_rate: 6.8, retained: 24853 },
        ],
      });
    }

    const [churnResult, atRiskResult, reasonsResult, trendResult] =
      await Promise.all([
        db
          .prepare(
            `SELECT
              ROUND(CAST(SUM(CASE WHEN last_visit < date('now', '-90 days') AND status = 'active' THEN 1 ELSE 0 END) AS REAL) /
                    NULLIF(COUNT(*), 0) * 100, 1) as churn_rate,
              COUNT(*) as total_active
             FROM patients WHERE status = 'active'`
          )
          .first<{ churn_rate: number; total_active: number }>(),
        db
          .prepare(
            `SELECT p.id, p.name, p.age, p.gender, p.city,
                    pc.churn_probability, p.last_visit,
                    CAST(julianday('now') - julianday(p.last_visit) AS INTEGER) as days_since_visit,
                    pc.conditions, pc.risk_factors, pc.recommended_retention
             FROM patients p
             JOIN patient_churn pc ON p.id = pc.patient_id
             WHERE pc.churn_probability >= 0.7
             ORDER BY pc.churn_probability DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT reason, ROUND(CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM patient_churn WHERE churn_probability >= 0.5) * 100, 1) as percentage
             FROM patient_churn_reasons
             GROUP BY reason
             ORDER BY percentage DESC`
          )
          .all(),
        db
          .prepare(
            `SELECT strftime('%Y-%m', calculated_at) as month,
                    ROUND(AVG(churn_rate), 1) as churn_rate,
                    SUM(retained_count) as retained
             FROM churn_monthly
             WHERE calculated_at >= date('now', '-6 months')
             GROUP BY strftime('%Y-%m', calculated_at)
             ORDER BY month ASC`
          )
          .all(),
      ]);

    const churnRate = churnResult?.churn_rate || 0;

    return json({
      churn_rate: churnRate,
      retention_rate: Math.round((100 - churnRate) * 10) / 10,
      at_risk_count: atRiskResult.results?.length || 0,
      total_active_patients: churnResult?.total_active || 0,
      at_risk_patients: atRiskResult.results || [],
      churn_by_reason: reasonsResult.results || [],
      monthly_trend: trendResult.results || [],
    });
  } catch (error) {
    console.error('Error fetching churn analytics:', error);
    return json({ error: 'Failed to fetch churn analytics' }, 500);
  }
};
