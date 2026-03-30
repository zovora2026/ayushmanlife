import { useState, useEffect } from 'react'
import { governance, type GovernanceDashboard, type EnhancementRequest, type GovernanceReview } from '../lib/api'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'

const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  submitted: 'info',
  in_review: 'warning',
  approved: 'success',
  in_development: 'info',
  completed: 'success',
  deferred: 'default',
  rejected: 'error',
}

const effortColors: Record<string, string> = {
  small: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  large: 'bg-red-100 text-red-700',
}

function priorityColor(score: number) {
  if (score >= 85) return 'text-red-600 bg-red-50'
  if (score >= 70) return 'text-amber-600 bg-amber-50'
  return 'text-blue-600 bg-blue-50'
}

export default function EnhancementGovernance() {
  const [dashboard, setDashboard] = useState<GovernanceDashboard | null>(null)
  const [requests, setRequests] = useState<EnhancementRequest[]>([])
  const [reviews, setReviews] = useState<GovernanceReview[]>([])
  const [reviewCommittees, setReviewCommittees] = useState<Record<string, { total: number; approved: number; pending: number; deferred: number }>>({})
  const [statusFilter, setStatusFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<EnhancementRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      governance.getDashboard(),
      governance.getRequests(),
      governance.getReviews(),
    ]).then(([d, r, rv]) => {
      setDashboard(d)
      setRequests(r.requests)
      setReviews(rv.reviews)
      setReviewCommittees(rv.by_committee)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const loadRequests = () => {
    governance.getRequests({ status: statusFilter || undefined, department: deptFilter || undefined }).then(r => setRequests(r.requests))
  }

  useEffect(() => { if (!loading) loadRequests() }, [statusFilter, deptFilter])

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await governance.createRequest({
        title: data.title as string,
        description: data.description as string,
        department: data.department as string,
        requester_name: data.requester_name as string,
        request_type: data.request_type as string,
        emr_module: data.emr_module as string,
        clinical_impact: Number(data.clinical_impact) || 0,
        operational_impact: Number(data.operational_impact) || 0,
        regulatory_impact: Number(data.regulatory_impact) || 0,
        effort_estimate: data.effort_estimate as string,
        effort_hours: Number(data.effort_hours) || undefined,
      })
      setShowCreateModal(false)
      loadRequests()
      governance.getDashboard().then(setDashboard)
    } catch (err) { console.error(err) }
  }

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRequest) return
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await governance.createReview({
        request_id: selectedRequest.id,
        committee: data.committee as string,
        reviewer_name: data.reviewer_name as string,
        decision: data.decision as string,
        comments: data.comments as string,
        meeting_date: data.meeting_date as string,
        priority_override: Number(data.priority_override) || undefined,
      })
      setShowReviewModal(false)
      setSelectedRequest(null)
      loadRequests()
      governance.getReviews().then(rv => { setReviews(rv.reviews); setReviewCommittees(rv.by_committee) })
      governance.getDashboard().then(setDashboard)
    } catch (err) { console.error(err) }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await governance.updateRequest({ id, status: newStatus })
    loadRequests()
    governance.getDashboard().then(setDashboard)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const departments = [...new Set(requests.map(r => r.department))].sort()

  const tabs = [
    {
      label: 'Dashboard',
      content: dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Requests" value={dashboard.total} />
            <Stat label="Completed" value={dashboard.completed} />
            <Stat label="Avg Priority Score" value={dashboard.avg_priority_score} />
            <Stat label="Total Effort (hrs)" value={dashboard.total_effort_hours.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">By Status</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.by_status).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant={statusColors[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>
                    <div className="flex items-center gap-2 flex-1 ml-3">
                      <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${(count / dashboard.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-text dark:text-text-dark w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">By Department</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.by_department).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-muted w-40 truncate">{dept}</span>
                    <div className="flex items-center gap-2 flex-1 ml-3">
                      <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-secondary rounded-full h-2" style={{ width: `${(count / dashboard.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-text dark:text-text-dark w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review Pipeline */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">Governance Review Pipeline</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(dashboard.review_summary).map(([decision, count]) => (
                <div key={decision} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
                  <div className="text-2xl font-bold text-text dark:text-text-dark">{count}</div>
                  <div className="text-xs text-muted capitalize">{decision}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Progress */}
          {dashboard.sprints.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-semibold text-text dark:text-text-dark mb-3">Sprint Progress</h3>
              <div className="space-y-3">
                {dashboard.sprints.map(s => (
                  <div key={s.sprint} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text dark:text-text-dark w-32">{s.sprint}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-3">
                      <div className="bg-green-500 rounded-full h-3" style={{ width: `${s.count > 0 ? (s.completed / s.count) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm text-muted w-20">{s.completed}/{s.count} done</span>
                    <span className="text-xs text-muted">{s.total_hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backlog Aging */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">Backlog Aging</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left py-2 px-3 text-muted font-medium">Request</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Status</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Score</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Age (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.backlog_aging.slice(0, 10).map(item => (
                    <tr key={item.id} className="border-b border-border/50 dark:border-border-dark/50">
                      <td className="py-2 px-3 text-text dark:text-text-dark">{item.title}</td>
                      <td className="py-2 px-3"><Badge variant={statusColors[item.status] || 'default'}>{item.status.replace(/_/g, ' ')}</Badge></td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColor(item.priority_score)}`}>{item.priority_score}</span>
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${item.age_days > 90 ? 'text-red-500' : item.age_days > 60 ? 'text-amber-500' : 'text-text dark:text-text-dark'}`}>{item.age_days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Requests',
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-border dark:border-border-dark rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-text dark:text-text-dark">
                <option value="">All Statuses</option>
                {['submitted', 'in_review', 'approved', 'in_development', 'completed', 'deferred'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="text-sm border border-border dark:border-border-dark rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-text dark:text-text-dark">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              + New Request
            </button>
          </div>

          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-text dark:text-text-dark truncate">{req.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColor(req.priority_score)}`}>{req.priority_score}</span>
                    </div>
                    <p className="text-sm text-muted line-clamp-2 mb-2">{req.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant={statusColors[req.status] || 'default'}>{req.status.replace(/_/g, ' ')}</Badge>
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-muted">{req.department}</span>
                      {req.emr_module && <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600">{req.emr_module}</span>}
                      {req.effort_estimate && <span className={`px-2 py-0.5 rounded text-xs font-medium ${effortColors[req.effort_estimate] || ''}`}>{req.effort_estimate}{req.effort_hours ? ` (${req.effort_hours}h)` : ''}</span>}
                      {req.request_type === 'regulatory' && <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 font-medium">Regulatory</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {req.status === 'submitted' && (
                      <button onClick={() => handleStatusChange(req.id, 'in_review')} className="text-xs px-3 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">Send to Review</button>
                    )}
                    {req.status === 'approved' && (
                      <button onClick={() => handleStatusChange(req.id, 'in_development')} className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Start Dev</button>
                    )}
                    {req.status === 'in_development' && (
                      <button onClick={() => handleStatusChange(req.id, 'completed')} className="text-xs px-3 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium">Complete</button>
                    )}
                    {['submitted', 'in_review'].includes(req.status) && (
                      <button onClick={() => { setSelectedRequest(req); setShowReviewModal(true) }} className="text-xs px-3 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 font-medium">Review</button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                  <span>By: {req.requester_name || 'Unknown'}</span>
                  {req.sprint && <span>Sprint: {req.sprint}</span>}
                  {req.target_date && <span>Target: {req.target_date}</span>}
                  {req.assignee_name && <span>Assigned: {req.assignee_name}</span>}
                  <span>Reviews: {req.review_count || 0} ({req.approved_count || 0} approved)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: 'Governance',
      content: (
        <div className="space-y-6">
          {/* Committee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(reviewCommittees).map(([committee, stats]) => (
              <div key={committee} className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-4">
                <h4 className="font-semibold text-text dark:text-text-dark text-sm mb-3">{committee}</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">{stats.approved}</div>
                    <div className="text-xs text-muted">Approved</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
                    <div className="text-xs text-muted">Pending</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-500">{stats.deferred}</div>
                    <div className="text-xs text-muted">Deferred</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-muted">{stats.total} total reviews</div>
              </div>
            ))}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">Review History</h3>
            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${rev.decision === 'approved' ? 'bg-green-500' : rev.decision === 'pending' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text dark:text-text-dark truncate">{rev.request_title}</span>
                      <Badge variant={rev.decision === 'approved' ? 'success' : rev.decision === 'pending' ? 'warning' : 'default'}>{rev.decision}</Badge>
                    </div>
                    <p className="text-xs text-muted">{rev.comments}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted">
                      <span>{rev.committee}</span>
                      <span>By: {rev.reviewer_name}</span>
                      {rev.meeting_date && <span>Meeting: {rev.meeting_date}</span>}
                      {rev.priority_override && <span>Priority override: {rev.priority_override}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Backlog',
      content: dashboard && (
        <div className="space-y-6">
          {/* EMR Module breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">By EMR Module</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(dashboard.by_module).sort((a, b) => b[1] - a[1]).map(([mod, count]) => (
                <div key={mod} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 text-center">
                  <div className="text-lg font-bold text-text dark:text-text-dark">{count}</div>
                  <div className="text-xs text-muted">{mod}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prioritized Backlog */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-semibold text-text dark:text-text-dark mb-3">Prioritized Backlog</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left py-2 px-3 text-muted font-medium">Rank</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Title</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Department</th>
                    <th className="text-center py-2 px-3 text-muted font-medium">Score</th>
                    <th className="text-center py-2 px-3 text-muted font-medium">Clinical</th>
                    <th className="text-center py-2 px-3 text-muted font-medium">Operational</th>
                    <th className="text-center py-2 px-3 text-muted font-medium">Regulatory</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Effort</th>
                    <th className="text-left py-2 px-3 text-muted font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...requests].sort((a, b) => b.priority_score - a.priority_score).map((req, idx) => (
                    <tr key={req.id} className="border-b border-border/50 dark:border-border-dark/50">
                      <td className="py-2 px-3 text-muted font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 text-text dark:text-text-dark max-w-xs truncate">{req.title}</td>
                      <td className="py-2 px-3 text-muted">{req.department}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColor(req.priority_score)}`}>{req.priority_score}</span>
                      </td>
                      <td className="py-2 px-3 text-center text-muted">{req.clinical_impact}/10</td>
                      <td className="py-2 px-3 text-center text-muted">{req.operational_impact}/10</td>
                      <td className="py-2 px-3 text-center text-muted">{req.regulatory_impact}/10</td>
                      <td className="py-2 px-3">
                        {req.effort_estimate && <span className={`px-2 py-0.5 rounded text-xs font-medium ${effortColors[req.effort_estimate] || ''}`}>{req.effort_estimate}</span>}
                      </td>
                      <td className="py-2 px-3"><Badge variant={statusColors[req.status] || 'default'}>{req.status.replace(/_/g, ' ')}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Enhancement Governance</h1>
        <p className="text-sm text-muted mt-1">EMR change request intake, scoring, prioritization, and governance review</p>
      </div>

      <Tabs tabs={tabs} />

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-text dark:text-text-dark mb-4">New Enhancement Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-3">
              <input name="title" required placeholder="Title" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <textarea name="description" placeholder="Description" rows={3} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select name="department" required className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                  <option value="">Department</option>
                  {['Registration', 'Clinical Documentation', 'Pharmacy', 'Laboratory', 'Nursing', 'Radiology', 'Billing', 'IT', 'Administration', 'Quality', 'Surgery', 'Front Desk', 'Medical Records'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="request_type" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                  <option value="enhancement">Enhancement</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="bug_fix">Bug Fix</option>
                </select>
              </div>
              <input name="emr_module" placeholder="EMR Module (e.g., Patient Registration)" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <input name="requester_name" placeholder="Requester Name" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Clinical (0-10)</label>
                  <input name="clinical_impact" type="number" min="0" max="10" defaultValue="5" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Operational (0-10)</label>
                  <input name="operational_impact" type="number" min="0" max="10" defaultValue="5" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Regulatory (0-10)</label>
                  <input name="regulatory_impact" type="number" min="0" max="10" defaultValue="5" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="effort_estimate" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                  <option value="">Effort Size</option>
                  <option value="small">Small (&lt;30h)</option>
                  <option value="medium">Medium (30-80h)</option>
                  <option value="large">Large (80h+)</option>
                </select>
                <input name="effort_hours" type="number" placeholder="Hours estimate" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowReviewModal(false); setSelectedRequest(null) }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg text-text dark:text-text-dark mb-2">Governance Review</h3>
            <p className="text-sm text-muted mb-4">{selectedRequest.title}</p>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <select name="committee" required className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                <option value="">Select Committee</option>
                <option value="Clinical IT Committee">Clinical IT Committee</option>
                <option value="Regulatory Committee">Regulatory Committee</option>
                <option value="IT Security Committee">IT Security Committee</option>
                <option value="Finance Committee">Finance Committee</option>
              </select>
              <input name="reviewer_name" required placeholder="Reviewer Name" className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <select name="decision" required className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm">
                <option value="">Decision</option>
                <option value="approved">Approve</option>
                <option value="pending">Needs More Info</option>
                <option value="deferred">Defer</option>
              </select>
              <textarea name="comments" placeholder="Review comments" rows={3} className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="meeting_date" type="date" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
                <input name="priority_override" type="number" placeholder="Priority override" className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-white dark:bg-slate-700 text-text dark:text-text-dark text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowReviewModal(false); setSelectedRequest(null) }} className="px-4 py-2 text-sm text-muted hover:text-text dark:hover:text-text-dark">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
