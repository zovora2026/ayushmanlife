// AyushmanLife API Client — typed fetch functions for all endpoints

const API_BASE = '/api';

class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new APIError(error.message || `API error: ${res.status}`, res.status);
  }
  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    fetchAPI<{ user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; name: string; role?: string; department?: string; phone?: string }) =>
    fetchAPI<{ user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => fetchAPI<{ message: string }>('/auth/logout', { method: 'POST' }),
  me: () => fetchAPI<{ user: User | null }>('/auth/me'),
};

// Patients
export const patients = {
  list: (params?: Record<string, string>) =>
    fetchAPI<{ patients: Patient[]; total: number; page: number }>(`/patients?${new URLSearchParams(params || {})}`),
  get: (id: string) =>
    fetchAPI<{ patient: Patient; vitals: Vital[]; medications: Medication[]; appointments: Appointment[]; claims: Claim[] }>(`/patients/${id}`),
  create: (data: Partial<Patient>) =>
    fetchAPI<{ patient: Patient }>('/patients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Patient>) =>
    fetchAPI<{ patient: Patient }>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  vitals: (id: string, params?: Record<string, string>) =>
    fetchAPI<{ vitals: Vital[] }>(`/patients/${id}/vitals?${new URLSearchParams(params || {})}`),
  addVital: (id: string, data: { type: string; value: number; unit: string }) =>
    fetchAPI<{ vital: Vital }>(`/patients/${id}/vitals`, { method: 'POST', body: JSON.stringify(data) }),
  medications: (id: string) =>
    fetchAPI<{ medications: Medication[] }>(`/patients/${id}/medications`),
  addMedication: (id: string, data: Partial<Medication>) =>
    fetchAPI<{ medication: Medication }>(`/patients/${id}/medications`, { method: 'POST', body: JSON.stringify(data) }),
};

// Appointments
export const appointments = {
  list: (params?: Record<string, string>) =>
    fetchAPI<{ appointments: Appointment[] }>(`/appointments?${new URLSearchParams(params || {})}`),
  create: (data: Partial<Appointment>) =>
    fetchAPI<{ appointment: Appointment }>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Appointment>) =>
    fetchAPI<{ appointment: Appointment }>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  available: (params?: Record<string, string>) =>
    fetchAPI<{ slots: { time: string; available: boolean }[] }>(`/appointments/available?${new URLSearchParams(params || {})}`),
};

