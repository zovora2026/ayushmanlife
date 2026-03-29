import React, { useState } from 'react'
import {
  LayoutDashboard, MessageSquareHeart, FileCheck, TrendingUp,
  Activity, Users, Clock, IndianRupee, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vcare', label: 'V-Care', icon: MessageSquareHeart },
  { id: 'claims', label: 'SmartClaims', icon: FileCheck },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
]

function DashboardPreview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Patients', value: '12,847', change: 8.2, icon: Users, color: 'text-primary' },
          { label: 'Claims Today', value: '156', change: 12.5, icon: FileCheck, color: 'text-accent' },
          { label: 'Satisfaction', value: '94.2%', change: 3.1, icon: Activity, color: 'text-success' },
          { label: 'Revenue (MTD)', value: '₹2.4Cr', change: -2.3, icon: IndianRupee, color: 'text-secondary' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={cn('w-4 h-4', s.color)} />
              <span className={cn('text-xs flex items-center gap-0.5', s.change > 0 ? 'text-success' : 'text-error')}>
                {s.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(s.change)}%
              </span>
            </div>
            <p className="font-display font-bold text-lg text-text dark:text-text-dark">{s.value}</p>
            <p className="text-[10px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
          <p className="text-xs font-semibold text-text dark:text-text-dark mb-2">Recent Activity</p>
          {['Claim CLM-0048 submitted', 'Patient Meera Reddy checked in', 'Dr. Kumar approved referral', 'Lab results uploaded'].map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 dark:border-slate-600 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[10px] text-muted">{a}</p>
              <span className="text-[9px] text-muted ml-auto">{(i + 1) * 5}m</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
          <p className="text-xs font-semibold text-text dark:text-text-dark mb-2">Claims Pipeline</p>
          <div className="space-y-2">
            {[
              { status: 'Submitted', count: 34, color: 'bg-accent' },
              { status: 'Under Review', count: 21, color: 'bg-warning' },
              { status: 'Approved', count: 89, color: 'bg-success' },
              { status: 'Paid', count: 156, color: 'bg-primary' },
            ].map((s) => (
              <div key={s.status} className="flex items-center gap-2">
                <span className="text-[10px] text-muted w-20">{s.status}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', s.color)} style={{ width: `${(s.count / 156) * 100}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-text dark:text-text-dark w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VCarePreview() {
  return (
    <div className="flex gap-3 h-64">
      <div className="flex-1 bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 flex flex-col">
        <div className="p-3 border-b border-gray-100 dark:border-slate-600">
          <p className="text-xs font-semibold text-text dark:text-text-dark flex items-center gap-1.5">
            <MessageSquareHeart className="w-3.5 h-3.5 text-primary" /> V-Care Assistant
          </p>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-600 rounded-lg rounded-tl-none px-3 py-1.5 text-[10px] max-w-[80%] text-text dark:text-text-dark">
              Namaste! How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-primary text-white rounded-lg rounded-tr-none px-3 py-1.5 text-[10px] max-w-[80%]">
              I need to book an appointment with a cardiologist
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-600 rounded-lg rounded-tl-none px-3 py-1.5 text-[10px] max-w-[80%] text-text dark:text-text-dark">
              Dr. Rajesh Kumar has slots available tomorrow at 10:00 AM and 2:00 PM. Shall I book one?
            </div>
          </div>
        </div>
        <div className="p-2 border-t border-gray-100 dark:border-slate-600">
          <div className="flex gap-1">
            {['Book Appointment', 'Check Symptoms', 'Medications'].map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px]">{c}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="w-40 bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 p-3 space-y-3">
        <p className="text-xs font-semibold text-text dark:text-text-dark">Patient Vitals</p>
        {[
          { label: 'BP', value: '128/82', unit: 'mmHg', ok: true },
          { label: 'HR', value: '72', unit: 'bpm', ok: true },
          { label: 'SpO2', value: '98', unit: '%', ok: true },
          { label: 'Glucose', value: '118', unit: 'mg/dL', ok: false },
          { label: 'Temp', value: '36.6', unit: '°C', ok: true },
        ].map((v) => (
          <div key={v.label}>
            <p className="text-[9px] text-muted">{v.label}</p>
            <p className={cn('text-xs font-semibold', v.ok ? 'text-text dark:text-text-dark' : 'text-warning')}>
              {v.value} <span className="text-[8px] font-normal text-muted">{v.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClaimsPreview() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'].map((f, i) => (
          <span key={f} className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium',
            i === 0 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-muted'
          )}>{f}</span>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-600">
              {['Claim ID', 'Patient', 'Amount', 'Payer', 'Status'].map(h => (
                <th key={h} className="text-left p-2 font-semibold text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'CLM-0048', patient: 'Amit Patel', amount: '₹1,85,000', payer: 'Star Health', status: 'Approved', color: 'text-success bg-success/10' },
              { id: 'CLM-0047', patient: 'Priya Singh', amount: '₹45,000', payer: 'PMJAY', status: 'Under Review', color: 'text-warning bg-warning/10' },
              { id: 'CLM-0046', patient: 'Rajesh Kumar', amount: '₹2,30,000', payer: 'CGHS', status: 'Submitted', color: 'text-accent bg-accent/10' },
              { id: 'CLM-0045', patient: 'Meera Reddy', amount: '₹78,000', payer: 'HDFC ERGO', status: 'Paid', color: 'text-primary bg-primary/10' },
            ].map((c) => (
              <tr key={c.id} className="border-b border-gray-50 dark:border-slate-600 last:border-0">
                <td className="p-2 font-semibold text-text dark:text-text-dark">{c.id}</td>
                <td className="p-2 text-text dark:text-text-dark">{c.patient}</td>
                <td className="p-2 font-semibold text-text dark:text-text-dark">{c.amount}</td>
                <td className="p-2 text-muted">{c.payer}</td>
                <td className="p-2">
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-medium', c.color)}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalyticsPreview() {
  const bars = [65, 78, 52, 90, 70, 85, 60, 95, 45, 80, 72, 88]
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Churn Rate', value: '10.2%', sub: 'Down from 35%', color: 'text-success' },
          { label: 'Avg Wait Time', value: '12 min', sub: 'Target: 15 min', color: 'text-primary' },
          { label: 'Bed Occupancy', value: '84%', sub: '252/300 beds', color: 'text-accent' },
        ].map((m) => (
          <div key={m.label} className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
            <p className="text-[10px] text-muted">{m.label}</p>
            <p className={cn('text-lg font-display font-bold', m.color)}>{m.value}</p>
            <p className="text-[9px] text-muted">{m.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-gray-100 dark:border-slate-600">
        <p className="text-xs font-semibold text-text dark:text-text-dark mb-3">Monthly Revenue Trend</p>
        <div className="flex items-end gap-1 h-24">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn('w-full rounded-t', i === bars.length - 1 ? 'bg-primary' : 'bg-primary/30')}
                style={{ height: `${h}%` }}
              />
              <span className="text-[7px] text-muted">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const previews: Record<string, React.FC> = {
  dashboard: DashboardPreview,
  vcare: VCarePreview,
  claims: ClaimsPreview,
  analytics: AnalyticsPreview,
}

export default function PlatformPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const Preview = previews[activeTab]

  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-800/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text dark:text-text-dark mb-4">
            See the Platform in Action
          </h2>
          <p className="text-lg text-muted">
            Interactive preview of core modules powering healthcare transformation.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-border dark:border-border-dark overflow-hidden">
          <div className="flex border-b border-border dark:border-border-dark">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-50 dark:hover:bg-slate-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 bg-gray-50 dark:bg-slate-900/50">
            <Preview />
          </div>
        </div>
      </div>
    </section>
  )
}
