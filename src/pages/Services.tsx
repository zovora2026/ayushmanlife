import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { cn, formatDate } from '../lib/utils'
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

const TICKETS: TicketData[] = [
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

// ── Component ──────────────────────────────────────────────────────────────────

export default function Services() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('All')
  const [kbSearch, setKbSearch] = useState('')

  const filteredTickets = useMemo(
    () => (ticketFilter === 'All' ? TICKETS : TICKETS.filter((t) => t.status === ticketFilter)),
    [ticketFilter],
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
          IT service management, SLAs, and knowledge resources
        </p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

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
    </div>
  )
}
