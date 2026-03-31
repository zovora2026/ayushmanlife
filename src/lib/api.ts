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
  claims: (params?: Record<string, string>) =>
    fetchAPI<{ claims: PayerClaim[]; summary: PayerClaimsSummary; currency: string }>(`/payer/claims?${new URLSearchParams(params || {})}`),
  fraudAlerts: (params?: Record<string, string>) =>
    fetchAPI<{ alerts: FraudAlertDetail[]; summary: FraudAlertsSummary; by_type: Array<{ alert_type: string; count: number; avg_risk: number }> }>(`/payer/fraud-alerts?${new URLSearchParams(params || {})}`),
  updateFraudAlert: (data: { alert_id: string; status?: string; investigated_by?: string }) =>
    fetchAPI<{ alert: FraudAlert }>('/payer/fraud-alerts', { method: 'PUT', body: JSON.stringify(data) }),
  analytics: () =>
    fetchAPI<PayerAnalytics>('/payer/analytics'),
  irdaiReport: (period?: string) =>
    fetchAPI<IRDAIReport>(`/payer/irdai-report${period ? `?period=${period}` : ''}`),
};

// Fraud Investigation
export const fraud = {
  investigations: (params?: Record<string, string>) =>
    fetchAPI<{ investigations: FraudInvestigation[]; summary: FraudInvestigationSummary }>(`/fraud/investigations?${new URLSearchParams(params || {})}`),
  createInvestigation: (data: { type: 'investigation'; alert_id: string; priority?: string; status?: string; findings?: string; action_taken?: string; recovery_amount?: number }) =>
    fetchAPI<{ investigation: FraudInvestigation }>('/fraud/investigations', { method: 'POST', body: JSON.stringify(data) }),
  addNote: (data: { type: 'note'; investigation_id: string; content: string; note_type?: string }) =>
    fetchAPI<{ note: { id: string } }>('/fraud/investigations', { method: 'POST', body: JSON.stringify(data) }),
  updateInvestigation: (data: { type: 'investigation'; alert_id: string; status?: string; findings?: string; action_taken?: string; recovery_amount?: number }) =>
    fetchAPI<{ investigation: FraudInvestigation }>('/fraud/investigations', { method: 'POST', body: JSON.stringify(data) }),
  analytics: () =>
    fetchAPI<FraudAnalytics>('/fraud/analytics'),
};

