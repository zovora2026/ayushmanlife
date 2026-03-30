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

function generateMockResponse(content: string): string {
  const lower = content.toLowerCase();

  if (
    lower.includes('symptom') ||
    lower.includes('pain') ||
    lower.includes('fever') ||
    lower.includes('cough') ||
    lower.includes('headache') ||
    lower.includes('nausea')
  ) {
    return `Based on your symptoms, here is my initial assessment:

**Triage Level:** Moderate — Please consult a doctor within 24 hours.

**Possible Considerations:**
- Your symptoms may be related to a viral or bacterial infection. A physical examination and basic blood work (CBC, ESR, CRP) would help narrow this down.
- If you have fever above 101°F (38.3°C) lasting more than 3 days, please visit your nearest PHC or district hospital immediately.

**Immediate Recommendations:**
1. Stay hydrated — drink ORS solution or nimbu pani with salt
2. Rest adequately and monitor your temperature every 4-6 hours
3. Take Paracetamol 500mg if fever exceeds 100°F (do not exceed 4 tablets in 24 hours)
4. If symptoms worsen — difficulty breathing, persistent vomiting, or high fever — visit the emergency department immediately

**Note:** This is AI-assisted guidance and not a substitute for professional medical advice. Please consult your physician at the earliest. If you are covered under Ayushman Bharat PMJAY, you can visit any empanelled hospital for free treatment.`;
  }

  if (
    lower.includes('appointment') ||
    lower.includes('book') ||
    lower.includes('schedule') ||
    lower.includes('doctor') ||
    lower.includes('visit')
  ) {
    return `I can help you book an appointment. Here are the available options:

**Available Departments:**
- General Medicine — Dr. Rajesh Sharma (MBBS, MD) — Next slot: Tomorrow 10:00 AM
- Cardiology — Dr. Priya Menon (DM Cardiology, AIIMS) — Next slot: 1st April 2:30 PM
- Orthopaedics — Dr. Sunil Verma (MS Ortho) — Next slot: Tomorrow 11:30 AM
- Paediatrics — Dr. Anita Krishnan (DCH, DNB) — Next slot: 31st March 9:00 AM
- Gynaecology — Dr. Deepa Iyer (MS OBG) — Next slot: 1st April 10:00 AM

**To book, please provide:**
1. Preferred department or doctor
2. Preferred date and time
3. Patient name and ABHA ID (if available)

Consultation fees range from ₹200 to ₹800 depending on the specialty. PMJAY and CGHS cardholders are eligible for cashless treatment.`;
  }

  if (
    lower.includes('medication') ||
    lower.includes('medicine') ||
    lower.includes('dosage') ||
    lower.includes('drug') ||
    lower.includes('tablet') ||
    lower.includes('prescription')
  ) {
    return `Here is the medication information you requested:

**Important Medication Guidelines:**
- Always take medications as prescribed by your doctor. Do not self-medicate.
- If you experience any adverse effects (rash, swelling, difficulty breathing), stop the medication and contact your doctor immediately.

**Common Medication Reminders:**
- **Metformin** (for Type 2 Diabetes): Take with meals to reduce GI side effects. Monitor blood sugar regularly.
- **Amlodipine** (for Hypertension): Take once daily, preferably at the same time. Avoid grapefruit juice.
- **Pantoprazole** (for Acidity/GERD): Take 30 minutes before breakfast on an empty stomach.

**Generic Medicines:** Under Jan Aushadhi Yojana, you can purchase affordable generic medicines at any Pradhan Mantri Bhartiya Janaushadhi Kendra at significantly lower prices.

Please share the specific medication name for detailed dosage information, interactions, and precautions. Always carry your prescription when purchasing medicines.`;
  }

  if (
    lower.includes('claim') ||
    lower.includes('insurance') ||
    lower.includes('policy') ||
    lower.includes('pmjay') ||
    lower.includes('ayushman') ||
    lower.includes('cashless')
  ) {
    return `Here is information about your healthcare claims and coverage:

**Ayushman Bharat PMJAY Coverage:**
- Family coverage up to ₹5,00,000 per year for secondary and tertiary care hospitalization
- Cashless treatment at over 27,000 empanelled hospitals across India
- Coverage includes 3 days pre-hospitalization and 15 days post-hospitalization expenses

**To file or check a claim:**
1. Ensure your Ayushman card or ABHA ID is active
2. Visit the empanelled hospital with your Aadhaar and ration card
3. The hospital's Ayushman Mitra will assist with pre-authorization
4. Treatment will be provided on a cashless basis upon approval

**Claim Status:** You can check claim status on the PMJAY portal (pmjay.gov.in) or call the helpline at 14555.

Would you like me to help you check a specific claim status or find empanelled hospitals near you?`;
  }

  if (
    lower.includes('lab') ||
    lower.includes('test') ||
    lower.includes('report') ||
    lower.includes('blood') ||
    lower.includes('result')
  ) {
    return `I can help you understand your lab reports. Here are some common reference ranges:

**Complete Blood Count (CBC):**
- Haemoglobin: 12-16 g/dL (Female), 13-17 g/dL (Male)
- WBC Count: 4,000-11,000 /cumm
- Platelet Count: 1,50,000-4,50,000 /cumm

**Blood Sugar:**
- Fasting: 70-100 mg/dL (Normal), 100-125 mg/dL (Pre-diabetic), >126 mg/dL (Diabetic)
- Post-prandial (2 hrs): <140 mg/dL (Normal)
- HbA1c: <5.7% (Normal), 5.7-6.4% (Pre-diabetic), >6.5% (Diabetic)

**Lipid Profile:**
- Total Cholesterol: <200 mg/dL (Desirable)
- LDL: <100 mg/dL (Optimal)
- HDL: >40 mg/dL (Male), >50 mg/dL (Female)
- Triglycerides: <150 mg/dL (Normal)

Please share your specific lab report values for a detailed interpretation. Remember, only your treating physician can provide a definitive diagnosis based on your reports and clinical examination.`;
  }

  return `Namaste! I am V-Care, your AI healthcare assistant powered by AyushmanLife.

I can help you with:
- **Symptom Assessment** — Describe your symptoms for an initial triage
- **Appointment Booking** — Find and book appointments with specialists
- **Medication Information** — Get dosage, interactions, and side-effect details
- **Claims & Insurance** — Check PMJAY/Ayushman Bharat claim status
- **Lab Reports** — Understand your test results and reference ranges
- **Hospital Finder** — Locate empanelled hospitals near you

How may I assist you today? Please describe your concern in detail so I can provide the most relevant guidance.

**Disclaimer:** This AI assistant provides general health information and is not a substitute for professional medical advice. In case of emergency, please call 108 (Ambulance) or 112 (Emergency).`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const conversationId = context.params.id as string;
    const db = context.env.DB;

    if (!db) {
      return json({
        messages: [
          {
            id: 'msg-001',
            conversation_id: conversationId,
            role: 'assistant',
            content:
              'Namaste! I am V-Care, your AI healthcare assistant. How may I help you today?',
            created_at: '2026-03-30T09:00:00Z',
          },
          {
            id: 'msg-002',
            conversation_id: conversationId,
            role: 'user',
            content:
              'I have been experiencing chest pain and shortness of breath since yesterday.',
            created_at: '2026-03-30T09:01:00Z',
          },
          {
            id: 'msg-003',
            conversation_id: conversationId,
            role: 'assistant',
            content:
              'I understand you are experiencing chest pain and shortness of breath. This requires immediate attention.\n\n**Triage Level: HIGH — Seek emergency care immediately.**\n\nPlease call 108 for an ambulance or visit the nearest emergency department right away. Do not delay.\n\nWhile waiting:\n1. Sit upright in a comfortable position\n2. Loosen any tight clothing\n3. If you have prescribed Sorbitrate/Aspirin, take it as directed\n4. Do not exert yourself\n\nIs anyone with you who can help you reach the hospital?',
            created_at: '2026-03-30T09:01:30Z',
          },
        ],
      });
    }

    const { results } = await db
      .prepare(
        `SELECT id, conversation_id, role, content, created_at
         FROM messages
         WHERE conversation_id = ?
         ORDER BY created_at ASC`
      )
      .bind(conversationId)
      .all();

    return json({ messages: results || [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return json({ error: 'Failed to fetch messages' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const conversationId = context.params.id as string;
    const db = context.env.DB;
    const body = (await context.request.json()) as { content: string };

    if (!body.content || body.content.trim() === '') {
      return json({ error: 'Message content is required' }, 400);
    }

    const userMsgId = `msg-${Date.now()}`;
    const assistantMsgId = `msg-${Date.now() + 1}`;
    const now = new Date().toISOString();

    // Save user message to DB if available
    if (db) {
      await db
        .prepare(
          `INSERT INTO messages (id, conversation_id, role, content, created_at)
           VALUES (?, ?, 'user', ?, datetime('now'))`
        )
        .bind(userMsgId, conversationId, body.content)
        .run();
    }

    // Load conversation history
    let conversationHistory: Array<{ role: string; content: string }> = [];
    if (db) {
      const { results } = await db
        .prepare(
          `SELECT role, content FROM messages
           WHERE conversation_id = ?
           ORDER BY created_at ASC
           LIMIT 50`
        )
        .bind(conversationId)
        .all();
      conversationHistory = (results || []) as Array<{
        role: string;
        content: string;
      }>;
    }

    let assistantContent: string;

    // Try calling Claude API if key is available
    if (context.env.ANTHROPIC_API_KEY) {
      try {
        const systemPrompt = `You are V-Care, an AI healthcare assistant for AyushmanLife — India's integrated healthcare platform. You assist patients, doctors, hospital staff, and insurance coordinators.

Your capabilities:
- Symptom triage and initial assessment (always recommend consulting a doctor)
- Appointment booking guidance
- Medication information (dosage, interactions, side effects)
- Insurance and claims assistance (PMJAY, Ayushman Bharat, CGHS, private insurers)
- Lab report interpretation
- General health education

Guidelines:
- Be empathetic, professional, and culturally sensitive to Indian patients
- Use Indian healthcare context (PMJAY, ABHA, Jan Aushadhi, PHC/CHC, district hospitals)
- Always include disclaimers that AI advice is not a substitute for professional medical consultation
- For emergencies, always direct to call 108 (Ambulance) or 112 (Emergency)
- Use INR (₹) for any cost references
- Reference Indian medical guidelines (ICMR, NMC) where appropriate
- Support multilingual patients — respond in the language the patient uses if possible`;

        const messages = conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

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
              messages,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`);
        }

        const apiResponse = (await response.json()) as {
          content: Array<{ type: string; text: string }>;
        };
        assistantContent =
          apiResponse.content?.[0]?.text ||
          generateMockResponse(body.content);
      } catch (apiError) {
        console.error('Anthropic API call failed, using mock:', apiError);
        assistantContent = generateMockResponse(body.content);
      }
    } else {
      assistantContent = generateMockResponse(body.content);
    }

    // Save assistant message to DB if available
    if (db) {
      await db
        .prepare(
          `INSERT INTO messages (id, conversation_id, role, content, created_at)
           VALUES (?, ?, 'assistant', ?, datetime('now'))`
        )
        .bind(assistantMsgId, conversationId, assistantContent)
        .run();

      // Update conversation updated_at
      await db
        .prepare(
          `UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`
        )
        .bind(conversationId)
        .run();
    }

    const userMessage = {
      id: userMsgId,
      conversation_id: conversationId,
      role: 'user',
      content: body.content,
      created_at: now,
    };

    const assistantMessage = {
      id: assistantMsgId,
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantContent,
      created_at: now,
    };

    return json({ userMessage, assistantMessage }, 201);
  } catch (error) {
    console.error('Error sending message:', error);
    return json({ error: 'Failed to send message' }, 500);
  }
};
