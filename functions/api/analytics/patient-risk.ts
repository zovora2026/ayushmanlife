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
      return json({ error: 'Database not available', total_high: 0, total_medium: 0, total_low: 0, high_risk: [], medium_risk: [], low_risk: [] }, 503);
    }

    // risk_score is stored as 0.0-1.0 in D1, thresholds: high >= 0.7, medium 0.4-0.7, low < 0.4
    const [highResult, mediumResult, lowResult, countsResult] =
      await Promise.all([
        db
          .prepare(
            `SELECT id, name, age, gender, risk_score, chronic_conditions, last_visit, medical_history
             FROM patients
             WHERE risk_score IS NOT NULL AND risk_score >= 0.7
             ORDER BY risk_score DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT id, name, age, gender, risk_score, chronic_conditions, last_visit, medical_history
             FROM patients
             WHERE risk_score IS NOT NULL AND risk_score >= 0.4 AND risk_score < 0.7
             ORDER BY risk_score DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT id, name, age, gender, risk_score, chronic_conditions, last_visit, medical_history
             FROM patients
             WHERE risk_score IS NOT NULL AND risk_score < 0.4
             ORDER BY risk_score DESC
             LIMIT 20`
          )
          .all(),
        db
          .prepare(
            `SELECT
              SUM(CASE WHEN risk_score >= 0.7 THEN 1 ELSE 0 END) as total_high,
              SUM(CASE WHEN risk_score >= 0.4 AND risk_score < 0.7 THEN 1 ELSE 0 END) as total_medium,
              SUM(CASE WHEN risk_score < 0.4 THEN 1 ELSE 0 END) as total_low
             FROM patients
             WHERE risk_score IS NOT NULL`
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
