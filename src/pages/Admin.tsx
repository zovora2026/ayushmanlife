import { useState } from 'react'
import { Settings, Building2, Users, Shield, Link2, CheckCircle, XCircle, AlertTriangle, ExternalLink, Fingerprint, ShieldCheck, UserCheck, BadgeCheck, Clock, Activity, Camera, Loader2, Search, Wifi, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

const tabs = ['Hospital Setup', 'User Management', 'Identity & Verification', 'Compliance', 'Integrations']

// Identity & Verification demo data
const verificationLog = [
  { date: '2026-03-30 09:15', name: 'Aarav Mehta', aadhaar: 'XXXX-XXXX-4523', abha: '12-3456-7890-1001', method: 'Aadhaar OTP', status: 'Verified', verifiedBy: 'Dr. Priya Sharma' },
  { date: '2026-03-30 08:42', name: 'Sneha Iyer', aadhaar: 'XXXX-XXXX-7891', abha: '12-3456-7890-1002', method: 'Biometric', status: 'Verified', verifiedBy: 'Amit Patel' },
  { date: '2026-03-30 08:10', name: 'Rajendra Prasad', aadhaar: 'XXXX-XXXX-3345', abha: '12-3456-7890-1003', method: 'Demographics', status: 'Failed', verifiedBy: 'Meera Reddy' },
  { date: '2026-03-29 17:30', name: 'Kavita Deshmukh', aadhaar: 'XXXX-XXXX-5567', abha: '12-3456-7890-1004', method: 'Aadhaar OTP', status: 'Verified', verifiedBy: 'Dr. Rajesh Kumar' },
  { date: '2026-03-29 16:05', name: 'Farhan Sheikh', aadhaar: 'XXXX-XXXX-2234', abha: '12-3456-7890-1005', method: 'Biometric', status: 'Verified', verifiedBy: 'Sunita Agarwal' },
  { date: '2026-03-29 14:22', name: 'Lakshmi Narayanan', aadhaar: 'XXXX-XXXX-8890', abha: '12-3456-7890-1006', method: 'Aadhaar OTP', status: 'Pending', verifiedBy: '-' },
  { date: '2026-03-29 11:48', name: 'Deepak Chauhan', aadhaar: 'XXXX-XXXX-6612', abha: '12-3456-7890-1007', method: 'Demographics', status: 'Verified', verifiedBy: 'Vikram Singh' },
  { date: '2026-03-29 10:05', name: 'Ananya Bose', aadhaar: 'XXXX-XXXX-9934', abha: '12-3456-7890-1008', method: 'Aadhaar OTP', status: 'Verified', verifiedBy: 'Dr. Priya Sharma' },
]

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

function IdentityVerificationTab() {
  const [aadhaarInput, setAadhaarInput] = useState('')
  const [abhaInput, setAbhaInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleVerify = () => {
    if (!aadhaarInput && !abhaInput) return
    setVerifying(true)
    setVerified(false)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
    }, 1500)
  }

  const handleReset = () => {
    setAadhaarInput('')
    setAbhaInput('')
    setVerified(false)
    setVerifying(false)
  }

  const maskAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12)
    if (digits.length <= 8) {
      return digits.replace(/(\d{4})/g, '$1-').replace(/-$/, '')
    }
    const masked = 'XXXX-XXXX-' + digits.slice(8)
    return masked
  }

  const formatAbha = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 14)
    return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})(\d{0,4})/, (_m, a, b, c, d) => {
      let result = a
      if (b) result += '-' + b
      if (c) result += '-' + c
      if (d) result += '-' + d
      return result
    })
  }

  const kpiStats = [
    { label: 'Total Verifications', value: '12,847', icon: Fingerprint, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Aadhaar Linked', value: '11,293', sub: '87.9%', icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10' },
    { label: 'ABHA IDs Created', value: '9,451', sub: '73.5%', icon: BadgeCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Verifications', value: '156', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ]

  const abdmServices = [
    { name: 'ABDM Gateway', status: 'Connected' },
    { name: 'Aadhaar eKYC API', status: 'Active' },
    { name: 'ABHA Creation API', status: 'Active' },
    { name: 'Health Information Exchange', status: 'Connected' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiStats.map(s => (
          <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-5 h-5', s.color)} />
              </div>
              <div>
                <p className={cn('font-display font-bold text-xl', s.color)}>{s.value}</p>
                {s.sub && <span className="text-xs text-muted">({s.sub})</span>}
              </div>
            </div>
            <p className="text-xs text-muted mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Patient Identity Verification */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
        <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" /> Patient Identity Verification
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Verification Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">Aadhaar Number</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="XXXX-XXXX-1234"
                  value={aadhaarInput.length > 8 ? maskAadhaar(aadhaarInput) : aadhaarInput.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})/g, '$1-').replace(/-$/, '')}
                  onChange={e => setAadhaarInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800 text-sm text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted mt-1">12-digit Aadhaar number (auto-masked for security)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">ABHA Health ID</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="12-3456-7890-1234"
                  value={formatAbha(abhaInput)}
                  onChange={e => setAbhaInput(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800 text-sm text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted mt-1">14-digit ABHA number (Ayushman Bharat Health Account)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleVerify}
                disabled={verifying || (!aadhaarInput && !abhaInput)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  verifying || (!aadhaarInput && !abhaInput)
                    ? 'bg-gray-200 dark:bg-slate-700 text-muted cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                )}
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
              {(aadhaarInput || abhaInput || verified) && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border dark:border-border-dark text-muted hover:text-text dark:hover:text-text-dark transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Verification Result */}
          <div>
            {verifying && (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted">Verifying identity with ABDM gateway...</p>
                <p className="text-xs text-muted mt-1">Checking Aadhaar eKYC & ABHA records</p>
              </div>
            )}
            {!verifying && !verified && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <Fingerprint className="w-12 h-12 text-muted/30 mb-3" />
                <p className="text-sm text-muted">Enter Aadhaar or ABHA details and click Verify</p>
                <p className="text-xs text-muted mt-1">Identity will be verified against ABDM registry</p>
              </div>
            )}
            {!verifying && verified && (
              <div className="border border-success/30 bg-success/5 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-6 h-6 text-success" />
                  <span className="font-display font-bold text-success text-lg">Verified</span>
                  <span className="ml-auto px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">eKYC Complete</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-muted text-xs">Full Name</p>
                    <p className="font-medium text-text dark:text-text-dark">Ramesh Venkataraman</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Age / Gender</p>
                    <p className="font-medium text-text dark:text-text-dark">45 / Male</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Aadhaar Status</p>
                    <p className="font-medium text-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">ABHA Status</p>
                    <p className="font-medium text-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">ABHA Address</p>
                    <p className="font-medium text-text dark:text-text-dark">ramesh.v@abdm</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Last Verified</p>
                    <p className="font-medium text-text dark:text-text-dark">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted text-xs">Photo Verification</p>
                    <p className="font-medium text-success flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Photo matched with Aadhaar record</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Log Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
        <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between">
          <h2 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Verification Log
          </h2>
          <span className="text-sm text-muted">{verificationLog.length} recent records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800">
                {['Date/Time', 'Patient Name', 'Aadhaar', 'ABHA ID', 'Method', 'Status', 'Verified By'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {verificationLog.map((row, i) => (
                <tr key={i} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3 font-medium text-text dark:text-text-dark whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{row.aadhaar}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{row.abha}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium whitespace-nowrap">{row.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                      row.status === 'Verified' ? 'bg-success/10 text-success' :
                      row.status === 'Failed' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'
                    )}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{row.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ABDM Integration Status */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" /> ABDM Integration Status
          </h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Last Sync: 2 minutes ago</span>
            <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Uptime: 99.97%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {abdmServices.map(svc => (
            <div key={svc.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <div>
                <p className="text-sm font-medium text-text dark:text-text-dark">{svc.name}</p>
                <p className="text-xs text-success">{svc.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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

      {activeTab === 'Identity & Verification' && (
        <IdentityVerificationTab />
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
