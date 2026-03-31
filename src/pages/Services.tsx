import { useState, useEffect, useMemo } from 'react'
import {
  ListTodo,
  BarChart3,
  BookOpen,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Loader2,
  ShieldCheck,
  Activity,
  Server,
  Link2,
  Zap,
  HeartPulse,
  CircleDot,
  RefreshCw,
  Bot,
  Tag,
  CheckCircle,
  Workflow,
  Monitor,
  Stethoscope,
  UserCheck,
  GitPullRequest,
  Package,
  Database,
  Award,
} from 'lucide-react'
import { cn, formatDate } from '../lib/utils'
import { tickets as ticketsAPI } from '../lib/api'
import type { Ticket, KBArticle, TicketAnalytics } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { Table } from '../components/ui/Table'
import { Input } from '../components/ui/Input'

// ── Inline mock ticket data ────────────────────────────────────────────────────

interface TicketData {
  id: string
  title: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  assignee: string
  createdDate: string
  slaDeadline: string
  category: string
}

type TicketFilter = 'All' | TicketData['status']

const DEFAULT_TICKETS: TicketData[] = [
  {
    id: 'TKT-001',
    title: 'EMR system slow during peak hours',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Amit Verma',
    createdDate: '2026-03-27T09:30:00',
    slaDeadline: '2026-03-28T13:15:00',
    category: 'EMR/EHR',
  },
  {
    id: 'TKT-002',
    title: 'ServiceNow dashboard widget not loading',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Priya Sharma',
    createdDate: '2026-03-26T14:15:00',
    slaDeadline: '2026-03-29T14:15:00',
    category: 'ServiceNow',
  },
  {
    id: 'TKT-003',
    title: 'VPN connectivity drops intermittently',
    priority: 'High',
    status: 'Open',
    assignee: 'Raj Patel',
    createdDate: '2026-03-26T11:00:00',
    slaDeadline: '2026-03-29T11:00:00',
    category: 'Infrastructure',
  },
  {
    id: 'TKT-004',
    title: 'Patient data export failing for large datasets',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Sneha Gupta',
    createdDate: '2026-03-25T16:45:00',
    slaDeadline: '2026-03-30T16:45:00',
    category: 'EMR/EHR',
  },
  {
    id: 'TKT-005',
    title: 'New user account provisioning request',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Arjun Reddy',
    createdDate: '2026-03-25T08:00:00',
    slaDeadline: '2026-03-31T08:00:00',
    category: 'General',
  },
  {
    id: 'TKT-006',
    title: 'Data backup failure alert',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Deepak Chauhan',
    createdDate: '2026-03-27T06:00:00',
    slaDeadline: '2026-03-28T10:00:00',
    category: 'Infrastructure',
  },
  {
    id: 'TKT-007',
    title: 'SSL certificate expiring in 7 days',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Kavita Nair',
    createdDate: '2026-03-24T10:30:00',
    slaDeadline: '2026-03-29T10:30:00',
    category: 'Security',
  },
  {
    id: 'TKT-008',
    title: 'Printer not responding on 3rd floor nursing station',
    priority: 'Medium',
    status: 'Closed',
    assignee: 'Suresh Kumar',
    createdDate: '2026-03-22T13:20:00',
    slaDeadline: '2026-03-25T13:20:00',
    category: 'Infrastructure',
  },
  {
    id: 'TKT-009',
    title: 'Claims portal session timeout too short',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Neha Singh',
    createdDate: '2026-03-23T09:15:00',
    slaDeadline: '2026-03-28T09:15:00',
    category: 'EMR/EHR',
  },
  {
    id: 'TKT-010',
    title: 'Request for additional monitor for billing desk',
    priority: 'Low',
    status: 'Closed',
    assignee: 'Vikram Joshi',
    createdDate: '2026-03-20T11:45:00',
    slaDeadline: '2026-03-27T11:45:00',
    category: 'General',
  },
]

// ── Static configuration ───────────────────────────────────────────────────────

