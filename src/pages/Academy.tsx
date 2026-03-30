import { useState, useEffect } from 'react'
import { GraduationCap, Users, Award, Clock, BookOpen, Star, ChevronRight, BarChart3, CheckCircle, AlertTriangle, Loader2, Target, TrendingUp, Database, RefreshCw, Layers, Calendar, Rocket, Shield, ArrowRight, Zap, Activity } from 'lucide-react'
import { cn } from '../lib/utils'
import { academy as academyAPI, workforce as workforceAPI } from '../lib/api'

const tabs = ['Dashboard', 'Learning Paths', 'Certifications', 'Apprenticeship', 'Go-Live Center', 'Skill Assessment', 'ERP Services']

interface LearningPathData {
  id: string
  title: string
  modules: number
  completed: number
  difficulty: string
  duration: string
  enrolled: number
  category: string
}

interface EnrollmentSummary {
  totalEnrollments: number
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  avgProgress: number
  certificatesIssued: number
  activeLearners: number
  totalHoursSpent: number
}

interface CertificationRow {
  staff: string
  cert: string
  status: 'Active' | 'Expiring' | 'Expired'
  expiry: string
  verified: boolean
}

interface CertSummary {
  total: number
  active: number
  expiringSoon: number
  expired: number
  complianceRate: number
}

const DEFAULT_LEARNING_PATHS: LearningPathData[] = [
  { id: '1', title: 'Healthcare IT Fundamentals', modules: 12, completed: 12, difficulty: 'Beginner', duration: '40 hrs', enrolled: 245, category: 'Foundation' },
  { id: '2', title: 'EMR/EHR Specialist', modules: 18, completed: 14, difficulty: 'Intermediate', duration: '80 hrs', enrolled: 189, category: 'Clinical IT' },
  { id: '3', title: 'ServiceNow Healthcare Admin', modules: 15, completed: 8, difficulty: 'Intermediate', duration: '60 hrs', enrolled: 156, category: 'ITSM' },
  { id: '4', title: 'Healthcare Cybersecurity', modules: 20, completed: 5, difficulty: 'Advanced', duration: '100 hrs', enrolled: 98, category: 'Security' },
  { id: '5', title: 'Cloud for Healthcare (AWS/Azure)', modules: 16, completed: 10, difficulty: 'Intermediate', duration: '70 hrs', enrolled: 134, category: 'Cloud' },
  { id: '6', title: 'Revenue Cycle Management', modules: 14, completed: 14, difficulty: 'Beginner', duration: '50 hrs', enrolled: 167, category: 'Finance' },
  { id: '7', title: 'Healthcare Data Analytics', modules: 22, completed: 3, difficulty: 'Advanced', duration: '90 hrs', enrolled: 112, category: 'Analytics' },
  { id: '8', title: 'AI/ML for Healthcare', modules: 24, completed: 1, difficulty: 'Advanced', duration: '120 hrs', enrolled: 78, category: 'AI/ML' },
  { id: '9', title: 'FHIR & Interoperability', modules: 10, completed: 7, difficulty: 'Intermediate', duration: '45 hrs', enrolled: 145, category: 'Standards' },
  { id: '10', title: 'Workday for Healthcare', modules: 12, completed: 0, difficulty: 'Beginner', duration: '55 hrs', enrolled: 89, category: 'ERP' },
]

const DEFAULT_CERTIFICATIONS: CertificationRow[] = [
  { staff: 'Dr. Priya Sharma', cert: 'Epic Certified Analyst', status: 'Active', expiry: '2027-06-15', verified: true },
  { staff: 'Amit Patel', cert: 'ServiceNow CSA', status: 'Active', expiry: '2026-12-01', verified: true },
  { staff: 'Meera Reddy', cert: 'AWS Solutions Architect', status: 'Expiring', expiry: '2026-05-15', verified: true },
  { staff: 'Rajesh Kumar', cert: 'CISSP', status: 'Active', expiry: '2027-03-20', verified: true },
  { staff: 'Sunita Agarwal', cert: 'Oracle Health Certified', status: 'Expired', expiry: '2026-01-10', verified: false },
  { staff: 'Vikram Singh', cert: 'Azure Administrator', status: 'Active', expiry: '2027-09-01', verified: true },
  { staff: 'Anita Desai', cert: 'PMP', status: 'Expiring', expiry: '2026-04-30', verified: true },
  { staff: 'Deepak Joshi', cert: 'ITIL v4 Foundation', status: 'Active', expiry: '2028-01-15', verified: true },
]