// Claims
export const claims = {
  list: (params?: Record<string, string>) =>
    fetchAPI<{ claims: Claim[]; total: number; page: number }>(`/claims?${new URLSearchParams(params || {})}`),
  get: (id: string) =>
    fetchAPI<{ claim: Claim; documents: ClaimDocument[] }>(`/claims/${id}`),
  create: (data: Partial<Claim>) =>
    fetchAPI<{ claim: Claim }>('/claims', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Claim>) =>
    fetchAPI<{ claim: Claim }>(`/claims/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  analyze: (id: string) =>
    fetchAPI<{ icd_codes: CodeSuggestion[]; cpt_codes: CodeSuggestion[]; completeness_score: number; suggestions: string[] }>(`/claims/${id}/analyze`, { method: 'POST' }),
  submit: (id: string) =>
    fetchAPI<{ claim: Claim }>(`/claims/${id}/submit`, { method: 'POST' }),
  stats: () =>
    fetchAPI<ClaimStats>('/claims/stats'),
};

// V-Care Chat
export const chat = {
  conversations: () =>
    fetchAPI<{ conversations: Conversation[] }>('/chat/conversations'),
  createConversation: (data?: { patient_id?: string; title?: string; mode?: string }) =>
    fetchAPI<{ conversation: Conversation }>('/chat/conversations', { method: 'POST', body: JSON.stringify(data || {}) }),
  messages: (convId: string) =>
    fetchAPI<{ messages: ChatMessage[] }>(`/chat/conversations/${convId}/messages`),
  send: (convId: string, content: string) =>
    fetchAPI<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  symptomCheck: (data: { symptoms: string[]; duration: string; severity: string }) =>
    fetchAPI<SymptomCheckResult>('/chat/symptom-check', { method: 'POST', body: JSON.stringify(data) }),
};

// Analytics
export const analytics = {
  dashboard: () => fetchAPI<DashboardKPIs>('/analytics/dashboard'),
  revenue: () => fetchAPI<RevenueData>('/analytics/revenue'),
  satisfaction: () => fetchAPI<SatisfactionData>('/analytics/satisfaction'),
  patientRisk: () => fetchAPI<PatientRiskData>('/analytics/patient-risk'),
  operations: () => fetchAPI<OperationsData>('/analytics/operations'),
  churn: () => fetchAPI<ChurnData>('/analytics/churn'),
};

// Tickets
export const tickets = {
  list: (params?: Record<string, string>) =>
    fetchAPI<{ tickets: Ticket[] }>(`/tickets?${new URLSearchParams(params || {})}`),
  create: (data: Partial<Ticket>) =>
    fetchAPI<{ ticket: Ticket }>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Ticket>) =>
    fetchAPI<{ ticket: Ticket }>(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Payer
export const payer = {
  policies: () => fetchAPI<{ policies: Policy[] }>('/payer/policies'),
  createPolicy: (data: Partial<Policy>) =>
    fetchAPI<{ policy: Policy }>('/payer/policies', { method: 'POST', body: JSON.stringify(data) }),
  claims: () => fetchAPI<{ claims: Claim[] }>('/payer/claims'),
  fraudAlerts: () => fetchAPI<{ alerts: FraudAlert[] }>('/payer/fraud-alerts'),
};

// Workforce
export const workforce = {
  staff: () => fetchAPI<{ staff: StaffMember[] }>('/workforce/staff'),
  schedule: (params?: Record<string, string>) =>
    fetchAPI<{ schedules: ShiftSchedule[] }>(`/workforce/schedule?${new URLSearchParams(params || {})}`),
  createShift: (data: Partial<ShiftSchedule>) =>
    fetchAPI<{ schedule: ShiftSchedule }>('/workforce/schedule', { method: 'POST', body: JSON.stringify(data) }),
  certifications: () => fetchAPI<{ certifications: Certification[] }>('/workforce/certifications'),
};

// Academy
export const academy = {
  paths: () => fetchAPI<{ paths: LearningPath[] }>('/academy/paths'),
  enrollments: () => fetchAPI<{ enrollments: Enrollment[] }>('/academy/enrollments'),
  enroll: (pathId: string) =>
    fetchAPI<{ enrollment: Enrollment }>('/academy/enrollments', { method: 'POST', body: JSON.stringify({ path_id: pathId }) }),
  updateProgress: (id: string, progress: number) =>
    fetchAPI<{ enrollment: Enrollment }>(`/academy/enrollments/${id}`, { method: 'PUT', body: JSON.stringify({ progress_percent: progress }) }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  blood_group?: string;
  emergency_contact?: string;
  insurance_type?: string;
  insurance_id?: string;
  insurance_provider?: string;
  medical_history?: string;
  allergies?: string;
  chronic_conditions?: string;
  registered_at?: string;
  last_visit?: string;
  risk_score?: number;
  churn_risk?: string;
  satisfaction_score?: number;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  department: string;
  date: string;
  time: string;
  duration_minutes?: number;
  type?: string;
  status?: string;
  notes?: string;
}

export interface Claim {
  id: string;
  patient_id: string;
  patient_name?: string;
  claim_number: string;
  payer_scheme: string;
  payer_name?: string;
  policy_number?: string;
  diagnosis: string;
  diagnosis_codes?: string;
  procedure_codes?: string;
  admission_date?: string;
  discharge_date?: string;
  claimed_amount: number;
  approved_amount?: number;
  status: string;
  rejection_reason?: string;
  documents?: string;
  ai_coding_confidence?: number;
  ai_completeness_score?: number;
  created_at?: string;
  submitted_at?: string;
  resolved_at?: string;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  type: string;
  filename: string;
  content_text?: string;
  ai_extraction?: string;
}

export interface ClaimStats {
  total_claims: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_amount: number;
  approved_amount: number;
  avg_processing_days: number;
  approval_rate: number;
}

export interface CodeSuggestion {
  code: string;
  description: string;
  confidence: number;
}

export interface Conversation {
  id: string;
  patient_id?: string;
  title?: string;
  mode: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  message_type?: string;
  metadata?: string;
  created_at: string;
}

export interface SymptomCheckResult {
  triage_level: string;
  possible_conditions: { name: string; probability: string }[];
  recommendations: string[];
  book_appointment: boolean;
  emergency: boolean;
}

export interface DashboardKPIs {
  total_patients: number;
  active_claims: number;
  monthly_revenue: number;
  satisfaction_score: number;
  claims_this_month: number;
  appointments_today: number;
  avg_wait_time: number;
  bed_occupancy: number;
}

export interface RevenueData {
  monthly: { month: string; revenue: number; claims: number }[];
  by_payer: { payer: string; amount: number; count: number }[];
  by_department: { department: string; amount: number }[];
  total_revenue: number;
  growth_rate: number;
}

export interface SatisfactionData {
  nps_score: number;
  avg_rating: number;
  by_department: { department: string; score: number }[];
  recent_feedback: { comment: string; rating: number; department: string; date: string }[];
}

export interface PatientRiskData {
  high_risk: Patient[];
  medium_risk: Patient[];
  low_risk: Patient[];
  total_high: number;
  total_medium: number;
  total_low: number;
}

export interface OperationsData {
  avg_turnaround_days: number;
  bed_occupancy_pct: number;
  staff_utilization_pct: number;
  claims_per_day: number;
  appointments_per_day: number;
}

export interface ChurnData {
  at_risk_patients: Patient[];
  churn_rate: number;
  retention_rate: number;
}

export interface Vital {
  id: string;
  patient_id: string;
  type: string;
  value: number;
  unit: string;
  recorded_at: string;
  source?: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
  start_date: string;
  end_date?: string;
  status?: string;
  adherence_rate?: number;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: string;
  created_by?: string;
  sla_hours?: number;
  sla_breached?: number;
  resolution?: string;
  created_at?: string;
  resolved_at?: string;
}

export interface Policy {
  id: string;
  policy_number: string;
  scheme: string;
  provider_name: string;
  holder_name: string;
  patient_id?: string;
  coverage_amount?: number;
  premium_amount?: number;
  start_date: string;
  end_date?: string;
  status: string;
}

export interface FraudAlert {
  id: string;
  claim_id?: string;
  alert_type: string;
  risk_score: number;
  description: string;
  status: string;
  created_at: string;
}

export interface StaffMember extends User {
  skills?: { skill_name: string; category: string; proficiency: number }[];
  certifications?: { certification_name: string; status: string; expiry_date: string }[];
}

export interface ShiftSchedule {
  id: string;
  user_id: string;
  user_name?: string;
  date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  department?: string;
  status: string;
}

export interface Certification {
  id: string;
  user_id: string;
  user_name?: string;
  certification_name: string;
  issuing_body?: string;
  expiry_date?: string;
  status: string;
  verified: boolean;
}

export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  modules_count: number;
  estimated_hours?: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  path_id: string;
  path_name?: string;
  progress_percent: number;
  started_at: string;
  completed_at?: string;
  status: string;
}
