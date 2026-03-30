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

interface SymptomCheckRequest {
  symptoms: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface TriageResult {
  triage_level: 'low' | 'moderate' | 'high' | 'emergency';
  triage_color: 'green' | 'yellow' | 'orange' | 'red';
  possible_conditions: Array<{
    name: string;
    likelihood: 'low' | 'moderate' | 'high';
    description: string;
  }>;
  recommendations: string[];
  seek_care_within: string;
  emergency_signs: string[];
  disclaimer: string;
}

function assessSymptoms(
  symptoms: string[],
  duration: string,
  severity: string
): TriageResult {
  const symptomStr = symptoms.join(' ').toLowerCase();

  // Emergency symptoms
  const emergencyKeywords = [
    'chest pain',
    'difficulty breathing',
    'unconscious',
    'severe bleeding',
    'stroke',
    'seizure',
    'paralysis',
    'poisoning',
    'heart attack',
  ];
  const isEmergency = emergencyKeywords.some((kw) =>
    symptomStr.includes(kw)
  );

  if (isEmergency || severity === 'severe') {
    return {
      triage_level: 'emergency',
      triage_color: 'red',
      possible_conditions: [
        {
          name: 'Acute Coronary Syndrome',
          likelihood: 'moderate',
          description:
            'Chest pain with breathlessness may indicate a cardiac event requiring immediate evaluation.',
        },
        {
          name: 'Pulmonary Embolism',
          likelihood: 'low',
          description:
            'Sudden onset breathlessness and chest pain can indicate a blood clot in the lungs.',
        },
        {
          name: 'Severe Respiratory Distress',
          likelihood: 'moderate',
          description:
            'Difficulty breathing may be caused by asthma exacerbation, pneumonia, or other acute conditions.',
        },
      ],
      recommendations: [
        'Call 108 (Ambulance) or 112 (Emergency) immediately',
        'Do not drive yourself to the hospital — have someone accompany you',
        'If experiencing chest pain, chew an Aspirin 325mg (if not allergic) while waiting for help',
        'Sit upright and try to remain calm; avoid physical exertion',
        'Visit the nearest government hospital or empanelled PMJAY hospital emergency department',
        'Carry your Aadhaar card and any existing prescriptions',
      ],
      seek_care_within: 'Immediately — Call 108 now',
      emergency_signs: [
        'Loss of consciousness',
        'Severe chest pressure or crushing pain',
        'Inability to breathe',
        'Sudden weakness on one side of the body',
        'Uncontrollable bleeding',
        'Blue discoloration of lips or fingertips',
      ],
      disclaimer:
        'This is an AI-assisted triage assessment and NOT a medical diagnosis. Please seek emergency medical care immediately. Call 108 for ambulance services.',
    };
  }

  // High risk - fever-related
  if (
    symptomStr.includes('fever') &&
    (symptomStr.includes('rash') ||
      symptomStr.includes('joint pain') ||
      symptomStr.includes('vomiting'))
  ) {
    return {
      triage_level: 'high',
      triage_color: 'orange',
      possible_conditions: [
        {
          name: 'Dengue Fever',
          likelihood: 'high',
          description:
            'Fever with body aches, rash, and joint pain is suggestive of dengue, especially during monsoon season. Platelet monitoring is important.',
        },
        {
          name: 'Chikungunya',
          likelihood: 'moderate',
          description:
            'Severe joint pain with fever may indicate chikungunya infection.',
        },
        {
          name: 'Malaria',
          likelihood: 'moderate',
          description:
            'High intermittent fever with chills may suggest malaria, especially in endemic areas.',
        },
      ],
      recommendations: [
        'Visit a doctor within 6-12 hours — this could be dengue or another serious vector-borne illness',
        'Get a CBC with platelet count and NS1 antigen test done urgently',
        'Stay well-hydrated with ORS, coconut water, and clear fluids',
        'Take Paracetamol for fever — DO NOT take Aspirin or Ibuprofen (can worsen bleeding in dengue)',
        'Use mosquito nets and repellents to prevent further transmission',
        'Monitor for warning signs: persistent vomiting, abdominal pain, bleeding gums',
        'Free testing is available at government PHCs and district hospitals',
      ],
      seek_care_within: '6-12 hours',
      emergency_signs: [
        'Bleeding from nose or gums',
        'Blood in vomit or stools',
        'Severe abdominal pain',
        'Persistent vomiting (more than 3 episodes)',
        'Extreme fatigue or restlessness',
        'Rapid drop in platelet count below 50,000',
      ],
      disclaimer:
        'This is an AI-assisted triage assessment and NOT a medical diagnosis. Please consult a qualified medical professional for proper diagnosis and treatment.',
    };
  }

  // Moderate - common symptoms
  if (
    symptomStr.includes('fever') ||
    symptomStr.includes('cough') ||
    symptomStr.includes('cold') ||
    symptomStr.includes('headache') ||
    symptomStr.includes('body ache')
  ) {
    return {
      triage_level: 'moderate',
      triage_color: 'yellow',
      possible_conditions: [
        {
          name: 'Upper Respiratory Tract Infection (URTI)',
          likelihood: 'high',
          description:
            'Common cold with fever, cough, and body aches is usually viral and self-limiting.',
        },
        {
          name: 'Influenza',
          likelihood: 'moderate',
          description:
            'Seasonal flu presents with high fever, body aches, and fatigue. Usually resolves in 5-7 days.',
        },
        {
          name: 'COVID-19',
          likelihood: 'low',
          description:
            'Respiratory symptoms with fever may warrant a COVID-19 test, especially if exposed to a positive case.',
        },
      ],
      recommendations: [
        'Consult a doctor within 24 hours if symptoms persist or worsen',
        'Rest adequately and stay hydrated with warm fluids (kadha, haldi doodh, soup)',
        'Take Paracetamol 500mg for fever (max 4 tablets per day)',
        'Steam inhalation 2-3 times daily for congestion',
        'Gargle with warm salt water for sore throat',
        'Wear a mask if you suspect an infectious illness',
        'Visit your nearest PHC if symptoms persist beyond 3 days',
        'Generic medicines available at Jan Aushadhi Kendras at affordable prices',
      ],
      seek_care_within: '24 hours',
      emergency_signs: [
        'Fever above 103°F (39.4°C) not responding to Paracetamol',
        'Difficulty breathing or wheezing',
        'Chest pain',
        'Persistent vomiting or inability to keep fluids down',
        'Confusion or altered consciousness',
      ],
      disclaimer:
        'This is an AI-assisted triage assessment and NOT a medical diagnosis. Please consult a qualified medical professional for proper diagnosis and treatment.',
    };
  }

  // Digestive symptoms
  if (
    symptomStr.includes('stomach') ||
    symptomStr.includes('diarrhea') ||
    symptomStr.includes('vomiting') ||
    symptomStr.includes('acidity') ||
    symptomStr.includes('gas') ||
    symptomStr.includes('bloating')
  ) {
    return {
      triage_level: 'moderate',
      triage_color: 'yellow',
      possible_conditions: [
        {
          name: 'Acute Gastroenteritis',
          likelihood: 'high',
          description:
            'Stomach infection causing diarrhea and vomiting, often from contaminated food or water.',
        },
        {
          name: 'Acid Peptic Disease / GERD',
          likelihood: 'moderate',
          description:
            'Acidity, bloating, and upper abdominal discomfort may indicate acid reflux or gastritis.',
        },
        {
          name: 'Food Poisoning',
          likelihood: 'moderate',
          description:
            'Sudden onset of vomiting and diarrhea within hours of eating contaminated food.',
        },
      ],
      recommendations: [
        'Start ORS (Oral Rehydration Solution) immediately — mix in 1 litre of clean water',
        'Follow the BRAT diet: Bananas, Rice (plain), Apple, Toast',
        'Avoid spicy, oily, and dairy foods until recovery',
        'Take Ondansetron/Domperidone for vomiting as per doctor advice',
        'If diarrhea persists beyond 48 hours or contains blood, consult a doctor urgently',
        'Boil drinking water and maintain hand hygiene',
        'Visit your nearest PHC or CHC if dehydration signs appear',
      ],
      seek_care_within: '24-48 hours',
      emergency_signs: [
        'Blood in stool or vomit',
        'Signs of severe dehydration (dry mouth, no urination, sunken eyes)',
        'Severe abdominal pain or rigidity',
        'High fever above 102°F with diarrhea',
        'Symptoms lasting more than 3 days without improvement',
      ],
      disclaimer:
        'This is an AI-assisted triage assessment and NOT a medical diagnosis. Please consult a qualified medical professional for proper diagnosis and treatment.',
    };
  }

  // Default low-risk assessment
  return {
    triage_level: 'low',
    triage_color: 'green',
    possible_conditions: [
      {
        name: 'Minor Ailment',
        likelihood: 'high',
        description:
          'Your reported symptoms suggest a minor condition that can likely be managed with self-care and over-the-counter remedies.',
      },
      {
        name: 'Stress-Related Symptoms',
        likelihood: 'moderate',
        description:
          'Mild symptoms can sometimes be related to stress, poor sleep, or lifestyle factors.',
      },
    ],
    recommendations: [
      'Monitor your symptoms for 48-72 hours',
      'Maintain a balanced diet with adequate hydration',
      'Ensure 7-8 hours of sleep',
      'Practice stress management — yoga and pranayama can be beneficial',
      'If symptoms persist beyond 3 days, visit your nearest PHC or family physician',
      'Maintain a symptom diary to share with your doctor if needed',
      'Annual health checkup is recommended — available free under Ayushman Bharat at empanelled centres',
    ],
    seek_care_within: '3-5 days if symptoms persist',
    emergency_signs: [
      'Sudden worsening of symptoms',
      'New onset of fever above 101°F',
      'Difficulty breathing',
      'Severe pain in any area',
      'Any symptom that significantly impairs daily activities',
    ],
    disclaimer:
      'This is an AI-assisted triage assessment and NOT a medical diagnosis. Please consult a qualified medical professional if symptoms persist or worsen.',
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as SymptomCheckRequest;

    if (
      !body.symptoms ||
      !Array.isArray(body.symptoms) ||
      body.symptoms.length === 0
    ) {
      return json(
        { error: 'At least one symptom is required' },
        400
      );
    }

    const duration = body.duration || 'not specified';
    const severity = body.severity || 'mild';

    // Try AI-powered assessment if API key available
    if (context.env.ANTHROPIC_API_KEY) {
      try {
        const systemPrompt = `You are a medical triage AI for AyushmanLife, an Indian healthcare platform. Assess the patient's symptoms and provide:
1. Triage level (low, moderate, high, emergency)
2. Possible conditions with likelihood
3. Specific recommendations for Indian healthcare context (mention PHC, PMJAY, Jan Aushadhi, etc.)
4. When to seek care
5. Emergency warning signs

Always include a disclaimer that this is not a medical diagnosis. Use Indian medical context.
Respond in valid JSON format matching this structure:
{
  "triage_level": "low|moderate|high|emergency",
  "triage_color": "green|yellow|orange|red",
  "possible_conditions": [{"name": "", "likelihood": "low|moderate|high", "description": ""}],
  "recommendations": [""],
  "seek_care_within": "",
  "emergency_signs": [""],
  "disclaimer": ""
}`;

        const response = await fetch(
          'https://api.anthropic.com/v1/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': context.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1024,
              system: systemPrompt,
              messages: [
                {
                  role: 'user',
                  content: `Patient reports the following:\nSymptoms: ${body.symptoms.join(', ')}\nDuration: ${duration}\nSeverity: ${severity}`,
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const apiResponse = (await response.json()) as {
            content: Array<{ type: string; text: string }>;
          };
          const text = apiResponse.content?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return json({
              assessment: parsed,
              symptoms: body.symptoms,
              duration,
              severity,
              assessed_at: new Date().toISOString(),
            });
          }
        }
      } catch (apiError) {
        console.error(
          'Anthropic API call failed, using mock assessment:',
          apiError
        );
      }
    }

    // Use smart mock assessment
    const assessment = assessSymptoms(body.symptoms, duration, severity);

    return json({
      assessment,
      symptoms: body.symptoms,
      duration,
      severity,
      assessed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in symptom check:', error);
    return json({ error: 'Failed to perform symptom assessment' }, 500);
  }
};
