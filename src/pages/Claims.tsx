import { useState, useMemo, useEffect } from 'react'
import {
  FileCheck,
  Plus,
  LayoutList,
  Kanban,
  Clock,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Chart } from '../components/ui/Chart'
import { Button } from '../components/ui/Button'
import { claims as claimsAPI } from '../lib/api'
import type { ClaimStats } from '../lib/api'
import { demoClaims, chartData } from '../lib/mock-data'
import { cn, formatCurrency, formatDate, getStatusColor } from '../lib/utils'

type ViewMode = 'table' | 'kanban'
type FilterStatus = 'All' | string

const statusFilters = ['All', 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid']
const statusLabels: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', rejected: 'Rejected', paid: 'Paid',
  pre_auth_pending: 'Pre-Auth', partially_approved: 'Partial', appealed: 'Appealed', closed: 'Closed',
}
const kanbanColumns = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid']

interface DisplayClaim {
  id: string; patientName: string; department: string; amount: number;
  payer: string; status: string; date: string; diagnosis: string;
}

function NewClaimModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (claim: DisplayClaim) => void }) {
  const [form, setForm] = useState({
    patientName: '', diagnosis: '', amount: '', payer: 'Star Health', department: 'General Medicine',
  })
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAiCode = () => {
    if (!form.diagnosis) return
    setAiSuggestion('Analyzing...')
    setTimeout(() => {
      const suggestions: Record<string, string> = {
        diabetes: 'ICD-10: E11.9 (Type 2 DM) | CPT: 99214 (Office Visit) | Est. ₹15,000-₹25,000',
        hypertension: 'ICD-10: I10 (Essential HTN) | CPT: 99213 (Office Visit) | Est. ₹8,000-₹12,000',
        fracture: 'ICD-10: S72.001A (Femur Fracture) | CPT: 27236 (ORIF) | Est. ₹1,50,000-₹2,50,000',
        pneumonia: 'ICD-10: J18.9 (Pneumonia) | CPT: 99223 (Hospital Admit) | Est. ₹35,000-₹60,000',
        appendicitis: 'ICD-10: K35.80 (Acute Appendicitis) | CPT: 44970 (Laparoscopic) | Est. ₹45,000-₹75,000',
      }
      const key = Object.keys(suggestions).find(k => form.diagnosis.toLowerCase().includes(k))
      setAiSuggestion(key ? suggestions[key] : `ICD-10: R69 (Illness, unspecified) | CPT: 99214 | Needs manual review`)
    }, 800)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await claimsAPI.create({
        patient_id: `pat-${Date.now()}`,
        patient_name: form.patientName,
        diagnosis: form.diagnosis,
        claimed_amount: Number(form.amount) || 0,
        payer_name: form.payer,
        payer_scheme: form.department,
      })
      const c = res.claim
      const created: DisplayClaim = {
        id: c.claim_number || c.id,
        patientName: c.patient_name || form.patientName,
        department: c.payer_scheme || form.department,
        amount: c.claimed_amount,
        payer: c.payer_name || c.payer_scheme || form.payer,
        status: c.status,
        date: c.created_at || new Date().toISOString(),
        diagnosis: c.diagnosis,
      }
      setSubmitting(false)
      onSubmit(created)
    } catch {
      // Fallback: build display claim locally
      const fallback: DisplayClaim = {
        id: `CLM-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        patientName: form.patientName,
        department: form.department,
        amount: Number(form.amount) || 0,
        payer: form.payer,
        status: 'draft',
        date: new Date().toISOString(),
        diagnosis: form.diagnosis,
      }
      setSubmitting(false)
      onSubmit(fallback)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-border-dark">
          <h2 className="font-display font-bold text-lg text-text dark:text-text-dark">New Insurance Claim</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Patient Name</label>
              <input type="text" required value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} placeholder="Rajesh Kumar"
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Department</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {['General Medicine', 'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Pulmonology', 'Gastroenterology'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Diagnosis</label>
            <div className="flex gap-2">
              <input type="text" required value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} placeholder="e.g. Type 2 Diabetes, Fracture, Pneumonia"
                className="flex-1 px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button type="button" onClick={handleAiCode} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3" /> AI Code
              </button>
            </div>
            {aiSuggestion && (
              <div className="mt-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
                <span className="font-semibold">AI Suggestion:</span> {aiSuggestion}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Claim Amount (₹)</label>
              <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="25000"
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Payer / Insurer</label>
              <select value={form.payer} onChange={e => setForm({...form, payer: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {['Star Health', 'HDFC ERGO', 'Bajaj Allianz', 'Ayushman Bharat', 'CGHS', 'ECHS', 'Niva Bupa', 'ICICI Lombard'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 text-text dark:text-text-dark text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Claim</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Claims() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All')
  const [claimsList, setClaimsList] = useState<DisplayClaim[]>([])
  const [stats, setStats] = useState<ClaimStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewClaim, setShowNewClaim] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [listData, statsData] = await Promise.all([
          claimsAPI.list(),
          claimsAPI.stats(),
        ])
        if (mounted) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setClaimsList((listData.claims || []).map((c: any) => ({
            id: c.claim_number || c.id,
            patientName: c.patient_name || 'Patient',
            department: c.payer_scheme || '',
            amount: c.claimed_amount,
            payer: c.payer_name || c.payer_scheme,
            status: c.status,
            date: c.created_at || c.submitted_at || '',
            diagnosis: c.diagnosis || c.diagnosis_text || '',
          })))
          setStats(statsData)
        }
      } catch {
        // Fallback to mock data
        if (mounted) {
          setClaimsList(demoClaims.map(c => ({
            id: c.id, patientName: c.patientName, department: c.department,
            amount: c.amount, payer: c.payer, status: c.status,
            date: c.submittedDate, diagnosis: c.diagnosis,
          })))
        }
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const filteredClaims = useMemo(() => {
    if (activeFilter === 'All') return claimsList
    return claimsList.filter((c) => c.status.toLowerCase().replace(/ /g, '_') === activeFilter)
  }, [activeFilter, claimsList])

  const kanbanData = useMemo(() => {
    const grouped: Record<string, DisplayClaim[]> = {}
    for (const col of kanbanColumns) grouped[col] = []
    for (const claim of claimsList) {
      const key = claim.status.toLowerCase().replace(/ /g, '_')
      if (grouped[key]) grouped[key].push(claim)
    }
    return grouped
  }, [claimsList])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SmartClaims Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered claims lifecycle management</p>
          </div>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowNewClaim(true)}>New Claim</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" /></Card>
          ))
        ) : (
          <>
            <Stat label="Total Claims" value={stats ? stats.total_claims.toLocaleString('en-IN') : '1,247'}
              change={12.5} changeLabel="vs last month" icon={<FileCheck className="h-5 w-5" />} />
            <Stat label="Approval Rate" value={stats ? `${stats.approval_rate}%` : '87.3%'}
              change={3.2} changeLabel="vs last month" icon={<CheckCircle2 className="h-5 w-5" />} />
            <Stat label="Avg Processing Time" value={stats ? `${stats.avg_processing_days} days` : '2.4 days'}
              change={-8.1} changeLabel="faster" icon={<Clock className="h-5 w-5" />} />
            <Stat label="Pending Amount"
              value={stats ? formatCurrency(stats.total_amount - stats.approved_amount) : '\u20B91.23 Cr'}
              change={-5.4} changeLabel="vs last month" icon={<IndianRupee className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setViewMode('table')}
          className={cn('inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            viewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15')}>
          <LayoutList className="h-4 w-4" /> Table View
        </button>
        <button onClick={() => setViewMode('kanban')}
          className={cn('inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            viewMode === 'kanban' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15')}>
          <Kanban className="h-4 w-4" /> Kanban View
        </button>
      </div>

      {viewMode === 'table' && (
        <Card padding="none">
          <div className="flex flex-wrap gap-2 border-b border-border px-5 py-4 dark:border-border-dark">
            {statusFilters.map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)}
                className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  activeFilter === filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15')}>
                {filter === 'All' ? 'All' : statusLabels[filter] || filter}
                {filter !== 'All' && (
                  <span className="ml-1.5 opacity-70">({claimsList.filter(c => c.status.toLowerCase().replace(/ /g, '_') === filter).length})</span>
                )}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Claim ID</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Patient</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Diagnosis</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payer</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {filteredClaims.map((claim, idx) => (
                    <tr key={claim.id} className={cn('cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5', idx % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]')}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-primary">{claim.id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{claim.patientName}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-gray-700 dark:text-gray-300">{claim.diagnosis}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(claim.amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{claim.payer}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={getStatusColor(statusLabels[claim.status] || claim.status)} dot>{statusLabels[claim.status] || claim.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(claim.date)}</td>
                    </tr>
                  ))}
                  {filteredClaims.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No claims found for this filter</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kanbanColumns.map((status) => {
            const claims = kanbanData[status] || []
            return (
              <div key={status} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant={getStatusColor(statusLabels[status] || status)} size="md" dot>{statusLabels[status] || status}</Badge>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{claims.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {claims.map((claim) => (
                    <Card key={claim.id} padding="sm" className="cursor-pointer transition-shadow hover:shadow-md">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary">{claim.id}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{claim.patientName}</p>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(claim.amount)}</span>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{claim.payer}</p>
                      </div>
                    </Card>
                  ))}
                  {claims.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-gray-400 dark:border-border-dark dark:text-gray-500">No claims</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card header={<div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Claims by Payer</h3></div>}>
          <Chart type="pie" data={chartData.payerMix as Record<string, unknown>[]} dataKeys={['value']} xAxisKey="name" height={320} />
        </Card>
        <Card header={<div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Claims Trend</h3></div>}>
          <Chart type="bar" data={chartData.claimsTrend as Record<string, unknown>[]} dataKeys={['submitted', 'approved']} xAxisKey="name" height={320} />
        </Card>
      </div>

      {showNewClaim && (
        <NewClaimModal
          onClose={() => setShowNewClaim(false)}
          onSubmit={(claim) => {
            setClaimsList(prev => [claim, ...prev])
            setShowNewClaim(false)
          }}
        />
      )}
    </div>
  )
}
