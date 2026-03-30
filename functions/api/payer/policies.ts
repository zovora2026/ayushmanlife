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
    const url = new URL(context.request.url);
    const payer = url.searchParams.get('payer');
    const status = url.searchParams.get('status');

    if (!db) {
      let policies = [
        {
          id: 'POL-PMJAY-001',
          policy_name: 'Ayushman Bharat PMJAY',
          payer: 'National Health Authority (NHA)',
          type: 'Government',
          coverage_amount: 500000,
          beneficiaries: 12450,
          active: true,
          packages_covered: 1950,
          start_date: '2025-04-01',
          end_date: '2026-03-31',
          description:
            'Pradhan Mantri Jan Arogya Yojana — covers secondary and tertiary hospitalization up to ₹5 lakh per family per year for BPL families.',
          empanelled_hospitals: 156,
          claims_ytd: 8450,
          amount_settled_ytd: 245000000,
        },
        {
          id: 'POL-CGHS-001',
          policy_name: 'CGHS Panel Agreement',
          payer: 'Central Government Health Scheme',
          type: 'Government',
          coverage_amount: 0, // No upper limit for CGHS
          beneficiaries: 3200,
          active: true,
          packages_covered: 2100,
          start_date: '2025-01-01',
          end_date: '2026-12-31',
          description:
            'CGHS empanelment for central government employees and pensioners. Cashless treatment as per CGHS rates.',
          empanelled_hospitals: 1,
          claims_ytd: 2860,
          amount_settled_ytd: 89000000,
        },
        {
          id: 'POL-STAR-001',
          policy_name: 'Star Comprehensive Health',
          payer: 'Star Health & Allied Insurance',
          type: 'Private',
          coverage_amount: 1000000,
          beneficiaries: 5680,
          active: true,
          packages_covered: 1200,
          start_date: '2025-06-01',
          end_date: '2026-05-31',
          description:
            'Comprehensive health insurance with cashless facility. Covers hospitalization, day care procedures, and pre/post hospitalization expenses.',
          empanelled_hospitals: 1,
          claims_ytd: 3420,
          amount_settled_ytd: 152000000,
        },
        {
          id: 'POL-NIA-001',
          policy_name: 'New India Mediclaim',
          payer: 'New India Assurance Co. Ltd.',
          type: 'PSU Insurer',
          coverage_amount: 500000,
          beneficiaries: 2840,
          active: true,
          packages_covered: 950,
          start_date: '2025-04-01',
          end_date: '2026-03-31',
          description:
            'Standard mediclaim policy covering hospitalization expenses. Sub-limits apply on room rent and specific procedures.',
          empanelled_hospitals: 1,
          claims_ytd: 1680,
          amount_settled_ytd: 68000000,
        },
        {
          id: 'POL-ICICI-001',
          policy_name: 'ICICI Lombard Health Protect',
          payer: 'ICICI Lombard General Insurance',
          type: 'Private',
          coverage_amount: 2000000,
          beneficiaries: 1950,
          active: true,
          packages_covered: 1100,
          start_date: '2025-07-01',
          end_date: '2026-06-30',
          description:
            'Health insurance with ₹20 lakh coverage, restoration benefit, and no room rent capping. Includes wellness benefits.',
          empanelled_hospitals: 1,
          claims_ytd: 1240,
          amount_settled_ytd: 73000000,
        },
        {
          id: 'POL-ESI-001',
          policy_name: 'ESIC Medical Benefit',
          payer: "Employees' State Insurance Corporation",
          type: 'Government',
          coverage_amount: 0,
          beneficiaries: 4200,
          active: true,
          packages_covered: 800,
          start_date: '2025-04-01',
          end_date: '2026-03-31',
          description:
            'ESIC medical benefits for insured workers and their dependents. Full medical care including specialist consultation, hospitalization, and medicines.',
          empanelled_hospitals: 1,
          claims_ytd: 3100,
          amount_settled_ytd: 45000000,
        },
      ];

      if (payer) {
        policies = policies.filter((p) =>
          p.payer.toLowerCase().includes(payer.toLowerCase())
        );
      }
      if (status === 'active') {
        policies = policies.filter((p) => p.active);
      } else if (status === 'inactive') {
        policies = policies.filter((p) => !p.active);
      }

      return json({
        policies,
        total: policies.length,
        currency: 'INR',
      });
    }

    let query = `SELECT * FROM policies WHERE 1=1`;
    const bindings: string[] = [];

    if (payer) {
      query += ` AND provider_name LIKE ?`;
      bindings.push(`%${payer}%`);
    }
    if (status === 'active') {
      query += ` AND status = 'active'`;
    } else if (status === 'inactive') {
      query += ` AND status != 'active'`;
    }

    query += ` ORDER BY coverage_amount DESC`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({
      policies: results || [],
      total: results?.length || 0,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return json({ error: 'Failed to fetch policies' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const body = (await context.request.json()) as {
      policy_name: string;
      payer: string;
      type: string;
      coverage_amount: number;
      start_date: string;
      end_date: string;
      description?: string;
      packages_covered?: number;
    };

    if (
      !body.policy_name ||
      !body.payer ||
      !body.type ||
      !body.start_date ||
      !body.end_date
    ) {
      return json(
        {
          error:
            'policy_name, payer, type, start_date, and end_date are required',
        },
        400
      );
    }

    const id = `POL-${Date.now()}`;

    if (!db) {
      return json(
        {
          policy: {
            id,
            policy_name: body.policy_name,
            payer: body.payer,
            type: body.type,
            coverage_amount: body.coverage_amount || 0,
            beneficiaries: 0,
            active: true,
            packages_covered: body.packages_covered || 0,
            start_date: body.start_date,
            end_date: body.end_date,
            description: body.description || '',
            created_at: new Date().toISOString(),
          },
        },
        201
      );
    }

    const policyNumber = `POL-${Date.now()}`;

    await db
      .prepare(
        `INSERT INTO policies (id, policy_number, scheme, provider_name, holder_name, coverage_amount, start_date, end_date, status, benefits, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, datetime('now'))`
      )
      .bind(
        id,
        policyNumber,
        body.type || '',
        body.payer,
        body.policy_name,
        body.coverage_amount || 0,
        body.start_date,
        body.end_date,
        body.description || ''
      )
      .run();

    const policy = await db
      .prepare(`SELECT * FROM policies WHERE id = ?`)
      .bind(id)
      .first();

    return json({ policy }, 201);
  } catch (error) {
    console.error('Error creating policy:', error);
    return json({ error: 'Failed to create policy' }, 500);
  }
};
