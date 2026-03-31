import { useState, useEffect } from 'react'
import { changes, type ChangeDashboard, type ChangeRequest, type CabMeeting, type CabDecision } from '../lib/api'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'

const statusColors: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'neutral',
  pending: 'warning',
  in_review: 'info',
  approved: 'success',
  scheduled: 'info',
  implemented: 'success',
  rejected: 'error',
  cancelled: 'error',
}

const riskColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const typeLabels: Record<string, string> = {
  normal: 'Normal',
  standard: 'Standard',
  emergency: 'Emergency',
}

export default function ChangeManagement() {
  const [dashboard, setDashboard] = useState<ChangeDashboard | null>(null)
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [meetings, setMeetings] = useState<CabMeeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<CabMeeting | null>(null)
  const [meetingDecisions, setMeetingDecisions] = useState<CabDecision[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCabModal, setShowCabModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      changes.getDashboard(),
      changes.getRequests(),
      changes.getCab(),
    ]).then(([d, r, c]) => {
      setDashboard(d)
      setChangeRequests(r.changes)
      setMeetings(c.meetings || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const loadChanges = () => {
    changes.getRequests({ status: statusFilter || undefined, risk_level: riskFilter || undefined }).then(r => setChangeRequests(r.changes))
  }

  useEffect(() => { if (!loading) loadChanges() }, [statusFilter, riskFilter])

  const viewMeetingDetails = async (meeting: CabMeeting) => {
    setSelectedMeeting(meeting)
    const data = await changes.getCab(meeting.id)
    setMeetingDecisions(data.decisions || [])
  }

  const [showEditModal, setShowEditModal] = useState(false)
  const [editChange, setEditChange] = useState<ChangeRequest | null>(null)

  const handleStatusChange = async (id: string, newStatus: string) => {
    await changes.updateRequest({ id, status: newStatus })
    loadChanges()
    changes.getDashboard().then(setDashboard)
  }

  const handleEditChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editChange) return
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await changes.updateRequest({
        id: editChange.id,
        title: data.title as string,
        description: data.description as string,
        impact_assessment: data.impact_assessment as string,
        rollback_plan: data.rollback_plan as string,
        testing_plan: data.testing_plan as string,
        risk_level: data.risk_level as string,
        scheduled_date: data.scheduled_date as string || undefined,
      })
      setShowEditModal(false)
      setEditChange(null)
      loadChanges()
      changes.getDashboard().then(setDashboard)
    } catch (err) { console.error(err) }
  }

  const handleCreateChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await changes.createRequest({
        title: data.title as string,
        description: data.description as string,
        change_type: data.change_type as string,
        category: data.category as string,
        emr_system: data.emr_system as string,
        risk_level: data.risk_level as string,
        impact_assessment: data.impact_assessment as string,
        rollback_plan: data.rollback_plan as string,
        testing_plan: data.testing_plan as string,
        requester_name: data.requester_name as string,
        scheduled_date: (data.scheduled_date as string) || undefined,
      })
      setShowCreateModal(false)
      loadChanges()
      changes.getDashboard().then(setDashboard)
    } catch (err) { console.error(err) }
  }

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await changes.createMeeting({
        meeting_date: data.meeting_date as string,
        meeting_type: data.meeting_type as string,
        chair_name: data.chair_name as string,
        agenda: data.agenda as string,
        attendees: data.attendees as string,
      })
      setShowCabModal(false)
      changes.getCab().then(c => setMeetings(c.meetings || []))
      changes.getDashboard().then(setDashboard)
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'changes', label: 'Changes' },
    { id: 'cab', label: 'CAB Meetings' },
    { id: 'audit', label: 'Audit Trail' },
  ]

  const dashboardContent = dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Changes" value={dashboard.total} />
            <Stat label="Implemented" value={dashboard.implemented} />
            <Stat label="Success Rate" value={`${dashboard.success_rate}%`} />
            <Stat label="Emergency Changes" value={dashboard.emergency_count} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">Risk Distribution</h3>
              <div className="space-y-2">
                {['critical', 'high', 'medium', 'low'].map(risk => (
                  <div key={risk} className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold w-16 text-center ${riskColors[risk]}`}>{risk}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                      <div className={`rounded-full h-2.5 ${risk === 'critical' ? 'bg-red-500' : risk === 'high' ? 'bg-orange-500' : risk === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${((dashboard.by_risk[risk] || 0) / dashboard.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-text dark:text-text-dark w-6 text-right">{dashboard.by_risk[risk] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">Status Distribution</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.by_status).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant={statusColors[status] || 'neutral'}>{status.replace(/_/g, ' ')}</Badge>
                    <div className="flex items-center gap-2 flex-1 ml-3">
                      <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${(count / dashboard.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-text dark:text-text-dark w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Changes */}
          {dashboard.upcoming.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">Upcoming Scheduled Changes</h3>
              <div className="space-y-2">
                {dashboard.upcoming.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${riskColors[c.risk_level]}`}>{c.risk_level}</span>
                    <span className="text-sm text-text dark:text-text-dark flex-1 truncate">{c.title}</span>
                    {c.change_type === 'emergency' && <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">EMERGENCY</span>}
                    <span className="text-xs text-muted">{c.scheduled_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Implementations */}
          {dashboard.recent_implementations.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">Recent Implementations</h3>
              <div className="space-y-2">
                {dashboard.recent_implementations.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text dark:text-text-dark">{c.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${riskColors[c.risk_level]}`}>{c.risk_level}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">{c.implementation_notes}</p>
                      <span className="text-xs text-muted">{c.implemented_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAB Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">CAB Meeting Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(dashboard.cab_summary).map(([status, count]) => (
                <div key={status} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                  <div className="text-2xl font-bold text-text dark:text-text-dark">{count}</div>
                  <div className="text-xs text-muted capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
  )

  const changesContent = (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search changes..." className="text-sm border border-border dark:border-border-dark rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-text dark:text-text-dark w-48" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-border dark:border-border-dark rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-text dark:text-text-dark">
                <option value="">All Statuses</option>
                {['draft', 'pending', 'in_review', 'approved', 'scheduled', 'implemented', 'rejected'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="text-sm border border-border dark:border-border-dark rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-text dark:text-text-dark">
                <option value="">All Risk Levels</option>
                {['critical', 'high', 'medium', 'low'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              + New Change
            </button>
          </div>

          <div className="space-y-3">
            {changeRequests.filter(cr => !searchQuery || cr.title.toLowerCase().includes(searchQuery.toLowerCase()) || (cr.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || (cr.requester_name || '').toLowerCase().includes(searchQuery.toLowerCase())).map(cr => (
              <div key={cr.id} className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-text dark:text-text-dark">{cr.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${riskColors[cr.risk_level]}`}>{cr.risk_level}</span>
                      <Badge variant={statusColors[cr.status] || 'neutral'}>{cr.status.replace(/_/g, ' ')}</Badge>
                      {cr.change_type === 'emergency' && <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">EMERGENCY</span>}
                    </div>
                    <p className="text-sm text-muted line-clamp-2 mb-2">{cr.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {cr.emr_system && <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600">{cr.emr_system}</span>}
                      {cr.category && <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-muted">{cr.category}</span>}
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-muted">{typeLabels[cr.change_type] || cr.change_type}</span>
                      {cr.cab_required ? <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600">CAB Required</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => { setEditChange(cr); setShowEditModal(true) }} className="text-xs px-3 py-1 rounded bg-gray-50 dark:bg-slate-700 text-muted hover:text-text font-medium">Edit</button>
                    {cr.status === 'draft' && (
                      <button onClick={() => handleStatusChange(cr.id, 'pending')} className="text-xs px-3 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">Submit</button>
                    )}
                    {cr.status === 'pending' && (
                      <button onClick={() => handleStatusChange(cr.id, 'in_review')} className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Review</button>
                    )}
                    {cr.status === 'approved' && (
                      <button onClick={() => handleStatusChange(cr.id, 'scheduled')} className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Schedule</button>
                    )}
                    {cr.status === 'scheduled' && (
                      <button onClick={() => handleStatusChange(cr.id, 'implemented')} className="text-xs px-3 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium">Implement</button>
                    )}
                  </div>
                </div>
                {(cr.rollback_plan || cr.impact_assessment) && (
                  <div className="mt-3 pt-3 border-t border-border/50 dark:border-border-dark/50 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cr.impact_assessment && (
                      <div>
                        <span className="text-xs font-medium text-muted">Impact: </span>
                        <span className="text-xs text-text dark:text-text-dark">{cr.impact_assessment}</span>
                      </div>
                    )}
                    {cr.rollback_plan && (
                      <div>
                        <span className="text-xs font-medium text-muted">Rollback: </span>
                        <span className="text-xs text-text dark:text-text-dark">{cr.rollback_plan}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                  <span>By: {cr.requester_name || 'Unknown'}</span>
                  {cr.assignee_name && <span>Assigned: {cr.assignee_name}</span>}
                  {cr.scheduled_date && <span>Scheduled: {cr.scheduled_date}</span>}
                  {cr.implemented_at && <span>Implemented: {cr.implemented_at}</span>}
                  {cr.cab_decision && <span>CAB: {cr.cab_decision}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
  )

  const cabContent = (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowCabModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">+ New CAB Meeting</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map(m => (
              <div key={m.id} className={`bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-4 cursor-pointer hover:border-primary/50 transition-colors ${selectedMeeting?.id === m.id ? 'border-primary ring-1 ring-primary/20' : ''}`}
                onClick={() => viewMeetingDetails(m)}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-text dark:text-text-dark text-sm">
                    {m.meeting_type === 'emergency' ? '🚨 Emergency CAB' : 'CAB Meeting'} — {m.meeting_date}
                  </h4>
                  <Badge variant={m.status === 'completed' ? 'success' : m.status === 'scheduled' ? 'info' : 'neutral'}>{m.status}</Badge>
                </div>
                <div className="flex gap-3 text-xs text-muted mb-2">
                  <span>Chair: {m.chair_name}</span>
                  <span>Decisions: {m.decision_count || 0}</span>
                  <span>Approved: {m.approved_count || 0}</span>
                </div>
                {m.agenda && <p className="text-xs text-muted line-clamp-3 whitespace-pre-line">{m.agenda}</p>}
              </div>
            ))}
          </div>

          {/* Meeting Detail */}
          {selectedMeeting && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-1">
                {selectedMeeting.meeting_type === 'emergency' ? 'Emergency ' : ''}CAB Meeting — {selectedMeeting.meeting_date}
              </h3>
              <p className="text-sm text-muted mb-3">Chair: {selectedMeeting.chair_name} | Attendees: {selectedMeeting.attendees}</p>

              {selectedMeeting.minutes && (
                <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <span className="text-xs font-medium text-muted block mb-1">Minutes</span>
                  <p className="text-sm text-text dark:text-text-dark whitespace-pre-line">{selectedMeeting.minutes}</p>
                </div>
              )}

              {meetingDecisions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text dark:text-text-dark mb-2">Decisions ({meetingDecisions.length})</h4>
                  <div className="space-y-2">
                    {meetingDecisions.map(d => (
                      <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${d.decision === 'approved' ? 'bg-green-500' : d.decision === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text dark:text-text-dark">{d.change_title}</span>
                            <Badge variant={d.decision === 'approved' ? 'success' : d.decision === 'rejected' ? 'error' : 'warning'}>{d.decision}</Badge>
                            {d.risk_level && <span className={`px-2 py-0.5 rounded text-xs ${riskColors[d.risk_level]}`}>{d.risk_level}</span>}
                          </div>
                          {d.conditions && <p className="text-xs text-muted mt-1">{d.conditions}</p>}
                          {d.voter_summary && <span className="text-xs text-muted">Vote: {d.voter_summary}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
  )

  const auditContent = (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-4">Change Implementation History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left py-2 px-3 text-muted font-medium">ID</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Change</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Type</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Risk</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Requested By</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Created</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Implemented</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">CAB</th>
                  </tr>
                </thead>
                <tbody>
                  {[...changeRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(cr => (
                    <tr key={cr.id} className="border-b border-border/50 dark:border-border-dark/50">
                      <td className="py-2 px-3 text-muted font-mono text-xs">{cr.id}</td>
                      <td className="py-2 px-3 text-text dark:text-text-dark max-w-xs truncate">{cr.title}</td>
                      <td className="py-2 px-3">
                        {cr.change_type === 'emergency' ? <span className="text-xs font-bold text-red-600">EMRG</span> : <span className="text-xs text-muted">{cr.change_type}</span>}
                      </td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${riskColors[cr.risk_level]}`}>{cr.risk_level}</span></td>
                      <td className="py-2 px-3"><Badge variant={statusColors[cr.status] || 'neutral'}>{cr.status.replace(/_/g, ' ')}</Badge></td>
                      <td className="py-2 px-3 text-muted text-xs">{cr.requester_name}</td>
                      <td className="py-2 px-3 text-muted text-xs">{cr.created_at?.split('T')[0] || cr.created_at?.split(' ')[0]}</td>
                      <td className="py-2 px-3 text-muted text-xs">{cr.implemented_at || '—'}</td>
                      <td className="py-2 px-3 text-xs">{cr.cab_decision ? <Badge variant={cr.cab_decision === 'approved' ? 'success' : 'warning'}>{cr.cab_decision}</Badge> : cr.cab_required ? 'Required' : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Breakdown */}
          {dashboard && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">By Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(dashboard.by_category).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-center">
                    <div className="text-lg font-bold text-text dark:text-text-dark">{count}</div>
                    <div className="text-xs text-muted">{cat.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Change Management</h1>
        <p className="text-sm text-muted mt-1">EMR change control, risk assessment, CAB governance, and implementation tracking</p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'dashboard' && dashboardContent}
      {activeTab === 'changes' && changesContent}
      {activeTab === 'cab' && cabContent}
      {activeTab === 'audit' && auditContent}

      {/* Create Change Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-text dark:text-text-dark mb-4">New Change Request</h3>
            <form onSubmit={handleCreateChange} className="space-y-3">
              <input name="title" required placeholder="Change Title" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="description" placeholder="Description" rows={3} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select name="change_type" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                  <option value="normal">Normal</option>
                  <option value="standard">Standard</option>
                  <option value="emergency">Emergency</option>
                </select>
                <select name="risk_level" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="category" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                  <option value="">Category</option>
                  {['software_update', 'configuration', 'integration', 'security', 'infrastructure', 'new_feature', 'performance', 'ui_change'].map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
                <input name="emr_system" placeholder="EMR System" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              </div>
              <input name="requester_name" placeholder="Requester Name" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="impact_assessment" placeholder="Impact Assessment" rows={2} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="rollback_plan" placeholder="Rollback Plan" rows={2} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="testing_plan" placeholder="Testing Plan" rows={2} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <input name="scheduled_date" type="date" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Submit Change</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowEditModal(false); setEditChange(null) }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-text dark:text-text-dark mb-4">Edit Change Request</h3>
            <form onSubmit={handleEditChange} className="space-y-3">
              <input name="title" required defaultValue={editChange.title} placeholder="Title" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="description" defaultValue={editChange.description || ''} rows={3} placeholder="Description" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <select name="risk_level" defaultValue={editChange.risk_level} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <textarea name="impact_assessment" defaultValue={editChange.impact_assessment || ''} rows={2} placeholder="Impact Assessment" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="rollback_plan" defaultValue={editChange.rollback_plan || ''} rows={2} placeholder="Rollback Plan" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="testing_plan" defaultValue={editChange.testing_plan || ''} rows={2} placeholder="Testing Plan" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <input name="scheduled_date" type="date" defaultValue={editChange.scheduled_date || ''} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowEditModal(false); setEditChange(null) }} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAB Meeting Modal */}
      {showCabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCabModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-text dark:text-text-dark mb-4">Schedule CAB Meeting</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <input name="meeting_date" type="date" required className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <select name="meeting_type" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                <option value="regular">Regular CAB</option>
                <option value="emergency">Emergency CAB</option>
              </select>
              <input name="chair_name" required placeholder="Chair Name" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <input name="attendees" placeholder="Attendees (comma-separated)" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="agenda" placeholder="Meeting Agenda" rows={4} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCabModal(false)} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
