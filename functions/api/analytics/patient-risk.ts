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
        total_high: 142,
        total_medium: 856,
        total_low: 23855,
        high_risk: [
          {
            id: 'pat-1001',
            name: 'Ramesh Prasad',
            age: 72,
            gender: 'Male',
            city: 'Varanasi',
            risk_score: 92,
            conditions: [
              'Chronic Heart Failure (NYHA Class III)',
              'Type 2 Diabetes (HbA1c 9.2%)',
              'Chronic Kidney Disease Stage 4',
            ],
            last_admission: '2026-03-15',
            readmission_risk: 'Very High',
            recommended_actions: [
              'Schedule cardiologist follow-up within 48 hours',
              'Adjust insulin regimen — current HbA1c above target',
              'Nephrology review for dialysis planning',
              'Enrol in home health monitoring programme',
            ],
          },
          {
            id: 'pat-1002',
            name: 'Kamala Devi',
            age: 68,
            gender: 'Female',
            city: 'Patna',
            risk_score: 88,
            conditions: [
              'COPD with frequent exacerbations',
              'Pulmonary Hypertension',
              'Osteoporosis',
            ],
            last_admission: '2026-03-22',
            readmission_risk: 'Very High',
            recommended_actions: [
              'Pulmonology review — 3rd exacerbation in 6 months',
              'Initiate home oxygen therapy assessment',
              'Bone density follow-up and calcium supplementation review',
              'Smoking cessation counselling (if applicable)',
            ],
          },
          {
            id: 'pat-1003',
            name: 'Bhagwan Singh',
            age: 78,
            gender: 'Male',
            city: 'Lucknow',
            risk_score: 85,
            conditions: [
              'Post-CABG (6 months)',
              'Atrial Fibrillation',
              'Hypertension (uncontrolled)',
            ],
            last_admission: '2026-02-28',
            readmission_risk: 'High',
            recommended_actions: [
              'Cardiology follow-up — BP not at target despite 3 medications',
              'INR monitoring — last value was sub-therapeutic',
              'Cardiac rehabilitation programme enrolment',
              'PMJAY claim follow-up for post-surgical care',
            ],
          },
        ],
        medium_risk: [
          {
            id: 'pat-2001',
            name: 'Priya Nair',
            age: 55,
            gender: 'Female',
            city: 'Kochi',
            risk_score: 62,
            conditions: [
              'Type 2 Diabetes (HbA1c 7.8%)',
              'Hypothyroidism',
              'Mild Diabetic Retinopathy',
            ],
            last_visit: '2026-03-10',
            readmission_risk: 'Moderate',
            recommended_actions: [
              'Endocrinology review for insulin adjustment',
              'Annual ophthalmology screening due',
              'Foot care education and podiatry referral',
            ],
          },
          {
            id: 'pat-2002',
            name: 'Suresh Yadav',
            age: 48,
            gender: 'Male',
            city: 'Jaipur',
            risk_score: 58,
            conditions: [
              'Hypertension Stage 2',
              'Obesity (BMI 34)',
              'Pre-diabetic (HbA1c 6.3%)',
            ],
            last_visit: '2026-03-18',
            readmission_risk: 'Moderate',
            recommended_actions: [
              'Lifestyle modification counselling',
              'Dietary consultation — reduce salt and sugar intake',
              'Follow-up BP monitoring in 2 weeks',
              'Repeat HbA1c in 3 months',
            ],
          },
          {
            id: 'pat-2003',
            name: 'Meenakshi Sundaram',
            age: 62,
            gender: 'Female',
            city: 'Chennai',
            risk_score: 55,
            conditions: [
              'Rheumatoid Arthritis (active)',
              'Osteopenia',
              'Chronic Anaemia (Hb 9.2)',
            ],
            last_visit: '2026-03-05',
            readmission_risk: 'Moderate',
            recommended_actions: [
              'Rheumatology review — disease activity score elevated',
              'Iron studies and possible IV iron infusion',
              'DEXA scan overdue — schedule within 2 weeks',
            ],
          },
        ],
        low_risk: [
          {
            id: 'pat-3001',
            name: 'Ananya Gupta',
            age: 32,
            gender: 'Female',
            city: 'Delhi',
            risk_score: 15,
            conditions: ['Seasonal Allergic Rhinitis'],
            last_visit: '2026-03-25',
            readmission_risk: 'Low',
            recommended_actions: [
              'Continue antihistamines as needed',
              'Annual health checkup recommended',
            ],
          },
          {
            id: 'pat-3002',
            name: 'Vikram Reddy',
            age: 28,
            gender: 'Male',
            city: 'Hyderabad',
            risk_score: 8,
            conditions: ['Mild Myopia', 'Vitamin D Deficiency'],
            last_visit: '2026-03-20',
            readmission_risk: 'Low',
            recommended_actions: [
              'Continue Vitamin D3 60K sachets weekly for 8 weeks',
              'Annual eye checkup',
            ],
          },
        ],
      });
    }

    const [highResult, mediumResult, lowResult, countsResult] =
      await Promise.all([
        db
          .prepare(
            `SELECT p.id, p.name, p.age, p.gender, p.city, pr.risk_score, pr.conditions, pr.last_admission, pr.readmission_risk, pr.recommended_actions
             FROM patients p
             JOIN patient_risk pr ON p.id = pr.patient_id
             WHERE pr.risk_score >= 75
             ORDER BY pr.risk_score DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT p.id, p.name, p.age, p.gender, p.city, pr.risk_score, pr.conditions, pr.last_visit, pr.readmission_risk, pr.recommended_actions
             FROM patients p
             JOIN patient_risk pr ON p.id = pr.patient_id
             WHERE pr.risk_score >= 40 AND pr.risk_score < 75
             ORDER BY pr.risk_score DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT p.id, p.name, p.age, p.gender, p.city, pr.risk_score, pr.conditions, pr.last_visit, pr.readmission_risk, pr.recommended_actions
             FROM patients p
             JOIN patient_risk pr ON p.id = pr.patient_id
             WHERE pr.risk_score < 40
             ORDER BY pr.risk_score DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT
              SUM(CASE WHEN risk_score >= 75 THEN 1 ELSE 0 END) as total_high,
              SUM(CASE WHEN risk_score >= 40 AND risk_score < 75 THEN 1 ELSE 0 END) as total_medium,
              SUM(CASE WHEN risk_score < 40 THEN 1 ELSE 0 END) as total_low
             FROM patient_risk`
          )
          .first<{
            total_high: number;
            total_medium: number;
            total_low: number;
          }>(),
      ]);

    return json({
      total_high: countsResult?.total_high || 0,
      total_medium: countsResult?.total_medium || 0,
      total_low: countsResult?.total_low || 0,
      high_risk: highResult.results || [],
      medium_risk: mediumResult.results || [],
      low_risk: lowResult.results || [],
    });
  } catch (error) {
    console.error('Error fetching patient risk data:', error);
    return json({ error: 'Failed to fetch patient risk data' }, 500);
  }
};
