interface Env { DB: D1Database; ANTHROPIC_API_KEY?: string }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Common Indian condition → ICD-10/CPT mapping ────────────────────────────

interface CodeMapping {
  keywords: string[];
  icd10: { code: string; description: string }[];
  cpt: { code: string; description: string }[];
  ayushman_package?: string;
  typical_amount_range: [number, number];
}

const CONDITION_MAP: CodeMapping[] = [
  {
    keywords: ['diabetes', 'diabetic', 'dm', 'hyperglycemia', 'hba1c'],
    icd10: [
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
      { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia' },
    ],
    cpt: [
      { code: '99213', description: 'Office visit, established patient, low complexity' },
      { code: '82947', description: 'Glucose, quantitative, blood' },
      { code: '83036', description: 'Hemoglobin A1c' },
    ],
    ayushman_package: 'AB-HBP-D-S-1-002',
    typical_amount_range: [15000, 50000],
  },
  {
    keywords: ['hypertension', 'htn', 'high blood pressure', 'bp'],
    icd10: [
      { code: 'I10', description: 'Essential (primary) hypertension' },
      { code: 'I11.9', description: 'Hypertensive heart disease without heart failure' },
    ],
    cpt: [
      { code: '99214', description: 'Office visit, established patient, moderate complexity' },
      { code: '93000', description: 'Electrocardiogram, 12-lead' },
    ],
    ayushman_package: 'AB-HBP-D-S-2-001',
    typical_amount_range: [15000, 40000],
  },
  {
    keywords: ['dengue', 'hemorrhagic fever', 'thrombocytopenia'],
    icd10: [
      { code: 'A90', description: 'Dengue fever [classical dengue]' },
      { code: 'A91', description: 'Dengue hemorrhagic fever' },
      { code: 'D69.6', description: 'Thrombocytopenia, unspecified' },
    ],
    cpt: [
      { code: '99223', description: 'Initial hospital care, high complexity' },
      { code: '85025', description: 'Complete blood count with differential' },
      { code: '86790', description: 'Virus antibody, dengue' },
    ],
    ayushman_package: 'AB-HBP-D-M-4-001',
    typical_amount_range: [20000, 60000],
  },
  {
    keywords: ['typhoid', 'enteric fever', 'salmonella typhi'],
    icd10: [
      { code: 'A01.0', description: 'Typhoid fever' },
      { code: 'A01.00', description: 'Typhoid fever, unspecified' },
    ],
    cpt: [
      { code: '99222', description: 'Initial hospital care, moderate complexity' },
      { code: '87040', description: 'Blood culture for bacteria' },
      { code: '86800', description: 'Widal test / Typhidot' },
    ],
    ayushman_package: 'AB-HBP-D-M-3-002',
    typical_amount_range: [15000, 45000],
  },
  {
    keywords: ['malaria', 'plasmodium', 'falciparum', 'vivax'],
    icd10: [
      { code: 'B50.9', description: 'Plasmodium falciparum malaria, unspecified' },
      { code: 'B51.9', description: 'Plasmodium vivax malaria without complication' },
    ],
    cpt: [
      { code: '99223', description: 'Initial hospital care, high complexity' },
      { code: '87207', description: 'Smear, special stain for parasites (malaria)' },
      { code: '85025', description: 'Complete blood count with differential' },
    ],
    ayushman_package: 'AB-HBP-D-M-4-003',
    typical_amount_range: [20000, 75000],
  },
  {
    keywords: ['tuberculosis', 'tb', 'pulmonary tb', 'koch'],
    icd10: [
      { code: 'A15.0', description: 'Tuberculosis of lung' },
      { code: 'A15.9', description: 'Respiratory tuberculosis, unspecified' },
    ],
    cpt: [
      { code: '99221', description: 'Initial hospital care, low complexity' },
      { code: '87116', description: 'AFB culture, mycobacterium' },
      { code: '71046', description: 'Chest X-ray, 2 views' },
    ],
    ayushman_package: 'AB-HBP-D-M-3-001',
    typical_amount_range: [15000, 35000],
  },
  {
    keywords: ['myocardial infarction', 'mi', 'heart attack', 'stemi', 'nstemi', 'acs'],
    icd10: [
      { code: 'I21.0', description: 'Acute ST elevation myocardial infarction of anterior wall' },
      { code: 'I21.9', description: 'Acute myocardial infarction, unspecified' },
    ],
    cpt: [
      { code: '92928', description: 'Percutaneous coronary stent placement' },
      { code: '93458', description: 'Left heart catheterization with angiography' },
      { code: '93000', description: 'Electrocardiogram, 12-lead' },
    ],
    ayushman_package: 'AB-HBP-D-C-5-001',
    typical_amount_range: [100000, 250000],
  },
  {
    keywords: ['stroke', 'cerebrovascular', 'ischemic stroke', 'cva', 'cerebral infarction'],
    icd10: [
      { code: 'I63.9', description: 'Cerebral infarction, unspecified' },
      { code: 'I63.50', description: 'Cerebral infarction due to unspecified occlusion of cerebral artery' },
    ],
    cpt: [
      { code: '99223', description: 'Initial hospital care, high complexity' },
      { code: '70553', description: 'MRI brain with and without contrast' },
      { code: '93880', description: 'Duplex scan of extracranial arteries' },
    ],
    ayushman_package: 'AB-HBP-D-N-5-001',
    typical_amount_range: [80000, 200000],
  },
  {
    keywords: ['appendicitis', 'appendectomy'],
    icd10: [
      { code: 'K35.80', description: 'Unspecified acute appendicitis' },
      { code: 'K35.20', description: 'Acute appendicitis with generalized peritonitis' },
    ],
    cpt: [
      { code: '44970', description: 'Laparoscopic appendectomy' },
      { code: '49320', description: 'Diagnostic laparoscopy' },
    ],
    ayushman_package: 'AB-HBP-D-G-2-001',
    typical_amount_range: [30000, 120000],
  },
  {
    keywords: ['cholecystitis', 'cholelithiasis', 'gallstone', 'gallbladder'],
    icd10: [
      { code: 'K80.10', description: 'Calculus of gallbladder with chronic cholecystitis without obstruction' },
      { code: 'K81.0', description: 'Acute cholecystitis' },
    ],
    cpt: [
      { code: '47562', description: 'Laparoscopic cholecystectomy' },
      { code: '74177', description: 'CT abdomen and pelvis with contrast' },
    ],
    ayushman_package: 'AB-HBP-D-G-2-003',
    typical_amount_range: [25000, 80000],
  },
  {
    keywords: ['fracture', 'femur', 'hip', 'orthopedic', 'bone'],
    icd10: [
      { code: 'S72.001A', description: 'Fracture of unspecified part of neck of right femur, initial encounter' },
      { code: 'S72.009A', description: 'Fracture of unspecified part of neck of unspecified femur, initial encounter' },
    ],
    cpt: [
      { code: '27236', description: 'Open treatment of femoral fracture, internal fixation' },
      { code: '73502', description: 'X-ray hip, 2-3 views' },
    ],
    ayushman_package: 'AB-HBP-D-O-3-002',
    typical_amount_range: [50000, 150000],
  },
  {
    keywords: ['copd', 'chronic obstructive', 'emphysema', 'bronchitis'],
    icd10: [
      { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation' },
      { code: 'J44.0', description: 'COPD with acute lower respiratory infection' },
    ],
    cpt: [
      { code: '99222', description: 'Initial hospital care, moderate complexity' },
      { code: '94726', description: 'Plethysmography for lung volumes' },
      { code: '71046', description: 'Chest X-ray, 2 views' },
    ],
    ayushman_package: 'AB-HBP-D-R-2-001',
    typical_amount_range: [20000, 55000],
  },
  {
    keywords: ['anemia', 'iron deficiency', 'hemoglobin'],
    icd10: [
      { code: 'D50.0', description: 'Iron deficiency anemia secondary to blood loss (chronic)' },
      { code: 'D50.9', description: 'Iron deficiency anemia, unspecified' },
    ],
    cpt: [
      { code: '99213', description: 'Office visit, established patient, low complexity' },
      { code: '85018', description: 'Hemoglobin' },
      { code: '83540', description: 'Iron binding capacity' },
    ],
    typical_amount_range: [15000, 30000],
  },
  {
    keywords: ['pregnancy', 'gestational', 'delivery', 'cesarean', 'c-section', 'labour', 'labor'],
    icd10: [
      { code: 'O80', description: 'Encounter for full-term uncomplicated delivery' },
      { code: 'O82', description: 'Encounter for cesarean delivery without indication' },
      { code: 'O24.410', description: 'Gestational diabetes mellitus in pregnancy, diet controlled' },
    ],
    cpt: [
      { code: '59400', description: 'Routine obstetric care including vaginal delivery' },
      { code: '59510', description: 'Routine obstetric care including cesarean delivery' },
    ],
    ayushman_package: 'AB-HBP-D-OB-1-001',
    typical_amount_range: [18000, 90000],
  },
  {
    keywords: ['kidney', 'renal', 'ckd', 'nephropathy', 'dialysis'],
    icd10: [
      { code: 'N18.3', description: 'Chronic kidney disease, stage 3' },
      { code: 'N18.9', description: 'Chronic kidney disease, unspecified' },
    ],
    cpt: [
      { code: '90935', description: 'Hemodialysis, single session' },
      { code: '80053', description: 'Comprehensive metabolic panel' },
    ],
    ayushman_package: 'AB-HBP-D-U-3-001',
    typical_amount_range: [25000, 100000],
  },
];

// ── Smart mock analysis based on diagnosis text ─────────────────────────────

function generateMockAnalysis(diagnosisText: string, claimedAmount?: number) {
  const lower = diagnosisText.toLowerCase();
  const matchedConditions: CodeMapping[] = [];

  for (const condition of CONDITION_MAP) {
    if (condition.keywords.some(kw => lower.includes(kw))) {
      matchedConditions.push(condition);
    }
  }

  // Default fallback if nothing matches
  if (matchedConditions.length === 0) {
    matchedConditions.push({
      keywords: [],
      icd10: [
        { code: 'R69', description: 'Illness, unspecified' },
        { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
      ],
      cpt: [
        { code: '99213', description: 'Office visit, established patient, low complexity' },
        { code: '80053', description: 'Comprehensive metabolic panel' },
      ],
      typical_amount_range: [15000, 50000],
    });
  }

  // Collect all suggested codes
  const suggestedIcd10 = matchedConditions.flatMap(c => c.icd10);
  const suggestedCpt = matchedConditions.flatMap(c => c.cpt);

  // Deduplicate
  const uniqueIcd10 = Array.from(new Map(suggestedIcd10.map(c => [c.code, c])).values());
  const uniqueCpt = Array.from(new Map(suggestedCpt.map(c => [c.code, c])).values());

  // Completeness scoring
  let completenessScore = 40; // Base score for having diagnosis text
  const suggestions: string[] = [];

  if (lower.length > 20) completenessScore += 10;
  if (lower.length > 50) completenessScore += 5;
  if (uniqueIcd10.length >= 2) completenessScore += 10;
  if (uniqueCpt.length >= 2) completenessScore += 10;

  // Check for common documentation completeness items
  if (lower.includes('complication') || lower.includes('with')) completenessScore += 5;
  if (lower.includes('stage') || lower.includes('type') || lower.includes('grade')) completenessScore += 5;
  if (lower.includes('acute') || lower.includes('chronic')) completenessScore += 5;

  // Cap at 95 for mock
  completenessScore = Math.min(95, completenessScore);

  // Generate suggestions
  if (completenessScore < 60) {
    suggestions.push('Add more specificity to diagnosis - include type, stage, or severity');
  }
  if (!lower.includes('complication') && matchedConditions.length > 0) {
    suggestions.push('Document any complications or comorbidities for accurate coding');
  }
  if (claimedAmount) {
    const ranges = matchedConditions.map(c => c.typical_amount_range);
    const maxRange = Math.max(...ranges.map(r => r[1]));
    if (claimedAmount > maxRange * 1.2) {
      suggestions.push(`Claimed amount (INR ${claimedAmount.toLocaleString('en-IN')}) exceeds typical range for this condition. Ensure supporting documentation justifies the amount.`);
    }
  }
  suggestions.push('Verify ICD-10 codes match the latest WHO ICD-10 2019 revision used by NHA');
  suggestions.push('Ensure discharge summary includes all coded diagnoses');

  // Ayushman Bharat package info
  const packages = matchedConditions
    .filter(c => c.ayushman_package)
    .map(c => ({
      code: c.ayushman_package,
      rate_range: `INR ${c.typical_amount_range[0].toLocaleString('en-IN')} - ${c.typical_amount_range[1].toLocaleString('en-IN')}`,
    }));

  return {
    suggested_icd10_codes: uniqueIcd10,
    suggested_cpt_codes: uniqueCpt,
    completeness_score: completenessScore,
    suggestions,
    ayushman_packages: packages.length > 0 ? packages : null,
    confidence: matchedConditions[0]?.keywords.length > 0 ? 'high' : 'low',
    analysis_source: 'rule_based_mock',
  };
}

// ── POST: AI analysis of claim ──────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return json({ message: 'Claim ID is required' }, 400);

    // Get claim data from request body or database
    let diagnosisText: string | null = null;
    let claimedAmount: number | undefined;
    let icd10Codes: string | null = null;
    let cptCodes: string | null = null;

    // Try to get from request body first
    try {
      const body = await context.request.json() as Record<string, unknown>;
      diagnosisText = (body.diagnosis_text as string) || null;
      claimedAmount = body.claimed_amount ? Number(body.claimed_amount) : undefined;
      icd10Codes = (body.icd10_codes as string) || null;
      cptCodes = (body.cpt_codes as string) || null;
    } catch {
      // Body might be empty; we'll try DB
    }

    // If not in body, try to get from D1
    if (!diagnosisText && context.env.DB) {
      try {
        const claim = await context.env.DB.prepare(
          'SELECT diagnosis_text, claimed_amount, icd10_codes, cpt_codes FROM claims WHERE id = ?'
        ).bind(id).first<{
          diagnosis_text: string;
          claimed_amount: number;
          icd10_codes: string;
          cpt_codes: string;
        }>();

        if (claim) {
          diagnosisText = claim.diagnosis_text;
          claimedAmount = claim.claimed_amount;
          icd10Codes = claim.icd10_codes;
          cptCodes = claim.cpt_codes;
        }
      } catch (dbErr) {
        console.error('D1 fetch for analysis failed:', dbErr);
      }
    }

    // If still no diagnosis text, use mock fallback for the given ID
    if (!diagnosisText) {
      diagnosisText = 'Type 2 Diabetes Mellitus with peripheral neuropathy';
      claimedAmount = 45000;
    }

    // ── Try Claude API if available ──
    if (context.env.ANTHROPIC_API_KEY) {
      try {
        const prompt = `You are a medical coding expert specializing in Indian healthcare claims processing, particularly for Ayushman Bharat (PM-JAY) and CGHS schemes.

Analyze the following clinical information and provide coding suggestions:

Diagnosis: ${diagnosisText}
${icd10Codes ? `Current ICD-10 codes: ${icd10Codes}` : ''}
${cptCodes ? `Current CPT codes: ${cptCodes}` : ''}
${claimedAmount ? `Claimed amount: INR ${claimedAmount.toLocaleString('en-IN')}` : ''}

Respond in JSON format only (no markdown, no explanation outside JSON):
{
  "suggested_icd10_codes": [{"code": "...", "description": "..."}],
  "suggested_cpt_codes": [{"code": "...", "description": "..."}],
  "completeness_score": <0-100>,
  "suggestions": ["..."],
  "ayushman_packages": [{"code": "...", "rate_range": "INR X - Y"}] or null,
  "confidence": "high" | "medium" | "low"
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': context.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (response.ok) {
          const result = await response.json() as {
            content: { type: string; text: string }[];
          };

          const text = result.content?.[0]?.text || '';

          // Extract JSON from the response
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return json({
              claim_id: id,
              diagnosis_text: diagnosisText,
              analysis: { ...analysis, analysis_source: 'claude_ai' },
            });
          }
        }

        // If Claude API fails, fall through to mock
        console.error('Claude API returned non-OK or unparseable response');
      } catch (aiErr) {
        console.error('Claude API call failed, falling back to mock:', aiErr);
      }
    }

    // ── Smart mock fallback ──
    const analysis = generateMockAnalysis(diagnosisText, claimedAmount);

    return json({
      claim_id: id,
      diagnosis_text: diagnosisText,
      analysis,
    });
  } catch (err) {
    return json({ message: 'Failed to analyze claim', error: String(err) }, 500);
  }
};