const DEFAULT_ENROLLMENT_SUMMARY: EnrollmentSummary = {
  totalEnrollments: 8,
  completedCount: 3,
  inProgressCount: 4,
  notStartedCount: 1,
  avgProgress: 64,
  certificatesIssued: 3,
  activeLearners: 342,
  totalHoursSpent: 12450,
}

const DEFAULT_CERT_SUMMARY: CertSummary = {
  total: 8,
  active: 5,
  expiringSoon: 2,
  expired: 1,
  complianceRate: 87.5,
}

const cohorts = [
  { name: 'Cohort Alpha 2026', size: 25, startDate: '2026-01-15', phase: 'Deployment', completion: 72 },
  { name: 'Cohort Beta 2026', size: 30, startDate: '2026-03-01', phase: 'Training', completion: 35 },
  { name: 'Cohort Gamma 2025', size: 20, startDate: '2025-06-01', phase: 'Mentorship', completion: 95 },
  { name: 'Cohort Delta 2026', size: 28, startDate: '2026-04-15', phase: 'Training', completion: 10 },
]

function DiffBadge({ d }: { d: string }) {
  const colors = { Beginner: 'bg-success/10 text-success', Intermediate: 'bg-warning/10 text-warning', Advanced: 'bg-error/10 text-error' }
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colors[d as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>{d}</span>
}

export default function Academy() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [loading, setLoading] = useState(true)
  const [learningPaths, setLearningPaths] = useState<LearningPathData[]>(DEFAULT_LEARNING_PATHS)
  const [enrollmentSummary, setEnrollmentSummary] = useState<EnrollmentSummary>(DEFAULT_ENROLLMENT_SUMMARY)
  const [certifications, setCertifications] = useState<CertificationRow[]>(DEFAULT_CERTIFICATIONS)
  const [certSummary, setCertSummary] = useState<CertSummary>(DEFAULT_CERT_SUMMARY)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [pathsRes, enrollRes, certRes] = await Promise.all([
          academyAPI.paths().catch(() => null),
          academyAPI.enrollments().catch(() => null),
          workforceAPI.certifications().catch(() => null),
        ])

        // Build enrollment lookup: path_id -> list of enrollments
        const enrollmentsByPath: Record<string, { progress: number; status: string; time_spent_hours?: number }[]> = {}
        const rawEnrollments: { status: string; progress: number; certificate_issued?: boolean; time_spent_hours?: number; modules_completed?: number; total_modules?: number }[] = []
        if (enrollRes && (enrollRes as any).enrollments?.length) {
          for (const e of (enrollRes as any).enrollments) {
            rawEnrollments.push(e)
            const pid = e.path_id || e.pathId
            if (pid) {
              if (!enrollmentsByPath[pid]) enrollmentsByPath[pid] = []
              enrollmentsByPath[pid].push({ progress: e.progress ?? e.progress_percent ?? 0, status: e.status, time_spent_hours: e.time_spent_hours })
            }
          }
        }

        // Compute enrollment summary from real data
        if (rawEnrollments.length > 0) {
          const completed = rawEnrollments.filter(e => e.status === 'completed').length
          const inProgress = rawEnrollments.filter(e => e.status === 'in-progress' || e.status === 'in_progress').length
          const notStarted = rawEnrollments.filter(e => e.status === 'not-started' || e.status === 'not_started').length
          const avgProgress = Math.round(rawEnrollments.reduce((sum, e) => sum + (e.progress ?? e.progress as number ?? 0), 0) / rawEnrollments.length)
          const certsIssued = rawEnrollments.filter(e => (e as any).certificate_issued).length
          const totalHours = Math.round(rawEnrollments.reduce((sum, e) => sum + ((e as any).time_spent_hours || 0), 0) * 100) / 100
          // Unique active learners = unique staff ids with in-progress enrollments
          const uniqueStaff = new Set((enrollRes as any).enrollments.filter((e: any) => e.status !== 'not-started' && e.status !== 'not_started').map((e: any) => e.staff_id || e.user_id)).size

          if (mounted) {
            setEnrollmentSummary({
              totalEnrollments: rawEnrollments.length,
              completedCount: completed,
              inProgressCount: inProgress,
              notStartedCount: notStarted,
              avgProgress,
              certificatesIssued: certsIssued,
              activeLearners: uniqueStaff || rawEnrollments.length,
              totalHoursSpent: totalHours,
            })
          }
        }

        // Map learning paths with real enrollment counts
        if (mounted && pathsRes && (pathsRes as any).paths?.length) {
          const apiPaths = (pathsRes as any).paths
          setLearningPaths(apiPaths.map((p: any) => {
            const pathEnrollments = enrollmentsByPath[p.id] || []
            const enrolledCount = p.enrolled ?? pathEnrollments.length
            const completedModules = pathEnrollments.length > 0
              ? Math.round(pathEnrollments.reduce((s: number, e: any) => s + e.progress, 0) / 100 * (p.modules ?? p.modules_count ?? 0))
              : (p.completed ?? 0)
            return {
              id: p.id,
              title: p.title || p.name,
              modules: p.modules ?? p.modules_count ?? 0,
              completed: completedModules,
              difficulty: p.difficulty,
              duration: p.duration_hours || p.estimated_hours ? `${p.duration_hours || p.estimated_hours} hrs` : 'N/A',
              enrolled: enrolledCount,
              category: p.category,
            }
          }))
        }

        // Map certifications from workforce API
        if (mounted && certRes && (certRes as any).certifications?.length) {
          const apiCerts = (certRes as any).certifications
          setCertifications(apiCerts.map((c: any) => ({
            staff: c.staff_name || c.user_name || 'Staff',
            cert: c.certification_name,
            status: c.status === 'active' ? 'Active' as const :
                   c.status === 'expiring-soon' ? 'Expiring' as const : 'Expired' as const,
            expiry: c.valid_until || c.expiry_date || '',
            verified: c.status === 'active' || c.status === 'expiring-soon',
          })))

          const summary = (certRes as any).summary
          if (summary) {
            setCertSummary({
              total: summary.total ?? apiCerts.length,
              active: summary.active ?? apiCerts.filter((c: any) => c.status === 'active').length,
              expiringSoon: summary.expiring_soon ?? apiCerts.filter((c: any) => c.status === 'expiring-soon').length,
              expired: summary.expired ?? apiCerts.filter((c: any) => c.status === 'expired').length,
              complianceRate: summary.compliance_rate ?? 87.5,
            })
          } else {
            const active = apiCerts.filter((c: any) => c.status === 'active').length
            const expiring = apiCerts.filter((c: any) => c.status === 'expiring-soon').length
            const expired = apiCerts.filter((c: any) => c.status === 'expired').length
            setCertSummary({
              total: apiCerts.length,
              active,
              expiringSoon: expiring,
              expired,
              complianceRate: Math.round(((active + expiring) / apiCerts.length) * 1000) / 10,
            })
          }
        }
      } catch {
        // keep defaults on error
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">CareerPath Academy</h1>
        <p className="text-muted text-sm mt-1">Healthcare IT training, certification, and workforce development</p>
      </div>

      <div className="flex gap-1 border-b border-border dark:border-border-dark overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={cn(
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
            activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text dark:hover:text-text-dark'
          )}>{t}</button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {activeTab === 'Dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Learners', value: enrollmentSummary.activeLearners.toLocaleString(), icon: Users, change: `${enrollmentSummary.inProgressCount} in progress` },
              { label: 'Completion Rate', value: `${enrollmentSummary.totalEnrollments > 0 ? Math.round((enrollmentSummary.completedCount / enrollmentSummary.totalEnrollments) * 100) : 94}%`, icon: Award, change: `${enrollmentSummary.completedCount} completed` },
              { label: 'Cert Pass Rate', value: `${certSummary.complianceRate}%`, icon: CheckCircle, change: `${certSummary.total} total certs` },
              { label: 'Learning Hours', value: enrollmentSummary.totalHoursSpent > 0 ? enrollmentSummary.totalHoursSpent.toLocaleString() : '12,450', icon: Clock, change: `${enrollmentSummary.totalEnrollments} enrollments` },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-success font-medium">{s.change}</span>
                </div>
                <p className="font-display font-bold text-2xl text-text dark:text-text-dark">{s.value}</p>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4">Top Learning Paths</h3>
              <div className="space-y-3">
                {learningPaths.slice(0, 5).map(lp => (
                  <div key={lp.id} className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text dark:text-text-dark truncate">{lp.title}</p>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(lp.completed / lp.modules) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-muted shrink-0">{lp.enrolled} enrolled</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4">Active Cohorts</h3>
              <div className="space-y-3">
                {cohorts.map(c => (
                  <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">{c.name}</p>
                      <p className="text-xs text-muted">{c.size} learners · {c.phase}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{c.completion}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Learning Paths' && (
        <div className="space-y-6">
          {/* Certification Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Certified', value: enrollmentSummary.certificatesIssued > 0 ? enrollmentSummary.certificatesIssued.toString() : '186', icon: Award, color: 'text-success' },
              { label: 'In Progress', value: enrollmentSummary.inProgressCount.toString(), icon: Loader2, color: 'text-primary' },
              { label: 'Pass Rate', value: `${certSummary.complianceRate}%`, icon: Target, color: 'text-accent' },
              { label: 'Avg Progress', value: `${enrollmentSummary.avgProgress}%`, icon: TrendingUp, color: 'text-warning' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800', s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-text dark:text-text-dark">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Skill Competency Assessment */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Competency Assessment
              </h3>
              <div className="space-y-4">
                {[
                  { area: 'Clinical Systems Knowledge', pct: 82, target: 90 },
                  { area: 'Technical Architecture', pct: 71, target: 85 },
                  { area: 'Project Management', pct: 88, target: 90 },
                  { area: 'Regulatory Compliance', pct: 76, target: 80 },
                  { area: 'Communication & Leadership', pct: 84, target: 85 },
                ].map(c => (
                  <div key={c.area}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text dark:text-text-dark">{c.area}</span>
                      <span className="text-xs text-muted">{c.pct}% / {c.target}% target</span>
                    </div>
                    <div className="relative w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all',
                        c.pct >= c.target ? 'bg-success' : c.pct >= c.target - 10 ? 'bg-primary' : 'bg-warning'
                      )} style={{ width: `${c.pct}%` }} />
                      <div className="absolute top-0 bottom-0 w-0.5 bg-text/30 dark:bg-text-dark/30" style={{ left: `${c.target}%` }} title={`Target: ${c.target}%`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Progression Pathway */}
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Career Progression Pathway
              </h3>
              <div className="space-y-3">
                {[
                  { level: 'Junior Analyst', req: '0-1 yrs exp, 1 certification, fundamentals complete', active: false, current: false },
                  { level: 'Mid-Level Specialist', req: '2-3 yrs exp, 2 certifications, 3+ projects', active: false, current: true },
                  { level: 'Senior Consultant', req: '4-6 yrs exp, 3 certifications, lead 2+ go-lives', active: true, current: false },
                  { level: 'Lead / Architect', req: '7+ yrs exp, 4+ certifications, mentorship record', active: true, current: false },
                ].map((p, i) => (
                  <div key={p.level} className="relative">
                    <div className={cn('p-3 rounded-lg border-2 transition-all',
                      p.current ? 'border-primary bg-primary/5' :
                      !p.active ? 'border-success/40 bg-success/5' : 'border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800'
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!p.active && !p.current && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                          {p.current && <Zap className="w-4 h-4 text-primary shrink-0" />}
                          {p.active && !p.current && <Star className="w-4 h-4 text-muted shrink-0" />}
                          <span className="text-sm font-semibold text-text dark:text-text-dark">{p.level}</span>
                        </div>
                        {p.current && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">Current Level</span>}
                        {!p.active && !p.current && <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">Achieved</span>}
                      </div>
                      <p className="text-xs text-muted mt-1 ml-6">{p.req}</p>
                    </div>
                    {i < 3 && <div className="flex justify-center my-1"><ArrowRight className="w-4 h-4 text-muted rotate-90" /></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Path Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningPaths.map(lp => (
              <div key={lp.id} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{lp.category}</span>
                  <DiffBadge d={lp.difficulty} />
                </div>
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">{lp.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted mb-3">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{lp.modules} modules</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lp.duration}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full mb-2">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(lp.completed / lp.modules) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">{lp.completed}/{lp.modules} completed</span>
                  <span className="text-muted">{lp.enrolled} enrolled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Certifications' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <p className="text-sm text-warning">{certSummary.expiringSoon} certification{certSummary.expiringSoon !== 1 ? 's' : ''} expiring soon, {certSummary.expired} expired — review and schedule renewals</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800">
                  {['Staff', 'Certification', 'Status', 'Expiry Date', 'Verified'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certifications.map((c, i) => (
                  <tr key={i} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{c.staff}</td>
                    <td className="px-4 py-3 text-muted">{c.cert}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        c.status === 'Active' ? 'bg-success/10 text-success' :
                        c.status === 'Expiring' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                      )}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{new Date(c.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">{c.verified ? <CheckCircle className="w-4 h-4 text-success" /> : <span className="text-xs text-error">Pending</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Apprenticeship' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cohorts.map(c => (
              <div key={c.name} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-1">{c.name}</h3>
                <p className="text-xs text-muted mb-4">{c.size} learners · Started {new Date(c.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                    c.phase === 'Training' ? 'bg-accent/10 text-accent' :
                    c.phase === 'Deployment' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                  )}>{c.phase}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.completion}%` }} />
                </div>
                <p className="text-xs text-muted mt-1 text-right">{c.completion}% complete</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4">Apprenticeship Pipeline</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              {['Intake', 'Training', 'Deployment', 'Graduated'].map((phase, i) => (
                <div key={phase}>
                  <div className={cn('h-2 rounded-full mb-2', i <= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700')} />
                  <p className="text-sm font-medium text-text dark:text-text-dark">{phase}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{[15, 55, 23, 120][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Go-Live Center' && (
        <div className="space-y-6">
          {/* Days to Go-Live Countdown Banner */}
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Rocket className="w-8 h-8" />
                <div>
                  <h3 className="font-display font-bold text-lg">Next Go-Live: City Care Multi-Speciality, Pune</h3>
                  <p className="text-white/80 text-sm">Epic EHR Full Deployment — 05 Apr 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { val: '6', unit: 'Days' },
                  { val: '14', unit: 'Hours' },
                  { val: '32', unit: 'Minutes' },
                ].map(cd => (
                  <div key={cd.unit} className="text-center">
                    <p className="font-display font-bold text-3xl">{cd.val}</p>
                    <p className="text-white/70 text-xs uppercase tracking-wider">{cd.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', value: '8', icon: BarChart3, change: '+2 this month' },
              { label: 'Certifications', value: certSummary.total.toString(), icon: CheckCircle, change: `${certSummary.active} active` },
              { label: 'Training Complete', value: `${enrollmentSummary.totalEnrollments > 0 ? Math.round((enrollmentSummary.completedCount / enrollmentSummary.totalEnrollments) * 100) : 92}%`, icon: GraduationCap, change: `${enrollmentSummary.completedCount} completed` },
              { label: 'Support Tickets', value: '24', icon: AlertTriangle, change: '-35% post go-live' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-success font-medium">{s.change}</span>
                </div>
                <p className="font-display font-bold text-2xl text-text dark:text-text-dark">{s.value}</p>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-x-auto">
            <div className="p-5 border-b border-border dark:border-border-dark">
              <h3 className="font-display font-semibold text-text dark:text-text-dark">Go-Live Readiness Tracker</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800">
                  {['Hospital', 'System', 'Phase', 'Training %', 'Go-Live Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { hospital: 'City Care Multi-Speciality, Pune', system: 'Epic', phase: 'Go-Live', training: 98, date: '05 Apr 2026', status: 'Ready' },
                  { hospital: 'Max Super Speciality, Delhi', system: 'Oracle Health', phase: 'Testing', training: 85, date: '20 Apr 2026', status: 'On Track' },
                  { hospital: 'Apollo Hospitals, Chennai', system: 'Epic + ServiceNow', phase: 'Training', training: 62, date: '15 May 2026', status: 'On Track' },
                  { hospital: 'Fortis Memorial, Gurugram', system: 'Meditech', phase: 'Build', training: 35, date: '01 Jun 2026', status: 'At Risk' },
                  { hospital: 'Manipal Hospital, Bangalore', system: 'Epic', phase: 'Go-Live', training: 96, date: '02 Apr 2026', status: 'Ready' },
                  { hospital: 'Narayana Health, Bangalore', system: 'Oracle Health', phase: 'Go-Live', training: 100, date: '30 Mar 2026', status: 'Live' },
                  { hospital: 'AIIMS Satellite, Rishikesh', system: 'ABDM Integration', phase: 'Testing', training: 78, date: '10 May 2026', status: 'On Track' },
                  { hospital: 'Medanta, Gurugram', system: 'Epic + Workday', phase: 'Training', training: 55, date: '25 May 2026', status: 'On Track' },
                ].map((p, i) => (
                  <tr key={i} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{p.hospital}</td>
                    <td className="px-4 py-3 text-muted">{p.system}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        p.phase === 'Go-Live' ? 'bg-primary/10 text-primary' :
                        p.phase === 'Testing' ? 'bg-accent/10 text-accent' :
                        p.phase === 'Training' ? 'bg-warning/10 text-warning' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                      )}>{p.phase}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', p.training >= 90 ? 'bg-success' : p.training >= 60 ? 'bg-warning' : 'bg-error')} style={{ width: `${p.training}%` }} />
                        </div>
                        <span className="text-xs text-muted">{p.training}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.date}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        p.status === 'Ready' ? 'bg-success/10 text-success' :
                        p.status === 'Live' ? 'bg-primary/10 text-primary' :
                        p.status === 'On Track' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'
                      )}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h4 className="font-display font-semibold text-text dark:text-text-dark mb-3">24x7 Command Center</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted">Certified Staff</span><span className="font-semibold text-text dark:text-text-dark">{certSummary.active}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">Certs Expiring Soon</span><span className="font-semibold text-error">{certSummary.expiringSoon}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">Compliance Rate</span><span className="font-semibold text-success">{certSummary.complianceRate}%</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">War Room Active</span><span className="font-semibold text-primary">Yes (Narayana)</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h4 className="font-display font-semibold text-text dark:text-text-dark mb-3">Training Completion</h4>
              <div className="space-y-2">
                {['End Users', 'Super Users', 'IT Staff', 'Physicians'].map((role, i) => {
                  const pct = [94, 88, 91, 72][i]
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted">{role}</span>
                        <span className={cn('font-medium', pct >= 85 ? 'text-success' : 'text-warning')}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', pct >= 85 ? 'bg-success' : 'bg-warning')} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h4 className="font-display font-semibold text-text dark:text-text-dark mb-3">Post Go-Live Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted">System Adoption</span><span className="font-semibold text-success">94%</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">Workflow Efficiency</span><span className="font-semibold text-success">+28%</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">User Satisfaction</span><span className="font-semibold text-primary">4.6/5</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">Downtime Events</span><span className="font-semibold text-success">0</span></div>
              </div>
            </div>
          </div>

          {/* Detailed Readiness Tracker */}
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Go-Live Readiness Checklist — City Care Pune
            </h3>
            <div className="space-y-3">
              {[
                { item: 'Staff Training', pct: 98, status: 'Complete', icon: GraduationCap },
                { item: 'System Testing (UAT)', pct: 92, status: 'Final Review', icon: Shield },
                { item: 'Data Migration', pct: 100, status: 'Verified', icon: Database },
                { item: 'Integration Validation', pct: 85, status: 'In Progress', icon: RefreshCw },
                { item: 'Go-Live Checklist', pct: 78, status: 'In Progress', icon: CheckCircle },
              ].map(r => (
                <div key={r.item} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <r.icon className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text dark:text-text-dark">{r.item}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                          r.pct === 100 ? 'bg-success/10 text-success' :
                          r.pct >= 90 ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                        )}>{r.status}</span>
                        <span className="text-sm font-bold text-text dark:text-text-dark">{r.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all',
                        r.pct === 100 ? 'bg-success' : r.pct >= 90 ? 'bg-primary' : 'bg-warning'
                      )} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-display font-semibold text-text dark:text-text-dark mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Go-Live Milestone Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
              <div className="space-y-6">
                {[
                  { date: '01 Mar 2026', title: 'Environment Provisioning Complete', status: 'done' as const },
                  { date: '15 Mar 2026', title: 'Data Migration & Validation Sign-off', status: 'done' as const },
                  { date: '25 Mar 2026', title: 'End-User Training Complete', status: 'done' as const },
                  { date: '02 Apr 2026', title: 'Dress Rehearsal & Final UAT', status: 'current' as const },
                  { date: '05 Apr 2026', title: 'Go-Live & Hypercare Support Begins', status: 'upcoming' as const },
                ].map((m, i) => (
                  <div key={i} className="relative flex items-start gap-4 pl-10">
                    <div className={cn('absolute left-2.5 w-3 h-3 rounded-full border-2 mt-1',
                      m.status === 'done' ? 'bg-success border-success' :
                      m.status === 'current' ? 'bg-primary border-primary animate-pulse' : 'bg-white dark:bg-surface-dark border-gray-300 dark:border-slate-600'
                    )} />
                    <div className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-text dark:text-text-dark">{m.title}</p>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                          m.status === 'done' ? 'bg-success/10 text-success' :
                          m.status === 'current' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
                        )}>{m.status === 'done' ? 'Completed' : m.status === 'current' ? 'In Progress' : 'Upcoming'}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">{m.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Skill Assessment' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4">Organization Skill Radar</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Clinical Systems', 'Cloud & Infra', 'Data & Analytics', 'Cybersecurity', 'ITSM/ServiceNow', 'AI/ML'].map((skill, i) => {
                const score = [82, 68, 75, 59, 71, 45][i]
                return (
                  <div key={skill} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text dark:text-text-dark">{skill}</span>
                      <span className={cn('text-sm font-bold', score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-error')}>{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                      <div className={cn('h-full rounded-full', score >= 70 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-error')} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Gap Analysis
            </h3>
            <div className="space-y-3">
              {[
                { skill: 'AI/ML for Healthcare', gap: 55, priority: 'High' },
                { skill: 'Cybersecurity', gap: 41, priority: 'High' },
                { skill: 'Cloud Architecture', gap: 32, priority: 'Medium' },
                { skill: 'Data Engineering', gap: 28, priority: 'Medium' },
                { skill: 'FHIR/HL7 Standards', gap: 22, priority: 'Low' },
              ].map(g => (
                <div key={g.skill} className="flex items-center gap-4">
                  <span className="text-sm text-text dark:text-text-dark w-48">{g.skill}</span>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-error/70 rounded-full" style={{ width: `${g.gap}%` }} />
                  </div>
                  <span className="text-xs text-muted w-8">{g.gap}%</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                    g.priority === 'High' ? 'bg-error/10 text-error' : g.priority === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  )}>{g.priority}</span>
                  <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    View Path <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ERP Services' && (
        <div className="space-y-6">
          {/* Workday HCM Integration Status */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-8 h-8" />
                <div>
                  <h3 className="font-display font-bold text-lg">Workday HCM Integration</h3>
                  <p className="text-white/80 text-sm">Healthcare-grade ERP platform — Connected & Syncing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Connected
                </span>
                <span className="text-white/70 text-sm">Last sync: 2 min ago</span>
              </div>
            </div>
          </div>

          {/* Integration Pipeline Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Records Synced', value: '1.24M', icon: Database, change: '+12,450 today' },
              { label: 'Last Full Sync', value: '08:45 AM', icon: RefreshCw, change: 'Today' },
              { label: 'Error Rate', value: '0.02%', icon: AlertTriangle, change: 'Below threshold' },
              { label: 'Uptime (30d)', value: '99.97%', icon: Activity, change: 'SLA: 99.9%' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-success font-medium">{s.change}</span>
                </div>
                <p className="font-display font-bold text-2xl text-text dark:text-text-dark">{s.value}</p>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ERP Module Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                module: 'Finance & Accounting',
                icon: BarChart3,
                status: 'Active',
                statusColor: 'bg-success/10 text-success',
                desc: 'GL, AP/AR, revenue cycle, billing integrations',
                metrics: [
                  { label: 'Transactions/Day', value: '8,420' },
                  { label: 'Auto-Reconciled', value: '96%' },
                  { label: 'Pending Approvals', value: '14' },
                ],
              },
              {
                module: 'Human Resources',
                icon: Users,
                status: 'Active',
                statusColor: 'bg-success/10 text-success',
                desc: 'Employee records, payroll, benefits, credentialing',
                metrics: [
                  { label: 'Active Employees', value: '2,847' },
                  { label: 'Payroll Accuracy', value: '99.8%' },
                  { label: 'Open Positions', value: '34' },
                ],
              },
              {
                module: 'Supply Chain',
                icon: RefreshCw,
                status: 'Configuring',
                statusColor: 'bg-warning/10 text-warning',
                desc: 'Procurement, inventory, pharmacy supply, vendor mgmt',
                metrics: [
                  { label: 'POs This Month', value: '1,245' },
                  { label: 'Vendors Active', value: '328' },
                  { label: 'Stock Alerts', value: '7' },
                ],
              },
              {
                module: 'Planning & Analytics',
                icon: TrendingUp,
                status: 'Pilot',
                statusColor: 'bg-accent/10 text-accent',
                desc: 'Workforce planning, budgeting, financial forecasts',
                metrics: [
                  { label: 'Forecast Accuracy', value: '87%' },
                  { label: 'Budget Variance', value: '-2.1%' },
                  { label: 'Planning Cycles', value: 'Q2 2026' },
                ],
              },
            ].map(m => (
              <div key={m.module} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <m.icon className="w-6 h-6 text-primary" />
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', m.statusColor)}>{m.status}</span>
                </div>
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-1">{m.module}</h3>
                <p className="text-xs text-muted mb-4">{m.desc}</p>
                <div className="space-y-2 border-t border-border dark:border-border-dark pt-3">
                  {m.metrics.map(mt => (
                    <div key={mt.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{mt.label}</span>
                      <span className="font-semibold text-text dark:text-text-dark">{mt.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Integration Data Flow */}
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
            <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Integration Data Flow
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800">
                    {['Integration', 'Source', 'Destination', 'Frequency', 'Records', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { integration: 'Employee Master Sync', source: 'Workday HCM', dest: 'Epic EHR', freq: 'Real-time', records: '2,847', status: 'Active' },
                    { integration: 'Payroll Export', source: 'Workday Payroll', dest: 'Bank Gateway', freq: 'Bi-weekly', records: '2,847', status: 'Active' },
                    { integration: 'PO Requisitions', source: 'Epic Supply Chain', dest: 'Workday Finance', freq: 'Hourly', records: '~340/day', status: 'Active' },
                    { integration: 'GL Journal Entries', source: 'Revenue Cycle', dest: 'Workday Finance', freq: 'Daily', records: '~1,200/day', status: 'Active' },
                    { integration: 'Credential Verify', source: 'Workday HCM', dest: 'Compliance Engine', freq: 'Daily', records: '156', status: 'Active' },
                    { integration: 'Budget Forecasts', source: 'Workday Planning', dest: 'BI Dashboard', freq: 'Weekly', records: '48 models', status: 'Pilot' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{row.integration}</td>
                      <td className="px-4 py-3 text-muted">{row.source}</td>
                      <td className="px-4 py-3 text-muted">{row.dest}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{row.freq}</span></td>
                      <td className="px-4 py-3 text-muted">{row.records}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                          row.status === 'Active' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                        )}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
