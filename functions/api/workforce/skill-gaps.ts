// Workforce Skill Gaps API — aggregate from staff_skills table
interface Env { DB: D1Database; }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const db = env.DB;
  if (!db) return Response.json({ error: 'Database not available', gaps: [] }, { status: 503 });

  try {
    // Aggregate skills by category and proficiency
    const { results: skills } = await db.prepare(`
      SELECT ss.category, ss.skill_name,
             COUNT(*) as staff_count,
             AVG(ss.proficiency) as avg_proficiency,
             MIN(ss.proficiency) as min_proficiency,
             MAX(ss.proficiency) as max_proficiency
      FROM staff_skills ss
      GROUP BY ss.category, ss.skill_name
      ORDER BY avg_proficiency ASC
    `).all();

    // Group by category
    const byCategory = skills.reduce((acc: Record<string, unknown[]>, s: Record<string, unknown>) => {
      const cat = (s.category as string) || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({
        skill: s.skill_name,
        staff_count: s.staff_count,
        avg_proficiency: Number((s.avg_proficiency as number).toFixed(1)),
        min_proficiency: s.min_proficiency,
        max_proficiency: s.max_proficiency,
        gap_level: (s.avg_proficiency as number) < 50 ? 'critical' : (s.avg_proficiency as number) < 70 ? 'moderate' : 'adequate',
      });
      return acc;
    }, {} as Record<string, unknown[]>);

    // Get total staff count for coverage calculation
    const staffCount = await db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM staff_skills").first() as Record<string, unknown>;

    return Response.json({
      gaps: skills.map((s: Record<string, unknown>) => ({
        skill: s.skill_name,
        category: s.category,
        staff_count: s.staff_count,
        avg_proficiency: Number((s.avg_proficiency as number).toFixed(1)),
        gap_level: (s.avg_proficiency as number) < 50 ? 'critical' : (s.avg_proficiency as number) < 70 ? 'moderate' : 'adequate',
      })),
      by_category: byCategory,
      total_staff_with_skills: staffCount?.count || 0,
    });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch skill gaps', gaps: [] }, { status: 500 });
  }
};