// Adjudication
export const adjudication = {
  queue: (params?: Record<string, string>) =>
    fetchAPI<{ claims: AdjudicationQueueClaim[]; queue_stats: AdjudicationQueueStats; by_payer_scheme: Array<{ payer_scheme: string; count: number; total_amount: number }> }>(`/adjudication/queue?${new URLSearchParams(params || {})}`),
  getClaim: (id: string) =>
    fetchAPI<{ claim: AdjudicationClaimDetail; adjudications: AdjudicationDecision[]; timeline: ClaimTimelineEvent[]; fraud_alerts: FraudAlert[]; policy: Policy | null }>(`/adjudication/${id}`),
  adjudicate: (id: string, data: { action: string; amount_approved?: number; remarks: string; rules_applied?: string }) =>
    fetchAPI<{ adjudication: AdjudicationDecision; claim: Claim; message: string }>(`/adjudication/${id}`, { method: 'POST', body: JSON.stringify(data) }),
  rules: (params?: Record<string, string>) =>
    fetchAPI<{ rules: AdjudicationRule[]; summary: AdjudicationRulesSummary }>(`/adjudication/rules?${new URLSearchParams(params || {})}`),
  createRule: (data: Partial<AdjudicationRule>) =>
    fetchAPI<{ rule: AdjudicationRule }>('/adjudication/rules', { method: 'POST', body: JSON.stringify(data) }),
  analytics: () =>
    fetchAPI<AdjudicationAnalytics>('/adjudication/analytics'),
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

// Projects (Client Portal)
export const projects = {
  getDetail: (id: string) =>
    fetchAPI<ProjectDetail>(`/projects/${id}`),
  milestones: (projectId: string) =>
    fetchAPI<{ milestones: ProjectMilestone[]; summary: Record<string, number> }>(`/projects/milestones?project_id=${projectId}`),
  createMilestone: (data: Partial<ProjectMilestone>) =>
    fetchAPI<{ milestone: ProjectMilestone }>('/projects/milestones', { method: 'POST', body: JSON.stringify(data) }),
  documents: (projectId: string) =>
    fetchAPI<{ documents: ProjectDocument[] }>(`/projects/documents?project_id=${projectId}`),
  createDocument: (data: Partial<ProjectDocument>) =>
    fetchAPI<{ document: ProjectDocument }>('/projects/documents', { method: 'POST', body: JSON.stringify(data) }),
  messages: (projectId: string) =>
    fetchAPI<{ messages: ProjectMessage[] }>(`/projects/messages?project_id=${projectId}`),
  sendMessage: (data: { project_id: string; sender_name: string; message: string; sender_role?: string; message_type?: string }) =>
    fetchAPI<{ message: ProjectMessage }>('/projects/messages', { method: 'POST', body: JSON.stringify(data) }),
};

// Testing
export const testing = {
  dashboard: (projectId?: string) =>
    fetchAPI<TestDashboard>(`/testing/dashboard${projectId ? `?project_id=${projectId}` : ''}`),
  suites: (projectId?: string) =>
    fetchAPI<{ suites: TestSuite[]; total: number }>(`/testing/suites${projectId ? `?project_id=${projectId}` : ''}`),
  createSuite: (data: Partial<TestSuite>) =>
    fetchAPI<{ suite: TestSuite }>('/testing/suites', { method: 'POST', body: JSON.stringify(data) }),
  scripts: (params?: Record<string, string>) =>
    fetchAPI<{ scripts: TestScript[]; total: number }>(`/testing/scripts?${new URLSearchParams(params || {})}`),
  createScript: (data: Partial<TestScript>) =>
    fetchAPI<{ script: TestScript }>('/testing/scripts', { method: 'POST', body: JSON.stringify(data) }),
  updateScript: (data: { id: string; status?: string; notes?: string; tester_name?: string }) =>
    fetchAPI<{ script: TestScript }>('/testing/scripts', { method: 'PUT', body: JSON.stringify(data) }),
  defects: (params?: Record<string, string>) =>
    fetchAPI<{ defects: TestDefect[]; total: number }>(`/testing/defects?${new URLSearchParams(params || {})}`),
  createDefect: (data: Partial<TestDefect>) =>
    fetchAPI<{ defect: TestDefect }>('/testing/defects', { method: 'POST', body: JSON.stringify(data) }),
  updateDefect: (data: { id: string; status?: string; severity?: string; resolution?: string; assigned_to?: string }) =>
    fetchAPI<{ defect: TestDefect }>('/testing/defects', { method: 'PUT', body: JSON.stringify(data) }),
};

// Security
export const security = {
  dashboard: () => fetchAPI<SecurityDashboard>('/security/dashboard'),
  incidents: (params?: Record<string, string>) =>
    fetchAPI<{ incidents: SecurityIncident[]; total: number }>(`/security/incidents?${new URLSearchParams(params || {})}`),
  createIncident: (data: Partial<SecurityIncident>) =>
    fetchAPI<{ incident: SecurityIncident }>('/security/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateIncident: (data: { id: string; status?: string; severity?: string; resolution?: string; assigned_to?: string }) =>
    fetchAPI<{ incident: SecurityIncident }>('/security/incidents', { method: 'PUT', body: JSON.stringify(data) }),
  compliance: (framework?: string) =>
    fetchAPI<{ checks: ComplianceCheck[]; total: number; summary: Record<string, { total: number; compliant: number; partial: number; non_compliant: number; score: number }> }>(`/security/compliance${framework ? `?framework=${framework}` : ''}`),
  infrastructure: () =>
    fetchAPI<{ services: InfraService[]; total: number; summary: { by_provider: Record<string, number>; by_status: Record<string, number>; total_monthly_cost: number } }>('/security/infrastructure'),
  costs: () => fetchAPI<CloudCosts>('/security/costs'),
};

// Insurance
export const insurance = {
  products: (scheme?: string) =>
    fetchAPI<{ products: InsuranceProduct[]; total: number; by_scheme: Record<string, number>; by_category: Record<string, number> }>(`/insurance/products${scheme ? `?scheme=${scheme}` : ''}`),
  policies: (params?: Record<string, string>) =>
    fetchAPI<{ policies: InsurancePolicy[]; total: number; summary: { by_status: Record<string, number>; by_scheme: Record<string, number>; total_coverage: number; total_premium: number } }>(`/insurance/policies?${new URLSearchParams(params || {})}`),
  createPolicy: (data: Partial<InsurancePolicy>) =>
    fetchAPI<{ policy: InsurancePolicy }>('/insurance/policies', { method: 'POST', body: JSON.stringify(data) }),
  updatePolicy: (data: { id: string; status?: string; end_date?: string }) =>
    fetchAPI<{ policy: InsurancePolicy }>('/insurance/policies', { method: 'PUT', body: JSON.stringify(data) }),
  endorsements: (params?: Record<string, string>) =>
    fetchAPI<{ endorsements: PolicyEndorsement[]; total: number }>(`/insurance/endorsements?${new URLSearchParams(params || {})}`),
  createEndorsement: (data: Partial<PolicyEndorsement>) =>
    fetchAPI<{ endorsement: PolicyEndorsement }>('/insurance/endorsements', { method: 'POST', body: JSON.stringify(data) }),
  updateEndorsement: (data: { id: string; status: string; approved_by?: string }) =>
    fetchAPI<{ endorsement: PolicyEndorsement }>('/insurance/endorsements', { method: 'PUT', body: JSON.stringify(data) }),
  underwriting: (decision?: string) =>
    fetchAPI<{ requests: UnderwritingRequest[]; total: number; summary: { by_decision: Record<string, number>; by_risk: Record<string, number> } }>(`/insurance/underwriting${decision ? `?decision=${decision}` : ''}`),
  createUnderwriting: (data: Partial<UnderwritingRequest>) =>
    fetchAPI<{ request: UnderwritingRequest }>('/insurance/underwriting', { method: 'POST', body: JSON.stringify(data) }),
  updateUnderwriting: (data: { id: string; decision: string; premium_loading?: number; remarks?: string; underwriter_id?: string }) =>
    fetchAPI<{ request: UnderwritingRequest }>('/insurance/underwriting', { method: 'PUT', body: JSON.stringify(data) }),
};

// Academy
export const academy = {
  paths: () => fetchAPI<{ paths: LearningPath[] }>('/academy/paths'),
  enrollments: (params?: Record<string, string>) =>
    fetchAPI<{ enrollments: Enrollment[]; summary?: EnrollmentSummary }>(`/academy/enrollments?${new URLSearchParams(params || {})}`),
  enroll: (pathId: string, userId?: string) =>
    fetchAPI<{ enrollment: Enrollment }>('/academy/enrollments', { method: 'POST', body: JSON.stringify({ path_id: pathId, staff_id: userId }) }),
  updateProgress: (id: string, progress: number) =>
    fetchAPI<{ enrollment: Enrollment }>(`/academy/enrollments/${id}`, { method: 'PUT', body: JSON.stringify({ progress_percent: progress }) }),
  modules: (params?: Record<string, string>) =>
    fetchAPI<{ modules: LearningModule[]; total: number }>(`/academy/modules?${new URLSearchParams(params || {})}`),
  assessments: (params?: Record<string, string>) =>
    fetchAPI<{ assessments: Assessment[]; total: number; user_submissions?: AssessmentSubmission[] }>(`/academy/assessments?${new URLSearchParams(params || {})}`),
  submitAssessment: (data: { assessment_id: string; user_id: string; answers: number[] }) =>
    fetchAPI<{ submission: AssessmentSubmission; message: string }>('/academy/assessments', { method: 'POST', body: JSON.stringify(data) }),
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

export interface FraudAlertDetail extends FraudAlert {
  evidence?: string;
  investigated_by?: string;
  resolved_at?: string;
  claim_number?: string;
  claimed_amount?: number;
  payer_scheme?: string;
  payer_name?: string;
  diagnosis?: string;
  patient_name?: string;
  investigator_name?: string;
  investigation_id?: string;
  case_number?: string;
  investigation_status?: string;
  investigation_priority?: string;
}

export interface FraudAlertsSummary {
  total_alerts: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  investigating: number;
  confirmed: number;
  resolved: number;
  total_flagged_amount: number;
}

export interface FraudInvestigation {
  id: string;
  alert_id: string;
  investigator_id?: string;
  investigator_name?: string;
  case_number: string;
  status: string;
  priority: string;
  findings?: string;
  evidence_summary?: string;
  recovery_amount: number;
  action_taken?: string;
  opened_at: string;
  closed_at?: string;
  alert_type?: string;
  risk_score?: number;
  claim_number?: string;
  claimed_amount?: number;
  patient_name?: string;
  notes_count?: number;
}

export interface FraudInvestigationSummary {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  total_recovery: number;
}

export interface FraudAnalytics {
  alerts: {
    total_alerts: number;
    avg_risk_score: number;
    open_alerts: number;
    investigating: number;
    confirmed_fraud: number;
    resolved: number;
  };
  investigations: {
    total_investigations: number;
    open_cases: number;
    in_progress: number;
    closed_cases: number;
    total_recovery: number;
    critical_priority: number;
    high_priority: number;
  };
  by_type: Array<{ alert_type: string; count: number; avg_risk: number; total_amount: number }>;
  by_payer_scheme: Array<{ payer_scheme: string; count: number; flagged_amount: number }>;
  monthly_trend: Array<{ month: string; alerts: number; confirmed: number }>;
  risk_distribution: Array<{ risk_band: string; count: number }>;
  currency: string;
}

// Payer Analytics
export interface PayerAnalytics {
  loss_ratio: {
    ytd: number;
    monthly: Array<{ month: string; total_premium: number; total_claims_paid: number; total_lives: number; loss_ratio: number }>;
    by_scheme: Array<{ payer_scheme: string; total_premium: number; total_claims_paid: number; total_lives: number; loss_ratio: number; threshold: number; compliant: boolean }>;
    detailed_monthly: Array<{ month: string; payer_scheme: string; premium_collected: number; claims_paid: number; loss_ratio: number }>;
  };
  portfolio: {
    by_scheme: Array<{ payer_scheme: string; claims_count: number; total_claimed: number; total_approved: number; settled_count: number; avg_claim_amount: number; percentage: number }>;
    by_department: Array<{ department: string; claim_count: number; total_claimed: number; total_approved: number; avg_claim: number }>;
    total_claimed: number;
  };
  high_cost_claimants: Array<{ patient_name: string; scheme: string; claim_count: number; total_claimed: number; total_approved: number; avg_claim: number; last_claim_date: string }>;
  claims_summary: {
    total_claims: number;
    total_claimed: number;
    total_paid: number;
    settled: number;
    rejected: number;
    pending: number;
    settlement_rate: number;
  };
  claims_trend: Array<{ month: string; submitted: number; settled: number; rejected: number; amount_submitted: number; amount_settled: number }>;
  premium_summary: {
    total_premium: number;
    total_lives: number;
    new_policies: number;
    renewals: number;
    cancellations: number;
  };
  tat: {
    avg_days: number;
    min_days: number;
    max_days: number;
    compliance_pct: number;
    threshold_days: number;
  };
  irdai_compliance: {
    loss_ratio: { value: number; threshold: number; warning: number; status: string };
    tat: { value: number; threshold: number; status: string };
    settlement_rate: { value: number; threshold: number; status: string };
  };
  currency: string;
}

export interface IRDAIReport {
  report_type: string;
  period: string;
  generated_at: string;
  currency: string;
  executive_summary: {
    total_premium_collected: number;
    total_claims_incurred: number;
    overall_loss_ratio: number;
    settlement_rate: number;
    total_lives_covered: number;
    unique_claimants: number;
    fraud_cases_detected: number;
    fraud_recovery: number;
  };
  claims_performance: {
    summary: Record<string, number>;
    by_scheme: Array<Record<string, unknown>>;
    rejection_analysis: Array<{ rejection_reason: string; count: number; total_amount: number }>;
  };
  loss_ratio_analysis: {
    overall: number;
    by_scheme: Array<{ payer_scheme: string; premium: number; claims_incurred: number; loss_ratio: number; irdai_threshold: number; compliant: boolean }>;
  };
  turnaround_time: {
    by_scheme: Array<{ payer_scheme: string; resolved_count: number; avg_tat_days: number; within_30_days: number; tat_compliance_pct: number }>;
    irdai_threshold_days: number;
  };
  fraud_detection: {
    alerts: Record<string, number>;
    investigations: Record<string, number>;
  };
  compliance_scorecard: Record<string, { value: number; threshold: number; status: string }>;
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
  status?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  user_name?: string;
  department?: string;
  path_id: string;
  path_title?: string;
  category?: string;
  difficulty?: string;
  total_modules?: number;
  estimated_hours?: number;
  progress_percent: number;
  started_at: string;
  completed_at?: string;
  status: string;
}

export interface EnrollmentSummary {
  total_enrollments: number;
  completed: number;
  in_progress: number;
  not_started: number;
  avg_progress: number;
}

export interface LearningModule {
  id: string;
  path_id: string;
  path_name?: string;
  title: string;
  description?: string;
  content_type: string;
  order_num: number;
  duration_minutes: number;
}

export interface Assessment {
  id: string;
  module_id: string;
  path_id: string;
  title: string;
  path_name?: string;
  module_title?: string;
  passing_score: number;
  time_limit_minutes: number;
  total_attempts?: number;
  passed_count?: number;
}

export interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  user_id?: string;
  score: number;
  passed: boolean | number;
  correct?: number;
  total?: number;
  submitted_at?: string;
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

// Client Portal types
export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  target_date?: string;
  actual_date?: string;
  status: string;
  rag_status: string;
  percentage_complete: number;
  owner?: string;
  created_at?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: string;
  title: string;
  filename?: string;
  description?: string;
  version: string;
  uploaded_by?: string;
  uploader_name?: string;
  status: string;
  created_at?: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id?: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: string;
  created_at?: string;
  read_at?: string;
}

export interface ProjectDetail {
  project: Project & { active_team_size: number };
  team: (ProjectAssignment & { consultant_name?: string; department?: string; email?: string })[];
  milestones_summary: { total: number; completed: number; in_progress: number; not_started: number; red: number; amber: number; green: number; avg_completion: number };
  budget: { budgeted: number; actual_spend: number; projected_total: number; variance: number; burn_rate_pct: number; avg_daily_rate: number };
  documents_count: { total: number; sows: number; status_reports: number };
  recent_messages: ProjectMessage[];
  currency: string;
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

// Adjudication types
export interface PayerClaim extends Claim {
  abha_id?: string;
  adjudication_action?: string;
  adjudication_remarks?: string;
  adjudicated_date?: string;
  adjudicator_name?: string;
  los_days?: number;
}

export interface PayerClaimsSummary {
  total_claims: number;
  total_claimed: number;
  total_approved: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  partially_approved_count?: number;
}

export interface AdjudicationQueueClaim extends Claim {
  days_pending?: number;
  active_fraud_alerts?: number;
  max_fraud_score?: number;
}

export interface AdjudicationQueueStats {
  total_pending: number;
  submitted: number;
  under_review: number;
  pre_auth_pending: number;
  appealed: number;
  total_amount_pending: number;
  avg_days_pending: number;
}

export interface AdjudicationClaimDetail extends Claim {
  age?: number;
  gender?: string;
  insurance_type?: string;
  abha_id?: string;
}

export interface AdjudicationDecision {
  id: string;
  claim_id: string;
  action: string;
  adjudicated_by?: string;
  adjudicator_name?: string;
  amount_approved?: number;
  remarks?: string;
  rules_applied?: string;
  decision_date: string;
}

export interface ClaimTimelineEvent {
  id: string;
  claim_id: string;
  event: string;
  actor?: string;
  detail?: string;
  created_at: string;
}

export interface AdjudicationRule {
  id: string;
  rule_name: string;
  description?: string;
  payer_scheme?: string;
  condition_type: string;
  condition_value: string;
  action: string;
  confidence_threshold: number;
  priority: number;
  enabled: number;
  times_triggered: number;
}

export interface AdjudicationRulesSummary {
  total_rules: number;
  enabled: number;
  total_triggered: number;
  by_action: Record<string, number>;
}

export interface AdjudicationAnalytics {
  overall: {
    total_adjudicated: number;
    approved: number;
    rejected: number;
    partially_approved: number;
    total_approved_amount: number;
    avg_approved_amount: number;
    approval_rate: number;
    auto_adjudication_rate: number;
  };
  pending: {
    total_pending: number;
    pending_amount: number;
    avg_days_in_queue: number;
  };
  by_payer_scheme: Array<{ payer_scheme: string; total: number; approved: number; rejected: number; total_approved_amount: number; approval_rate: number }>;
  monthly_trend: Array<{ month: string; total: number; approved: number; rejected: number; amount_approved: number }>;
  rules_performance: AdjudicationRule[];
  turnaround_time: { avg_tat_days: number; min_tat_days: number; max_tat_days: number };
  recent_adjudications: Array<AdjudicationDecision & { claim_number: string; claimed_amount: number; payer_scheme: string }>;
  currency: string;
}

// EMR Test Management
export interface TestSuite {
  id: string;
  project_id?: string;
  name: string;
  workstream: string;
  description?: string;
  total_scripts: number;
  assigned_to?: string;
  status: string;
  target_date?: string;
  created_at: string;
  passed?: number;
  failed?: number;
  blocked?: number;
  not_run?: number;
  open_defects?: number;
}

export interface TestScript {
  id: string;
  suite_id: string;
  title: string;
  description?: string;
  preconditions?: string;
  steps?: string;
  expected_result?: string;
  assigned_to?: string;
  tester_name?: string;
  status: string;
  priority: string;
  execution_date?: string;
  notes?: string;
  created_at: string;
  suite_name?: string;
  workstream?: string;
  open_defects?: number;
}

export interface TestDefect {
  id: string;
  script_id?: string;
  suite_id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  assigned_to?: string;
  reporter?: string;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  suite_name?: string;
  script_title?: string;
}

export interface TestDashboard {
  summary: {
    total_suites: number;
    total_scripts: number;
    total_defects: number;
    pass_rate: number;
    execution_rate: number;
  };
  script_status: Record<string, number>;
  defect_severity: Record<string, number>;
  defect_status: Record<string, number>;
  suites: TestSuite[];
}

// Cloud & Security
export interface SecurityIncident {
  id: string;
  title: string;
  description?: string;
  severity: string;
  category: string;
  source?: string;
  affected_system?: string;
  status: string;
  assigned_to?: string;
  assigned_to_name?: string;
  resolution?: string;
  detected_at: string;
  resolved_at?: string;
  created_at: string;
}

export interface ComplianceCheck {
  id: string;
  framework: string;
  control_id: string;
  control_name: string;
  description?: string;
  category: string;
  status: string;
  evidence?: string;
  last_checked: string;
  next_review?: string;
  owner?: string;
  notes?: string;
}

export interface InfraService {
  id: string;
  service_name: string;
  provider: string;
  region?: string;
  service_type: string;
  status: string;
  uptime_pct: number;
  cpu_usage?: number;
  memory_usage?: number;
  last_health_check: string;
  monthly_cost: number;
  environment: string;
}

export interface CloudCosts {
  trend: Array<{ month: string; total_cost: number; total_budget: number }>;
  by_provider: Array<{ provider: string; total_cost: number; total_budget: number }>;
  by_category: Array<{ service_category: string; total_cost: number; total_budget: number }>;
  current_month: Array<{ id: string; month: string; provider: string; service_category: string; service_name: string; cost_amount: number; budget_amount: number }>;
  over_budget: Array<{ service_name: string; cost_amount: number; budget_amount: number }>;
  currency: string;
}

export interface SecurityDashboard {
  incidents: {
    total: number;
    by_status: Record<string, number>;
    by_severity: Record<string, number>;
    open_critical: number;
  };
  compliance: {
    score: number;
    total_checks: number;
    compliant: number;
    by_framework: Record<string, Record<string, number>>;
  };
  infrastructure: {
    total_services: number;
    by_status: Record<string, number>;
    avg_uptime: number;
  };
  costs: {
    current_month: number;
    budget: number;
    variance: number;
    trend_pct: number;
    currency: string;
  };
  dr_readiness_score: number;
}

// Insurance Core
export interface InsuranceProduct {
  id: string;
  product_name: string;
  product_code: string;
  scheme: string;
  category: string;
  coverage_amount: number;
  premium_range_min?: number;
  premium_range_max?: number;
  coverage_rules?: string;
  exclusions?: string;
  waiting_period_days: number;
  max_age: number;
  min_age: number;
  co_pay_pct: number;
  room_rent_limit?: number;
  status: string;
}

export interface InsurancePolicy {
  id: string;
  policy_number: string;
  scheme: string;
  provider_name: string;
  holder_name: string;
  holder_id?: string;
  patient_id?: string;
  patient_name?: string;
  coverage_amount?: number;
  premium_amount?: number;
  start_date: string;
  end_date?: string;
  status: string;
  benefits?: string;
  created_at: string;
}

export interface PolicyEndorsement {
  id: string;
  policy_id: string;
  policy_number?: string;
  holder_name?: string;
  scheme?: string;
  endorsement_type: string;
  description: string;
  old_value?: string;
  new_value?: string;
  effective_date: string;
  premium_impact: number;
  status: string;
  approved_by?: string;
  approved_by_name?: string;
  created_at: string;
  approved_at?: string;
}

export interface UnderwritingRequest {
  id: string;
  policy_id?: string;
  policy_number?: string;
  patient_id?: string;
  patient_name?: string;
  patient_age?: number;
  product_id?: string;
  product_name?: string;
  product_scheme?: string;
  product_coverage?: number;
  request_type: string;
  risk_category: string;
  risk_score?: number;
  medical_history?: string;
  pre_existing_conditions?: string;
  bmi?: number;
  smoker: number;
  decision: string;
  premium_loading: number;
  remarks?: string;
  underwriter_id?: string;
  underwriter_name?: string;
  created_at: string;
  decided_at?: string;
}

// Enhancement Governance
export const governance = {
  getDashboard: () => fetchAPI<GovernanceDashboard>('/governance/dashboard'),
  getRequests: (params?: { status?: string; department?: string; type?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.department) sp.set('department', params.department);
    if (params?.type) sp.set('type', params.type);
    const qs = sp.toString();
    return fetchAPI<{ requests: EnhancementRequest[]; total: number }>(`/governance/requests${qs ? `?${qs}` : ''}`);
  },
  createRequest: (data: { title: string; description?: string; department: string; requested_by?: string; requester_name?: string; request_type?: string; emr_module?: string; clinical_impact?: number; operational_impact?: number; regulatory_impact?: number; effort_estimate?: string; effort_hours?: number }) =>
    fetchAPI<{ request: EnhancementRequest }>('/governance/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequest: (data: { id: string; title?: string; description?: string; status?: string; assigned_to?: string; assignee_name?: string; sprint?: string; target_date?: string; priority_score?: number; effort_estimate?: string; effort_hours?: number; clinical_impact?: number; operational_impact?: number; regulatory_impact?: number; category?: string }) =>
    fetchAPI<{ request: EnhancementRequest }>('/governance/requests', { method: 'PUT', body: JSON.stringify(data) }),
  getReviews: (params?: { request_id?: string; committee?: string; decision?: string }) => {
    const sp = new URLSearchParams();
    if (params?.request_id) sp.set('request_id', params.request_id);
    if (params?.committee) sp.set('committee', params.committee);
    if (params?.decision) sp.set('decision', params.decision);
    const qs = sp.toString();
    return fetchAPI<{ reviews: GovernanceReview[]; total: number; by_committee: Record<string, { total: number; approved: number; pending: number; deferred: number }> }>(`/governance/reviews${qs ? `?${qs}` : ''}`);
  },
  createReview: (data: { request_id: string; committee: string; reviewer_id?: string; reviewer_name?: string; decision: string; priority_override?: number; comments?: string; meeting_date?: string }) =>
    fetchAPI<{ review: GovernanceReview }>('/governance/reviews', { method: 'POST', body: JSON.stringify(data) }),
}

export interface GovernanceDashboard {
  total: number;
  completed: number;
  avg_priority_score: number;
  total_effort_hours: number;
  by_status: Record<string, number>;
  by_department: Record<string, number>;
  by_type: Record<string, number>;
  by_module: Record<string, number>;
  backlog_aging: { id: string; title: string; status: string; priority_score: number; age_days: number }[];
  sprints: { sprint: string; count: number; completed: number; total_hours: number }[];
  review_summary: Record<string, number>;
}

export interface EnhancementRequest {
  id: string;
  title: string;
  description?: string;
  department: string;
  requested_by?: string;
  requester_name?: string;
  request_type: string;
  emr_module?: string;
  priority_score: number;
  clinical_impact: number;
  operational_impact: number;
  regulatory_impact: number;
  effort_estimate?: string;
  effort_hours?: number;
  status: string;
  assigned_to?: string;
  assignee_name?: string;
  sprint?: string;
  target_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  review_count?: number;
  approved_count?: number;
}

export interface GovernanceReview {
  id: string;
  request_id: string;
  request_title?: string;
  department?: string;
  request_status?: string;
  request_priority?: number;
  committee: string;
  reviewer_id?: string;
  reviewer_name?: string;
  decision: string;
  priority_override?: number;
  comments?: string;
  meeting_date?: string;
  created_at: string;
}

// Change Management
export const changes = {
  getDashboard: () => fetchAPI<ChangeDashboard>('/changes/dashboard'),
  getRequests: (params?: { status?: string; risk_level?: string; change_type?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.risk_level) sp.set('risk_level', params.risk_level);
    if (params?.change_type) sp.set('change_type', params.change_type);
    const qs = sp.toString();
    return fetchAPI<{ changes: ChangeRequest[]; total: number }>(`/changes/requests${qs ? `?${qs}` : ''}`);
  },
  createRequest: (data: { title: string; description?: string; change_type?: string; category?: string; emr_system?: string; environment?: string; risk_level?: string; impact_assessment?: string; rollback_plan?: string; testing_plan?: string; requested_by?: string; requester_name?: string; scheduled_date?: string; cab_required?: number }) =>
    fetchAPI<{ change: ChangeRequest }>('/changes/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequest: (data: { id: string; title?: string; description?: string; status?: string; assigned_to?: string; assignee_name?: string; scheduled_date?: string; implementation_notes?: string; risk_level?: string; cab_meeting_id?: string; impact_assessment?: string; rollback_plan?: string; testing_plan?: string; category?: string }) =>
    fetchAPI<{ change: ChangeRequest }>('/changes/requests', { method: 'PUT', body: JSON.stringify(data) }),
  getCab: (meetingId?: string) => {
    const qs = meetingId ? `?meeting_id=${meetingId}` : '';
    return fetchAPI<{ meetings?: CabMeeting[]; meeting?: CabMeeting; decisions?: CabDecision[]; total?: number }>(`/changes/cab${qs}`);
  },
  createMeeting: (data: { meeting_date: string; meeting_type?: string; chair_name?: string; agenda?: string; attendees?: string }) =>
    fetchAPI<{ meeting: CabMeeting }>('/changes/cab', { method: 'POST', body: JSON.stringify({ type: 'meeting', ...data }) }),
  createDecision: (data: { meeting_id: string; change_id: string; decision: string; conditions?: string; risk_accepted?: number; voter_summary?: string }) =>
    fetchAPI<{ decision: CabDecision }>('/changes/cab', { method: 'POST', body: JSON.stringify({ type: 'decision', ...data }) }),
}

export interface ChangeDashboard {
  total: number;
  implemented: number;
  emergency_count: number;
  incident_count: number;
  success_rate: number;
  by_status: Record<string, number>;
  by_risk: Record<string, number>;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
  upcoming: { id: string; title: string; risk_level: string; risk_score: number; scheduled_date: string; change_type: string; status: string }[];
  cab_summary: Record<string, number>;
  recent_implementations: { id: string; title: string; risk_level: string; implemented_at: string; implementation_notes: string }[];
}

export interface ChangeRequest {
  id: string;
  title: string;
  description?: string;
  change_type: string;
  category?: string;
  emr_system?: string;
  environment: string;
  risk_level: string;
  risk_score: number;
  impact_assessment?: string;
  rollback_plan?: string;
  testing_plan?: string;
  requested_by?: string;
  requester_name?: string;
  assigned_to?: string;
  assignee_name?: string;
  status: string;
  scheduled_date?: string;
  implemented_at?: string;
  implementation_notes?: string;
  cab_required: number;
  cab_meeting_id?: string;
  created_at: string;
  updated_at: string;
  cab_review_count?: number;
  cab_decision?: string;
}

export interface CabMeeting {
  id: string;
  meeting_date: string;
  meeting_type: string;
  chair_id?: string;
  chair_name?: string;
  status: string;
  agenda?: string;
  minutes?: string;
  attendees?: string;
  created_at: string;
  decision_count?: number;
  approved_count?: number;
}

export interface CabDecision {
  id: string;
  meeting_id: string;
  change_id: string;
  change_title?: string;
  risk_level?: string;
  risk_score?: number;
  change_type?: string;
  decision: string;
  conditions?: string;
  risk_accepted: number;
  voter_summary?: string;
  created_at: string;
}
