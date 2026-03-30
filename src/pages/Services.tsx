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
} from 'lucide-react'
import { cn, formatDate } from '../lib/utils'
import { tickets as ticketsAPI } from '../lib/api'
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
]

const FILTER_OPTIONS: TicketFilter[] = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']

const PRIORITY_DISTRIBUTION = [
  { label: 'Critical', count: 2, color: 'bg-error', textColor: 'text-error' },
  { label: 'High', count: 5, color: 'bg-warning', textColor: 'text-warning' },
  { label: 'Medium', count: 3, color: 'bg-accent', textColor: 'text-accent' },
  { label: 'Low', count: 2, color: 'bg-gray-400', textColor: 'text-gray-500' },
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
    default: return 'bg-gray-400'
  }
}

function getSystemStatusTextColor(status: string): string {
  switch (status) {
    case 'Healthy': return 'text-success'
    case 'Degraded': return 'text-warning'
    case 'Down': return 'text-error'
    default: return 'text-gray-500'
  }
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Services() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('All')
  const [kbSearch, setKbSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [ticketData, setTicketData] = useState<TicketData[]>(DEFAULT_TICKETS)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await ticketsAPI.list()
        if (mounted && res?.tickets?.length) {
          setTicketData(res.tickets.map((t) => ({
            id: t.ticket_number || t.id,
            title: t.title,
            priority: t.priority as TicketData['priority'],
            status: t.status as TicketData['status'],
            assignee: t.assigned_to ?? '',
            createdDate: t.created_at ?? '',
            slaDeadline: t.created_at ?? '',
            category: t.category,
          })))
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

  const filteredArticles = useMemo(
    () =>
      kbSearch
        ? KB_ARTICLES.filter(
            (a) =>
              a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
              a.category.toLowerCase().includes(kbSearch.toLowerCase()) ||
              a.description.toLowerCase().includes(kbSearch.toLowerCase()),
          )
        : KB_ARTICLES,
    [kbSearch],
  )

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

  const maxPriorityCount = Math.max(...PRIORITY_DISTRIBUTION.map((p) => p.count))

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
          { label: 'Healthcare Clients', value: '45+', sub: 'Hospitals & clinics' },
          { label: 'Insurance Clients', value: '18+', sub: 'Payers, TPAs & insurers' },
          { label: 'SLA Compliance', value: '99.1%', sub: 'Across all clients' },
          { label: 'Avg Resolution', value: '3.8 hrs', sub: 'P1 incidents' },
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
      {activeTab === 'tickets' && (
        <div className="space-y-4">
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
              value="94.2%"
              change={1.4}
              changeLabel="vs last week"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <Stat
              label="Avg Resolution Time"
              value="4.2 hrs"
              change={-8}
              changeLabel="vs last week"
              icon={<Clock className="h-5 w-5" />}
            />
            <Stat
              label="Open Tickets"
              value={8}
              icon={<ListTodo className="h-5 w-5" />}
            />
            <Stat
              label="Breach Count"
              value={2}
              icon={<XCircle className="h-5 w-5" />}
            />
          </div>

          {/* Priority Distribution Bars */}
          <Card
            header={
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Priority Distribution
              </h3>
            }
          >
            <div className="space-y-4">
              {PRIORITY_DISTRIBUTION.map((item) => (
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
                      style={{ width: `${(item.count / maxPriorityCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SLA Breach Alerts */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              SLA Breach Alerts
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BREACHED_TICKETS.map((ticket) => (
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
        </div>
      )}

      {/* ── Knowledge Base ────────────────────────────────────────── */}
      {activeTab === 'kb' && (
        <div className="space-y-6">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search articles, categories..."
            value={kbSearch}
            onChange={(e) => setKbSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {KB_CATEGORIES.map((cat) => (
              <Card key={cat.name} className="text-center transition-shadow hover:shadow-md">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                  {cat.icon}
                </div>
                <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
                  {cat.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {cat.count} articles
                </p>
              </Card>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Articles
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
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
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>Updated {formatDate(article.updated)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views}
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
    </div>
  )
}
