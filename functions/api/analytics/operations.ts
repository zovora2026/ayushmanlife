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
      claimsPerDayResult,
      losResult,
      appointmentsPerDayResult,
      deptResult,
      feedbackByDeptResult,
    ] = await Promise.all([
      db
        .prepare(
          `SELECT ROUND(AVG(julianday(resolved_at) - julianday(submitted_at)), 1) as avg_days
           FROM claims
           WHERE resolved_at IS NOT NULL AND submitted_at IS NOT NULL`
        )
        .first<{ avg_days: number }>(),
      db
        .prepare(
          `SELECT ROUND(CAST(COUNT(*) AS REAL) / 30, 0) as per_day
           FROM claims WHERE created_at >= date('now', '-30 days')`
        )
        .first<{ per_day: number }>(),
      db
        .prepare(
          `SELECT ROUND(AVG(julianday(discharge_date) - julianday(admission_date)), 1) as avg_los
           FROM claims
           WHERE discharge_date IS NOT NULL AND admission_date IS NOT NULL`
        )
        .first<{ avg_los: number }>(),
      db
        .prepare(
          `SELECT ROUND(CAST(COUNT(*) AS REAL) / 30, 0) as per_day
           FROM appointments WHERE date >= date('now', '-30 days')`
        )
        .first<{ per_day: number }>(),
      db
        .prepare(
          `SELECT department, COUNT(*) as appointments_count,
                  COUNT(DISTINCT patient_id) as unique_patients
           FROM appointments
           WHERE department IS NOT NULL
           GROUP BY department
           ORDER BY appointments_count DESC`
        )
        .all(),
      db
        .prepare(
          `SELECT department, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as feedback_count
           FROM feedback
           WHERE department IS NOT NULL
           GROUP BY department
           ORDER BY avg_rating DESC`
        )
        .all(),
    ]);

    // Merge department data from appointments and feedback
    const deptMap: Record<string, { appointments: number; patients: number; avg_rating: number; feedback_count: number }> = {};
    for (const row of (deptResult.results || []) as Array<Record<string, unknown>>) {
      const dept = row.department as string;
      deptMap[dept] = {
        appointments: row.appointments_count as number,
        patients: row.unique_patients as number,
        avg_rating: 0,
        feedback_count: 0,
      };
    }
    for (const row of (feedbackByDeptResult.results || []) as Array<Record<string, unknown>>) {
      const dept = row.department as string;
      if (!deptMap[dept]) deptMap[dept] = { appointments: 0, patients: 0, avg_rating: 0, feedback_count: 0 };
      deptMap[dept].avg_rating = row.avg_rating as number;
      deptMap[dept].feedback_count = row.feedback_count as number;
    }
    const byDepartment = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      appointments: data.appointments,
      unique_patients: data.patients,
      avg_satisfaction: data.avg_rating,
      feedback_count: data.feedback_count,
    }));

    return json({
      avg_turnaround_days: turnaroundResult?.avg_days || 0,
      claims_per_day: claimsPerDayResult?.per_day || 0,
      appointments_per_day: appointmentsPerDayResult?.per_day || 0,
      avg_length_of_stay_days: losResult?.avg_los || 0,
      by_department: byDepartment,
    });
  } catch (error) {
    console.error('Error fetching operations analytics:', error);
    return json(
      { error: 'Failed to fetch operations analytics' },
      500
    );
  }
};
