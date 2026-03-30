import { useState, useEffect, useMemo } from 'react'
import { Settings, Building2, Users, Shield, Link2, CheckCircle, XCircle, AlertTriangle, ExternalLink, Fingerprint, ShieldCheck, UserCheck, BadgeCheck, Clock, Activity, Camera, Loader2, Search, Wifi, RefreshCw, Lock, Eye, Bug, Key, MonitorSmartphone, FileWarning, Globe, ServerCrash, Database } from 'lucide-react'
import { cn } from '../lib/utils'
import { workforce, analytics, patients } from '../lib/api'
import type { DashboardKPIs } from '../lib/api'

const tabs = ['Hospital Setup', 'User Management', 'Identity & Verification', 'Compliance', 'Integrations', 'Security Center']

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

function IdentityVerificationTab({ patientCount }: { patientCount: number | null }) {
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

      {/* Verified Patients from D1 + Verification Methods Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verified Patient Count from D1 */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
          <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" /> Patient Verification Status
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <Database className="w-3 h-3" /> D1 Data
            </span>
          </h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center flex-1 p-4 rounded-xl bg-success/5 border border-success/20">
              <p className="font-display font-bold text-3xl text-success">
                {patientCount != null ? patientCount.toLocaleString() : '...'}
              </p>
              <p className="text-xs text-muted mt-1">Verified Patients</p>
            </div>
            <div className="text-center flex-1 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="font-display font-bold text-3xl text-primary">
                {patientCount != null ? Math.round(patientCount * 0.879).toLocaleString() : '...'}
              </p>
              <p className="text-xs text-muted mt-1">Aadhaar Linked</p>
            </div>
          </div>
          <div className="text-xs text-muted flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-success" />
            Patient count sourced from D1 patients table via <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded">/api/patients</code>
          </div>
        </div>

        {/* Verification Methods Breakdown */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
          <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" /> Verification Methods Breakdown
          </h2>
          <div className="space-y-4">
            {[
              { method: 'Aadhaar eKYC', percent: 65, color: 'bg-blue-500', textColor: 'text-blue-500', count: patientCount != null ? Math.round(patientCount * 0.65) : null },
              { method: 'ABHA Health ID', percent: 25, color: 'bg-violet-500', textColor: 'text-violet-500', count: patientCount != null ? Math.round(patientCount * 0.25) : null },
              { method: 'Manual Verification', percent: 10, color: 'bg-amber-500', textColor: 'text-amber-500', count: patientCount != null ? Math.round(patientCount * 0.10) : null },
            ].map(m => (
              <div key={m.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text dark:text-text-dark">{m.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{m.count != null ? m.count.toLocaleString() : '...'} patients</span>
                    <span className={cn('text-sm font-bold', m.textColor)}>{m.percent}%</span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', m.color)} style={{ width: `${m.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border dark:border-border-dark text-xs text-muted">
            Aadhaar OTP is the primary verification method. ABHA adoption growing at 12% month-over-month.
          </div>
        </div>
      </div>
    </div>
  )
}

// Security Center demo data
const securityStats = [
  { label: 'Threat Score', value: '12/100', sub: 'Low', icon: Shield, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Active Alerts', value: '3', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'Endpoints Protected', value: '847', icon: MonitorSmartphone, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Last Scan', value: '12 min ago', icon: Eye, color: 'text-success', bg: 'bg-success/10' },
]

const securityMonitors = [
  { name: 'Firewall', status: 'Active', icon: Globe, detail1Label: 'Traffic', detail1: '2.4M packets/day', detail2Label: 'Blocked', detail2: '847 threats blocked' },
  { name: 'Intrusion Detection', status: 'Active', icon: Eye, detail1Label: 'Intrusions', detail1: '0 detected', detail2Label: 'Last Check', detail2: '5 min ago' },
  { name: 'Endpoint Protection', status: 'Active', icon: MonitorSmartphone, detail1Label: 'Devices', detail1: '847 / 852 protected', detail2Label: 'Updates', detail2: '5 pending updates' },
  { name: 'Data Encryption', status: 'Active', icon: Lock, detail1Label: 'Standard', detail1: 'AES-256', detail2Label: 'Coverage', detail2: 'All PHI encrypted' },
  { name: 'Access Control', status: 'Active', icon: Key, detail1Label: 'MFA', detail1: 'Enabled for 98% users', detail2Label: 'Policy', detail2: 'Zero-trust enforced' },
  { name: 'Vulnerability Scanner', status: 'Active', icon: Bug, detail1Label: 'Last Scan', detail1: '2 hrs ago', detail2Label: 'Findings', detail2: '3 medium findings' },
]

const securityEvents = [
  { timestamp: '2026-03-30 09:42', type: 'Failed Login Attempt', source: '192.168.1.45', severity: 'Medium', status: 'Resolved', action: 'Account locked after 5 attempts' },
  { timestamp: '2026-03-30 08:17', type: 'Port Scan Detected', source: '10.0.0.88', severity: 'High', status: 'Blocked', action: 'IP blacklisted automatically' },
  { timestamp: '2026-03-30 07:55', type: 'Suspicious File Upload', source: 'Upload Portal', severity: 'High', status: 'Investigating', action: 'File quarantined for review' },
  { timestamp: '2026-03-29 22:30', type: 'Certificate Renewal', source: 'SSL Manager', severity: 'Low', status: 'Resolved', action: 'Auto-renewed successfully' },
  { timestamp: '2026-03-29 18:05', type: 'Malware Blocked', source: 'Workstation-12', severity: 'Critical', status: 'Blocked', action: 'Trojan isolated & removed' },
  { timestamp: '2026-03-29 15:22', type: 'Unauthorized API Call', source: 'API Gateway', severity: 'Medium', status: 'Resolved', action: 'Token revoked, user notified' },
]

const complianceAuditItems = [
  { label: 'HIPAA Alignment', value: 91, type: 'progress' as const },
  { label: 'DPDP Act 2023', value: 88, type: 'progress' as const },
  { label: 'SOC 2 Type II', value: 'Certified', type: 'badge' as const, badgeColor: 'success' as const },
  { label: 'ISO 27001', value: 'In Progress', type: 'badge' as const, badgeColor: 'warning' as const },
]

function SecurityCenterTab({ staffCount, dashboardData }: { staffCount: number; dashboardData: DashboardKPIs | null }) {
  const [lastScanTime] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))

  return (
    <div className="space-y-6">
      {/* Security Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {securityStats.map(s => (
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

      {/* System Health from API + Security Events Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Real-Time System Health from D1 */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
          <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> System Health
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <Database className="w-3 h-3" /> Live API
            </span>
          </h2>
          {dashboardData ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Total Patients</p>
                <p className="font-display font-bold text-lg text-text dark:text-text-dark">{dashboardData.total_patients.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Active Claims</p>
                <p className="font-display font-bold text-lg text-text dark:text-text-dark">{dashboardData.active_claims}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Bed Occupancy</p>
                <p className="font-display font-bold text-lg text-text dark:text-text-dark">{dashboardData.bed_occupancy}%</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Staff in D1</p>
                <p className="font-display font-bold text-lg text-text dark:text-text-dark">{staffCount || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Satisfaction Score</p>
                <p className="font-display font-bold text-lg text-success">{dashboardData.satisfaction_score}/5</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Avg Wait Time</p>
                <p className="font-display font-bold text-lg text-text dark:text-text-dark">{dashboardData.avg_wait_time} min</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
              <p className="text-xs text-muted">Loading system health data...</p>
            </div>
          )}
        </div>

        {/* Security Events Summary */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
          <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Security Events Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-success/5 border border-success/20">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-success">0</p>
                <p className="text-xs text-muted">Critical Incidents (Last 30 Days)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Last Full Scan</p>
                <p className="text-sm font-semibold text-text dark:text-text-dark">{lastScanTime}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Threat Level</p>
                <p className="text-sm font-semibold text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success" /> Low
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Events Today</p>
                <p className="text-sm font-semibold text-text dark:text-text-dark">{securityEvents.filter(e => e.timestamp.startsWith('2026-03-30')).length}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-muted">Auto-Resolved</p>
                <p className="text-sm font-semibold text-text dark:text-text-dark">{securityEvents.filter(e => e.status === 'Resolved' || e.status === 'Blocked').length}/{securityEvents.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Certifications */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
        <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-primary" /> Compliance Certifications
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'ISO 27001', status: 'In Progress', statusColor: 'text-warning', statusBg: 'bg-warning/10', icon: Shield, desc: 'Information Security Management' },
            { name: 'HIPAA', status: 'Aligned', statusColor: 'text-success', statusBg: 'bg-success/10', icon: Lock, desc: 'Health Insurance Portability Act' },
            { name: 'ABDM', status: 'Compliant', statusColor: 'text-success', statusBg: 'bg-success/10', icon: Globe, desc: 'Ayushman Bharat Digital Mission' },
            { name: 'SOC 2 Type II', status: 'Certified', statusColor: 'text-success', statusBg: 'bg-success/10', icon: ShieldCheck, desc: 'Service Organization Controls' },
          ].map(cert => (
            <div key={cert.name} className="p-4 rounded-xl border border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800 text-center">
              <cert.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-display font-semibold text-sm text-text dark:text-text-dark">{cert.name}</p>
              <p className="text-xs text-muted mt-0.5 mb-2">{cert.desc}</p>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', cert.statusBg, cert.statusColor)}>
                {cert.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Monitoring Dashboard */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
        <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" /> Security Monitoring Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityMonitors.map(m => (
            <div key={m.name} className="rounded-xl border border-border dark:border-border-dark p-4 bg-gray-50 dark:bg-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <m.icon className="w-5 h-5 text-primary" />
                  <span className="font-display font-semibold text-sm text-text dark:text-text-dark">{m.name}</span>
                </div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {m.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{m.detail1Label}</span>
                  <span className="font-medium text-text dark:text-text-dark">{m.detail1}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{m.detail2Label}</span>
                  <span className="font-medium text-text dark:text-text-dark">{m.detail2}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Events Table */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
        <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between">
          <h2 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-primary" /> Recent Security Events
          </h2>
          <span className="text-sm text-muted">{securityEvents.length} events</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800">
                {['Timestamp', 'Event Type', 'Source', 'Severity', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {securityEvents.map((evt, i) => (
                <tr key={i} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-muted whitespace-nowrap font-mono text-xs">{evt.timestamp}</td>
                  <td className="px-4 py-3 font-medium text-text dark:text-text-dark whitespace-nowrap">{evt.type}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs whitespace-nowrap">{evt.source}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                      evt.severity === 'Low' ? 'bg-success/10 text-success' :
                      evt.severity === 'Medium' ? 'bg-warning/10 text-warning' :
                      evt.severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-error/10 text-error'
                    )}>{evt.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                      evt.status === 'Resolved' ? 'bg-success/10 text-success' :
                      evt.status === 'Investigating' ? 'bg-warning/10 text-warning' :
                      'bg-accent/10 text-accent'
                    )}>{evt.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{evt.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance & Audit Section */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
        <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Compliance & Audit
        </h2>
        <div className="space-y-4">
          {complianceAuditItems.map(item => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm font-medium text-text dark:text-text-dark w-40 shrink-0">{item.label}</span>
              {item.type === 'progress' ? (
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', item.value >= 90 ? 'bg-success' : item.value >= 80 ? 'bg-warning' : 'bg-error')}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className={cn('text-sm font-semibold w-12 text-right', item.value >= 90 ? 'text-success' : item.value >= 80 ? 'text-warning' : 'text-error')}>{item.value}%</span>
                </div>
              ) : (
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold',
                  item.badgeColor === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                )}>{item.value}</span>
              )}
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-border dark:border-border-dark flex items-center gap-2 text-sm">
            <ServerCrash className="w-4 h-4 text-muted" />
            <span className="text-muted">Last Penetration Test:</span>
            <span className="font-medium text-text dark:text-text-dark">15 Mar 2026</span>
            <span className="text-muted">-</span>
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">No critical findings</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Types for API staff used in Admin context
interface APIStaffEntry {
  id: string
  user_id?: string
  name?: string
  role?: string
  department?: string
  designation?: string
  contact?: string
  status?: string
  experience_years?: number
  skills?: string[] | { skill_name: string; category: string; proficiency: number }[]
  certifications?: { name?: string; certification_name?: string; status?: string; issued_by?: string; valid_until?: string | null; expiry_date?: string }[]
  city?: string
}

interface CertSummary {
  total: number
  active: number
  expiring_soon: number
  expired: number
  compliance_rate: number
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Hospital Setup')

  // Real data state
  const [apiStaff, setApiStaff] = useState<APIStaffEntry[]>([])
  const [certSummary, setCertSummary] = useState<CertSummary | null>(null)
  const [staffLoading, setStaffLoading] = useState(true)
  const [staffError, setStaffError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardKPIs | null>(null)
  const [patientCount, setPatientCount] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadStaffData() {
      setStaffLoading(true)
      setStaffError(null)
      try {
        const [staffRes, certRes, dashRes, patientRes] = await Promise.all([
          workforce.staff(),
          workforce.certifications().catch(() => null),
          analytics.dashboard().catch(() => null),
          patients.list({ limit: '1' }).catch(() => null),
        ])
        if (!mounted) return
        if (staffRes.staff) {
          setApiStaff(staffRes.staff as unknown as APIStaffEntry[])
        }
        if (certRes && (certRes as any).summary) {
          setCertSummary((certRes as any).summary)
        }
        if (dashRes) {
          setDashboardData(dashRes)
        }
        if (patientRes && patientRes.total != null) {
          setPatientCount(patientRes.total)
        }
        setFetchedAt(new Date())
      } catch (err: any) {
        if (mounted) {
          setStaffError(err?.message || 'Failed to load staff data')
        }
      }
      if (mounted) setStaffLoading(false)
    }
    loadStaffData()
    return () => { mounted = false }
  }, [])

  // Derived stats from live API data
  const staffCount = apiStaff.length
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    apiStaff.forEach(s => {
      const dept = s.department || 'Unknown'
      map[dept] = (map[dept] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [apiStaff])

  const activeStaffCount = useMemo(
    () => apiStaff.filter(s => s.status === 'active' || s.status === 'Active').length,
    [apiStaff]
  )

  const roleBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    apiStaff.forEach(s => {
      const role = s.role || 'Unknown'
      map[role] = (map[role] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [apiStaff])

  // Merge API staff into the user management table (fallback to hardcoded if API returns nothing)
  const mergedUsers = useMemo(() => {
    if (apiStaff.length > 0) {
      return apiStaff.map(s => ({
        name: s.name || s.user_id || s.id,
        email: s.contact || '',
        role: s.role || s.designation || '-',
        dept: s.department || '-',
        status: (s.status === 'active' ? 'Active' : s.status === 'on-leave' ? 'On Leave' : s.status || 'Active') as string,
        lastLogin: '-',
        source: 'D1' as const,
      }))
    }
    return users.map(u => ({ ...u, source: 'local' as const }))
  }, [apiStaff])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Administration</h1>
          <p className="text-muted text-sm mt-1">Hospital configuration, user management, and compliance</p>
        </div>
        {fetchedAt && (
          <div className="flex items-center gap-2 text-xs text-muted bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg px-3 py-1.5">
            <Database className="w-3.5 h-3.5 text-success" />
            <span>D1 synced {fetchedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            {staffCount > 0 && <span className="font-medium text-text dark:text-text-dark">({staffCount} staff)</span>}
          </div>
        )}
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
                ['Staff Count', staffLoading ? 'Loading...' : staffCount > 0 ? `${staffCount} (from D1)` : '~800'],
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
          {/* D1 Department Staff Distribution */}
          {departmentBreakdown.length > 0 && (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
              <h2 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> Staff Distribution by Department
              </h2>
              <p className="text-xs text-muted mb-4">Live data from D1 workforce API</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {departmentBreakdown.map(([dept, count]) => (
                  <div key={dept} className="px-3 py-3 rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
                    <span className="text-sm text-text dark:text-text-dark">{dept}</span>
                    <span className="text-sm font-bold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'User Management' && (
        <div className="space-y-6">
          {/* User Management KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Staff', value: staffLoading ? '...' : String(staffCount || users.length), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Active Now', value: staffLoading ? '...' : String(activeStaffCount || users.filter(u => u.status === 'Active').length), icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Departments', value: staffLoading ? '...' : String(departmentBreakdown.length || '16'), icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Certifications', value: certSummary ? String(certSummary.total) : '-', icon: BadgeCheck, color: certSummary && certSummary.expired > 0 ? 'text-warning' : 'text-success', bg: certSummary && certSummary.expired > 0 ? 'bg-warning/10' : 'bg-success/10', sub: certSummary ? `${certSummary.compliance_rate}% compliant` : undefined },
            ].map(s => (
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

          {/* Role & Department Breakdown (from D1) */}
          {apiStaff.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
                <h3 className="font-display font-semibold text-sm text-text dark:text-text-dark mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> By Role
                </h3>
                <div className="space-y-2">
                  {roleBreakdown.map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm text-muted">{role}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(count / staffCount) * 100}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-text dark:text-text-dark w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
                <h3 className="font-display font-semibold text-sm text-text dark:text-text-dark mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> By Department
                </h3>
                <div className="space-y-2">
                  {departmentBreakdown.map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm text-muted">{dept}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(count / staffCount) * 100}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-text dark:text-text-dark w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certification Compliance (from D1) */}
          {certSummary && (
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
              <h3 className="font-display font-semibold text-sm text-text dark:text-text-dark mb-3 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-primary" /> Certification Compliance
                <span className="ml-auto text-xs text-muted font-normal">Source: D1 workforce/certifications</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Total', value: certSummary.total, color: 'text-text dark:text-text-dark' },
                  { label: 'Active', value: certSummary.active, color: 'text-success' },
                  { label: 'Expiring Soon', value: certSummary.expiring_soon, color: 'text-warning' },
                  { label: 'Expired', value: certSummary.expired, color: 'text-error' },
                  { label: 'Compliance', value: `${certSummary.compliance_rate}%`, color: certSummary.compliance_rate >= 90 ? 'text-success' : 'text-warning' },
                ].map(item => (
                  <div key={item.label} className="text-center py-2">
                    <p className={cn('font-display font-bold text-lg', item.color)}>{item.value}</p>
                    <p className="text-xs text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff table */}
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
            <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between">
              <h2 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Platform Users
              </h2>
              <div className="flex items-center gap-3">
                {apiStaff.length > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <Database className="w-3 h-3" /> Live D1
                  </span>
                )}
                <span className="text-sm text-muted">{mergedUsers.length} users</span>
              </div>
            </div>

            {staffLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted">Loading staff from D1 database...</p>
              </div>
            ) : staffError ? (
              <div className="p-6">
                <div className="flex items-center gap-2 text-warning mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Could not load live data: {staffError}</span>
                </div>
                <p className="text-xs text-muted mb-4">Showing local fallback data instead.</p>
                <div className="overflow-x-auto">
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
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                      {['Name', 'Email / Contact', 'Role', 'Department', 'Status', mergedUsers[0]?.source === 'D1' ? 'Source' : 'Last Login'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mergedUsers.map((u, idx) => (
                      <tr key={u.email || idx} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{u.name}</td>
                        <td className="px-4 py-3 text-muted text-xs">{u.email || '-'}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{u.role}</span></td>
                        <td className="px-4 py-3 text-muted">{u.dept}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                            u.status === 'Active' ? 'bg-success/10 text-success' :
                            u.status === 'On Leave' ? 'bg-warning/10 text-warning' :
                            'bg-success/10 text-success'
                          )}>{u.status}</span>
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {u.source === 'D1' ? (
                            <span className="flex items-center gap-1 text-xs"><Database className="w-3 h-3 text-success" /> D1</span>
                          ) : (
                            u.lastLogin !== '-' ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Identity & Verification' && (
        <IdentityVerificationTab patientCount={patientCount} />
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
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-x-auto">
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

      {activeTab === 'Security Center' && (
        <SecurityCenterTab staffCount={staffCount} dashboardData={dashboardData} />
      )}
    </div>
  )
}
