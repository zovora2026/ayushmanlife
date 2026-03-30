import { useState, useEffect } from 'react'
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Server, Cloud,
  DollarSign, Activity, Lock, Eye, Plus, Filter,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { security } from '../lib/api'
import type { SecurityDashboard as DashboardType, SecurityIncident, ComplianceCheck, InfraService, CloudCosts } from '../lib/api'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'incidents', label: 'Security Incidents' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'finops', label: 'FinOps' },
]

const SEVERITY_BADGE: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'neutral',
}

const STATUS_BADGE: Record<string, 'error' | 'warning' | 'success' | 'info' | 'neutral'> = {
  open: 'error', investigating: 'warning', resolved: 'success', standby: 'neutral',
  healthy: 'success', degraded: 'warning', down: 'error',
  compliant: 'success', partial: 'warning', non_compliant: 'error',
}

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export default function SecurityDashboardPage() {
  const [tab, setTab] = useState('overview')
  const [dashboard, setDashboard] = useState<DashboardType | null>(null)
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [compliance, setCompliance] = useState<{ checks: ComplianceCheck[]; summary: Record<string, any> }>({ checks: [], summary: {} })
  const [infrastructure, setInfrastructure] = useState<{ services: InfraService[]; summary: any }>({ services: [], summary: {} })
  const [costs, setCosts] = useState<CloudCosts | null>(null)
  const [loading, setLoading] = useState(true)
  const [incidentFilter, setIncidentFilter] = useState('')
  const [complianceFilter, setComplianceFilter] = useState('')
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [newIncident, setNewIncident] = useState({ title: '', category: 'Vulnerability', severity: 'medium', description: '', source: '', affected_system: '' })

  useEffect(() => { loadDashboard() }, [])

  useEffect(() => {
    if (tab === 'incidents') loadIncidents()
    if (tab === 'compliance') loadCompliance()
    if (tab === 'infrastructure') loadInfrastructure()
    if (tab === 'finops') loadCosts()
  }, [tab, incidentFilter, complianceFilter])

  async function loadDashboard() {
    try {
      setLoading(true)
      const [d, inc] = await Promise.all([security.dashboard(), security.incidents()])
      setDashboard(d)
      setIncidents(inc.incidents)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadIncidents() {
    try {
      const params: Record<string, string> = {}
      if (incidentFilter) params.status = incidentFilter
      const data = await security.incidents(params)
      setIncidents(data.incidents)
    } catch (e) { console.error(e) }
  }

  async function loadCompliance() {
    try {
      const data = await security.compliance(complianceFilter || undefined)
      setCompliance(data)
    } catch (e) { console.error(e) }
  }

  async function loadInfrastructure() {
    try {
      const data = await security.infrastructure()
      setInfrastructure(data)
    } catch (e) { console.error(e) }
  }

  async function loadCosts() {
    try {
      const data = await security.costs()
      setCosts(data)
    } catch (e) { console.error(e) }
  }

  async function handleUpdateIncident(id: string, status: string) {
    try {
      await security.updateIncident({ id, status })
      loadIncidents()
      loadDashboard()
    } catch (e) { console.error(e) }
  }

  async function handleCreateIncident() {
    if (!newIncident.title || !newIncident.category) return
    try {
      await security.createIncident(newIncident)
      setShowIncidentModal(false)
      setNewIncident({ title: '', category: 'Vulnerability', severity: 'medium', description: '', source: '', affected_system: '' })
      loadIncidents()
      loadDashboard()
    } catch (e) { console.error(e) }
  }

  if (loading && !dashboard) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text dark:text-text-dark">Cloud & Security Operations</h1>
        <p className="text-sm text-muted mt-1">Infrastructure monitoring, security incidents, compliance tracking & FinOps</p>
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'overview' && dashboard && <OverviewTab dashboard={dashboard} incidents={incidents} />}
      {tab === 'incidents' && (
        <IncidentsTab incidents={incidents} filter={incidentFilter} setFilter={setIncidentFilter} onUpdateStatus={handleUpdateIncident} onAdd={() => setShowIncidentModal(true)} />
      )}
      {tab === 'compliance' && <ComplianceTab checks={compliance.checks} summary={compliance.summary} filter={complianceFilter} setFilter={setComplianceFilter} />}
      {tab === 'infrastructure' && <InfrastructureTab services={infrastructure.services} summary={infrastructure.summary} />}
      {tab === 'finops' && costs && <FinOpsTab costs={costs} />}

      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">Report Security Incident</h3>
            <input placeholder="Incident title" value={newIncident.title} onChange={e => setNewIncident({...newIncident, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <textarea placeholder="Description" value={newIncident.description} onChange={e => setNewIncident({...newIncident, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm h-20" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newIncident.category} onChange={e => setNewIncident({...newIncident, category: e.target.value})} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
                <option value="Vulnerability">Vulnerability</option>
                <option value="Intrusion Attempt">Intrusion Attempt</option>
                <option value="Data Leakage">Data Leakage</option>
                <option value="Malware">Malware</option>
                <option value="DDoS">DDoS</option>
                <option value="Unauthorized Access">Unauthorized Access</option>
                <option value="Misconfiguration">Misconfiguration</option>
                <option value="Insider Threat">Insider Threat</option>
              </select>
              <select value={newIncident.severity} onChange={e => setNewIncident({...newIncident, severity: e.target.value})} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <input placeholder="Affected system" value={newIncident.affected_system} onChange={e => setNewIncident({...newIncident, affected_system: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowIncidentModal(false)} className="px-4 py-2 text-sm text-muted hover:text-text">Cancel</button>
              <button onClick={handleCreateIncident} className="px-4 py-2 text-sm bg-error text-white rounded-lg hover:opacity-90">Report Incident</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OverviewTab({ dashboard, incidents }: { dashboard: DashboardType; incidents: SecurityIncident[] }) {
  const { incidents: inc, compliance: comp, infrastructure: infra, costs } = dashboard

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Open Incidents" value={((inc.by_status.open || 0) + (inc.by_status.investigating || 0))} trend={inc.open_critical > 0 ? 'down' : 'up'} />
        <Stat label="Compliance Score" value={`${comp.score}%`} trend={comp.score >= 75 ? 'up' : 'down'} />
        <Stat label="Avg Uptime" value={`${infra.avg_uptime}%`} trend={infra.avg_uptime >= 99.5 ? 'up' : 'down'} />
        <Stat label="Cloud Spend" value={formatINR(costs.current_month)} />
        <Stat label="DR Readiness" value={`${dashboard.dr_readiness_score}%`} trend={dashboard.dr_readiness_score >= 80 ? 'up' : 'down'} />
      </div>

      {/* Critical Alerts */}
      {inc.open_critical > 0 && (
        <div className="p-4 rounded-xl bg-error/5 border border-error/20">
          <div className="flex items-center gap-2 text-error font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" /> {inc.open_critical} Critical Incident{inc.open_critical > 1 ? 's' : ''} Open
          </div>
          {incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').map(i => (
            <p key={i.id} className="text-sm text-muted ml-7">• {i.title}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incident Summary */}
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-error" /> Security Incidents
          </h3>
          <div className="space-y-3">
            {Object.entries(inc.by_severity).map(([sev, count]) => (
              <div key={sev} className="flex items-center justify-between">
                <Badge variant={SEVERITY_BADGE[sev] || 'neutral'} dot>{sev}</Badge>
                <span className="font-medium text-text dark:text-text-dark">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border dark:border-border-dark space-y-2">
            {Object.entries(inc.by_status).map(([st, count]) => (
              <div key={st} className="flex items-center justify-between text-sm">
                <Badge variant={STATUS_BADGE[st] || 'neutral'}>{st}</Badge>
                <span className="text-muted">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Compliance Status
          </h3>
          <div className="space-y-4">
            {Object.entries(comp.by_framework).map(([fw, stats]: [string, any]) => {
              const total = (stats.compliant || 0) + (stats.partial || 0) + (stats.non_compliant || 0)
              const score = total > 0 ? Math.round((stats.compliant / total) * 100) : 0
              return (
                <div key={fw}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text dark:text-text-dark">{fw}</span>
                    <span className={`text-sm font-bold ${score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'}`}>{score}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-success" style={{ width: `${total > 0 ? (stats.compliant / total * 100) : 0}%` }} />
                    <div className="h-full bg-warning" style={{ width: `${total > 0 ? (stats.partial / total * 100) : 0}%` }} />
                    <div className="h-full bg-error" style={{ width: `${total > 0 ? (stats.non_compliant / total * 100) : 0}%` }} />
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-muted">
                    <span>{stats.compliant || 0} compliant</span>
                    <span>{stats.partial || 0} partial</span>
                    <span>{stats.non_compliant || 0} non-compliant</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Infrastructure */}
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-accent" /> Infrastructure Health
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(infra.by_status).map(([st, count]) => (
              <div key={st} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
                <p className={`text-xl font-bold ${st === 'healthy' ? 'text-success' : st === 'degraded' ? 'text-warning' : st === 'down' ? 'text-error' : 'text-muted'}`}>{count}</p>
                <p className="text-xs text-muted capitalize">{st}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-text dark:text-text-dark">{infra.avg_uptime}%</p>
            <p className="text-xs text-muted">Average Uptime (Production)</p>
          </div>
        </Card>

        {/* FinOps */}
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-warning" /> Cloud Cost Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-text dark:text-text-dark">{formatINR(costs.current_month)}</p>
              <p className="text-xs text-muted">Current Month</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
              <p className="text-xl font-bold text-text dark:text-text-dark">{formatINR(costs.budget)}</p>
              <p className="text-xs text-muted">Budget</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Variance</span>
            <span className={`text-sm font-bold ${costs.variance > 0 ? 'text-error' : 'text-success'}`}>
              {costs.variance > 0 ? '+' : ''}{formatINR(Math.abs(costs.variance))}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted">MoM Trend</span>
            <span className={`text-sm font-bold ${costs.trend_pct > 0 ? 'text-error' : 'text-success'}`}>
              {costs.trend_pct > 0 ? '+' : ''}{costs.trend_pct}%
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function IncidentsTab({ incidents, filter, setFilter, onUpdateStatus, onAdd }: {
  incidents: SecurityIncident[]; filter: string; setFilter: (v: string) => void;
  onUpdateStatus: (id: string, status: string) => void; onAdd: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
        <div className="flex-1" />
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-error text-white rounded-lg hover:opacity-90">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      <div className="space-y-3">
        {incidents.map(inc => (
          <Card key={inc.id}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${inc.severity === 'critical' ? 'text-error' : inc.severity === 'high' ? 'text-warning' : 'text-muted'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted">{inc.id}</span>
                  <Badge variant={SEVERITY_BADGE[inc.severity] || 'neutral'}>{inc.severity}</Badge>
                  <Badge variant={STATUS_BADGE[inc.status] || 'neutral'} dot>{inc.status}</Badge>
                  <Badge variant="info">{inc.category}</Badge>
                </div>
                <h3 className="font-medium text-text dark:text-text-dark mt-1">{inc.title}</h3>
                {inc.description && <p className="text-sm text-muted mt-1">{inc.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap">
                  {inc.affected_system && <span>System: {inc.affected_system}</span>}
                  {inc.source && <span>Source: {inc.source}</span>}
                  {inc.assigned_to_name && <span>Assigned: {inc.assigned_to_name}</span>}
                  <span>Detected: {inc.detected_at?.replace('T', ' ').slice(0, 16)}</span>
                </div>
                {inc.resolution && (
                  <div className="mt-2 p-2 rounded-lg bg-success/5 text-sm text-success">
                    Resolution: {inc.resolution}
                  </div>
                )}
              </div>
              <select
                value={inc.status}
                onChange={e => onUpdateStatus(inc.id, e.target.value)}
                className="px-2 py-1 rounded border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-xs shrink-0"
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </Card>
        ))}
        {incidents.length === 0 && <Card><p className="text-center text-muted py-8">No incidents found</p></Card>}
      </div>
    </div>
  )
}

function ComplianceTab({ checks, summary, filter, setFilter }: {
  checks: ComplianceCheck[]; summary: Record<string, any>; filter: string; setFilter: (v: string) => void
}) {
  const frameworks = Object.keys(summary)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
          <option value="">All Frameworks</option>
          <option value="HIPAA">HIPAA</option>
          <option value="DISHA">DISHA</option>
          <option value="SOC2">SOC 2</option>
          <option value="NABH">NABH</option>
        </select>
      </div>

      {/* Framework Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {frameworks.map(fw => {
          const s = summary[fw]
          return (
            <Card key={fw} className="text-center">
              <p className="text-xs text-muted font-medium mb-1">{fw}</p>
              <p className={`text-3xl font-bold ${s.score >= 80 ? 'text-success' : s.score >= 60 ? 'text-warning' : 'text-error'}`}>{s.score}%</p>
              <p className="text-xs text-muted mt-1">{s.compliant}/{s.total} compliant</p>
            </Card>
          )
        })}
      </div>

      {/* Control Details */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 text-muted font-medium">Framework</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Control</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Name</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Category</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Status</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Owner</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {checks.map(c => (
                <tr key={c.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3"><Badge variant="info">{c.framework}</Badge></td>
                  <td className="py-2 px-3 font-mono text-xs text-muted">{c.control_id}</td>
                  <td className="py-2 px-3">
                    <p className="font-medium text-text dark:text-text-dark">{c.control_name}</p>
                    {c.evidence && <p className="text-xs text-muted mt-0.5">{c.evidence}</p>}
                  </td>
                  <td className="py-2 px-3 text-muted text-xs">{c.category}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={STATUS_BADGE[c.status] || 'neutral'} dot>{c.status.replace('_', '-')}</Badge>
                  </td>
                  <td className="py-2 px-3 text-xs text-muted">{c.owner}</td>
                  <td className="py-2 px-3 text-xs text-muted">{c.next_review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function InfrastructureTab({ services, summary }: { services: InfraService[]; summary: any }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(summary?.by_status || {}).map(([st, count]) => (
          <Card key={st} className="text-center">
            <p className={`text-3xl font-bold ${st === 'healthy' ? 'text-success' : st === 'degraded' ? 'text-warning' : st === 'down' ? 'text-error' : 'text-muted'}`}>{count as number}</p>
            <p className="text-xs text-muted capitalize">{st}</p>
          </Card>
        ))}
        <Card className="text-center">
          <p className="text-3xl font-bold text-text dark:text-text-dark">{formatINR(summary?.total_monthly_cost || 0)}</p>
          <p className="text-xs text-muted">Monthly Cost</p>
        </Card>
      </div>

      {/* Service List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 text-muted font-medium">Service</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Provider</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Region</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Type</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Status</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Uptime</th>
                <th className="text-center py-2 px-3 text-muted font-medium">CPU</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Memory</th>
                <th className="text-right py-2 px-3 text-muted font-medium">Cost/mo</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3">
                    <p className="font-medium text-text dark:text-text-dark">{s.service_name}</p>
                    {s.environment !== 'production' && <Badge variant="neutral" size="sm">{s.environment}</Badge>}
                  </td>
                  <td className="py-2 px-3 text-muted">{s.provider}</td>
                  <td className="py-2 px-3 text-xs text-muted">{s.region}</td>
                  <td className="py-2 px-3 text-xs text-muted">{s.service_type}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={STATUS_BADGE[s.status] || 'neutral'} dot>{s.status}</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`text-xs font-medium ${s.uptime_pct >= 99.9 ? 'text-success' : s.uptime_pct >= 99 ? 'text-warning' : 'text-error'}`}>
                      {s.uptime_pct}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {s.cpu_usage != null ? (
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.cpu_usage > 80 ? 'bg-error' : s.cpu_usage > 60 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${s.cpu_usage}%` }} />
                        </div>
                        <span className="text-xs text-muted">{s.cpu_usage}%</span>
                      </div>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {s.memory_usage != null ? (
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.memory_usage > 80 ? 'bg-error' : s.memory_usage > 60 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${s.memory_usage}%` }} />
                        </div>
                        <span className="text-xs text-muted">{s.memory_usage}%</span>
                      </div>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="py-2 px-3 text-right text-xs font-medium text-text dark:text-text-dark">{formatINR(s.monthly_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function FinOpsTab({ costs }: { costs: CloudCosts }) {
  const currentTotal = costs.current_month.reduce((a, c) => a + c.cost_amount, 0)
  const budgetTotal = costs.current_month.reduce((a, c) => a + (c.budget_amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Monthly Trend */}
      <Card>
        <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Monthly Cost Trend
        </h3>
        <div className="space-y-2">
          {costs.trend.map(t => {
            const maxCost = Math.max(...costs.trend.map(x => x.total_cost))
            const pct = maxCost > 0 ? (t.total_cost / maxCost * 100) : 0
            const overBudget = t.total_cost > t.total_budget
            return (
              <div key={t.month} className="flex items-center gap-3">
                <span className="text-xs text-muted w-16">{t.month}</span>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${overBudget ? 'bg-error' : 'bg-primary'} flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${pct}%`, minWidth: '3rem' }}
                  >
                    <span className="text-xs font-bold text-white">{formatINR(t.total_cost)}</span>
                  </div>
                </div>
                <span className="text-xs text-muted w-16 text-right">{formatINR(t.total_budget)}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary" /> Actual</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-error" /> Over Budget</span>
          <span>Right column = Budget</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Provider */}
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-accent" /> Cost by Provider (March 2026)
          </h3>
          <div className="space-y-3">
            {costs.by_provider.map(p => (
              <div key={p.provider}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text dark:text-text-dark">{p.provider}</span>
                  <span className="text-sm font-bold text-text dark:text-text-dark">{formatINR(p.total_cost)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.total_cost > p.total_budget ? 'bg-error' : 'bg-primary'}`}
                    style={{ width: `${currentTotal > 0 ? (p.total_cost / currentTotal * 100) : 0}%` }} />
                </div>
                <p className="text-xs text-muted mt-0.5">Budget: {formatINR(p.total_budget)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* By Category */}
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-warning" /> Cost by Category (March 2026)
          </h3>
          <div className="space-y-3">
            {costs.by_category.map(c => (
              <div key={c.service_category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text dark:text-text-dark">{c.service_category}</span>
                  <span className="text-sm font-bold text-text dark:text-text-dark">{formatINR(c.total_cost)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.total_cost > c.total_budget ? 'bg-error' : 'bg-success'}`}
                    style={{ width: `${currentTotal > 0 ? (c.total_cost / currentTotal * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Over Budget Alerts */}
      {costs.over_budget.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-error mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Over-Budget Items ({costs.over_budget.length})
          </h3>
          <div className="space-y-2">
            {costs.over_budget.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-error/5">
                <span className="text-sm text-text dark:text-text-dark">{item.service_name}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-error">{formatINR(item.cost_amount)}</span>
                  <span className="text-xs text-muted ml-2">/ {formatINR(item.budget_amount)} budget</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
