import { useState } from 'react'
import { GraduationCap, Users, Award, Clock, BookOpen, Star, ChevronRight, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '../lib/utils'

const tabs = ['Dashboard', 'Learning Paths', 'Certifications', 'Apprenticeship', 'Skill Assessment']

const learningPaths = [
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

const certifications = [
  { staff: 'Dr. Priya Sharma', cert: 'Epic Certified Analyst', status: 'Active' as const, expiry: '2027-06-15', verified: true },
  { staff: 'Amit Patel', cert: 'ServiceNow CSA', status: 'Active' as const, expiry: '2026-12-01', verified: true },
  { staff: 'Meera Reddy', cert: 'AWS Solutions Architect', status: 'Expiring' as const, expiry: '2026-05-15', verified: true },
  { staff: 'Rajesh Kumar', cert: 'CISSP', status: 'Active' as const, expiry: '2027-03-20', verified: true },
  { staff: 'Sunita Agarwal', cert: 'Oracle Health Certified', status: 'Expired' as const, expiry: '2026-01-10', verified: false },
  { staff: 'Vikram Singh', cert: 'Azure Administrator', status: 'Active' as const, expiry: '2027-09-01', verified: true },
  { staff: 'Anita Desai', cert: 'PMP', status: 'Expiring' as const, expiry: '2026-04-30', verified: true },
  { staff: 'Deepak Joshi', cert: 'ITIL v4 Foundation', status: 'Active' as const, expiry: '2028-01-15', verified: true },
]

const cohorts = [
  { name: 'Cohort Alpha 2026', size: 25, startDate: '2026-01-15', phase: 'Deployment', completion: 72 },
  { name: 'Cohort Beta 2026', size: 30, startDate: '2026-03-01', phase: 'Training', completion: 35 },
  { name: 'Cohort Gamma 2025', size: 20, startDate: '2025-06-01', phase: 'Mentorship', completion: 95 },
  { name: 'Cohort Delta 2026', size: 28, startDate: '2026-04-15', phase: 'Training', completion: 10 },
]

function DiffBadge({ d }: { d: string }) {
  const colors = { Beginner: 'bg-success/10 text-success', Intermediate: 'bg-warning/10 text-warning', Advanced: 'bg-error/10 text-error' }
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', colors[d as keyof typeof colors] || 'bg-gray-100 text-gray-600')}>{d}</span>
}

export default function Academy() {
  const [activeTab, setActiveTab] = useState('Dashboard')

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

      {activeTab === 'Dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Learners', value: '342', icon: Users, change: '+18%' },
              { label: 'Placement Rate', value: '94%', icon: Award, change: '+5%' },
              { label: 'Cert Pass Rate', value: '89%', icon: CheckCircle, change: '+3%' },
              { label: 'Learning Hours', value: '12,450', icon: Clock, change: '+22%' },
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
      )}

      {activeTab === 'Certifications' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <p className="text-sm text-warning">3 certifications expiring within 60 days — review and schedule renewals</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
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
    </div>
  )
}
