import { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  IndianRupee,
  AlertTriangle,
  Target,
  Send,
  Loader2,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../lib/utils'
import { workforce, projects as projectsAPI } from '../lib/api'
import type { Project, ProjectAssignment, ProjectMilestone, ProjectDocument, ProjectMessage, ProjectDetail } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Staffing Roster' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'budget', label: 'Budget' },
  { id: 'documents', label: 'Documents' },
  { id: 'messages', label: 'Communication' },
]

function ragBadge(rag: string) {
  if (rag === 'green') return <Badge variant="success">Green</Badge>
  if (rag === 'amber') return <Badge variant="warning">Amber</Badge>
  if (rag === 'red') return <Badge variant="error">Red</Badge>
  return <Badge variant="neutral">{rag}</Badge>
}

function statusBadge(status: string) {
  if (status === 'completed') return <Badge variant="success">Completed</Badge>
  if (status === 'in_progress') return <Badge variant="info">In Progress</Badge>
  if (status === 'active') return <Badge variant="info">Active</Badge>
  if (status === 'not_started') return <Badge variant="neutral">Not Started</Badge>
  return <Badge variant="neutral">{status}</Badge>
}

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj-001')
  const [detail, setDetail] = useState<ProjectDetail | null>(null)
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [milestoneSummary, setMilestoneSummary] = useState<Record<string, number>>({})
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [messages, setMessages] = useState<ProjectMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const projectsRes = await workforce.projects().catch(() => null)
        if (projectsRes?.projects?.length) {
          setAllProjects(projectsRes.projects)
        }
      } catch { /* keep defaults */ }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedProjectId) return
    async function loadProject() {
      setLoading(true)
      try {
        const [detailRes, msRes, docsRes, msgsRes] = await Promise.all([
          projectsAPI.getDetail(selectedProjectId).catch(() => null),
          projectsAPI.milestones(selectedProjectId).catch(() => null),
          projectsAPI.documents(selectedProjectId).catch(() => null),
          projectsAPI.messages(selectedProjectId).catch(() => null),
        ])
        if (detailRes) setDetail(detailRes)
        if (msRes) { setMilestones(msRes.milestones || []); setMilestoneSummary(msRes.summary || {}) }
        if (docsRes) setDocuments(docsRes.documents || [])
        if (msgsRes) setMessages(msgsRes.messages || [])
      } catch { /* keep defaults */ }
      setLoading(false)
    }
    loadProject()
  }, [selectedProjectId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProjectId) return
    setSending(true)
    try {
      await projectsAPI.sendMessage({
        project_id: selectedProjectId,
        sender_name: 'Hospital Admin',
        sender_role: 'client',
        message: newMessage,
        message_type: 'update',
      })
      const msgsRes = await projectsAPI.messages(selectedProjectId).catch(() => null)
      if (msgsRes) setMessages(msgsRes.messages || [])
      setNewMessage('')
    } catch { /* ignore */ }
    setSending(false)
  }

  const proj = detail?.project
  const budget = detail?.budget

  if (loading && !detail) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with project selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Client Portal</h1>
          <p className="text-sm text-gray-500">Project visibility, staffing, milestones & communication</p>
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          {allProjects.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.client_hospital}</option>
          ))}
        </select>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Overview ───────────────────────────────────────── */}
      {activeTab === 'overview' && proj && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <Stat label="Status" value={proj.status?.replace(/_/g, ' ') || 'Active'} />
            <Stat label="Budget" value={formatCurrency(proj.budget || 0)} />
            <Stat label="Burn Rate" value={`${budget?.burn_rate_pct || 0}%`} />
            <Stat label="Team Size" value={proj.active_team_size || 0} />
            <Stat label="Milestones" value={`${detail?.milestones_summary?.completed || 0}/${detail?.milestones_summary?.total || 0}`} />
            <Stat label="Avg Progress" value={`${detail?.milestones_summary?.avg_completion || 0}%`} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card header={<h3 className="font-semibold text-gray-900 dark:text-gray-100">Project Details</h3>}>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-medium">{proj.client_hospital}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{proj.city}, {proj.state}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{(proj.project_type || '').replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Timeline</span><span className="font-medium">{formatDate(proj.start_date || '')} — {formatDate(proj.end_date || '')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Skills Required</span><span className="font-medium">{proj.skills_required}</span></div>
                {proj.description && <div className="mt-2 rounded-lg bg-gray-50 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{proj.description}</div>}
              </div>
            </Card>

            <Card header={<h3 className="font-semibold text-gray-900 dark:text-gray-100">Milestone RAG Status</h3>}>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                    <div className="text-2xl font-bold text-green-600">{detail?.milestones_summary?.green || 0}</div>
                    <div className="text-xs text-green-600">Green</div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                    <div className="text-2xl font-bold text-yellow-600">{detail?.milestones_summary?.amber || 0}</div>
                    <div className="text-xs text-yellow-600">Amber</div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                    <div className="text-2xl font-bold text-red-600">{detail?.milestones_summary?.red || 0}</div>
                    <div className="text-xs text-red-600">Red</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Overall Progress</span>
                    <span>{detail?.milestones_summary?.avg_completion || 0}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${detail?.milestones_summary?.avg_completion || 0}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Messages */}
          {detail?.recent_messages?.length ? (
            <Card header={<h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Communication</h3>}>
              <div className="space-y-3">
                {detail.recent_messages.map((m) => (
                  <div key={m.id} className={cn('rounded-lg p-3', m.sender_role === 'client' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-gray-50 dark:bg-gray-800')}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold">{m.sender_name}</span>
                      <Badge variant={m.sender_role === 'client' ? 'info' : 'neutral'} className="text-xs">{m.sender_role}</Badge>
                      <span className="ml-auto text-xs text-gray-400">{formatDate(m.created_at || '')}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{m.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      )}

      {/* ── Staffing Roster ────────────────────────────────── */}
      {activeTab === 'team' && (
        <Card header={<div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><h3 className="font-semibold text-gray-900 dark:text-gray-100">Assigned Team — {proj?.client_hospital}</h3></div>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-3">Consultant</th><th className="p-3">Department</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Utilization</th><th className="p-3">Rate/Day</th><th className="p-3">Timeline</th></tr></thead>
              <tbody>
                {(detail?.team || []).map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="font-medium">{t.consultant_name || t.consultant_id}</div>
                      {t.email && <div className="text-xs text-gray-400">{t.email}</div>}
                    </td>
                    <td className="p-3">{t.department || '—'}</td>
                    <td className="p-3">{t.role}</td>
                    <td className="p-3">{statusBadge(t.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className={cn('h-full rounded-full', (t.utilization_pct || 0) > 80 ? 'bg-red-500' : (t.utilization_pct || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${t.utilization_pct || 0}%` }} />
                        </div>
                        <span className="text-xs">{t.utilization_pct || 0}%</span>
                      </div>
                    </td>
                    <td className="p-3">{formatCurrency(t.rate_per_day || 0)}</td>
                    <td className="p-3 text-xs">{formatDate(t.start_date || '')} — {t.end_date ? formatDate(t.end_date) : 'Ongoing'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!detail?.team?.length) && <div className="p-8 text-center text-gray-400">No team members assigned</div>}
          </div>
        </Card>
      )}

      {/* ── Milestones ─────────────────────────────────────── */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Total Milestones" value={milestoneSummary.total || 0} />
            <Stat label="Completed" value={milestoneSummary.completed || 0} />
            <Stat label="In Progress" value={milestoneSummary.in_progress || 0} />
            <Stat label="Not Started" value={milestoneSummary.not_started || 0} />
          </div>

          <Card header={<div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h3 className="font-semibold text-gray-900 dark:text-gray-100">Project Milestones</h3></div>}>
            <div className="space-y-4">
              {milestones.map((m) => (
                <div key={m.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{m.title}</h4>
                        {ragBadge(m.rag_status)}
                        {statusBadge(m.status)}
                      </div>
                      {m.description && <p className="mt-1 text-sm text-gray-500">{m.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Target: {formatDate(m.target_date || '')}</span>
                        {m.actual_date && <span>Actual: {formatDate(m.actual_date)}</span>}
                        {m.owner && <span>Owner: {m.owner}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{m.percentage_complete}%</div>
                      <div className="mt-1 h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className={cn('h-full rounded-full', m.rag_status === 'red' ? 'bg-red-500' : m.rag_status === 'amber' ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${m.percentage_complete}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!milestones.length && <div className="p-8 text-center text-gray-400">No milestones defined</div>}
            </div>
          </Card>
        </div>
      )}

      {/* ── Budget ─────────────────────────────────────────── */}
      {activeTab === 'budget' && budget && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Total Budget" value={formatCurrency(budget.budgeted)} />
            <Stat label="Actual Spend" value={formatCurrency(budget.actual_spend)} />
            <Stat label="Projected Total" value={formatCurrency(budget.projected_total)} />
            <Stat label="Variance" value={formatCurrency(budget.variance)} className={budget.variance < 0 ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950' : ''} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card header={<h3 className="font-semibold text-gray-900 dark:text-gray-100">Budget Utilization</h3>}>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-gray-500">Burn Rate</span>
                    <span className="font-bold">{budget.burn_rate_pct}%</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className={cn('h-full rounded-full transition-all', budget.burn_rate_pct > 90 ? 'bg-red-500' : budget.burn_rate_pct > 70 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${Math.min(budget.burn_rate_pct, 100)}%` }} />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Average Daily Rate</span><span className="font-medium">{formatCurrency(budget.avg_daily_rate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Budget Remaining</span><span className="font-medium">{formatCurrency(budget.budgeted - budget.actual_spend)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget Health</span>
                    <span>{budget.variance >= 0 ? <Badge variant="success">Under Budget</Badge> : <Badge variant="error">Over Budget</Badge>}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card header={<h3 className="font-semibold text-gray-900 dark:text-gray-100">Team Cost Breakdown</h3>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-2">Consultant</th><th className="p-2">Role</th><th className="p-2">Rate/Day</th><th className="p-2">Utilization</th></tr></thead>
                  <tbody>
                    {(detail?.team || []).filter(t => t.status === 'active').map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="p-2 font-medium">{t.consultant_name || t.consultant_id}</td>
                        <td className="p-2">{t.role}</td>
                        <td className="p-2">{formatCurrency(t.rate_per_day || 0)}</td>
                        <td className="p-2">{t.utilization_pct || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Documents ──────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <Card header={<div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h3 className="font-semibold text-gray-900 dark:text-gray-100">Project Documents</h3></div>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-gray-500"><th className="p-3">Title</th><th className="p-3">Type</th><th className="p-3">Version</th><th className="p-3">Uploaded By</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="font-medium">{d.title}</div>
                      {d.description && <div className="text-xs text-gray-400">{d.description}</div>}
                    </td>
                    <td className="p-3">
                      <Badge variant={d.document_type === 'sow' ? 'info' : d.document_type === 'status_report' ? 'warning' : 'neutral'}>
                        {d.document_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3">v{d.version}</td>
                    <td className="p-3">{d.uploader_name || d.uploaded_by || '—'}</td>
                    <td className="p-3 text-xs">{formatDate(d.created_at || '')}</td>
                    <td className="p-3">{d.status === 'current' ? <Badge variant="success">Current</Badge> : <Badge variant="neutral">Archived</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!documents.length && <div className="p-8 text-center text-gray-400">No documents uploaded</div>}
          </div>
        </Card>
      )}

      {/* ── Communication ──────────────────────────────────── */}
      {activeTab === 'messages' && (
        <Card header={<div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /><h3 className="font-semibold text-gray-900 dark:text-gray-100">Project Communication — {proj?.name}</h3></div>}>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn('rounded-lg p-4', m.sender_role === 'client' ? 'ml-8 bg-blue-50 dark:bg-blue-950' : 'mr-8 bg-gray-50 dark:bg-gray-800')}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold">{m.sender_name}</span>
                  <Badge variant={m.sender_role === 'client' ? 'info' : m.sender_role === 'project_manager' ? 'warning' : 'neutral'} className="text-xs">
                    {m.sender_role === 'project_manager' ? 'PM' : m.sender_role}
                  </Badge>
                  {m.message_type !== 'update' && (
                    <Badge variant={m.message_type === 'escalation' ? 'error' : m.message_type === 'question' ? 'info' : 'neutral'} className="text-xs">
                      {m.message_type}
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-gray-400">{formatDate(m.created_at || '')}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{m.message}</p>
              </div>
            ))}
            {!messages.length && <div className="p-8 text-center text-gray-400">No messages yet</div>}
          </div>

          {/* Message input */}
          <div className="mt-4 flex gap-2 border-t pt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
