interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function fuzzyMatch(required: string, candidate: string): number {
  const reqLower = required.toLowerCase();
  const candLower = candidate.toLowerCase();

  // Exact match
  if (candLower === reqLower) return 1.0;
  // Substring match
  if (candLower.includes(reqLower) || reqLower.includes(candLower)) return 0.85;

  // Word-level overlap
  const reqTokens = tokenize(required);
  const candTokens = tokenize(candidate);
  let wordMatches = 0;
  for (const rt of reqTokens) {
    for (const ct of candTokens) {
      if (ct.includes(rt) || rt.includes(ct)) {
        wordMatches++;
        break;
      }
    }
  }
  if (reqTokens.length > 0 && wordMatches > 0) {
    return 0.6 * (wordMatches / reqTokens.length);
  }

  return 0;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const skills = url.searchParams.get('skills');
    const city = url.searchParams.get('city');
    const availableOnly = url.searchParams.get('available') === 'true';
    const department = url.searchParams.get('department');

    if (!db) {
      return json({ matches: [], message: 'DB not available' });
    }

    // Get all staff with their skills, proficiency, and current utilization
    const staffResult = await db
      .prepare(
        `SELECT u.id, u.name, u.role, u.department,
          GROUP_CONCAT(ss.skill_name || ':' || ss.proficiency, '|') as skills_with_prof,
          GROUP_CONCAT(DISTINCT ss.category) as skill_categories,
          MAX(ss.proficiency) as max_proficiency,
          AVG(ss.proficiency) as avg_proficiency,
          COALESCE(
            (SELECT SUM(pa.utilization_pct)
             FROM project_assignments pa
             WHERE pa.consultant_id = u.id AND pa.status = 'active'),
            0
          ) as current_utilization,
          (SELECT COUNT(*) FROM project_assignments pa
           WHERE pa.consultant_id = u.id AND pa.status = 'active') as active_projects
        FROM users u
        LEFT JOIN staff_skills ss ON ss.user_id = u.id
        GROUP BY u.id
        ORDER BY u.name`
      )
      .all();

    // Burn rate: team-level utilization metrics
    const burnRateResult = await db
      .prepare(
        `SELECT
           COUNT(DISTINCT pa.consultant_id) as assigned_staff,
           ROUND(AVG(pa.utilization_pct), 1) as avg_utilization,
           COUNT(CASE WHEN pa.utilization_pct >= 100 THEN 1 END) as overloaded,
           COUNT(DISTINCT pa.project_id) as active_projects
         FROM project_assignments pa
         WHERE pa.status = 'active'`
      )
      .first<{ assigned_staff: number; avg_utilization: number; overloaded: number; active_projects: number }>();

    const totalStaffResult = await db
      .prepare(`SELECT COUNT(*) as total FROM users`)
      .first<{ total: number }>();

    let matches = (staffResult.results || []) as Array<Record<string, unknown>>;

    // Filter by department
    if (department) {
      const deptLower = department.toLowerCase();
      matches = matches.filter(
        (m) => ((m.department as string) || '').toLowerCase().includes(deptLower)
      );
    }

    // Filter by availability
    if (availableOnly) {
      matches = matches.filter(
        (m) => ((m.current_utilization as number) || 0) < 100
      );
    }

    // Enhanced skill matching with proficiency weighting
    if (skills) {
      const requiredSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);

      matches = matches
        .map((m) => {
          const skillsWithProf = ((m.skills_with_prof as string) || '')
            .split('|')
            .filter(Boolean)
            .map((sp) => {
              const parts = sp.split(':');
              return { name: parts[0], proficiency: parseInt(parts[1]) || 3 };
            });

          const categories = ((m.skill_categories as string) || '')
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());

          let totalScore = 0;
          const matchedSkills: string[] = [];

          for (const req of requiredSkills) {
            let bestMatch = 0;
            let bestSkillName = '';

            // Check against actual skills with proficiency boost
            for (const sp of skillsWithProf) {
              const similarity = fuzzyMatch(req, sp.name);
              if (similarity > 0) {
                const profBoost = sp.proficiency / 5; // 0.2 to 1.0
                const score = similarity * (0.6 + 0.4 * profBoost);
                if (score > bestMatch) {
                  bestMatch = score;
                  bestSkillName = sp.name;
                }
              }
            }

            // Check against categories
            for (const cat of categories) {
              const similarity = fuzzyMatch(req, cat);
              if (similarity > bestMatch) {
                bestMatch = similarity * 0.5; // categories are less specific
                bestSkillName = cat;
              }
            }

            if (bestMatch > 0) {
              totalScore += bestMatch;
              matchedSkills.push(bestSkillName);
            }
          }

          const matchPct = Math.round(
            (totalScore / requiredSkills.length) * 100
          );

          // Availability bonus: prefer people with more capacity
          const utilization = (m.current_utilization as number) || 0;
          const availabilityBonus = Math.max(0, (100 - utilization) / 100) * 10;

          return {
            id: m.id,
            name: m.name,
            role: m.role,
            department: m.department,
            skills: skillsWithProf.map((sp) => ({
              name: sp.name,
              proficiency: sp.proficiency,
            })),
            categories,
            matched_skills: matchedSkills,
            match_score: Math.round(totalScore * 10) / 10,
            match_pct: Math.min(matchPct, 100),
            composite_score: Math.round((matchPct + availabilityBonus) * 10) / 10,
            current_utilization: utilization,
            available_capacity: Math.max(0, 100 - utilization),
            active_projects: m.active_projects || 0,
          };
        })
        .filter((m) => m.match_pct > 0)
        .sort((a, b) => b.composite_score - a.composite_score);
    } else {
      matches = matches.map((m) => {
        const skillsWithProf = ((m.skills_with_prof as string) || '')
          .split('|')
          .filter(Boolean)
          .map((sp) => {
            const parts = sp.split(':');
            return { name: parts[0], proficiency: parseInt(parts[1]) || 3 };
          });
        const utilization = (m.current_utilization as number) || 0;
        return {
          id: m.id,
          name: m.name,
          role: m.role,
          department: m.department,
          skills: skillsWithProf,
          match_score: 0,
          match_pct: 0,
          composite_score: 0,
          current_utilization: utilization,
          available_capacity: Math.max(0, 100 - utilization),
          active_projects: m.active_projects || 0,
        };
      });
    }

    const totalStaff = totalStaffResult?.total || 0;
    const assignedStaff = burnRateResult?.assigned_staff || 0;

    return json({
      matches,
      total: matches.length,
      query: { skills, city, department, availableOnly },
      burn_rate: {
        total_staff: totalStaff,
        assigned_staff: assignedStaff,
        unassigned_staff: totalStaff - assignedStaff,
        avg_utilization: burnRateResult?.avg_utilization || 0,
        overloaded_count: burnRateResult?.overloaded || 0,
        active_projects: burnRateResult?.active_projects || 0,
        bench_ratio: totalStaff > 0
          ? Math.round(((totalStaff - assignedStaff) / totalStaff) * 1000) / 10
          : 0,
      },
    });
  } catch (error) {
    console.error('Error matching consultants:', error);
    return json({ error: 'Failed to match consultants' }, 500);
  }
};
