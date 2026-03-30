-- AyushmanLife D1 Database Schema
-- Apply with: wrangler d1 execute ayushmanlife-db --file=schema.sql

-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
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
  insurance_type TEXT,
  insurance_id TEXT,
  insurance_provider TEXT,
  medical_history TEXT,
  allergies TEXT,
  chronic_conditions TEXT,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_visit DATETIME,
  risk_score REAL DEFAULT 0,
  churn_risk TEXT DEFAULT 'low',
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
  type TEXT DEFAULT 'consultation',
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  claim_number TEXT UNIQUE NOT NULL,
  payer_scheme TEXT NOT NULL,
  payer_name TEXT,
  policy_number TEXT,
  diagnosis TEXT NOT NULL,
  diagnosis_codes TEXT,
  procedure_codes TEXT,
  admission_date DATE,
  discharge_date DATE,
  claimed_amount REAL NOT NULL,
  approved_amount REAL,
  status TEXT DEFAULT 'draft',
  rejection_reason TEXT,
  documents TEXT,
  ai_coding_confidence REAL,
  ai_completeness_score REAL,
  fhir_bundle TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  resolved_at DATETIME
);

-- Claim Documents
CREATE TABLE IF NOT EXISTS claim_documents (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  type TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_text TEXT,
  ai_extraction TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- V-Care Chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id),
  user_id TEXT REFERENCES users(id),
  title TEXT,
  mode TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES chat_conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patient Vitals
CREATE TABLE IF NOT EXISTS vitals (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by TEXT REFERENCES users(id),
  source TEXT DEFAULT 'manual'
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT DEFAULT 'oral',
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by TEXT REFERENCES users(id),
  status TEXT DEFAULT 'active',
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
  status TEXT DEFAULT 'active',
  verified INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS staff_skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skill_name TEXT NOT NULL,
  category TEXT,
  proficiency INTEGER DEFAULT 1,
  verified INTEGER DEFAULT 0,
  last_assessed DATETIME
);

CREATE TABLE IF NOT EXISTS shift_schedules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  shift_type TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  department TEXT,
  status TEXT DEFAULT 'scheduled'
);

-- Service Desk Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
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
  scheme TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  holder_id TEXT,
  patient_id TEXT REFERENCES patients(id),
  coverage_amount REAL,
  premium_amount REAL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  benefits TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id TEXT PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id),
  alert_type TEXT NOT NULL,
  risk_score REAL NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  status TEXT DEFAULT 'open',
  investigated_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- Academy/Learning
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'intermediate',
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
  status TEXT DEFAULT 'in_progress'
);

-- Feedback & Satisfaction
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id),
  type TEXT NOT NULL,
  department TEXT,
  rating INTEGER,
  nps_score INTEGER,
  comment TEXT,
  sentiment TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_insurance ON patients(insurance_type);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_claims_patient ON claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_payer ON claims(payer_scheme);
CREATE INDEX IF NOT EXISTS idx_chat_conv_patient ON chat_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_type ON vitals(type);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_policies_patient ON policies(patient_id);
CREATE INDEX IF NOT EXISTS idx_fraud_claim ON fraud_alerts(claim_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON learning_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_patient ON feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
