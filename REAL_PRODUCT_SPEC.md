# AYUSHMANLIFE — REAL PRODUCT BUILD SPEC
# This is not a demo. This is a functional product.

## ARCHITECTURE FOR REAL FUNCTIONALITY

### Storage: Cloudflare D1 (serverless SQLite — free, already available on your account)
### Auth: Cookie-based sessions stored in D1
### AI: Claude API via Cloudflare Pages Functions (with smart mock fallback)
### File Processing: Client-side PDF/image parsing + AI extraction
### Frontend: React + TypeScript (already built)
### API: Cloudflare Pages Functions (already have /functions/api/)

---

## TASK 1: SET UP REAL DATABASE (Cloudflare D1)

Create the database and all tables. Run via wrangler:

```bash
source .env
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler d1 create ayushmanlife-db
```

Add the D1 binding to wrangler.toml:
```toml
[[d1_databases]]
binding = "DB"
database_name = "ayushmanlife-db"
database_id = "<id from create command>"
```

Create schema file `schema.sql` and apply it:

```sql
-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff', -- admin, doctor, nurse, staff, patient, payer
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  emergency_contact TEXT,
  insurance_type TEXT, -- ayushman_bharat, cghs, echs, private, self_pay
  insurance_id TEXT,
  insurance_provider TEXT,
  medical_history TEXT, -- JSON
  allergies TEXT, -- JSON array
  chronic_conditions TEXT, -- JSON array
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_visit DATETIME,
  risk_score REAL DEFAULT 0,
  churn_risk TEXT DEFAULT 'low', -- low, medium, high
  satisfaction_score REAL
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  doctor_id TEXT REFERENCES users(id),
  department TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type TEXT DEFAULT 'consultation', -- consultation, follow_up, procedure, telemedicine
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled, no_show
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  claim_number TEXT UNIQUE NOT NULL,
  payer_scheme TEXT NOT NULL, -- ayushman_bharat, cghs, echs, private_insurance, self_pay
  payer_name TEXT,
  policy_number TEXT,
  diagnosis TEXT NOT NULL,
  diagnosis_codes TEXT, -- JSON array of ICD-10 codes
  procedure_codes TEXT, -- JSON array of CPT codes
  admission_date DATE,
  discharge_date DATE,
  claimed_amount REAL NOT NULL,
  approved_amount REAL,
  status TEXT DEFAULT 'draft', -- draft, submitted, under_review, pre_auth_pending, approved, partially_approved, rejected, appealed, paid, closed
  rejection_reason TEXT,
  documents TEXT, -- JSON array of document references
  ai_coding_confidence REAL,
  ai_completeness_score REAL,
  fhir_bundle TEXT, -- JSON FHIR R4 bundle
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  resolved_at DATETIME
);

-- Claim Documents
CREATE TABLE IF NOT EXISTS claim_documents (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  type TEXT NOT NULL, -- discharge_summary, prescription, lab_report, invoice, pre_auth_form
  filename TEXT NOT NULL,
  content_text TEXT, -- extracted text from document
  ai_extraction TEXT, -- JSON of AI-extracted structured data
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- V-Care Chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id),
  user_id TEXT REFERENCES users(id),
  title TEXT,
  mode TEXT DEFAULT 'general', -- general, symptom_check, appointment, medication, emergency
  status TEXT DEFAULT 'active', -- active, resolved, escalated
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES chat_conversations(id),
  role TEXT NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, appointment_card, medication_card, alert, vitals
  metadata TEXT, -- JSON for structured data (appointment details, medication info, etc.)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patient Vitals
CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  type TEXT NOT NULL, -- bp_systolic, bp_diastolic, heart_rate, spo2, blood_sugar, temperature, weight
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by TEXT REFERENCES users(id),
  source TEXT DEFAULT 'manual' -- manual, wearable, device
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL, -- once_daily, twice_daily, thrice_daily, as_needed, etc.
  route TEXT DEFAULT 'oral', -- oral, injectable, topical, inhalation
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by TEXT REFERENCES users(id),
  status TEXT DEFAULT 'active', -- active, completed, discontinued
  reminder_enabled INTEGER DEFAULT 1,
  adherence_rate REAL DEFAULT 0,
  notes TEXT
);

-- Staff/Workforce
CREATE TABLE IF NOT EXISTS staff_certifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  certification_name TEXT NOT NULL,
  issuing_body TEXT,
  certification_id TEXT,
  issued_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active', -- active, expiring_soon, expired, pending_renewal
  verified INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS staff_skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skill_name TEXT NOT NULL,
  category TEXT, -- emr, servicenow, cloud, security, clinical, data
  proficiency INTEGER DEFAULT 1, -- 1-5
  verified INTEGER DEFAULT 0,
  last_assessed DATETIME
);

CREATE TABLE IF NOT EXISTS shift_schedules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- morning, afternoon, night, on_call
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  department TEXT,
  status TEXT DEFAULT 'scheduled' -- scheduled, confirmed, swapped, cancelled
);

-- Service Desk Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- emr, network, hardware, software, access, other
  priority TEXT DEFAULT 'medium', -- critical, high, medium, low
  status TEXT DEFAULT 'open', -- open, assigned, in_progress, waiting, resolved, closed
  assigned_to TEXT REFERENCES users(id),
  created_by TEXT REFERENCES users(id),
  sla_hours INTEGER DEFAULT 24,
  sla_breached INTEGER DEFAULT 0,
  resolution TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- Payer/Insurance
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  policy_number TEXT UNIQUE NOT NULL,
  scheme TEXT NOT NULL, -- ayushman_bharat, cghs, echs, esi, private_group, retail
  provider_name TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  holder_id TEXT, -- Aadhaar or other ID
  patient_id TEXT REFERENCES patients(id),
  coverage_amount REAL,
  premium_amount REAL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- active, lapsed, cancelled, expired
  benefits TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id TEXT PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id),
  alert_type TEXT NOT NULL, -- duplicate, upcoding, phantom, unbundling, pattern_anomaly
  risk_score REAL NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT, -- JSON
  status TEXT DEFAULT 'open', -- open, investigating, confirmed_fraud, false_positive, resolved
  investigated_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- Academy/Learning
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- emr, servicenow, cloud, security, revenue_cycle, data, ai
  difficulty TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced
  modules_count INTEGER DEFAULT 0,
  estimated_hours INTEGER,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS learning_enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  path_id TEXT NOT NULL REFERENCES learning_paths(id),
  progress_percent REAL DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  status TEXT DEFAULT 'in_progress' -- in_progress, completed, paused, dropped
);

-- Feedback & Satisfaction
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id),
  type TEXT NOT NULL, -- visit, service, complaint, suggestion, nps
  department TEXT,
  rating INTEGER, -- 1-5
  nps_score INTEGER, -- 0-10
  comment TEXT,
  sentiment TEXT, -- positive, neutral, negative (AI-analyzed)
  status TEXT DEFAULT 'new', -- new, acknowledged, in_progress, resolved
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT, -- JSON
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Seed the database with realistic data:
- 50 patients with Indian names, real conditions, varied insurance types
- 10 staff users (doctors, nurses, admin)
- 100 claims across all statuses and payer schemes
- 200 chat messages across 20 conversations
- 500 vitals readings
- 30 active medications
- 50 appointments (past and upcoming)
- 20 service desk tickets
- 10 policies
- 5 fraud alerts
- 8 learning paths with enrollments
- 30 feedback entries
- Staff certifications and skills for all staff

ALL seed data must be realistic Indian healthcare context — Indian names, Indian cities, Indian hospital departments, INR amounts, Ayushman Bharat package rates, real ICD-10 codes for common Indian conditions (diabetes, hypertension, dengue, typhoid, cardiac, orthopedic, maternal).

---

## TASK 2: BUILD REAL API ROUTES (Cloudflare Pages Functions)

Every API route goes in /functions/api/. Each function gets the D1 database from context.env.DB.

### Auth APIs
- POST /api/auth/login — validate email/password, create session, set cookie
- POST /api/auth/register — create user, hash password (use Web Crypto API)
- POST /api/auth/logout — delete session
- GET /api/auth/me — return current user from session cookie

### Patient APIs
- GET /api/patients — list with search, filter, pagination
- GET /api/patients/:id — full patient profile with vitals, medications, appointments, claims
- POST /api/patients — create new patient
- PUT /api/patients/:id — update patient
- GET /api/patients/:id/vitals — vitals history
- POST /api/patients/:id/vitals — record new vitals
- GET /api/patients/:id/medications — active medications
- POST /api/patients/:id/medications — prescribe medication

### Appointment APIs
- GET /api/appointments — list with date filter, department filter
- POST /api/appointments — book appointment (V-Care can call this)
- PUT /api/appointments/:id — update status
- GET /api/appointments/available — available slots by doctor/department/date

### Claims APIs
- GET /api/claims — list with filters (status, payer, date range, patient)
- GET /api/claims/:id — full claim detail with documents
- POST /api/claims — create new claim
- PUT /api/claims/:id — update claim (status change, add codes, etc.)
- POST /api/claims/:id/analyze — AI analysis: extract ICD/CPT codes, completeness check, generate FHIR bundle
- POST /api/claims/:id/submit — submit claim to payer
- GET /api/claims/stats — dashboard statistics

### V-Care Chat APIs
- GET /api/chat/conversations — list conversations
- POST /api/chat/conversations — start new conversation
- GET /api/chat/conversations/:id/messages — get message history
- POST /api/chat/conversations/:id/messages — send message, get AI response
  - This is the REAL AI endpoint. It must:
    1. Accept user message
    2. Load conversation history from D1
    3. Load patient context (if patient_id is set): vitals, medications, appointments, conditions
    4. Build a Claude API system prompt with full patient context
    5. Call Claude API (or use smart mock if no ANTHROPIC_API_KEY)
    6. Parse Claude's response for actions (book_appointment, set_reminder, check_symptoms, escalate)
    7. Execute actions against the database (create appointment, etc.)
    8. Save both messages to D1
    9. Return response with any action results

### V-Care Symptom Checker
- POST /api/chat/symptom-check — structured symptom assessment
  - Input: symptoms array, duration, severity, body region, patient context
  - AI analyzes and returns: triage level (emergency/urgent/routine/self_care), possible conditions, recommended actions, whether to book appointment
  - If emergency: response includes emergency contacts and nearest hospital info

### Ticket APIs
- GET /api/tickets — list with filters
- POST /api/tickets — create ticket
- PUT /api/tickets/:id — update status, assign, resolve

### Payer APIs
- GET /api/payer/policies — list policies
- POST /api/payer/policies — create policy
- GET /api/payer/claims — claims from payer perspective
- PUT /api/payer/claims/:id/adjudicate — approve/reject with reason
- GET /api/payer/fraud-alerts — fraud alerts list
- POST /api/payer/fraud-alerts/:id/investigate — update investigation

### Analytics APIs
- GET /api/analytics/dashboard — KPI summary (patients, claims, revenue, satisfaction)
- GET /api/analytics/patient-risk — risk stratification data
- GET /api/analytics/churn — churn prediction data
- GET /api/analytics/operations — operational metrics (turnaround, occupancy, utilization)
- GET /api/analytics/revenue — revenue breakdown by payer, department, month
- GET /api/analytics/satisfaction — NPS, feedback analysis, department scores

### Workforce APIs
- GET /api/workforce/staff — staff list with skills and certifications
- GET /api/workforce/schedule — shift schedule
- POST /api/workforce/schedule — create/update shift
- GET /api/workforce/certifications — certification status

### Academy APIs
- GET /api/academy/paths — learning paths
- GET /api/academy/enrollments — user enrollments with progress
- POST /api/academy/enrollments — enroll in path
- PUT /api/academy/enrollments/:id — update progress

---

## TASK 3: CONNECT FRONTEND TO REAL APIs

Replace ALL hardcoded mock data in the React frontend with real API calls.

Create src/lib/api.ts with typed fetch functions:
```typescript
const API_BASE = '/api';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // send session cookie
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }
  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
  me: () => fetchAPI('/auth/me'),
};

