import type { ChatMessage } from '../types'
import { generateId } from './utils'

interface ResponseRule {
  keywords: string[]
  response: string
  type?: ChatMessage['type']
  data?: Record<string, unknown>
}

const rules: ResponseRule[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'],
    response: "Namaste! Welcome to V-Care. I'm here to help you with your healthcare needs. You can ask me about appointments, symptoms, medications, or anything health-related. What would you like help with?",
  },
  {
    keywords: ['appointment', 'book', 'schedule', 'doctor', 'visit'],
    response: "I'd be happy to help you book an appointment! Here are available slots for this week:\n\n🗓️ **Dr. Rajesh Kumar** - Cardiology\n• Tomorrow, 10:00 AM - 10:30 AM\n• Tomorrow, 2:00 PM - 2:30 PM\n\n🗓️ **Dr. Anita Desai** - Internal Medicine\n• Today, 4:00 PM - 4:30 PM\n• Wednesday, 11:00 AM - 11:30 AM\n\n🗓️ **Dr. Suresh Patel** - Orthopedics\n• Thursday, 9:00 AM - 9:30 AM\n\nWould you like me to book any of these slots? Please share the patient name and preferred time.",
    type: 'appointment',
  },
  {
    keywords: ['symptom', 'fever', 'headache', 'pain', 'cough', 'cold', 'sick', 'unwell'],
    response: "I understand you're not feeling well. Let me help assess your symptoms.\n\n⚕️ **Symptom Assessment**\nBased on what you've described, here's my initial assessment:\n\n• **Severity Level**: Moderate\n• **Recommended Action**: Schedule a consultation\n• **Suggested Department**: Internal Medicine / General Physician\n\n⚠️ **Important**: This is an AI-based preliminary assessment only. Please consult a doctor for proper diagnosis and treatment.\n\nWould you like me to:\n1. Book an appointment with a physician\n2. Continue the symptom assessment for more detail\n3. View nearby emergency contacts",
  },
  {
    keywords: ['medicine', 'medication', 'drug', 'tablet', 'prescription', 'dose'],
    response: "Here's your current medication schedule based on your records:\n\n💊 **Active Medications**\n\n| Medication | Dosage | Timing |\n|---|---|---|\n| Metformin 500mg | 1 tablet | After breakfast & dinner |\n| Amlodipine 5mg | 1 tablet | Morning |\n| Atorvastatin 10mg | 1 tablet | Bedtime |\n\n✅ **Adherence Rate**: 87% this month\n\n⏰ **Next dose**: Metformin 500mg — After dinner today\n\nWould you like me to set up medication reminders or check for drug interactions?",
    type: 'medication',
  },
  {
    keywords: ['insurance', 'claim', 'coverage', 'policy', 'cashless', 'tpa'],
    response: "Let me check your insurance details:\n\n🏥 **Insurance Information**\n\n• **Provider**: Star Health Insurance\n• **Policy**: Family Health Optima\n• **Policy No**: SHI-2025-789456\n• **Sum Insured**: ₹10,00,000\n• **Available Balance**: ₹7,85,000\n• **Status**: Active (Valid till Mar 2027)\n\n📋 **Recent Claims**:\n• CLM-2026-0042: ₹1,85,000 — Approved ✅\n• CLM-2026-0038: ₹45,000 — Under Review ⏳\n\nWould you like to:\n1. Submit a new claim\n2. Check pre-authorization status\n3. Find cashless network hospitals",
  },
  {
    keywords: ['report', 'lab', 'test', 'result', 'blood', 'diagnostic'],
    response: "Here are your recent lab results:\n\n🔬 **Lab Results Summary** (24 Mar 2026)\n\n| Test | Result | Reference | Status |\n|---|---|---|---|\n| HbA1c | 6.8% | <7.0% | ✅ Normal |\n| Fasting Blood Sugar | 118 mg/dL | 70-110 | ⚠️ Slightly High |\n| Total Cholesterol | 195 mg/dL | <200 | ✅ Normal |\n| Blood Pressure | 128/82 mmHg | <130/85 | ✅ Normal |\n| Creatinine | 0.9 mg/dL | 0.7-1.3 | ✅ Normal |\n\n📊 **AI Interpretation**: Your diabetes is well-controlled with HbA1c at 6.8%. Fasting sugar is slightly elevated — consider dietary adjustments. All other parameters are within normal limits.\n\nWould you like me to explain any specific result in detail?",
  },
  {
    keywords: ['emergency', 'urgent', 'chest pain', 'breathing', 'unconscious', 'accident'],
    response: "🚨 **EMERGENCY DETECTED**\n\nIf this is a medical emergency, please:\n\n1. **Call 112** (National Emergency Number) immediately\n2. **Call 108** (Ambulance Service)\n3. Go to the nearest **Emergency Department**\n\n🏥 **Nearest Emergency Rooms**:\n• AyushmanLife Hospital, Connaught Place — 2.3 km\n• AIIMS Emergency — 4.1 km\n• Safdarjung Hospital — 5.8 km\n\n⚠️ **Do NOT wait for an online response in case of emergency.**\n\nIf this is not an immediate emergency, please describe your symptoms and I'll help with a proper assessment.",
  },
  {
    keywords: ['diet', 'food', 'nutrition', 'eat', 'weight', 'exercise'],
    response: "Great that you're thinking about healthy living! Here are some personalized tips:\n\n🥗 **Dietary Recommendations**\n(Based on your profile: Type 2 Diabetes, Mild Hypertension)\n\n• **Morning**: Overnight oats with flaxseeds, green tea\n• **Lunch**: Dal, brown rice, sabzi, salad, curd\n• **Evening snack**: Handful of almonds, fruit\n• **Dinner**: Roti (2), light sabzi, soup\n\n🚶 **Activity Goals**\n• 30 min brisk walking daily\n• Current week: 4/7 days completed ✅\n• Steps today: 6,234 / 8,000 target\n\n💡 **Health Tip**: Including methi (fenugreek) seeds soaked overnight can help manage blood sugar levels naturally.\n\nWant me to create a detailed weekly meal plan?",
    type: 'health-tip',
  },
  {
    keywords: ['thank', 'thanks', 'helpful', 'great', 'good'],
    response: "You're welcome! I'm always here to help you with your health needs. Remember:\n\n• Stay on top of your medications ⏰\n• Your next appointment is on Thursday at 10:00 AM\n• Don't forget your evening walk! 🚶\n\nIs there anything else I can help you with?",
  },
  {
    keywords: ['cost', 'price', 'fee', 'charge', 'bill', 'payment'],
    response: "Here are the estimated costs for common services at our hospital:\n\n💰 **Fee Structure**\n\n| Service | Cost (₹) |\n|---|---|\n| OPD Consultation | ₹500 - ₹1,500 |\n| Blood Tests (Basic Panel) | ₹800 - ₹2,000 |\n| ECG | ₹300 |\n| X-Ray | ₹500 - ₹1,200 |\n| MRI Scan | ₹5,000 - ₹12,000 |\n| CT Scan | ₹3,000 - ₹8,000 |\n\n🏥 **Payment Options**: Cash, Card, UPI, EMI available\n💳 **Insurance**: Cashless facility available for 50+ insurers\n\nWould you like a detailed estimate for a specific procedure?",
  },
  {
    keywords: ['covid', 'vaccine', 'vaccination', 'booster'],
    response: "Here's the latest COVID-19 information at our hospital:\n\n💉 **Vaccination Status**\n• COVID-19 boosters available (walk-in)\n• Timing: Mon-Sat, 9:00 AM - 4:00 PM\n• Cost: Free (under govt program) / ₹250 (private)\n\n🧪 **Testing**\n• RT-PCR: Results in 24 hours — ₹500\n• Rapid Antigen: Results in 30 min — ₹300\n\n😷 **Current Guidelines**\n• Masks recommended in hospital premises\n• Sanitizers available at all entry points\n• Visitor restrictions: 1 visitor per patient\n\nWould you like to book a vaccination appointment?",
  },
  {
    keywords: ['ayushman', 'bharat', 'pmjay', 'government', 'scheme'],
    response: "Great question! Here's information about Ayushman Bharat - PMJAY:\n\n🏥 **Ayushman Bharat - PMJAY**\n\n• **Coverage**: Up to ₹5,00,000 per family per year\n• **Beneficiaries**: 55 crore+ Indians covered\n• **Our Hospital**: Empanelled under PMJAY ✅\n\n📋 **Services Covered**:\n• Hospitalizations (1,949+ procedures)\n• Pre & post hospitalization expenses\n• Day care procedures\n• Follow-up care\n\n✅ **How to avail at our hospital**:\n1. Bring your Ayushman card or Aadhaar\n2. Visit the PMJAY desk at reception\n3. Get verified and receive cashless treatment\n\nWould you like me to check your PMJAY eligibility?",
  },
  {
    keywords: ['mental', 'stress', 'anxiety', 'depression', 'sleep', 'insomnia'],
    response: "I appreciate you reaching out about your mental wellbeing. Your mental health matters deeply.\n\n🧠 **Mental Health Support**\n\n• **Counseling Available**: Our hospital has trained psychologists and psychiatrists\n• **Helpline**: Call iCall at 9152987821 (Mon-Sat, 8am-10pm)\n• **Crisis Line**: Vandrevala Foundation — 1860-2662-345 (24x7)\n\n🌟 **Quick Relief Tips**:\n• Try 4-7-8 breathing: Inhale 4s, Hold 7s, Exhale 8s\n• Step outside for 10 minutes of sunlight\n• Limit screen time before bed\n• Practice progressive muscle relaxation\n\nWould you like me to:\n1. Book an appointment with our counselor\n2. Share guided meditation resources\n3. Set up daily wellness check-ins",
  },
  {
    keywords: ['diabetes', 'sugar', 'glucose', 'hba1c', 'insulin'],
    response: "Here's your diabetes management overview:\n\n📊 **Diabetes Dashboard**\n\n• **HbA1c**: 6.8% (Good Control ✅)\n• **Fasting Sugar Today**: 118 mg/dL\n• **Post-meal Average**: 156 mg/dL\n• **7-Day Average**: 132 mg/dL\n\n📈 **Trend**: Your blood sugar levels have improved by 12% over the last 3 months.\n\n💊 **Current Treatment**:\n• Metformin 500mg — twice daily\n• Diet control + 30 min exercise\n\n🎯 **Next Goals**:\n• Bring fasting sugar below 110 mg/dL\n• Maintain HbA1c below 6.5%\n• Increase walking to 45 minutes daily\n\nYour next endocrinologist appointment is in 2 weeks. Shall I help you prepare your sugar log for the visit?",
  },
]

const fallbackResponses = [
  "I understand your concern. While I can provide general health information, I'd recommend discussing this with your doctor for personalized advice. Would you like me to book a consultation?",
  "That's a great question! Let me connect you with the right department for detailed guidance. In the meantime, is there anything specific about appointments, medications, or insurance I can help with?",
  "I want to make sure you get the best care possible. For this specific query, I'd suggest visiting our hospital's specialist. Shall I help schedule an appointment?",
  "Thank you for sharing that with me. Based on your health profile, I'd recommend following up with your primary care physician. Would you like to see your upcoming appointments?",
  "I'm here to help! While I process your request, you might also want to check your health dashboard for the latest vitals and upcoming appointments. What else can I assist you with?",
]

export function mockAIRespond(userMessage: string, _history: ChatMessage[]): ChatMessage {
  const lower = userMessage.toLowerCase()

  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        id: generateId(),
        role: 'assistant',
        content: rule.response,
        timestamp: new Date().toISOString(),
        type: rule.type ?? 'text',
        data: rule.data,
      }
    }
  }

  const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  return {
    id: generateId(),
    role: 'assistant',
    content: fallback,
    timestamp: new Date().toISOString(),
    type: 'text',
  }
}
