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
        avg_turnaround_days: 4.2,
        bed_occupancy_pct: 78.5,
        staff_utilization_pct: 84.3,
        claims_per_day: 128,
        appointments_per_day: 187,
        emergency_response_time_min: 8.5,
        avg_length_of_stay_days: 3.8,
        ot_utilization_pct: 71.2,
        pharmacy_turnaround_min: 12,
        lab_turnaround_hours: 4.5,
        by_department: [
          {
            department: 'Emergency',
            avg_wait_min: 12,
            patients_per_day: 65,
            bed_turnover: 2.1,
            staff_count: 48,
          },
          {
            department: 'General Medicine',
            avg_wait_min: 35,
            patients_per_day: 120,
            bed_turnover: 1.4,
            staff_count: 32,
          },
          {
            department: 'Cardiology',
            avg_wait_min: 28,
            patients_per_day: 45,
            bed_turnover: 0.8,
            staff_count: 24,
          },
          {
            department: 'Orthopaedics',
            avg_wait_min: 32,
            patients_per_day: 38,
            bed_turnover: 0.6,
            staff_count: 20,
          },
          {
            department: 'Paediatrics',
            avg_wait_min: 22,
            patients_per_day: 55,
            bed_turnover: 1.8,
            staff_count: 18,
          },
          {
            department: 'Gynaecology & Obstetrics',
            avg_wait_min: 25,
            patients_per_day: 42,
            bed_turnover: 1.2,
            staff_count: 22,
          },
        ],
        daily_trends: [
          { date: '2026-03-24', admissions: 42, discharges: 38, occupancy: 76.2 },
          { date: '2026-03-25', admissions: 48, discharges: 44, occupancy: 77.5 },
          { date: '2026-03-26', admissions: 45, discharges: 41, occupancy: 78.1 },
          { date: '2026-03-27', admissions: 50, discharges: 46, occupancy: 78.9 },
          { date: '2026-03-28', admissions: 38, discharges: 42, occupancy: 77.8 },
          { date: '2026-03-29', admissions: 44, discharges: 40, occupancy: 78.2 },
          { date: '2026-03-30', admissions: 46, discharges: 43, occupancy: 78.5 },
        ],
      });
    }

    const [
      turnaroundResult,
      bedResult,
      claimsPerDayResult,
      appointmentsPerDayResult,
      losResult,
      deptResult,
    ] = await Promise.all([
      db
        .prepare(
          `SELECT ROUND(AVG(julianday(completed_at) - julianday(submitted_at)), 1) as avg_days
           FROM claims
           WHERE completed_at IS NOT NULL AND submitted_at >= date('now', '-30 days')`
        )
        .first<{ avg_days: number }>(),
      db
        .prepare(
          `SELECT CASE WHEN total > 0 THEN ROUND(CAST(occupied AS REAL) / total * 100, 1) ELSE 0 END as occupancy
           FROM (SELECT COUNT(*) as total, SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied FROM beds)`
        )
        .first<{ occupancy: number }>(),
      db
        .prepare(
          `SELECT ROUND(CAST(COUNT(*) AS REAL) / 30, 0) as per_day
           FROM claims WHERE submitted_at >= date('now', '-30 days')`
        )
        .first<{ per_day: number }>(),
      db
        .prepare(
          `SELECT ROUND(CAST(COUNT(*) AS REAL) / 30, 0) as per_day
           FROM appointments WHERE appointment_date >= date('now', '-30 days')`
        )
        .first<{ per_day: number }>(),
      db
        .prepare(
          `SELECT ROUND(AVG(julianday(discharge_date) - julianday(admission_date)), 1) as avg_los
           FROM admissions
           WHERE discharge_date IS NOT NULL AND admission_date >= date('now', '-30 days')`
        )
        .first<{ avg_los: number }>(),
      db
        .prepare(
          `SELECT d.name as department,
                  ROUND(AVG(CAST((julianday(a.seen_at) - julianday(a.check_in_at)) * 24 * 60 AS INTEGER)), 0) as avg_wait_min,
                  COUNT(*) / 30 as patients_per_day,
                  (SELECT COUNT(*) FROM staff s WHERE s.department_id = d.id AND s.status = 'active') as staff_count
           FROM appointments a
           JOIN departments d ON a.department_id = d.id
           WHERE a.appointment_date >= date('now', '-30 days') AND a.seen_at IS NOT NULL
           GROUP BY d.name
           ORDER BY patients_per_day DESC`
        )
        .all(),
    ]);

    return json({
      avg_turnaround_days: turnaroundResult?.avg_days || 0,
      bed_occupancy_pct: bedResult?.occupancy || 0,
      staff_utilization_pct: 0,
      claims_per_day: claimsPerDayResult?.per_day || 0,
      appointments_per_day: appointmentsPerDayResult?.per_day || 0,
      avg_length_of_stay_days: losResult?.avg_los || 0,
      by_department: deptResult.results || [],
    });
  } catch (error) {
    console.error('Error fetching operations analytics:', error);
    return json(
      { error: 'Failed to fetch operations analytics' },
      500
    );
  }
};