// Patients
export const patients = {
  list: (params?: Record<string, string>) => fetchAPI(`/patients?${new URLSearchParams(params)}`),
  get: (id: string) => fetchAPI(`/patients/${id}`),
  create: (data: any) => fetchAPI('/patients', { method: 'POST', body: JSON.stringify(data) }),
  // ... etc
};

// Claims
export const claims = {
  list: (params?: Record<string, string>) => fetchAPI(`/claims?${new URLSearchParams(params)}`),
  get: (id: string) => fetchAPI(`/claims/${id}`),
  create: (data: any) => fetchAPI('/claims', { method: 'POST', body: JSON.stringify(data) }),
  analyze: (id: string) => fetchAPI(`/claims/${id}/analyze`, { method: 'POST' }),
  submit: (id: string) => fetchAPI(`/claims/${id}/submit`, { method: 'POST' }),
  stats: () => fetchAPI('/claims/stats'),
};

// Chat
export const chat = {
  conversations: () => fetchAPI('/chat/conversations'),
  messages: (convId: string) => fetchAPI(`/chat/conversations/${convId}/messages`),
  send: (convId: string, content: string) => fetchAPI(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  newConversation: (patientId?: string) => fetchAPI('/chat/conversations', { method: 'POST', body: JSON.stringify({ patient_id: patientId }) }),
};

// ... similar for all other modules
```

Every React component that displays data must:
1. Call the real API on mount (useEffect or React Query)
2. Show loading skeleton while fetching
3. Show error state if API fails
4. Show empty state if no data
5. Support create/edit/delete operations through forms that POST/PUT to the API

### Real Login Flow
- Login page sends POST /api/auth/login
- On success, redirect to /dashboard
- Session cookie is set automatically
- Every API call includes credentials
- If session expired, redirect to /login
- Registration creates a real user in D1

### Real V-Care Chat
- On opening V-Care, load or create a conversation
- Each message sent hits POST /api/chat/conversations/:id/messages
- API calls Claude with full patient context
- Response streams back (or returns complete)
- If Claude says "book appointment" → API actually creates an appointment in D1
- If Claude says "check symptoms" → triggers symptom checker flow
- Chat history persists across sessions (stored in D1)

### Real Claims Workflow
- Create claim form collects real data: patient, diagnosis, procedures, dates, amounts
- ICD-10/CPT coding: user types clinical text → POST /api/claims/:id/analyze → AI returns suggested codes with confidence
- User reviews and accepts/modifies codes
- Completeness score calculated based on required fields for the payer scheme
- Submit sends to payer (simulated status change)
- Claims dashboard shows real counts from database

### Real Analytics
- All charts pull from /api/analytics/* endpoints
- Endpoints run actual SQL aggregation queries on D1 data
- Patient risk scores calculated from vitals, conditions, visit frequency
- Churn prediction based on satisfaction scores, visit gaps, complaint history
- Revenue calculated from claims data
- All numbers are real — derived from the seeded data

---

## TASK 4: LANDING PAGE MUST BE WORLD-CLASS

Completely rewrite the Landing page. It must look like a $10M funded startup's website.

Follow the layout spec from earlier but also:
- Add smooth scroll-triggered animations using Framer Motion (useInView)
- Hero background: animated gradient mesh that subtly shifts colors
- Feature cards: animate in on scroll, stagger delay
- Platform preview: actually show real screenshots of the dashboard (render mini versions of real components)
- Testimonial cards: subtle slide-in animation
- Pricing cards: hover effects that feel premium
- CTA section: full-width gradient with animated particles or dots
- Use proper typographic scale and whitespace
- Every pixel must feel intentional

---

## TASK 5: FIX SSL/TLS

In Cloudflare dashboard settings for ayushmanlife.in, the SSL mode needs to be "Flexible" not "Full (strict)" since Pages handles SSL. But if you can't access the dashboard, add this to the Pages Function:

```typescript
// In every function, add CORS and security headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};
```

---

## TASK 6: BUILD, DEPLOY, DOCUMENT

1. npm run build — zero errors
2. Apply database schema: wrangler d1 execute ayushmanlife-db --file=schema.sql
3. Apply seed data: wrangler d1 execute ayushmanlife-db --file=seed.sql
4. Deploy: source .env && CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy dist --project-name=ayushmanlife
5. git add -A && git commit -m "feat: real product with D1 database, real APIs, real auth, real AI chat, real claims processing" && git push origin main
6. Update PLATFORM_STATE.md with complete status

---

## CRITICAL: THIS IS A REAL PRODUCT

- Every form submission must persist data to D1
- Every list/table must query data from D1
- Auth must work with real session cookies
- V-Care chat must actually call Claude AI (or mock intelligently)
- Claims processing must actually generate ICD codes via AI
- Analytics must aggregate real data via SQL
- No hardcoded arrays in React components — ALL data comes from API
- Error handling everywhere — try/catch, loading states, empty states
- If a feature can't be fully real, make it as real as possible with clear progressive enhancement path
