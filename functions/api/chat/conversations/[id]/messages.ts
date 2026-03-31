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
    lower.includes('bp') ||
    lower.includes('blood pressure') ||
    lower.includes('heart') ||
    lower.includes('cholesterol') ||
    lower.includes('ecg') ||
    lower.includes('cardiac')
  ) {
    return `Here is your cardiovascular health summary:

**Blood Pressure Trends (Last 30 days):**
| Date | Systolic | Diastolic | Status |
|------|----------|-----------|--------|
| 28 Mar | 128 | 82 | ✅ Normal |
| 21 Mar | 134 | 86 | ⚠️ Slightly High |
| 14 Mar | 130 | 84 | ✅ Normal |
| 7 Mar | 138 | 90 | ⚠️ High |
| 1 Mar | 132 | 85 | ✅ Normal |

**7-Day Average:** 131/84 mmHg
**30-Day Trend:** ↓ Improving (down from 135/88 avg last month)

**Heart Health Summary:**
- Resting Heart Rate: 72 bpm (Normal)
- Total Cholesterol: 195 mg/dL (Normal)
- LDL: 118 mg/dL (Borderline)
- Last ECG: Sinus rhythm, no abnormalities (12 Mar 2026)

**Recommendations:**
1. Continue Amlodipine 5mg as prescribed
2. Reduce salt intake to <5g/day
3. Walk 30 minutes daily — your step count has improved this week
4. Next cardiology follow-up: Dr. Rajesh Sharma, 5 April 2026

Would you like me to schedule an earlier consultation or set BP monitoring reminders?`;
  }

  if (
    lower.includes('diabetes') ||
    lower.includes('sugar') ||
    lower.includes('hba1c') ||
    lower.includes('glucose') ||
    lower.includes('metformin') ||
    lower.includes('insulin')
  ) {
    return `Here is your diabetes management overview:

**Blood Sugar Trends:**
- Fasting (today): 118 mg/dL ⚠️ (Target: <110)
- Post-meal avg (7 days): 156 mg/dL (Target: <140)
- HbA1c (last check): 6.8% ✅ (Target: <7.0%)

**30-Day Glucose Trend:** ↓ Improving — average down 8% from last month

**Current Medications:**
- Metformin 500mg — twice daily (after meals)
- Adherence this month: 92% ✅

**Key Recommendations:**
1. Your fasting sugar is slightly elevated — try having dinner before 8 PM
2. Include more fiber-rich foods (dal, sabzi, whole grains)
3. 30 min post-meal walk helps reduce sugar spikes by 20-30%
4. Schedule eye and foot exam (annual diabetic screening due)

**Next Endocrinology Visit:** Dr. Meera Nair, 15 April 2026

Would you like me to prepare a sugar log for your next doctor visit?`;
  }

  if (
    lower.includes('upcoming') ||
    lower.includes('next appointment') ||
    lower.includes('my appointment') ||
    lower.includes('when is my')
  ) {
    return `Here are your upcoming appointments:

📅 **Upcoming Appointments:**

1. **Dr. Rajesh Sharma** — Cardiology
   📍 OPD Block A, Room 204
   🗓️ 5 April 2026, 9:00 AM
   📋 Diabetes and cardiac risk follow-up

2. **Dental Check-up** — Dental OPD
   📍 OPD Block B, Room 102
   🗓️ 12 April 2026, 10:30 AM
   📋 Routine 6-month dental checkup

**Reminders:**
- Carry your previous reports and current medication list
- Arrive 15 minutes early for registration
- Fasting required for blood work (no food after 10 PM the night before)

Would you like me to reschedule any appointment, add a new one, or set a reminder?`;
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
        `SELECT id, conversation_id, role, content, message_type, metadata, created_at
         FROM chat_messages
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
          `INSERT INTO chat_messages (id, conversation_id, role, content, message_type, created_at)
           VALUES (?, ?, 'user', ?, 'text', datetime('now'))`
        )
        .bind(userMsgId, conversationId, body.content)
        .run();
    }

    // Load conversation history
    let conversationHistory: Array<{ role: string; content: string }> = [];
    if (db) {
      const { results } = await db
        .prepare(
          `SELECT role, content FROM chat_messages
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

    // Load patient context from D1 for Claude
    let patientContext = '';
    if (db) {
      try {
        // Get patient_id from conversation
        const conv = await db.prepare(
          `SELECT patient_id FROM chat_conversations WHERE id = ?`
        ).bind(conversationId).first() as { patient_id?: string } | null;
        const patientId = conv?.patient_id || 'pat-001';

        const patient = await db.prepare(
          `SELECT name, age, gender, blood_group, insurance_type, insurance_provider, medical_history, allergies, chronic_conditions, risk_score FROM patients WHERE id = ?`
        ).bind(patientId).first();

        if (patient) {
          const p = patient as Record<string, unknown>;
          patientContext = `\n\nCurrent Patient Context:
- Name: ${p.name}, Age: ${p.age}, Gender: ${p.gender}, Blood Group: ${p.blood_group}
- Insurance: ${p.insurance_type} (${p.insurance_provider || 'Self-pay'})
- Medical History: ${p.medical_history || 'None recorded'}
- Allergies: ${p.allergies || 'None known'}
- Chronic Conditions: ${p.chronic_conditions || 'None'}
- Risk Score: ${p.risk_score}/1.0`;

          // Get recent vitals
          const { results: vitals } = await db.prepare(
            `SELECT type, value, unit, recorded_at FROM vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 6`
          ).bind(patientId).all();
          if (vitals && vitals.length > 0) {
            patientContext += '\n- Recent Vitals: ' + vitals.map((v: Record<string, unknown>) => `${v.type}: ${v.value}${v.unit}`).join(', ');
          }

          // Get current medications
          const { results: meds } = await db.prepare(
            `SELECT name, dosage, frequency FROM medications WHERE patient_id = ? AND status = 'active'`
          ).bind(patientId).all();
          if (meds && meds.length > 0) {
            patientContext += '\n- Current Medications: ' + meds.map((m: Record<string, unknown>) => `${m.name} ${m.dosage} (${m.frequency})`).join(', ');
          }
        }
      } catch (e) {
        console.error('Failed to load patient context:', e);
      }
    }

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
- Support multilingual patients — respond in the language the patient uses if possible
- When patient context is available, personalize your responses based on their medical history, conditions, and medications
- Flag any drug interactions or allergy concerns based on patient data` + patientContext;

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
          `INSERT INTO chat_messages (id, conversation_id, role, content, message_type, created_at)
           VALUES (?, ?, 'assistant', ?, 'text', datetime('now'))`
        )
        .bind(assistantMsgId, conversationId, assistantContent)
        .run();

      // Update conversation updated_at
      await db
        .prepare(
          `UPDATE chat_conversations SET updated_at = datetime('now') WHERE id = ?`
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
