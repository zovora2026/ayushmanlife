import { useState } from 'react'
import { Settings, Building2, Users, Shield, Link2, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'

const tabs = ['Hospital Setup', 'User Management', 'Compliance', 'Integrations']

const users = [
  { name: 'Dr. Priya Sharma', email: 'priya@ayushmanlife.in', role: 'Admin', dept: 'Administration', status: 'Active', lastLogin: '2026-03-29' },
  { name: 'Dr. Rajesh Kumar', email: 'rajesh@ayushmanlife.in', role: 'Doctor', dept: 'Cardiology', status: 'Active', lastLogin: '2026-03-29' },
  { name: 'Amit Patel', email: 'amit@ayushmanlife.in', role: 'Billing Staff', dept: 'Revenue Cycle', status: 'Active', lastLogin: '2026-03-28' },
  { name: 'Meera Reddy', email: 'meera@ayushmanlife.in', role: 'Nurse Manager', dept: 'ICU', status: 'Active', lastLogin: '2026-03-29' },
  { name: 'Sunita Agarwal', email: 'sunita@ayushmanlife.in', role: 'Lab Tech', dept: 'Pathology', status: 'On Leave', lastLogin: '2026-03-25' },
  { name: 'Vikram Singh', email: 'vikram@ayushmanlife.in', role: 'IT Admin', dept: 'IT', status: 'Active', lastLogin: '2026-03-29' },
]

const integrations = [
  { name: 'ABDM Health Information Exchange', status: 'Connected', type: 'Government', uptime: '99.8%' },
  { name: 'Ayushman Bharat PMJAY Portal', status: 'Connected', type: 'Government', uptime: '99.5%' },
  { name: 'Star Health Insurance API', status: 'Connected', type: 'Payer', uptime: '99.9%' },
  { name: 'HDFC ERGO Claims Gateway', status: 'Connected', type: 'Payer', uptime: '99.7%' },
  { name: 'AWS Cloud Infrastructure', status: 'Connected', type: 'Infrastructure', uptime: '99.99%' },
  { name: 'ServiceNow ITSM', status: 'Maintenance', type: 'Operations', uptime: '98.2%' },
  { name: 'Epic FHIR Gateway', status: 'Disconnected', type: 'Clinical', uptime: 'N/A' },
  { name: 'WhatsApp Business API', status: 'Connected', type: 'Communication', uptime: '99.6%' },
]

const complianceItems = [
  { item: 'HIPAA Risk Assessment', status: 'Complete', due: '2026-06-30', score: 94 },
  { item: 'NABH Accreditation Renewal', status: 'In Progress', due: '2026-09-15', score: 78 },
  { item: 'ABDM Compliance Audit', status: 'Complete', due: '2026-12-31', score: 96 },
  { item: 'Data Privacy Impact Assessment', status: 'Scheduled', due: '2026-04-30', score: 0 },
  { item: 'Penetration Testing', status: 'Complete', due: '2026-06-01', score: 89 },
  { item: 'Business Continuity Plan Review', status: 'In Progress', due: '2026-05-15', score: 65 },
  { item: 'PHI Access Audit', status: 'Complete', due: '2026-03-31', score: 97 },
  { item: 'Disaster Recovery Drill', status: 'Scheduled', due: '2026-04-15', score: 0 },
]

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Hospital Setup')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Administration</h1>
        <p className="text-muted text-sm mt-1">Hospital configuration, user management, and compliance</p>
      </div>

      <div className="flex gap-1 border-b border-border dark:border-border-dark">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === t ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text dark:hover:text-text-dark'
          )}>{t}</button>
        ))}
      </div>

      {activeTab === 'Hospital Setup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
            <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Organization Profile
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ['Hospital Name', 'AyushmanLife Demo Hospital'],
                ['Location', 'Connaught Place, New Delhi 110001'],
                ['Type', 'Multi-Specialty Hospital'],
                ['Beds', '300 (100 Critical Care)'],
                ['Specialties', '32'],
                ['Centres of Excellence', '14'],
                ['NABH Status', 'Accredited'],
                ['ABDM Facility ID', 'IN0110000845'],
                ['Registration', 'MCI/DEL/2020/12345'],
                ['Staff Count', '~800'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border dark:border-border-dark last:border-0">
                  <span className="text-sm text-muted">{label}</span>
                  <span className="text-sm font-medium text-text dark:text-text-dark">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
            <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4">Departments</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Pediatrics', 'OB/GYN', 'General Surgery', 'Internal Medicine',
                'Emergency', 'Radiology', 'Pathology', 'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'Pulmonology'].map(d => (
                <div key={d} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm text-text dark:text-text-dark flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />{d}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'User Management' && (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
          <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between">
            <h2 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Platform Users
            </h2>
            <span className="text-sm text-muted">{users.length} users</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800">
                {['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{u.role}</span></td>
                  <td className="px-4 py-3 text-muted">{u.dept}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', u.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(u.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'HIPAA Score', value: '94%', color: 'text-success' },
              { label: 'ABDM Status', value: 'Active', color: 'text-success' },
              { label: 'Audits Due', value: '2', color: 'text-warning' },
              { label: 'Security Score', value: '89%', color: 'text-primary' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4 text-center">
                <p className={cn('font-display font-bold text-2xl', s.color)}>{s.value}</p>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-slate-800">
                {['Compliance Item', 'Status', 'Due Date', 'Score'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {complianceItems.map(c => (
                  <tr key={c.item} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{c.item}</td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1 text-xs font-medium',
                        c.status === 'Complete' ? 'text-success' : c.status === 'In Progress' ? 'text-warning' : 'text-muted'
                      )}>
                        {c.status === 'Complete' ? <CheckCircle className="w-3.5 h-3.5" /> : c.status === 'In Progress' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{new Date(c.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3">{c.score > 0 ? <span className={cn('font-semibold', c.score >= 90 ? 'text-success' : c.score >= 70 ? 'text-warning' : 'text-error')}>{c.score}%</span> : <span className="text-muted">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Integrations' && (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark">
          <div className="p-4 border-b border-border dark:border-border-dark">
            <h2 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" /> Integration Hub
            </h2>
          </div>
          <div className="divide-y divide-border dark:divide-border-dark">
            {integrations.map(i => (
              <div key={i.name} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <div className={cn('w-3 h-3 rounded-full',
                  i.status === 'Connected' ? 'bg-success' : i.status === 'Maintenance' ? 'bg-warning' : 'bg-error'
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text dark:text-text-dark">{i.name}</p>
                  <p className="text-xs text-muted">{i.type}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                  i.status === 'Connected' ? 'bg-success/10 text-success' :
                  i.status === 'Maintenance' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                )}>{i.status}</span>
                <span className="text-xs text-muted w-16 text-right">{i.uptime}</span>
                <ExternalLink className="w-4 h-4 text-muted" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