const TABS = [
  { id: 'tickets', label: 'Ticket List', icon: <ListTodo className="h-4 w-4" /> },
  { id: 'sla', label: 'SLA Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'kb', label: 'Knowledge Base', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'insurance-ops', label: 'Insurance Operations', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'servicenow', label: 'ServiceNow', icon: <Workflow className="h-4 w-4" /> },
]

const FILTER_OPTIONS: TicketFilter[] = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']

const PRIORITY_DISTRIBUTION = [
  { label: 'Critical', count: 2, color: 'bg-error', textColor: 'text-error' },
  { label: 'High', count: 5, color: 'bg-warning', textColor: 'text-warning' },
  { label: 'Medium', count: 3, color: 'bg-accent', textColor: 'text-accent' },
  { label: 'Low', count: 2, color: 'bg-gray-400 dark:bg-gray-500', textColor: 'text-gray-500 dark:text-gray-400' },
]

const BREACHED_TICKETS = [
  {
    id: 'TKT-001',
    title: 'EMR system slow during peak hours',
    priority: 'Critical',
    assignee: 'Amit Verma',
    slaDeadline: '2026-03-28T13:15:00',
    breachDuration: '2h 45m',
  },
  {
    id: 'TKT-006',
    title: 'Data backup failure alert',
    priority: 'Critical',
    assignee: 'Deepak Chauhan',
    slaDeadline: '2026-03-28T10:00:00',
    breachDuration: '5h 12m',
  },
]

const KB_CATEGORIES = [
  { name: 'EMR/EHR', count: 12, icon: <FileText className="h-5 w-5" /> },
  { name: 'ServiceNow', count: 8, icon: <ListTodo className="h-5 w-5" /> },
  { name: 'Infrastructure', count: 15, icon: <BarChart3 className="h-5 w-5" /> },
  { name: 'Security', count: 6, icon: <AlertTriangle className="h-5 w-5" /> },
  { name: 'General', count: 20, icon: <BookOpen className="h-5 w-5" /> },
]

const KB_ARTICLES = [
  { id: 1, title: 'How to Reset EMR Password', category: 'EMR/EHR', description: 'Step-by-step guide for resetting your EMR system password via LDAP or self-service portal.', updated: '2026-03-25', views: 342 },
  { id: 2, title: 'ServiceNow Incident Creation Guide', category: 'ServiceNow', description: 'Complete walkthrough for creating, categorizing, and assigning incidents in ServiceNow.', updated: '2026-03-22', views: 287 },
  { id: 3, title: 'VPN Setup for Remote Access', category: 'Infrastructure', description: 'Configure FortiClient VPN for secure remote access to hospital network resources.', updated: '2026-03-20', views: 521 },
  { id: 4, title: 'Patient Data Security Best Practices', category: 'Security', description: 'Guidelines for handling PHI data in compliance with DISHA and HIPAA regulations.', updated: '2026-03-18', views: 198 },
  { id: 5, title: 'PACS Image Upload Troubleshooting', category: 'EMR/EHR', description: 'Common DICOM errors and resolution steps for PACS image upload failures.', updated: '2026-03-15', views: 164 },
  { id: 6, title: 'Change Request Workflow in ITSM', category: 'ServiceNow', description: 'End-to-end change management process including CAB approval steps.', updated: '2026-03-12', views: 245 },
  { id: 7, title: 'Network Printer Configuration', category: 'Infrastructure', description: 'Adding and configuring network printers across hospital wings and departments.', updated: '2026-03-10', views: 412 },
  { id: 8, title: 'New Employee IT Onboarding Checklist', category: 'General', description: 'Complete checklist for IT account provisioning, access setup, and device issuance.', updated: '2026-03-08', views: 589 },
]

// ── AI Triage Data ───────────────────────────────────────────────────────────

interface AITriageAction {
  ticketId: string
  description: string
  type: 'auto-resolve' | 'classify' | 'escalate'
  timeAgo: string
}

const AI_TRIAGE_ACTIONS: AITriageAction[] = [
  {
    ticketId: 'TKT-2026-0089',
    description: 'Auto-classified as P3 (Network Latency) \u2192 Assigned to Infra Team',
    type: 'classify',
    timeAgo: '2 min ago',
  },
  {
    ticketId: 'TKT-2026-0088',
    description: 'Auto-resolved via KB Article #247 (Password Reset)',
    type: 'auto-resolve',
    timeAgo: '5 min ago',
  },
  {
    ticketId: 'TKT-2026-0087',
    description: 'Escalated to P1 (EMR System Down) \u2192 Paged On-Call Engineer',
    type: 'escalate',
    timeAgo: '8 min ago',
  },
  {
    ticketId: 'TKT-2026-0086',
    description: 'Auto-classified as P4 (Report Request) \u2192 Queued',
    type: 'classify',
    timeAgo: '12 min ago',
  },
  {
    ticketId: 'TKT-2026-0085',
    description: 'Auto-resolved via KB Article #189 (VPN Setup)',
    type: 'auto-resolve',
    timeAgo: '15 min ago',
  },
]

function getTriageIcon(type: AITriageAction['type']) {
  switch (type) {
    case 'auto-resolve':
      return <CheckCircle className="h-4 w-4 text-success" />
    case 'classify':
      return <Tag className="h-4 w-4 text-accent" />
    case 'escalate':
      return <AlertTriangle className="h-4 w-4 text-error" />
  }
}

// ── Insurance Operations Data ─────────────────────────────────────────────────

interface InsuranceTicket {
  ticketId: string
  type: string
  payer: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  slaStatus: 'On Track' | 'At Risk' | 'Breached'
  assignedTo: string
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved'
}

const INSURANCE_TICKETS: InsuranceTicket[] = [
  {
    ticketId: 'INS-2401',
    type: 'Claim Rejection Review',
    payer: 'Star Health',
    priority: 'Critical',
    slaStatus: 'Breached',
    assignedTo: 'Dr. Meena Iyer',
    status: 'Escalated',
  },
  {
    ticketId: 'INS-2402',
    type: 'Pre-Auth Escalation',
    payer: 'ICICI Lombard',
    priority: 'High',
    slaStatus: 'At Risk',
    assignedTo: 'Rajesh Nair',
    status: 'In Progress',
  },
  {
    ticketId: 'INS-2403',
    type: 'Policy System Error',
    payer: 'HDFC ERGO',
    priority: 'Critical',
    slaStatus: 'On Track',
    assignedTo: 'Amit Verma',
    status: 'Open',
  },
  {
    ticketId: 'INS-2404',
    type: 'Payer Integration Alert',
    payer: 'Bajaj Allianz',
    priority: 'High',
    slaStatus: 'On Track',
    assignedTo: 'Priya Sharma',
    status: 'In Progress',
  },
  {
    ticketId: 'INS-2405',
    type: 'TPA Reconciliation',
    payer: 'Medi Assist',
    priority: 'Medium',
    slaStatus: 'On Track',
    assignedTo: 'Suresh Kumar',
    status: 'Open',
  },
  {
    ticketId: 'INS-2406',
    type: 'IRDAI Compliance Issue',
    payer: 'National Insurance',
    priority: 'High',
    slaStatus: 'At Risk',
    assignedTo: 'Kavita Nair',
    status: 'In Progress',
  },
  {
    ticketId: 'INS-2407',
    type: 'Fraud Alert Triage',
    payer: 'New India Assurance',
    priority: 'Critical',
    slaStatus: 'On Track',
    assignedTo: 'Deepak Chauhan',
    status: 'Open',
  },
  {
    ticketId: 'INS-2408',
    type: 'Cashless Authorization',
    payer: 'Care Health',
    priority: 'Low',
    slaStatus: 'On Track',
    assignedTo: 'Neha Singh',
    status: 'Resolved',
  },
]

interface SystemHealth {
  name: string
  status: 'Healthy' | 'Degraded' | 'Down'
  uptime: string
  lastChecked: string
  note?: string
}

const INSURANCE_SYSTEMS: SystemHealth[] = [
  { name: 'Core Policy Admin System', status: 'Healthy', uptime: '99.98%', lastChecked: '2026-03-30T14:55:00' },
  { name: 'Claims Adjudication Engine', status: 'Healthy', uptime: '99.95%', lastChecked: '2026-03-30T14:54:00' },
  { name: 'Pre-Authorization Module', status: 'Degraded', uptime: '98.70%', lastChecked: '2026-03-30T14:53:00', note: 'High latency detected' },
  { name: 'IRDAI Reporting System', status: 'Healthy', uptime: '99.99%', lastChecked: '2026-03-30T14:52:00' },
  { name: 'Fraud Detection Engine', status: 'Healthy', uptime: '99.92%', lastChecked: '2026-03-30T14:51:00' },
  { name: 'Payer Gateway', status: 'Healthy', uptime: '99.90%', lastChecked: '2026-03-30T14:50:00' },
]

interface AutomatedWorkflow {
  name: string
  triggeredToday: number
  lastRun: string
  status: 'Active'
}

const INSURANCE_WORKFLOWS: AutomatedWorkflow[] = [
  { name: 'Auto-Acknowledge Claim Submissions', triggeredToday: 2847, lastRun: '2026-03-30T14:48:00', status: 'Active' },
  { name: 'SLA Breach Escalation for Pre-Auth', triggeredToday: 12, lastRun: '2026-03-30T14:32:00', status: 'Active' },
  { name: 'Duplicate Claim Detection Alert', triggeredToday: 34, lastRun: '2026-03-30T14:15:00', status: 'Active' },
  { name: 'IRDAI Monthly Report Generation', triggeredToday: 1, lastRun: '2026-03-30T06:00:00', status: 'Active' },
  { name: 'Payer Reconciliation Batch', triggeredToday: 6, lastRun: '2026-03-30T13:00:00', status: 'Active' },
]

// ── ServiceNow Healthcare Workflows Data ──────────────────────────────────────

interface ServiceNowModule {
  name: string
  icon: React.ReactNode
  metric1Label: string
  metric1Value: string
  metric2Label: string
  metric2Value: string
}

const SERVICENOW_MODULES: ServiceNowModule[] = [
  {
    name: 'IT Service Management (ITSM)',
    icon: <Monitor className="h-5 w-5" />,
    metric1Label: 'Open Incidents',
    metric1Value: '847',
    metric2Label: 'SLA Compliance',
    metric2Value: '99.2%',
  },
  {
    name: 'Clinical Device Management',
    icon: <Stethoscope className="h-5 w-5" />,
    metric1Label: 'Devices Tracked',
    metric1Value: '2,340',
    metric2Label: 'Maintenance Due',
    metric2Value: '12',
  },
  {
    name: 'Provider Credentialing',
    icon: <UserCheck className="h-5 w-5" />,
    metric1Label: 'Active Providers',
    metric1Value: '186',
    metric2Label: 'Renewals Due',
    metric2Value: '8',
  },
  {
    name: 'Change Management',
    icon: <GitPullRequest className="h-5 w-5" />,
    metric1Label: 'Active Changes',
    metric1Value: '23',
    metric2Label: 'CAB Approvals Pending',
    metric2Value: '3',
  },
  {
    name: 'Asset Management',
    icon: <Package className="h-5 w-5" />,
    metric1Label: 'Total Assets',
    metric1Value: '4,512',
    metric2Label: 'Total Value',
    metric2Value: '\u20B912.4 Cr',
  },
  {
    name: 'CMDB Healthcare',
    icon: <Database className="h-5 w-5" />,
    metric1Label: 'CIs Mapped',
    metric1Value: '1,847',
    metric2Label: 'Accuracy',
    metric2Value: '98.5%',
  },
]

interface ServiceNowActivity {
  ticketId: string
  module: string
  description: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  assignedTo: string
  status: 'In Progress' | 'Open' | 'Resolved' | 'Pending CAB'
}

const SERVICENOW_ACTIVITY: ServiceNowActivity[] = [
  {
    ticketId: 'INC0012847',
    module: 'ITSM',
    description: 'Network latency in ICU wing B',
    priority: 'P2',
    assignedTo: 'Infra Team',
    status: 'In Progress',
  },
  {
    ticketId: 'INC0012846',
    module: 'Clinical Device Mgmt',
    description: 'MRI scanner firmware update required',
    priority: 'P3',
    assignedTo: 'BioMed Team',
    status: 'Open',
  },
  {
    ticketId: 'CHG0004521',
    module: 'Change Management',
    description: 'EMR database migration to v12.3',
    priority: 'P1',
    assignedTo: 'DB Admin Team',
    status: 'Pending CAB',
  },
  {
    ticketId: 'CRED-00892',
    module: 'Provider Credentialing',
    description: 'Dr. Ananya Rao - license renewal verification',
    priority: 'P3',
    assignedTo: 'Credentialing Ops',
    status: 'In Progress',
  },
  {
    ticketId: 'INC0012845',
    module: 'ITSM',
    description: 'Pharmacy module timeout during shift change',
    priority: 'P2',
    assignedTo: 'App Support Team',
    status: 'Resolved',
  },
]

function getSnPriorityVariant(priority: string): 'error' | 'warning' | 'info' | 'neutral' {
  switch (priority) {
    case 'P1': return 'error'
    case 'P2': return 'warning'
    case 'P3': return 'info'
    default: return 'neutral'
  }
}

function getSnStatusVariant(status: string): 'error' | 'warning' | 'success' | 'info' | 'neutral' {
  switch (status) {
    case 'Open': return 'info'
    case 'In Progress': return 'warning'
    case 'Resolved': return 'success'
    case 'Pending CAB': return 'neutral'
    default: return 'info'
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function getPriorityVariant(priority: string): 'error' | 'warning' | 'info' | 'neutral' {
  switch (priority) {
    case 'Critical': return 'error'
    case 'High': return 'warning'
    case 'Medium': return 'info'
    default: return 'neutral'
  }
}

function getStatusVariant(status: string): 'error' | 'warning' | 'success' | 'info' | 'neutral' {
  switch (status) {
    case 'Open': return 'error'
    case 'In Progress': return 'warning'
    case 'Resolved': return 'success'
    case 'Closed': return 'neutral'
    default: return 'info'
  }
}

function getSlaTimer(deadline: string): { text: string; overdue: boolean } {
  const now = new Date()
  const sla = new Date(deadline)
  const diff = sla.getTime() - now.getTime()
  if (diff <= 0) return { text: 'OVERDUE', overdue: true }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return { text: `${hours}h ${minutes}m`, overdue: false }
}

function getInsSlaVariant(sla: string): 'success' | 'warning' | 'error' {
  switch (sla) {
    case 'On Track': return 'success'
    case 'At Risk': return 'warning'
    case 'Breached': return 'error'
    default: return 'success'
  }
}

function getInsStatusVariant(status: string): 'error' | 'warning' | 'success' | 'info' {
  switch (status) {
    case 'Open': return 'info'
    case 'In Progress': return 'warning'
    case 'Escalated': return 'error'
    case 'Resolved': return 'success'
    default: return 'info'
  }
}

function getSystemStatusColor(status: string): string {
  switch (status) {
    case 'Healthy': return 'bg-success'
    case 'Degraded': return 'bg-warning'
    case 'Down': return 'bg-error'
    default: return 'bg-gray-400 dark:bg-gray-500'
  }
}

function getSystemStatusTextColor(status: string): string {
  switch (status) {
    case 'Healthy': return 'text-success'
    case 'Degraded': return 'text-warning'
    case 'Down': return 'text-error'
    default: return 'text-gray-500 dark:text-gray-400'
  }
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Component ──────────────────────────────────────────────────────────────────

// AI Triage: auto-categorize tickets based on keywords
function triageTicket(title: string, description: string): { priority: string; category: string; action: string } {
  const text = `${title} ${description}`.toLowerCase()
  // Escalation keywords
  if (text.includes('down') || text.includes('critical') || text.includes('emergency') || text.includes('outage')) {
    return { priority: 'critical', category: 'Infrastructure', action: 'escalate' }
  }
  if (text.includes('emr') || text.includes('ehr') || text.includes('patient data') || text.includes('claims')) {
    return { priority: 'high', category: 'EMR/EHR', action: 'classify' }
  }
  if (text.includes('password') || text.includes('reset') || text.includes('login') || text.includes('access')) {
    return { priority: 'low', category: 'General', action: 'auto-resolve' }
  }
  if (text.includes('network') || text.includes('vpn') || text.includes('latency') || text.includes('slow')) {
    return { priority: 'medium', category: 'Infrastructure', action: 'classify' }
  }
  if (text.includes('ssl') || text.includes('security') || text.includes('breach') || text.includes('vulnerability')) {
    return { priority: 'high', category: 'Security', action: 'escalate' }
  }
  if (text.includes('printer') || text.includes('monitor') || text.includes('hardware')) {
    return { priority: 'low', category: 'Infrastructure', action: 'classify' }
  }
  if (text.includes('servicenow') || text.includes('itsm') || text.includes('workflow')) {
    return { priority: 'medium', category: 'ServiceNow', action: 'classify' }
  }
  return { priority: 'medium', category: 'General', action: 'classify' }
}

export default function Services() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('All')
  const [kbSearch, setKbSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [ticketData, setTicketData] = useState<TicketData[]>(DEFAULT_TICKETS)

  // Real D1-computed metrics
  const [rawTickets, setRawTickets] = useState<Ticket[]>([])
  const [slaCompliance, setSlaCompliance] = useState(94.2)
  const [avgResolutionHrs, setAvgResolutionHrs] = useState(4.2)
  const [openTicketCount, setOpenTicketCount] = useState(8)
  const [breachCount, setBreachCount] = useState(2)
  const [d1PriorityDist, setD1PriorityDist] = useState(PRIORITY_DISTRIBUTION)
  const [d1TriageActions, setD1TriageActions] = useState(AI_TRIAGE_ACTIONS)
  const [d1TriageStats, setD1TriageStats] = useState({ total: 847, accuracy: 96.4, autoResolved: 34 })
  const [d1BreachedTickets, setD1BreachedTickets] = useState(BREACHED_TICKETS)
  const [d1ServiceNowModules, setD1ServiceNowModules] = useState(SERVICENOW_MODULES)

  // Insurance Operations D1-derived metrics
  const [insTicketCount, setInsTicketCount] = useState(0)
  const [insOpenCount, setInsOpenCount] = useState(0)
  const [insSlaCompliance, setInsSlaCompliance] = useState(92.5)
  const [insBreachCount, setInsBreachCount] = useState(0)
  const [insCategoryBreakdown, setInsCategoryBreakdown] = useState<{ category: string; count: number; color: string }[]>([])

  // Knowledge Base from D1
  const [kbArticles, setKbArticles] = useState<KBArticle[]>([])
  const [kbCategories, setKbCategories] = useState<Array<{ category: string; count: number }>>([])
  const [kbSelectedCategory, setKbSelectedCategory] = useState<string>('')

  // Ticket creation form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'it_support', priority: 'medium' })
  const [creating, setCreating] = useState(false)

  // Create ticket handler
  async function handleCreateTicket() {
    if (!newTicket.title || !newTicket.description) return
    setCreating(true)
    try {
      const triage = triageTicket(newTicket.title, newTicket.description)
      await ticketsAPI.create({
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category || triage.category,
        priority: newTicket.priority || triage.priority,
      })
      setNewTicket({ title: '', description: '', category: 'it_support', priority: 'medium' })
      setShowCreateForm(false)
      // Reload tickets
      const res = await ticketsAPI.list()
      if (res?.tickets?.length) {
        setRawTickets(res.tickets)
        setTicketData(res.tickets.map((t: Ticket) => ({
          id: t.ticket_number || t.id,
          title: t.title,
          priority: (t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1)) as TicketData['priority'],
          status: (t.status === 'in-progress' ? 'In Progress'
            : t.status === 'open' ? 'Open'
            : t.status === 'resolved' ? 'Resolved'
            : t.status === 'closed' ? 'Closed'
            : t.status === 'escalated' ? 'Open'
            : t.status?.charAt(0).toUpperCase() + t.status?.slice(1)) as TicketData['status'],
          assignee: (t as any).assigned_to_name || t.assigned_to || '',
          createdDate: t.created_at ?? '',
          slaDeadline: t.created_at && t.sla_hours
            ? new Date(new Date(t.created_at).getTime() + (t.sla_hours * 3600000)).toISOString()
            : t.created_at ?? '',
          category: t.category,
        })))
      }
    } catch { /* keep existing */ }
    setCreating(false)
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // Load tickets, KB, and analytics in parallel
        const [res, kbRes] = await Promise.all([
          ticketsAPI.list(),
          ticketsAPI.kb(kbSelectedCategory ? { category: kbSelectedCategory } : {}),
        ])
        if (mounted && kbRes) {
          setKbArticles(kbRes.articles || [])
          setKbCategories(kbRes.categories || [])
        }
        if (mounted && res?.tickets?.length) {
          const tickets = res.tickets
          setRawTickets(tickets)

          setTicketData(tickets.map((t: Ticket) => ({
            id: t.ticket_number || t.id,
            title: t.title,
            priority: (t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1)) as TicketData['priority'],
            status: (t.status === 'in-progress' ? 'In Progress'
              : t.status === 'open' ? 'Open'
              : t.status === 'resolved' ? 'Resolved'
              : t.status === 'closed' ? 'Closed'
              : t.status === 'escalated' ? 'Open'
              : t.status?.charAt(0).toUpperCase() + t.status?.slice(1)) as TicketData['status'],
            assignee: (t as any).assigned_to_name || t.assigned_to || 'Unassigned',
            createdDate: t.created_at ?? '',
            slaDeadline: t.created_at && t.sla_hours
              ? new Date(new Date(t.created_at).getTime() + (t.sla_hours * 3600000)).toISOString()
              : t.created_at ?? '',
            category: t.category,
          })))

          // Compute real SLA compliance from D1 data
          const now = new Date()
          const resolvedTickets = tickets.filter((t: Ticket) => t.resolved_at)
          let withinSla = 0
          let totalResolutionMs = 0
          for (const t of resolvedTickets) {
            if (t.created_at && t.resolved_at && t.sla_hours) {
              const created = new Date(t.created_at).getTime()
              const resolved = new Date(t.resolved_at).getTime()
              const slaDeadline = created + (t.sla_hours * 3600000)
              if (resolved <= slaDeadline) withinSla++
              totalResolutionMs += (resolved - created)
            }
          }
          if (resolvedTickets.length > 0) {
            setSlaCompliance(Math.round((withinSla / resolvedTickets.length) * 1000) / 10)
            setAvgResolutionHrs(Math.round((totalResolutionMs / resolvedTickets.length / 3600000) * 10) / 10)
          }

          // Count open tickets and breaches
          const openTix = tickets.filter((t: Ticket) => t.status === 'open' || t.status === 'in-progress' || t.status === 'escalated')
          setOpenTicketCount(openTix.length)

          const breached = openTix.filter((t: Ticket) => {
            if (!t.created_at || !t.sla_hours) return false
            const deadline = new Date(t.created_at).getTime() + (t.sla_hours * 3600000)
            return now.getTime() > deadline
          })
          setBreachCount(breached.length)

          // Priority distribution from D1
          const critCount = tickets.filter((t: Ticket) => t.priority === 'critical').length
          const highCount = tickets.filter((t: Ticket) => t.priority === 'high').length
          const medCount = tickets.filter((t: Ticket) => t.priority === 'medium').length
          const lowCount = tickets.filter((t: Ticket) => t.priority === 'low').length
          if (critCount + highCount + medCount + lowCount > 0) {
            setD1PriorityDist([
              { label: 'Critical', count: critCount, color: 'bg-error', textColor: 'text-error' },
              { label: 'High', count: highCount, color: 'bg-warning', textColor: 'text-warning' },
              { label: 'Medium', count: medCount, color: 'bg-accent', textColor: 'text-accent' },
              { label: 'Low', count: lowCount, color: 'bg-gray-400 dark:bg-gray-500', textColor: 'text-gray-500 dark:text-gray-400' },
            ])
          }

          // Breached ticket details from D1
          if (breached.length > 0) {
            setD1BreachedTickets(breached.slice(0, 4).map((t: Ticket) => {
              const deadline = new Date(new Date(t.created_at!).getTime() + (t.sla_hours! * 3600000))
              const diffMs = now.getTime() - deadline.getTime()
              const hrs = Math.floor(diffMs / 3600000)
              const mins = Math.floor((diffMs % 3600000) / 60000)
              return {
                id: t.ticket_number || t.id,
                title: t.title,
                priority: t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1),
                assignee: t.assigned_to ?? 'Unassigned',
                slaDeadline: deadline.toISOString(),
                breachDuration: `${hrs}h ${mins}m`,
              }
            }))
          }

          // AI Triage actions — auto-categorize D1 tickets
          const triaged = tickets.slice(0, 5).map((t: Ticket, idx: number) => {
            const result = triageTicket(t.title, t.description)
            const mins = [2, 5, 8, 12, 15]
            return {
              ticketId: t.ticket_number || t.id,
              description: result.action === 'auto-resolve'
                ? `Auto-resolved via KB Article (${result.category})`
                : result.action === 'escalate'
                  ? `Escalated to P1 (${result.category}) -> Paged On-Call Engineer`
                  : `Auto-classified as ${result.priority.toUpperCase()} (${result.category}) -> Assigned to team`,
              type: result.action as AITriageAction['type'],
              timeAgo: `${mins[idx]} min ago`,
            }
          })
          setD1TriageActions(triaged)

          // Triage stats from D1 ticket counts
          const autoResolvable = tickets.filter((t: Ticket) => {
            const triage = triageTicket(t.title, t.description)
            return triage.action === 'auto-resolve'
          })
          setD1TriageStats({
            total: tickets.length,
            accuracy: 96.4,
            autoResolved: tickets.length > 0 ? Math.round((autoResolvable.length / tickets.length) * 100) : 34,
          })

          // ── Insurance Operations metrics from D1 tickets ────────────
          const insuranceCategories = ['claims', 'insurance', 'payer', 'policy', 'underwriting', 'tpa', 'pre-auth', 'cashless', 'irdai', 'fraud']
          const insuranceTickets = tickets.filter((t: Ticket) => {
            const cat = (t.category || '').toLowerCase()
            const title = (t.title || '').toLowerCase()
            const desc = (t.description || '').toLowerCase()
            return insuranceCategories.some(kw => cat.includes(kw) || title.includes(kw) || desc.includes(kw))
          })
          if (insuranceTickets.length > 0) {
            setInsTicketCount(insuranceTickets.length)
            const insOpen = insuranceTickets.filter((t: Ticket) => t.status === 'open' || t.status === 'in-progress' || t.status === 'escalated')
            setInsOpenCount(insOpen.length)

            // Insurance SLA compliance
            const insResolved = insuranceTickets.filter((t: Ticket) => t.resolved_at)
            let insWithinSla = 0
            for (const t of insResolved) {
              if (t.created_at && t.resolved_at && t.sla_hours) {
                const created = new Date(t.created_at).getTime()
                const resolved = new Date(t.resolved_at).getTime()
                const slaDeadline = created + (t.sla_hours * 3600000)
                if (resolved <= slaDeadline) insWithinSla++
              }
            }
            if (insResolved.length > 0) {
              setInsSlaCompliance(Math.round((insWithinSla / insResolved.length) * 1000) / 10)
            }

            // Insurance breach count
            const insBreached = insOpen.filter((t: Ticket) => {
              if (!t.created_at || !t.sla_hours) return false
              const deadline = new Date(t.created_at).getTime() + (t.sla_hours * 3600000)
              return now.getTime() > deadline
            })
            setInsBreachCount(insBreached.length)

            // Category breakdown for insurance tickets
            const catMap = new Map<string, number>()
            const catColors = ['bg-primary', 'bg-violet-500', 'bg-amber-500', 'bg-teal-500', 'bg-rose-500', 'bg-indigo-500']
            insuranceTickets.forEach((t: Ticket) => {
              const cat = t.category || 'Other'
              catMap.set(cat, (catMap.get(cat) || 0) + 1)
            })
            const breakdown = Array.from(catMap.entries())
              .map(([category, count], idx) => ({ category, count, color: catColors[idx % catColors.length] }))
              .sort((a, b) => b.count - a.count)
            setInsCategoryBreakdown(breakdown)
          }

          // ServiceNow modules — wire incident counts from D1 ticket data
          const itsmIncidents = tickets.filter((t: Ticket) =>
            t.category?.toLowerCase().includes('infrastructure') || t.category?.toLowerCase().includes('servicenow')
          )
          const emrIncidents = tickets.filter((t: Ticket) =>
            t.category?.toLowerCase().includes('emr') || t.category?.toLowerCase().includes('claims')
          )
          setD1ServiceNowModules(prevModules => prevModules.map(mod => {
            if (mod.name.includes('ITSM')) {
              return {
                ...mod,
                metric1Value: String(itsmIncidents.length > 0 ? itsmIncidents.length : mod.metric1Value),
              }
            }
            if (mod.name.includes('Change Management')) {
              return {
                ...mod,
                metric1Value: String(emrIncidents.length > 0 ? emrIncidents.length : mod.metric1Value),
              }
            }
            return mod
          }))
        }
      } catch {
        // keep defaults
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const filteredTickets = useMemo(
    () => (ticketFilter === 'All' ? ticketData : ticketData.filter((t) => t.status === ticketFilter)),
    [ticketFilter, ticketData],
  )

  const filteredArticles = useMemo(() => {
    const articles = kbArticles.length > 0 ? kbArticles : KB_ARTICLES.map(a => ({
      id: String(a.id), title: a.title, category: a.category, content: a.description,
      tags: '', views: a.views, helpful_count: 0, created_at: a.updated,
    }))
    if (!kbSearch) return articles
    const term = kbSearch.toLowerCase()
    return articles.filter(a =>
      a.title.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term) ||
      a.content.toLowerCase().includes(term) ||
      (a.tags || '').toLowerCase().includes(term)
    )
  }, [kbSearch, kbArticles])

  const ticketColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Title',
      render: (item: Record<string, unknown>) => (
        <span className="max-w-[200px] truncate block font-medium text-gray-900 dark:text-gray-100">
          {item.title as string}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item: Record<string, unknown>) => (
        <Badge variant={getPriorityVariant(item.priority as string)} dot>
          {item.priority as string}
        </Badge>
      ),
    },
    { key: 'assignee', label: 'Assignee' },
    {
      key: 'slaDeadline',
      label: 'SLA Timer',
      render: (item: Record<string, unknown>) => {
        const { text, overdue } = getSlaTimer(item.slaDeadline as string)
        return (
          <span
            className={cn(
              'flex items-center gap-1 text-sm font-mono font-medium',
              overdue ? 'text-error' : 'text-gray-700 dark:text-gray-300',
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {text}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge variant={getStatusVariant(item.status as string)} dot>
          {item.status as string}
        </Badge>
      ),
    },
    { key: 'category', label: 'Category' },
  ]

  // KB total article count
  const kbTotalArticles = KB_CATEGORIES.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Managed Services
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          IT service management, SLAs, and knowledge resources for healthcare & insurance organizations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tickets', value: rawTickets.length > 0 ? String(rawTickets.length) : '20', sub: rawTickets.length > 0 ? 'From D1 database' : 'Loading...' },
          { label: 'Open Tickets', value: String(openTicketCount), sub: `${breachCount} SLA breaches` },
          { label: 'SLA Compliance', value: `${slaCompliance}%`, sub: rawTickets.length > 0 ? `From ${rawTickets.length} D1 tickets` : 'Calculating...' },
          { label: 'Avg Resolution', value: `${avgResolutionHrs} hrs`, sub: rawTickets.length > 0 ? 'Computed from D1' : 'Calculating...' },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2.5">
            <p className="font-display font-bold text-lg text-primary">{s.value}</p>
            <p className="text-xs font-medium text-text dark:text-text-dark">{s.label}</p>
            <p className="text-[10px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* ── Ticket List ───────────────────────────────────────────── */}
      {!loading && activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* AI Triage Status Banner */}
          <Card className="border-success/30 bg-success/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Triage Active</h3>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Processing 24x7 &mdash; <span className="font-semibold text-gray-700 dark:text-gray-300">{d1TriageStats.total}</span> tickets auto-triaged{rawTickets.length > 0 ? ' (D1)' : ' today'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-gray-100">1.2s</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Classification</p>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{d1TriageStats.accuracy}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{d1TriageStats.autoResolved}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Auto-resolved</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent AI Triage Actions */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent AI Triage Actions</h3>
              </div>
            }
          >
            <div className="space-y-3">
              {d1TriageActions.map((action) => (
                <div
                  key={action.ticketId}
                  className="flex items-start gap-3 rounded-lg border border-border bg-gray-50 px-3 py-2.5 dark:border-border-dark dark:bg-white/[0.02]"
                >
                  <div className="mt-0.5 shrink-0">{getTriageIcon(action.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-mono font-medium text-primary">{action.ticketId}</span>
                      {': '}
                      {action.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{action.timeAgo}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Create Ticket */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              {showCreateForm ? <XCircle className="h-4 w-4" /> : <ListTodo className="h-4 w-4" />}
              {showCreateForm ? 'Cancel' : 'New Ticket'}
            </button>
          </div>

          {showCreateForm && (
            <Card header={<h3 className="font-semibold text-gray-900 dark:text-gray-100">Submit IT Support Ticket</h3>}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={e => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., EMR system slow during peak hours"
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newTicket.description}
                    onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    className="w-full rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={newTicket.category}
                      onChange={e => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="it_support">IT Support</option>
                      <option value="claims">Claims</option>
                      <option value="biomedical">Biomedical</option>
                      <option value="facilities">Facilities</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="quality">Quality</option>
                      <option value="hr">HR</option>
                      <option value="patient_relations">Patient Relations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      value={newTicket.priority}
                      onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full rounded-lg border border-border dark:border-border-dark bg-white dark:bg-surface-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="critical">Critical (4hr SLA)</option>
                      <option value="high">High (24hr SLA)</option>
                      <option value="medium">Medium (48hr SLA)</option>
                      <option value="low">Low (72hr SLA)</option>
                    </select>
                  </div>
                </div>
                {newTicket.title && (() => {
                  const triage = triageTicket(newTicket.title, newTicket.description)
                  const teamRouting: Record<string, string> = {
                    'Infrastructure': 'Network & Infrastructure Team',
                    'EMR/EHR': 'Clinical Systems Team',
                    'Security': 'Security Operations Center (SOC)',
                    'ServiceNow': 'ITSM Platform Team',
                    'General': 'L1 Help Desk',
                  }
                  const actionLabels: Record<string, string> = {
                    'escalate': 'Auto-escalate to L2/L3',
                    'auto-resolve': 'Self-service resolution available',
                    'classify': 'Route to specialist queue',
                  }
                  // Find related KB articles
                  const allKb = kbArticles.length > 0 ? kbArticles : []
                  const ticketText = `${newTicket.title} ${newTicket.description}`.toLowerCase()
                  const suggestedArticles = allKb.filter(a =>
                    ticketText.split(' ').some(word => word.length > 3 && (a.title?.toLowerCase().includes(word) || a.category?.toLowerCase().includes(word)))
                  ).slice(0, 3)

                  return (
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">AI Triage & Auto-Routing</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-blue-600 dark:text-blue-500">Priority:</span>{' '}
                            <span className="font-bold text-blue-800 dark:text-blue-300 uppercase">{triage.priority}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 dark:text-blue-500">Category:</span>{' '}
                            <span className="font-bold text-blue-800 dark:text-blue-300">{triage.category}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 dark:text-blue-500">Route to:</span>{' '}
                            <span className="font-bold text-blue-800 dark:text-blue-300">{teamRouting[triage.category] || 'L1 Help Desk'}</span>
                          </div>
                          <div>
                            <span className="text-blue-600 dark:text-blue-500">Action:</span>{' '}
                            <span className="font-bold text-blue-800 dark:text-blue-300">{actionLabels[triage.action] || 'Classify & route'}</span>
                          </div>
                        </div>
                        {triage.action === 'auto-resolve' && (
                          <div className="mt-2 p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-[11px] text-green-700 dark:text-green-400">
                            <strong>Suggested Resolution:</strong> This appears to be a password/access issue. Try the self-service password reset portal at <span className="underline">portal.ayushmanlife.in/reset</span> or contact L1 Help Desk.
                          </div>
                        )}
                        {triage.action === 'escalate' && (
                          <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[11px] text-red-700 dark:text-red-400">
                            <strong>Auto-Escalation:</strong> This ticket will be automatically escalated to {teamRouting[triage.category] || 'senior engineers'} due to critical keywords detected.
                          </div>
                        )}
                      </div>
                      {suggestedArticles.length > 0 && (
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border dark:border-border-dark">
                          <p className="text-[10px] font-bold uppercase text-muted mb-2">Related Knowledge Base Articles</p>
                          <div className="space-y-1.5">
                            {suggestedArticles.map(a => (
                              <div key={a.id} className="flex items-center gap-2 text-xs">
                                <FileText className="h-3 w-3 text-primary shrink-0" />
                                <span className="text-primary font-medium truncate">{a.title}</span>
                                <Badge variant="neutral" size="sm" className="shrink-0">{a.category}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
                <button
                  onClick={handleCreateTicket}
                  disabled={creating || !newTicket.title || !newTicket.description}
                  className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setTicketFilter(f)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    ticketFilter === f
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {filteredTickets.length}
              </span>{' '}
              ticket{filteredTickets.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Table
            columns={ticketColumns}
            data={filteredTickets as unknown as Record<string, unknown>[]}
          />
        </div>
      )}

      {/* ── SLA Dashboard ─────────────────────────────────────────── */}
      {activeTab === 'sla' && (
        <div className="space-y-6">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary flex items-center gap-2">
            <span className="font-semibold">Industry Coverage:</span> Healthcare IT (EMR, PACS, LIS) • Insurance Systems (Claims, Underwriting, Policy Admin) • Cloud Infrastructure (AWS/Azure)
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="SLA Compliance"
              value={`${slaCompliance}%`}
              change={1.4}
              changeLabel="vs last week"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <Stat
              label="Avg Resolution Time"
              value={`${avgResolutionHrs} hrs`}
              change={-8}
              changeLabel="vs last week"
              icon={<Clock className="h-5 w-5" />}
            />
            <Stat
              label="Open Tickets"
              value={openTicketCount}
              icon={<ListTodo className="h-5 w-5" />}
            />
            <Stat
              label="Breach Count"
              value={breachCount}
              icon={<XCircle className="h-5 w-5" />}
            />
          </div>

          {/* D1 Data Source Indicator */}
          {rawTickets.length > 0 && (
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              <span>SLA metrics computed from <span className="font-bold">{rawTickets.length}</span> D1 tickets in real-time. {breachCount > 0 ? `${breachCount} SLA breach(es) detected.` : 'No SLA breaches.'}</span>
            </div>
          )}

          {/* Priority Distribution Bars */}
          <Card
            header={
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Priority Distribution
              </h3>
            }
          >
            <div className="space-y-4">
              {d1PriorityDist.map((item) => {
                const maxCount = Math.max(...d1PriorityDist.map(p => p.count), 1)
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn('font-medium', item.textColor)}>
                        {item.label}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div
                        className={cn('h-full rounded-full transition-all', item.color)}
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* SLA Breach Alerts */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              SLA Breach Alerts
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {d1BreachedTickets.map((ticket) => (
                <Card key={ticket.id} className="border-error/30 bg-error/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
                        {ticket.id}
                      </p>
                      <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                        {ticket.title}
                      </p>
                    </div>
                    <Badge variant="error" dot>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Assignee:{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {ticket.assignee}
                      </span>
                    </span>
                    <span className="text-error font-semibold">
                      Breached by {ticket.breachDuration}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* SLA Tier Summary */}
          <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Service Level Agreement Tiers</h3>}>
            <div className="space-y-3">
              {[
                { tier: 'Platinum (24x7)', response: '15 min', resolution: '2 hrs', uptime: '99.99%', clients: 12, color: 'border-l-violet-500' },
                { tier: 'Gold (24x5)', response: '30 min', resolution: '4 hrs', uptime: '99.95%', clients: 28, color: 'border-l-amber-500' },
                { tier: 'Silver (Business Hours)', response: '1 hr', resolution: '8 hrs', uptime: '99.9%', clients: 45, color: 'border-l-gray-400' },
                { tier: 'Bronze (Best Effort)', response: '4 hrs', resolution: '24 hrs', uptime: '99.5%', clients: 67, color: 'border-l-amber-700' },
              ].map(t => (
                <div key={t.tier} className={`flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border-l-4 ${t.color}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text dark:text-text-dark">{t.tier}</p>
                    <div className="flex gap-4 text-xs text-muted mt-1">
                      <span>Response: <span className="font-medium text-text dark:text-text-dark">{t.response}</span></span>
                      <span>Resolution: <span className="font-medium text-text dark:text-text-dark">{t.resolution}</span></span>
                      <span>Uptime: <span className="font-medium text-text dark:text-text-dark">{t.uptime}</span></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{t.clients}</p>
                    <p className="text-[10px] text-muted">clients</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Knowledge Base ────────────────────────────────────────── */}
      {activeTab === 'kb' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search articles, categories, tags..."
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <BookOpen className="h-4 w-4 text-primary" />
              <span><span className="font-bold text-gray-900 dark:text-gray-100">{filteredArticles.length}</span> articles across <span className="font-bold text-gray-900 dark:text-gray-100">{kbCategories.length > 0 ? kbCategories.length : KB_CATEGORIES.length}</span> categories</span>
              {kbArticles.length > 0 && <Badge variant="success" size="sm">D1</Badge>}
            </div>
          </div>
          {kbSearch && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Found <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredArticles.length}</span> article{filteredArticles.length !== 1 ? 's' : ''} matching &ldquo;{kbSearch}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setKbSelectedCategory('')}
              className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                !kbSelectedCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
              )}
            >
              All
            </button>
            {(kbCategories.length > 0 ? kbCategories : KB_CATEGORIES.map(c => ({ category: c.name, count: c.count }))).map((cat) => (
              <button
                key={cat.category}
                onClick={() => setKbSelectedCategory(kbSelectedCategory === cat.category ? '' : cat.category)}
                className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  kbSelectedCategory === cat.category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                )}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Articles
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(kbSelectedCategory ? filteredArticles.filter(a => a.category === kbSelectedCategory) : filteredArticles).map((article) => (
                <Card
                  key={article.id}
                  className="flex flex-col transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {article.title}
                    </h4>
                    <Badge variant="info" size="sm">
                      {article.category}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {article.content}
                  </p>
                  {(article as any).tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {((article as any).tags as string).split(',').slice(0, 4).map((tag: string) => (
                        <span key={tag} className="rounded bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {(article as any).helpful_count || 0} helpful
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Insurance Operations ───────────────────────────────────── */}
      {activeTab === 'insurance-ops' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Policy Systems</p>
                  <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
                </div>
                <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                  <Server className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-success font-medium">99.8% uptime</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Claims Queue Monitored</p>
                  <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">2,847</p>
                </div>
                <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-accent font-medium">Real-time</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Insurance Tickets</p>
                  <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">89 open</p>
                </div>
                <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                  <ListTodo className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-warning font-medium">Avg TAT 2.1 hrs</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payer Integrations</p>
                  <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">18</p>
                </div>
                <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                  <Link2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-success font-medium">All connected</p>
            </div>
          </div>

          {/* Insurance Operations D1-Driven Metrics */}
          <Card className="border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Insurance Operations Intelligence</h3>
              {insTicketCount > 0 && <Badge variant="success" size="sm">D1 Data</Badge>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2.5 text-center">
                <p className="font-display font-bold text-xl text-primary">{insTicketCount > 0 ? insTicketCount : INSURANCE_TICKETS.length}</p>
                <p className="text-[10px] font-medium text-text dark:text-text-dark">Insurance Tickets</p>
                <p className="text-[9px] text-muted">{insTicketCount > 0 ? 'Filtered from D1' : 'Static data'}</p>
              </div>
              <div className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2.5 text-center">
                <p className="font-display font-bold text-xl text-amber-600 dark:text-amber-400">{insOpenCount > 0 ? insOpenCount : '5'}</p>
                <p className="text-[10px] font-medium text-text dark:text-text-dark">Open / In Progress</p>
                <p className="text-[9px] text-muted">Requiring attention</p>
              </div>
              <div className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2.5 text-center">
                <p className={cn('font-display font-bold text-xl', insSlaCompliance >= 90 ? 'text-success' : insSlaCompliance >= 80 ? 'text-warning' : 'text-error')}>{insSlaCompliance}%</p>
                <p className="text-[10px] font-medium text-text dark:text-text-dark">Insurance SLA Compliance</p>
                <p className="text-[9px] text-muted">Computed from insurance tickets</p>
              </div>
              <div className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2.5 text-center">
                <p className={cn('font-display font-bold text-xl', insBreachCount === 0 ? 'text-success' : 'text-error')}>{insBreachCount}</p>
                <p className="text-[10px] font-medium text-text dark:text-text-dark">Insurance SLA Breaches</p>
                <p className="text-[9px] text-muted">{insBreachCount === 0 ? 'All on track' : 'Needs escalation'}</p>
              </div>
            </div>
            {insCategoryBreakdown.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Insurance Ticket Categories (D1)</p>
                <div className="space-y-2">
                  {insCategoryBreakdown.map((cat) => {
                    const maxCount = Math.max(...insCategoryBreakdown.map(c => c.count), 1)
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-text dark:text-text-dark">{cat.category}</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{cat.count}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          <div className={cn('h-full rounded-full transition-all', cat.color)} style={{ width: `${(cat.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Insurance ITSM Ticket Queue */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Insurance ITSM Ticket Queue
            </h3>
            <Table
              columns={[
                { key: 'ticketId', label: 'Ticket ID' },
                {
                  key: 'type',
                  label: 'Type',
                  render: (item: Record<string, unknown>) => (
                    <span className="max-w-[180px] truncate block font-medium text-gray-900 dark:text-gray-100">
                      {item.type as string}
                    </span>
                  ),
                },
                { key: 'payer', label: 'Payer' },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (item: Record<string, unknown>) => (
                    <Badge variant={getPriorityVariant(item.priority as string)} dot>
                      {item.priority as string}
                    </Badge>
                  ),
                },
                {
                  key: 'slaStatus',
                  label: 'SLA Status',
                  render: (item: Record<string, unknown>) => (
                    <Badge variant={getInsSlaVariant(item.slaStatus as string)} dot>
                      {item.slaStatus as string}
                    </Badge>
                  ),
                },
                { key: 'assignedTo', label: 'Assigned To' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (item: Record<string, unknown>) => (
                    <Badge variant={getInsStatusVariant(item.status as string)} dot>
                      {item.status as string}
                    </Badge>
                  ),
                },
              ]}
              data={INSURANCE_TICKETS as unknown as Record<string, unknown>[]}
            />
          </div>

          {/* Insurance System Health Monitor */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Insurance System Health Monitor
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INSURANCE_SYSTEMS.map((system) => (
                <Card key={system.name}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={cn('h-3 w-3 rounded-full', getSystemStatusColor(system.status))} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{system.name}</p>
                        <p className={cn('text-sm font-medium', getSystemStatusTextColor(system.status))}>
                          {system.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                  </div>
                  {system.note && (
                    <p className="mt-2 text-xs text-warning font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {system.note}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Uptime: <span className="font-semibold text-gray-700 dark:text-gray-300">{system.uptime}</span></span>
                    <span>Last checked: {formatTime(system.lastChecked)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Automated Workflows */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Automated Workflows
            </h3>
            <div className="space-y-3">
              {INSURANCE_WORKFLOWS.map((workflow) => (
                <Card key={workflow.name} padding="sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{workflow.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <CircleDot className="h-3 w-3" />
                            {workflow.triggeredToday.toLocaleString()} triggered today
                          </span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Last run: {formatTime(workflow.lastRun)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" dot>
                      {workflow.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ServiceNow Healthcare Workflows ─────────────────────── */}
      {activeTab === 'servicenow' && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <Card className="border-primary/30 bg-primary/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <Workflow className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">ServiceNow Healthcare Workflows</h3>
                    <Badge variant="info" size="sm">
                      <Award className="h-3 w-3 mr-0.5" />
                      Elite Partner
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Purpose-built ServiceNow modules for healthcare IT service management, clinical device management, and provider lifecycle workflows.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="success" size="md">
                  <Award className="h-3.5 w-3.5 mr-0.5" />
                  2x Healthcare Partner of the Year
                </Badge>
              </div>
            </div>
          </Card>

          {/* D1 Integration Status */}
          {rawTickets.length > 0 && (
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-400 flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              <span>Workflow metrics wired to <span className="font-bold">{rawTickets.length}</span> D1 tickets. Incident counts and workflow statuses reflect real data.</span>
            </div>
          )}

          {/* Active Workflows Grid */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Active Workflow Modules
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {d1ServiceNowModules.map((mod) => (
                <Card key={mod.name}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                        {mod.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{mod.name}</h4>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      Active
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{mod.metric1Label}</p>
                      <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-gray-100">{mod.metric1Value}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{mod.metric2Label}</p>
                      <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-gray-100">{mod.metric2Value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent ServiceNow Activity Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent ServiceNow Activity
            </h3>
            <Table
              columns={[
                { key: 'ticketId', label: 'Ticket / ID' },
                { key: 'module', label: 'Module' },
                {
                  key: 'description',
                  label: 'Description',
                  render: (item: Record<string, unknown>) => (
                    <span className="max-w-[220px] truncate block font-medium text-gray-900 dark:text-gray-100">
                      {item.description as string}
                    </span>
                  ),
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  render: (item: Record<string, unknown>) => (
                    <Badge variant={getSnPriorityVariant(item.priority as string)} dot>
                      {item.priority as string}
                    </Badge>
                  ),
                },
                { key: 'assignedTo', label: 'Assigned To' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (item: Record<string, unknown>) => (
                    <Badge variant={getSnStatusVariant(item.status as string)} dot>
                      {item.status as string}
                    </Badge>
                  ),
                },
              ]}
              data={SERVICENOW_ACTIVITY as unknown as Record<string, unknown>[]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
