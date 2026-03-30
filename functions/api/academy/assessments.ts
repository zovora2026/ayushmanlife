interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List assessments (optionally by path_id)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const pathId = url.searchParams.get('path_id');
    const userId = url.searchParams.get('user_id');

    if (!db) {
      return json({ assessments: [], total: 0 });
    }

    let query = `SELECT a.id, a.module_id, a.path_id, a.title, a.passing_score, a.time_limit_minutes,
                        lp.name as path_name, m.title as module_title,
                        (SELECT COUNT(*) FROM assessment_submissions s WHERE s.assessment_id = a.id) as total_attempts,
                        (SELECT COUNT(*) FROM assessment_submissions s WHERE s.assessment_id = a.id AND s.passed = 1) as passed_count
                 FROM learning_assessments a
                 JOIN learning_paths lp ON a.path_id = lp.id
                 JOIN learning_modules m ON a.module_id = m.id`;
    const bindings: string[] = [];
    const conditions: string[] = [];

    if (pathId) {
      conditions.push(`a.path_id = ?`);
      bindings.push(pathId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY a.path_id`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    // If user_id provided, also fetch their submissions
    let userSubmissions: Record<string, unknown>[] = [];
    if (userId) {
      const subResult = await db
        .prepare(
          `SELECT s.*, a.title as assessment_title
           FROM assessment_submissions s
           JOIN learning_assessments a ON s.assessment_id = a.id
           WHERE s.user_id = ?
           ORDER BY s.submitted_at DESC`
        )
        .bind(userId)
        .all();
      userSubmissions = (subResult.results || []) as Record<string, unknown>[];
    }

    return json({
      assessments: results || [],
      total: results?.length || 0,
      user_submissions: userSubmissions,
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return json({ error: 'Failed to fetch assessments' }, 500);
  }
};

// POST: Submit assessment answers
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      assessment_id: string;
      user_id: string;
      answers: number[];
    };

    if (!body.assessment_id || !body.user_id || !body.answers) {
      return json({ error: 'assessment_id, user_id, and answers are required' }, 400);
    }

    if (!db) {
      return json({
        submission: { id: `sub-${Date.now()}`, score: 80, passed: true },
        message: 'Submission recorded (mock)',
      }, 201);
    }

    // Get assessment and its questions
    const assessment = await db
      .prepare(`SELECT * FROM learning_assessments WHERE id = ?`)
      .bind(body.assessment_id)
      .first();

    if (!assessment) {
      return json({ error: 'Assessment not found' }, 404);
    }

    // Score the answers
    const questions = JSON.parse(assessment.questions as string) as Array<{
      q: string;
      options: string[];
      correct: number;
    }>;
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (body.answers[i] === questions[i].correct) {
        correct++;
      }
    }
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (assessment.passing_score as number);

    const id = `sub-${Date.now()}`;
    await db
      .prepare(
        `INSERT INTO assessment_submissions (id, assessment_id, user_id, answers, score, passed)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(id, body.assessment_id, body.user_id, JSON.stringify(body.answers), score, passed ? 1 : 0)
      .run();

    return json({
      submission: { id, assessment_id: body.assessment_id, score, passed, correct, total: questions.length },
      message: passed ? 'Congratulations! You passed the assessment.' : 'You did not pass. You may try again.',
    }, 201);
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return json({ error: 'Failed to submit assessment' }, 500);
  }
};
