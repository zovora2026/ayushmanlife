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
    fetchAPI<{ tickets: Ticket[]; total: number }>(`/tickets?${new URLSearchParams(params || {})}`),
  create: (data: Partial<Ticket>) =>
    fetchAPI<{ ticket: Ticket }>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Ticket>) =>
    fetchAPI<{ ticket: Ticket }>(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  analytics: () =>
    fetchAPI<TicketAnalytics>('/tickets/analytics'),
  kb: (params?: Record<string, string>) =>
    fetchAPI<{ articles: KBArticle[]; total: number; categories: Array<{ category: string; count: number }> }>(`/tickets/kb?${new URLSearchParams(params || {})}`),
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
  projects: (params?: Record<string, string>) =>
    fetchAPI<{ projects: Project[]; total: number }>(`/workforce/projects?${new URLSearchParams(params || {})}`),
  createProject: (data: Partial<Project>) =>
    fetchAPI<{ project: Project }>('/workforce/projects', { method: 'POST', body: JSON.stringify(data) }),
  assignments: (params?: Record<string, string>) =>
    fetchAPI<{ assignments: ProjectAssignment[]; total: number }>(`/workforce/assignments?${new URLSearchParams(params || {})}`),
  createAssignment: (data: Partial<ProjectAssignment>) =>
    fetchAPI<{ assignment: ProjectAssignment }>('/workforce/assignments', { method: 'POST', body: JSON.stringify(data) }),
  match: (params?: Record<string, string>) =>
    fetchAPI<{ matches: ConsultantMatch[]; total: number }>(`/workforce/match?${new URLSearchParams(params || {})}`),
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
  submitted_count?: number;
  under_review_count?: number;
  draft_count?: number;
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
  assessment: {
    triage_level: string;
    triage_color: string;
    possible_conditions: { name: string; likelihood: string; description: string }[];
    recommendations: string[];
    seek_care_within: string;
    emergency_signs: string[];
    disclaimer: string;
  };
  symptoms: string[];
  duration: string;
  severity: string;
  assessed_at: string;
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
  monthly: { month: string; revenue: number; claims_settled?: number; claims?: number }[];
  by_payer: { payer: string; revenue: number; percentage?: number; claims_count?: number; amount?: number; count?: number }[];
  by_department: { department: string; revenue: number; percentage?: number; avg_ticket_size?: number; amount?: number }[];
  total_revenue: number;
  growth_rate: number;
  currency?: string;
}

export interface SatisfactionData {
  nps_score: number;
  avg_rating: number;
  total_responses?: number;
  by_department: { department: string; avg_rating: number; responses?: number; score?: number }[];
  recent_feedback: { id?: string; patient_name?: string; comment: string; rating: number; department: string; date: string; sentiment?: string }[];
  rating_distribution?: { rating: number; count: number }[] | Record<string, number>;
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
  bed_occupancy_pct?: number;
  staff_utilization_pct?: number;
  claims_per_day: number;
  appointments_per_day: number;
  avg_length_of_stay_days?: number;
  by_department?: {
    department: string;
    appointments: number;
    unique_patients: number;
    avg_satisfaction: number;
    feedback_count: number;
  }[];
}

export interface ChurnData {
  at_risk_patients: (Patient & { days_since_visit?: number })[];
  churn_rate: number;
  retention_rate: number;
  at_risk_count: number;
  total_active_patients: number;
  churn_by_reason?: { reason: string; patient_count: number; percentage: number }[];
  monthly_trend?: { month: string; active_patients: number; claims_count: number }[];
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
  assigned_to_name?: string;
  created_by?: string;
  created_by_name?: string;
  sla_hours?: number;
  sla_breached?: number;
  resolution?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags?: string;
  views: number;
  helpful_count: number;
  created_at?: string;
}

export interface TicketAnalytics {
  total_tickets: number;
  by_status: Array<{ status: string; count: number }>;
  by_priority: Array<{ priority: string; count: number }>;
  by_category: Array<{ category: string; count: number }>;
  sla_compliance: { total: number; breached: number; compliant: number; compliance_pct: number };
  avg_resolution_hours: number;
  recent_activity: Array<Ticket>;
  daily_trend: Array<{ date: string; count: number }>;
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

export interface Project {
  id: string;
  name: string;
  client_hospital: string;
  location?: string;
  city?: string;
  state?: string;
  project_type?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  budget?: number;
  skills_required?: string;
  team_size?: number;
  assigned_count?: number;
  created_at?: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  consultant_id: string;
  role: string;
  start_date?: string;
  end_date?: string;
  rate_per_day?: number;
  status: string;
  utilization_pct?: number;
  notes?: string;
  consultant_name?: string;
  consultant_department?: string;
  project_name?: string;
  client_hospital?: string;
  project_city?: string;
}

export interface ConsultantMatch {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string;
  skill_categories: string;
  max_proficiency: number;
  current_utilization: number;
  match_score: number;
  match_pct: number;
  available_capacity: number;
}
