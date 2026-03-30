import { useState, useEffect } from 'react'
import {
  ClipboardCheck, Bug, AlertTriangle, CheckCircle2, XCircle, Clock, Ban,
  ChevronDown, ChevronRight, Plus, BarChart3, ListChecks, Filter,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { testing } from '../lib/api'
import type { TestDashboard, TestSuite, TestScript, TestDefect } from '../lib/api'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'suites', label: 'Test Suites' },
  { id: 'scripts', label: 'Test Scripts' },
  { id: 'defects', label: 'Defects' },
]

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; label: string }> = {
  pass: { variant: 'success', label: 'Pass' },
  fail: { variant: 'error', label: 'Fail' },
  blocked: { variant: 'warning', label: 'Blocked' },
  not_run: { variant: 'neutral', label: 'Not Run' },
}

const SEVERITY_BADGE: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
}

const DEFECT_STATUS_BADGE: Record<string, 'error' | 'warning' | 'success' | 'info' | 'neutral'> = {
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'neutral',
}

export default function TestManagement() {
  const [tab, setTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState<TestDashboard | null>(null)
  const [suites, setSuites] = useState<TestSuite[]>([])
  const [scripts, setScripts] = useState<TestScript[]>([])
  const [defects, setDefects] = useState<TestDefect[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSuite, setSelectedSuite] = useState<string>('')
  const [scriptFilter, setScriptFilter] = useState<string>('')
  const [defectFilter, setDefectFilter] = useState<string>('')
  const [expandedSuite, setExpandedSuite] = useState<string>('')
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [showDefectModal, setShowDefectModal] = useState(false)
  const [newScript, setNewScript] = useState({ suite_id: '', title: '', description: '', priority: 'medium', preconditions: '', steps: '', expected_result: '' })
  const [newDefect, setNewDefect] = useState({ suite_id: '', script_id: '', title: '', description: '', severity: 'medium', reporter: '' })

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (tab === 'scripts') loadScripts()
    if (tab === 'defects') loadDefects()
    if (tab === 'suites') loadSuites()
  }, [tab, selectedSuite, scriptFilter, defectFilter])

  async function loadDashboard() {
    try {
      setLoading(true)
      const data = await testing.dashboard()
      setDashboard(data)
      setSuites(data.suites)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadSuites() {
    try {
      const data = await testing.suites()
      setSuites(data.suites)
    } catch (e) { console.error(e) }
  }

  async function loadScripts() {
    try {
      const params: Record<string, string> = {}
      if (selectedSuite) params.suite_id = selectedSuite
      if (scriptFilter) params.status = scriptFilter
      const data = await testing.scripts(params)
      setScripts(data.scripts)
    } catch (e) { console.error(e) }
  }

  async function loadDefects() {
    try {
      const params: Record<string, string> = {}
      if (selectedSuite) params.suite_id = selectedSuite
      if (defectFilter) params.severity = defectFilter
      const data = await testing.defects(params)
      setDefects(data.defects)
    } catch (e) { console.error(e) }
  }

  async function handleUpdateScriptStatus(id: string, status: string) {
    try {
      await testing.updateScript({ id, status })
      loadScripts()
      loadDashboard()
    } catch (e) { console.error(e) }
  }

  async function handleUpdateDefectStatus(id: string, status: string) {
    try {
      await testing.updateDefect({ id, status })
      loadDefects()
      loadDashboard()
    } catch (e) { console.error(e) }
  }

  async function handleCreateScript() {
    if (!newScript.suite_id || !newScript.title) return
    try {
      await testing.createScript(newScript)
      setShowScriptModal(false)
      setNewScript({ suite_id: '', title: '', description: '', priority: 'medium', preconditions: '', steps: '', expected_result: '' })
      loadScripts()
      loadDashboard()
    } catch (e) { console.error(e) }
  }

  async function handleCreateDefect() {
    if (!newDefect.suite_id || !newDefect.title) return
    try {
      await testing.createDefect(newDefect)
      setShowDefectModal(false)
      setNewDefect({ suite_id: '', script_id: '', title: '', description: '', severity: 'medium', reporter: '' })
      loadDefects()
      loadDashboard()
    } catch (e) { console.error(e) }
  }

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text dark:text-text-dark">
            EMR Test Management
          </h1>
          <p className="text-sm text-muted mt-1">AIIMS Epic Go-Live — Test execution tracking & defect management</p>
        </div>
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'dashboard' && dashboard && <DashboardTab dashboard={dashboard} suites={suites} onSuiteClick={(id) => { setSelectedSuite(id); setTab('scripts') }} />}
      {tab === 'suites' && <SuitesTab suites={suites} expandedSuite={expandedSuite} setExpandedSuite={setExpandedSuite} onViewScripts={(id) => { setSelectedSuite(id); setTab('scripts') }} />}
      {tab === 'scripts' && (
        <ScriptsTab
          scripts={scripts}
          suites={suites}
          selectedSuite={selectedSuite}
          setSelectedSuite={(v) => { setSelectedSuite(v) }}
          statusFilter={scriptFilter}
          setStatusFilter={setScriptFilter}
          onUpdateStatus={handleUpdateScriptStatus}
          onAdd={() => setShowScriptModal(true)}
        />
      )}
      {tab === 'defects' && (
        <DefectsTab
          defects={defects}
          suites={suites}
          selectedSuite={selectedSuite}
          setSelectedSuite={setSelectedSuite}
          severityFilter={defectFilter}
          setSeverityFilter={setDefectFilter}
          onUpdateStatus={handleUpdateDefectStatus}
          onAdd={() => setShowDefectModal(true)}
        />
      )}

      {/* Create Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">New Test Script</h3>
            <select value={newScript.suite_id} onChange={e => setNewScript({...newScript, suite_id: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="">Select Suite</option>
              {suites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Title" value={newScript.title} onChange={e => setNewScript({...newScript, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <textarea placeholder="Description" value={newScript.description} onChange={e => setNewScript({...newScript, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm h-20" />
            <textarea placeholder="Test steps" value={newScript.steps} onChange={e => setNewScript({...newScript, steps: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm h-20" />
            <input placeholder="Expected result" value={newScript.expected_result} onChange={e => setNewScript({...newScript, expected_result: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <select value={newScript.priority} onChange={e => setNewScript({...newScript, priority: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowScriptModal(false)} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
              <button onClick={handleCreateScript} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">Create Script</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Defect Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">Log Defect</h3>
            <select value={newDefect.suite_id} onChange={e => setNewDefect({...newDefect, suite_id: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="">Select Suite</option>
              {suites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Defect Title" value={newDefect.title} onChange={e => setNewDefect({...newDefect, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <textarea placeholder="Description" value={newDefect.description} onChange={e => setNewDefect({...newDefect, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm h-20" />
            <select value={newDefect.severity} onChange={e => setNewDefect({...newDefect, severity: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input placeholder="Reporter name" value={newDefect.reporter} onChange={e => setNewDefect({...newDefect, reporter: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDefectModal(false)} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
              <button onClick={handleCreateDefect} className="px-4 py-2 text-sm bg-error text-white rounded-lg hover:opacity-90">Log Defect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dashboard Tab
function DashboardTab({ dashboard, suites, onSuiteClick }: { dashboard: TestDashboard; suites: TestSuite[]; onSuiteClick: (id: string) => void }) {
  const { summary, script_status, defect_severity, defect_status } = dashboard
  const totalExecuted = summary.total_scripts - (script_status.not_run || 0)

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Test Suites" value={summary.total_suites} />
        <Stat label="Total Scripts" value={summary.total_scripts} />
        <Stat label="Pass Rate" value={`${summary.pass_rate}%`} trend={summary.pass_rate >= 70 ? 'up' : 'down'} />
        <Stat label="Execution" value={`${summary.execution_rate}%`} />
        <Stat label="Open Defects" value={summary.total_defects - (defect_status.resolved || 0) - (defect_status.closed || 0)} />
      </div>

      {/* Execution Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Script Execution Status
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Passed', count: script_status.pass || 0, color: 'bg-success', icon: <CheckCircle2 className="w-4 h-4 text-success" /> },
              { label: 'Failed', count: script_status.fail || 0, color: 'bg-error', icon: <XCircle className="w-4 h-4 text-error" /> },
              { label: 'Blocked', count: script_status.blocked || 0, color: 'bg-warning', icon: <Ban className="w-4 h-4 text-warning" /> },
              { label: 'Not Run', count: script_status.not_run || 0, color: 'bg-gray-300 dark:bg-gray-600', icon: <Clock className="w-4 h-4 text-muted" /> },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                {s.icon}
                <span className="text-sm text-text dark:text-text-dark w-20">{s.label}</span>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${summary.total_scripts > 0 ? (s.count / summary.total_scripts * 100) : 0}%`, minWidth: s.count > 0 ? '2rem' : 0 }}
                  >
                    {s.count > 0 && <span className="text-xs font-bold text-white">{s.count}</span>}
                  </div>
                </div>
                <span className="text-sm font-medium text-muted w-10 text-right">
                  {summary.total_scripts > 0 ? Math.round(s.count / summary.total_scripts * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Bug className="w-4 h-4 text-error" /> Defect Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-error/5">
              <p className="text-2xl font-bold text-error">{defect_severity.critical || 0}</p>
              <p className="text-xs text-muted">Critical</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-warning/5">
              <p className="text-2xl font-bold text-warning">{defect_severity.high || 0}</p>
              <p className="text-xs text-muted">High</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-accent/5">
              <p className="text-2xl font-bold text-accent">{defect_severity.medium || 0}</p>
              <p className="text-xs text-muted">Medium</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
              <p className="text-2xl font-bold text-muted">{defect_severity.low || 0}</p>
              <p className="text-xs text-muted">Low</p>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(defect_status).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <Badge variant={DEFECT_STATUS_BADGE[key] || 'neutral'} dot>{key.replace('_', ' ')}</Badge>
                <span className="font-medium text-text dark:text-text-dark">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Suite Progress */}
      <Card>
        <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" /> Suite-wise Progress
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 text-muted font-medium">Suite</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Workstream</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Total</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Pass</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Fail</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Blocked</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Not Run</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Defects</th>
                <th className="py-2 px-3 text-muted font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {suites.map(s => {
                const total = (s.passed || 0) + (s.failed || 0) + (s.blocked || 0) + (s.not_run || 0)
                const executed = total - (s.not_run || 0)
                const pct = total > 0 ? Math.round(executed / total * 100) : 0
                const passPct = total > 0 ? Math.round((s.passed || 0) / total * 100) : 0
                return (
                  <tr key={s.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => onSuiteClick(s.id)}>
                    <td className="py-2.5 px-3 font-medium text-text dark:text-text-dark">{s.name}</td>
                    <td className="py-2.5 px-3 text-muted">{s.workstream}</td>
                    <td className="py-2.5 px-3 text-center">{total}</td>
                    <td className="py-2.5 px-3 text-center text-success font-medium">{s.passed || 0}</td>
                    <td className="py-2.5 px-3 text-center text-error font-medium">{s.failed || 0}</td>
                    <td className="py-2.5 px-3 text-center text-warning font-medium">{s.blocked || 0}</td>
                    <td className="py-2.5 px-3 text-center text-muted">{s.not_run || 0}</td>
                    <td className="py-2.5 px-3 text-center">
                      {(s.open_defects || 0) > 0 ? <Badge variant="error">{s.open_defects}</Badge> : <span className="text-muted">0</span>}
                    </td>
                    <td className="py-2.5 px-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${passPct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// Suites Tab
function SuitesTab({ suites, expandedSuite, setExpandedSuite, onViewScripts }: {
  suites: TestSuite[]; expandedSuite: string; setExpandedSuite: (id: string) => void; onViewScripts: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {suites.map(s => {
        const total = (s.passed || 0) + (s.failed || 0) + (s.blocked || 0) + (s.not_run || 0)
        const expanded = expandedSuite === s.id
        return (
          <Card key={s.id} className="overflow-hidden">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedSuite(expanded ? '' : s.id)}>
              {expanded ? <ChevronDown className="w-4 h-4 text-muted shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text dark:text-text-dark">{s.name}</h3>
                  <Badge variant="info">{s.workstream}</Badge>
                  {s.status !== 'not_started' && <Badge variant={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'warning' : 'neutral'}>{s.status.replace('_', ' ')}</Badge>}
                </div>
                <p className="text-xs text-muted mt-0.5">{total} scripts{s.target_date ? ` · Target: ${s.target_date}` : ''}{s.assigned_to ? ` · ${s.assigned_to}` : ''}</p>
              </div>
              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="text-success font-medium">{s.passed || 0} pass</span>
                <span className="text-error font-medium">{s.failed || 0} fail</span>
                <span className="text-warning font-medium">{s.blocked || 0} blocked</span>
              </div>
            </div>
            {expanded && (
              <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-success">{s.passed || 0}</p>
                    <p className="text-xs text-muted">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-error">{s.failed || 0}</p>
                    <p className="text-xs text-muted">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-warning">{s.blocked || 0}</p>
                    <p className="text-xs text-muted">Blocked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-muted">{s.not_run || 0}</p>
                    <p className="text-xs text-muted">Not Run</p>
                  </div>
                </div>
                {/* Stacked progress bar */}
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  {total > 0 && (
                    <>
                      <div className="h-full bg-success" style={{ width: `${(s.passed || 0) / total * 100}%` }} />
                      <div className="h-full bg-error" style={{ width: `${(s.failed || 0) / total * 100}%` }} />
                      <div className="h-full bg-warning" style={{ width: `${(s.blocked || 0) / total * 100}%` }} />
                    </>
                  )}
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => onViewScripts(s.id)} className="text-sm text-primary hover:underline">
                    View Scripts →
                  </button>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// Scripts Tab
function ScriptsTab({ scripts, suites, selectedSuite, setSelectedSuite, statusFilter, setStatusFilter, onUpdateStatus, onAdd }: {
  scripts: TestScript[]; suites: TestSuite[]; selectedSuite: string; setSelectedSuite: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void; onUpdateStatus: (id: string, status: string) => void; onAdd: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select value={selectedSuite} onChange={e => setSelectedSuite(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
            <option value="">All Suites</option>
            {suites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
            <option value="">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="blocked">Blocked</option>
            <option value="not_run">Not Run</option>
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">
          <Plus className="w-4 h-4" /> Add Script
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 text-muted font-medium">ID</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Title</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Suite</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Priority</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Status</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Tester</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Defects</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map(s => (
                <tr key={s.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3 text-xs font-mono text-muted">{s.id}</td>
                  <td className="py-2 px-3">
                    <p className="font-medium text-text dark:text-text-dark">{s.title}</p>
                    {s.notes && <p className="text-xs text-muted mt-0.5">{s.notes}</p>}
                  </td>
                  <td className="py-2 px-3 text-muted text-xs">{s.suite_name}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={SEVERITY_BADGE[s.priority] || 'neutral'}>{s.priority}</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={STATUS_BADGE[s.status]?.variant || 'neutral'} dot>{STATUS_BADGE[s.status]?.label || s.status}</Badge>
                  </td>
                  <td className="py-2 px-3 text-xs text-muted">{s.tester_name || '—'}</td>
                  <td className="py-2 px-3 text-center">
                    {(s.open_defects || 0) > 0 ? <Badge variant="error">{s.open_defects}</Badge> : <span className="text-muted">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <select
                      value={s.status}
                      onChange={e => onUpdateStatus(s.id, e.target.value)}
                      className="px-2 py-1 rounded border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="not_run">Not Run</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </td>
                </tr>
              ))}
              {scripts.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-muted">No scripts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// Defects Tab
function DefectsTab({ defects, suites, selectedSuite, setSelectedSuite, severityFilter, setSeverityFilter, onUpdateStatus, onAdd }: {
  defects: TestDefect[]; suites: TestSuite[]; selectedSuite: string; setSelectedSuite: (v: string) => void;
  severityFilter: string; setSeverityFilter: (v: string) => void; onUpdateStatus: (id: string, status: string) => void; onAdd: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select value={selectedSuite} onChange={e => setSelectedSuite(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
            <option value="">All Suites</option>
            {suites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex-1" />
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-error text-white rounded-lg hover:opacity-90">
          <Bug className="w-4 h-4" /> Log Defect
        </button>
      </div>

      <div className="space-y-3">
        {defects.map(d => (
          <Card key={d.id}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertTriangle className={`w-5 h-5 ${d.severity === 'critical' ? 'text-error' : d.severity === 'high' ? 'text-warning' : 'text-muted'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted">{d.id}</span>
                  <Badge variant={SEVERITY_BADGE[d.severity] || 'neutral'}>{d.severity}</Badge>
                  <Badge variant={DEFECT_STATUS_BADGE[d.status] || 'neutral'} dot>{d.status.replace('_', ' ')}</Badge>
                </div>
                <h3 className="font-medium text-text dark:text-text-dark mt-1">{d.title}</h3>
                {d.description && <p className="text-sm text-muted mt-1">{d.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                  <span>Suite: {d.suite_name}</span>
                  {d.script_title && <span>Script: {d.script_title}</span>}
                  {d.reporter && <span>Reporter: {d.reporter}</span>}
                  {d.assigned_to && <span>Assigned: {d.assigned_to}</span>}
                  <span>{d.created_at?.split('T')[0]}</span>
                </div>
                {d.resolution && (
                  <div className="mt-2 p-2 rounded-lg bg-success/5 text-sm text-success">
                    Resolution: {d.resolution}
                  </div>
                )}
              </div>
              <select
                value={d.status}
                onChange={e => onUpdateStatus(d.id, e.target.value)}
                className="px-2 py-1 rounded border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-xs shrink-0"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </Card>
        ))}
        {defects.length === 0 && (
          <Card><p className="text-center text-muted py-8">No defects found</p></Card>
        )}
      </div>
    </div>
  )
}
