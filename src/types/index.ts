export interface Patient {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  email: string
  address: string
  city: string
  state: string
  insuranceType: string
  insuranceId: string
  conditions: string[]
  medications: string[]
  allergies: string[]
  bloodGroup: string
  lastVisit: string
  nextAppointment: string
  riskScore: number
  satisfactionScore: number
  vitals: Vitals
}

export interface Vitals {
  bp: string
  heartRate: number
  spO2: number
  bloodGlucose: number
  temperature: number
  weight: number
}

export interface Claim {
  id: string
  patientId: string
  patientName: string
  department: string
  diagnosis: string
  icdCodes: string[]
  cptCodes: string[]
  amount: number
  payer: string
  status: ClaimStatus
  submittedDate: string
  lastUpdated: string
  assignedTo: string
  preAuthProbability: number
  completenessScore: number
  rejectionReason?: string
}

export type ClaimStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid'

export interface Staff {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  joinDate: string
  certifications: Certification[]
  skills: SkillRating[]
  shift: string
  status: 'Active' | 'On Leave' | 'Training'
  avatar?: string
}

export interface Certification {
  name: string
  issuer: string
  expiryDate: string
  status: 'Active' | 'Expiring' | 'Expired'
  verified: boolean
}

export interface SkillRating {
  skill: string
  level: number // 1-5
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  department: string
  date: string
  time: string
  type: 'Consultation' | 'Follow-up' | 'Procedure' | 'Lab Test'
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show'
}

export interface Ticket {
  id: string
  title: string
  description: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  assignee: string
  createdDate: string
  slaDeadline: string
  category: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type?: 'text' | 'appointment' | 'medication' | 'health-tip' | 'vitals'
  data?: Record<string, unknown>
}

export interface Policy {
  id: string
  policyNumber: string
  scheme: string
  beneficiaryName: string
  status: 'Active' | 'Expired' | 'Lapsed' | 'Pending'
  startDate: string
  endDate: string
  sumInsured: number
  premium: number
  claimsCount: number
}

export interface FraudAlert {
  id: string
  claimId: string
  riskScore: number
  anomalyType: string
  provider: string
  amount: number
  status: 'Under Investigation' | 'Confirmed' | 'Cleared'
  detectedDate: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  modules: number
  completedModules: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  enrolledCount: number
  category: string
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorRole: string
  date: string
  readTime: string
  category: string
  tags: string[]
}

export interface CaseStudy {
  slug: string
  title: string
  clientType: string
  challenge: string
  solution: string
  results: string[]
  metrics: { label: string; value: string }[]
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  hospital: string
  avatar?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: string
}

export interface ActivityItem {
  id: string
  action: string
  subject: string
  timestamp: string
  type: 'claim' | 'patient' | 'appointment' | 'system' | 'alert'
}
