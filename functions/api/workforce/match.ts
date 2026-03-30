interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Simple skill matching: find consultants whose skills overlap with required skills
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const skills = url.searchParams.get('skills'); // comma-separated
    const city = url.searchParams.get('city');
    const availableOnly = url.searchParams.get('available') === 'true';

    if (!db) {
      return json({ matches: [], message: 'DB not available' });
    }

    // Get all staff with their skills and current utilization
    const staffResult = await db
      .prepare(
        `SELECT u.id, u.name, u.role, u.department,
          GROUP_CONCAT(DISTINCT ss.skill_name) as skills,
          GROUP_CONCAT(DISTINCT ss.category) as skill_categories,
          MAX(ss.proficiency) as max_proficiency,
          COALESCE(
            (SELECT SUM(pa.utilization_pct)
             FROM project_assignments pa
             WHERE pa.consultant_id = u.id AND pa.status = 'active'),
            0
          ) as current_utilization
        FROM users u
        LEFT JOIN staff_skills ss ON ss.user_id = u.id
        GROUP BY u.id
        ORDER BY u.name`
      )
      .all();

    let matches = (staffResult.results || []) as Array<Record<string, unknown>>;

    // Filter by availability
    if (availableOnly) {
      matches = matches.filter(
        (m) => ((m.current_utilization as number) || 0) < 100
      );
    }

    // Score by skill match
    if (skills) {
      const requiredSkills = skills
        .toLowerCase()
        .split(',')
        .map((s) => s.trim());
      matches = matches
        .map((m) => {
          const staffSkills = ((m.skills as string) || '')
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());
          const staffCategories = ((m.skill_categories as string) || '')
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());
          const allStaffTokens = [...staffSkills, ...staffCategories];

          let matchScore = 0;
          for (const req of requiredSkills) {
            if (
              allStaffTokens.some(
                (s) => s.includes(req) || req.includes(s)
              )
            ) {
              matchScore++;
            }
          }
          return {
            ...m,
            match_score: matchScore,
            match_pct: Math.round(
              (matchScore / requiredSkills.length) * 100
            ),
            available_capacity:
              100 - ((m.current_utilization as number) || 0),
          };
        })
        .filter((m) => m.match_score > 0)
        .sort((a, b) => b.match_score - a.match_score);
    } else {
      matches = matches.map((m) => ({
        ...m,
        match_score: 0,
        match_pct: 0,
        available_capacity: 100 - ((m.current_utilization as number) || 0),
      }));
    }

    // Filter by city (simple text match)
    if (city) {
      // We don't have city on users table, so skip city filtering for now
      // In production, you'd add a location/city column to users
    }

    return json({
      matches,
      total: matches.length,
      query: { skills, city, availableOnly },
    });
  } catch (error) {
    console.error('Error matching consultants:', error);
    return json({ error: 'Failed to match consultants' }, 500);
  }
};
