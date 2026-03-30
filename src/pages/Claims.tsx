import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  FileCheck, Plus, LayoutList, Kanban, Clock, CheckCircle2,
  IndianRupee, Loader2, X, Sparkles, Search, User,
  ArrowRight, AlertCircle, ChevronDown, ChevronUp, Send,
  XCircle, Ban, RotateCcw,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Button } from '../components/ui/Button'
import { claims as claimsAPI, patients as patientsAPI } from '../lib/api'
import type { Patient, Claim, ClaimStats } from '../lib/api'
import { cn, formatCurrency, formatDate, getStatusColor } from '../lib/utils'

type ViewMode = 'table' | 'kanban'

const statusLabels: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', rejected: 'Rejected', paid: 'Paid',
  pre_auth_pending: 'Pre-Auth', partially_approved: 'Partial',
  appealed: 'Appealed', closed: 'Closed',
}

const statusFilters = ['All', 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid']
const kanbanColumns = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid']

const payerSchemes = [
  { value: 'ayushman_bharat', label: 'Ayushman Bharat (PMJAY)' },
  { value: 'cghs', label: 'CGHS' },
  { value: 'echs', label: 'ECHS' },
  { value: 'private', label: 'Private Insurance' },
  { value: 'esic', label: 'ESIC' },
  { value: 'self_pay', label: 'Self Pay' },
]

// ========== Patient Search Component ==========
function PatientSearch({ onSelect }: { onSelect: (patient: Patient) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const data = await patientsAPI.list({ q, limit: '8' })
      setResults(data.patients || [])
    } catch {
      setResults([])
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Search Patient *</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true) }}
          onFocus={() => setShowResults(true)}
          placeholder="Type patient name, phone, or ABHA ID..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />}
      </div>
      {showResults && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-border dark:border-border-dark rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setQuery(p.name); setShowResults(false) }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-border/50 dark:border-border-dark/50 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text dark:text-text-dark">{p.name}</p>
                  <p className="text-xs text-muted">{p.age}y/{p.gender?.charAt(0).toUpperCase()} | {p.phone}</p>
                </div>
                <div className="text-right">
                  {p.insurance_type && (
                    <Badge variant="info" size="sm">{p.insurance_provider || p.insurance_type}</Badge>
                  )}
                  {p.insurance_id && <p className="text-[10px] text-muted mt-0.5">{p.insurance_id}</p>}
                </div>
              </div>
              {p.chronic_conditions && (
                <p className="text-[10px] text-muted mt-1">Conditions: {p.chronic_conditions}</p>
              )}
            </button>
          ))}
        </div>
      )}
      {showResults && query.length >= 2 && results.length === 0 && !searching && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-border dark:border-border-dark rounded-lg shadow-lg p-4 text-center text-sm text-muted">
          No patients found for "{query}"
        </div>
      )}
    </div>
  )
}

// ========== AI Analysis Results Component ==========
interface AIAnalysis {
  icd_codes?: { code: string; description: string; confidence?: number }[]
  cpt_codes?: { code: string; description: string; confidence?: number }[]
  completeness_score?: number
  suggestions?: string[]
  ayushman_packages?: { code: string; name: string; rate_range?: string }[]
  comorbidities_from_history?: string[]
  confidence?: string
}

function AIAnalysisPanel({ analysis, onApplyCodes }: { analysis: AIAnalysis; onApplyCodes: (icd: string, cpt: string) => void }) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-bold text-text dark:text-text-dark">AI Analysis Results</h4>
        {analysis.confidence && (
          <Badge variant={analysis.confidence === 'high' ? 'success' : analysis.confidence === 'medium' ? 'warning' : 'error'} size="sm">
            {analysis.confidence} confidence
          </Badge>
        )}
      </div>

      {analysis.icd_codes && analysis.icd_codes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted mb-1">ICD-10 Codes</p>
          <div className="flex flex-wrap gap-2">
            {analysis.icd_codes.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-border dark:border-border-dark text-xs">
                <span className="font-mono font-bold text-primary">{c.code}</span>
                <span className="text-muted">{c.description}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.cpt_codes && analysis.cpt_codes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted mb-1">CPT/Procedure Codes</p>
          <div className="flex flex-wrap gap-2">
            {analysis.cpt_codes.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-border dark:border-border-dark text-xs">
                <span className="font-mono font-bold text-accent">{c.code}</span>
                <span className="text-muted">{c.description}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.completeness_score != null && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Completeness:</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', analysis.completeness_score >= 80 ? 'bg-success' : analysis.completeness_score >= 60 ? 'bg-warning' : 'bg-error')}
              style={{ width: `${analysis.completeness_score}%` }}
            />
          </div>
          <span className="text-xs font-bold">{analysis.completeness_score}%</span>
        </div>
      )}

      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted mb-1">Suggestions</p>
          <ul className="space-y-1">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-text dark:text-text-dark flex items-start gap-1.5">
                <AlertCircle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.ayushman_packages && analysis.ayushman_packages.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted mb-1">Ayushman Bharat Packages</p>
          <div className="flex flex-wrap gap-2">
            {analysis.ayushman_packages.map((pkg, i) => (
              <span key={i} className="px-2 py-1 rounded-md bg-success/10 text-xs text-success font-medium">
                {pkg.code}: {pkg.name} {pkg.rate_range && `(${pkg.rate_range})`}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          const icd = (analysis.icd_codes || []).map(c => c.code).join(', ')
          const cpt = (analysis.cpt_codes || []).map(c => c.code).join(', ')
          onApplyCodes(icd, cpt)
        }}
        className="w-full py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
      >
        Apply AI Codes to Claim
      </button>
    </div>
  )
}

// ========== New Claim Modal ==========
function NewClaimModal({ onClose, onCreated }: { onClose: () => void; onCreated: (claim: Claim) => void }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState({
    diagnosis: '', amount: '', payer_scheme: '', payer_name: '',
    policy_number: '', admission_date: '', discharge_date: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [createdClaim, setCreatedClaim] = useState<Claim | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)

  // Auto-fill insurance from patient
  useEffect(() => {
    if (selectedPatient) {
      setForm(prev => ({
        ...prev,
        payer_scheme: selectedPatient.insurance_type || 'self_pay',
        payer_name: selectedPatient.insurance_provider || '',
        policy_number: selectedPatient.insurance_id || '',
      }))
    }
  }, [selectedPatient])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) { setError('Please select a patient'); return }
    if (!form.diagnosis.trim()) { setError('Please enter a diagnosis'); return }
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter a valid amount'); return }
    setError('')
    setSubmitting(true)

    try {
      const res = await claimsAPI.create({
        patient_id: selectedPatient.id,
        diagnosis: form.diagnosis,
        claimed_amount: Number(form.amount),
        payer_scheme: form.payer_scheme,
        payer_name: form.payer_name,
        policy_number: form.policy_number,
        admission_date: form.admission_date || undefined,
        discharge_date: form.discharge_date || undefined,
      })
      setCreatedClaim(res.claim)
      // Automatically run AI analysis
      setAnalyzing(true)
      try {
        const analysisRes = await claimsAPI.analyze(res.claim.id)
        setAnalysis(analysisRes as unknown as AIAnalysis)
      } catch {
        // AI analysis failed — non-blocking
      }
      setAnalyzing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create claim')
    }
    setSubmitting(false)
  }

  const handleApplyCodes = async (icd: string, cpt: string) => {
    if (!createdClaim) return
    try {
      await claimsAPI.update(createdClaim.id, {
        diagnosis_codes: icd,
        procedure_codes: cpt,
        ai_completeness_score: analysis?.completeness_score,
      })
      onCreated({ ...createdClaim, diagnosis_codes: icd, procedure_codes: cpt })
      onClose()
    } catch {
      onCreated(createdClaim)
      onClose()
    }
  }

  const handleSubmitClaim = async () => {
    if (!createdClaim) return
    try {
      const res = await claimsAPI.submit(createdClaim.id)
      onCreated(res.claim || { ...createdClaim, status: 'submitted' })
      onClose()
    } catch {
      onCreated(createdClaim)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-border-dark sticky top-0 bg-white dark:bg-surface-dark z-10">
          <div>
            <h2 className="font-display font-bold text-lg text-text dark:text-text-dark">
              {createdClaim ? 'Claim Created — AI Analysis' : 'New Insurance Claim'}
            </h2>
            {createdClaim && (
              <p className="text-xs text-muted mt-0.5">Claim {createdClaim.claim_number} saved as draft</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted"><X className="w-5 h-5" /></button>
        </div>

        {!createdClaim ? (
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <PatientSearch onSelect={setSelectedPatient} />

            {selectedPatient && (
              <div className="p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text dark:text-text-dark">{selectedPatient.name}</p>
                    <p className="text-xs text-muted">
                      {selectedPatient.age}y | {selectedPatient.gender} | {selectedPatient.phone}
                      {selectedPatient.blood_group && ` | ${selectedPatient.blood_group}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="info" size="sm">{selectedPatient.insurance_provider || selectedPatient.insurance_type || 'Self Pay'}</Badge>
                    {selectedPatient.insurance_id && <p className="text-[10px] text-muted mt-0.5">{selectedPatient.insurance_id}</p>}
                  </div>
                </div>
                {selectedPatient.chronic_conditions && (
                  <p className="text-[10px] text-muted mt-2">Known conditions: {selectedPatient.chronic_conditions}</p>
                )}
                {selectedPatient.allergies && (
                  <p className="text-[10px] text-error mt-0.5">Allergies: {selectedPatient.allergies}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Diagnosis / Chief Complaint *</label>
              <textarea
                required
                rows={2}
                value={form.diagnosis}
                onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                placeholder="e.g. Type 2 Diabetes Mellitus with diabetic nephropathy, Hypertension Stage 2"
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Payer Scheme *</label>
                <select
                  required
                  value={form.payer_scheme}
                  onChange={e => setForm({ ...form, payer_scheme: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select scheme...</option>
                  {payerSchemes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Claimed Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="25000"
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Admission Date</label>
                <input
                  type="date"
                  value={form.admission_date}
                  onChange={e => setForm({ ...form, admission_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text dark:text-text-dark mb-1">Discharge Date</label>
                <input
                  type="date"
                  value={form.discharge_date}
                  onChange={e => setForm({ ...form, discharge_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 text-text dark:text-text-dark text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting || !selectedPatient} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create & Analyze</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4">
            {/* Claim created successfully */}
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-success">Claim Created Successfully</p>
                <p className="text-xs text-muted">{createdClaim.claim_number} | {formatCurrency(createdClaim.claimed_amount)} | {createdClaim.payer_scheme}</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium text-text dark:text-text-dark">Running AI Analysis...</p>
                  <p className="text-xs text-muted">Suggesting ICD-10/CPT codes based on diagnosis and patient history</p>
                </div>
              </div>
            )}

            {analysis && (
              <AIAnalysisPanel analysis={analysis} onApplyCodes={handleApplyCodes} />
            )}

            {!analyzing && !analysis && (
              <p className="text-sm text-muted text-center py-4">AI analysis not available. You can still submit the claim.</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => { onCreated(createdClaim); onClose() }} className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 text-text dark:text-text-dark text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                Save as Draft
              </button>
              <button onClick={handleSubmitClaim} className="flex-1 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit to Payer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== Claim Detail Modal ==========
function ClaimDetailModal({ claim, onClose, onStatusChange }: { claim: Claim; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<Claim | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await claimsAPI.get(claim.id)
        setDetail(res.claim || claim)
      } catch {
        setDetail(claim)
      }
      if (claim.patient_id) {
        try {
          const pRes = await patientsAPI.get(claim.patient_id)
          setPatient(pRes.patient)
        } catch { /* ignore */ }
      }
      setLoading(false)
    }
    load()
  }, [claim])

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      if (newStatus === 'submitted') {
        await claimsAPI.submit(claim.id)
      } else {
        await claimsAPI.update(claim.id, { status: newStatus })
      }
      onStatusChange(claim.id, newStatus)
      onClose()
    } catch {
      // Optimistic update
      onStatusChange(claim.id, newStatus)
      onClose()
    }
    setUpdating(false)
  }

  const c = detail || claim
  const statusOrder = ['draft', 'submitted', 'under_review', 'approved', 'paid']
  const currentStep = statusOrder.indexOf(c.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-border-dark sticky top-0 bg-white dark:bg-surface-dark z-10">
          <div>
            <h2 className="font-display font-bold text-lg text-text dark:text-text-dark">{c.claim_number}</h2>
            <p className="text-xs text-muted">{c.diagnosis}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(statusLabels[c.status] || c.status)} size="md" dot>
              {statusLabels[c.status] || c.status}
            </Badge>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Status Timeline */}
            <div className="flex items-center justify-between px-2">
              {statusOrder.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2',
                      i <= currentStep
                        ? c.status === 'rejected' && i === currentStep ? 'bg-error text-white border-error' : 'bg-primary text-white border-primary'
                        : 'bg-gray-100 dark:bg-gray-800 text-muted border-border dark:border-border-dark'
                    )}>
                      {i <= currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn('text-[10px] mt-1', i <= currentStep ? 'text-text dark:text-text-dark font-medium' : 'text-muted')}>
                      {statusLabels[step]}
                    </span>
                  </div>
                  {i < statusOrder.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-2 mt-[-16px]', i < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700')} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Claim Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase text-muted font-semibold">Claimed Amount</p>
                <p className="text-lg font-bold text-text dark:text-text-dark">{formatCurrency(c.claimed_amount)}</p>
              </div>
              {c.approved_amount != null && c.approved_amount > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-muted font-semibold">Approved Amount</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(c.approved_amount)}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase text-muted font-semibold">Payer</p>
                <p className="text-sm font-medium text-text dark:text-text-dark">{c.payer_name || c.payer_scheme}</p>
                {c.policy_number && <p className="text-[10px] text-muted">Policy: {c.policy_number}</p>}
              </div>
              {c.diagnosis_codes && (
                <div>
                  <p className="text-[10px] uppercase text-muted font-semibold">ICD-10 Codes</p>
                  <p className="text-sm font-mono text-primary">{c.diagnosis_codes}</p>
                </div>
              )}
              {c.procedure_codes && (
                <div>
                  <p className="text-[10px] uppercase text-muted font-semibold">CPT Codes</p>
                  <p className="text-sm font-mono text-accent">{c.procedure_codes}</p>
                </div>
              )}
              {c.admission_date && (
                <div>
                  <p className="text-[10px] uppercase text-muted font-semibold">Admission</p>
                  <p className="text-sm text-text dark:text-text-dark">{formatDate(c.admission_date)}</p>
                </div>
              )}
              {c.discharge_date && (
                <div>
                  <p className="text-[10px] uppercase text-muted font-semibold">Discharge</p>
                  <p className="text-sm text-text dark:text-text-dark">{formatDate(c.discharge_date)}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase text-muted font-semibold">Created</p>
                <p className="text-sm text-text dark:text-text-dark">{c.created_at ? formatDate(c.created_at) : '—'}</p>
              </div>
              {c.submitted_at && (
                <div>
                  <p className="text-[10px] uppercase text-muted font-semibold">Submitted</p>
                  <p className="text-sm text-text dark:text-text-dark">{formatDate(c.submitted_at)}</p>
                </div>
              )}
            </div>

            {c.rejection_reason && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                <p className="text-xs font-semibold text-error mb-1">Rejection Reason</p>
                <p className="text-sm text-text dark:text-text-dark">{c.rejection_reason}</p>
              </div>
            )}

            {/* Patient Info */}
            {patient && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-border dark:border-border-dark">
                <p className="text-xs font-semibold text-muted mb-2">Patient Details</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted">Name:</span> <span className="font-medium text-text dark:text-text-dark">{patient.name}</span></div>
                  <div><span className="text-muted">Age/Gender:</span> <span className="font-medium text-text dark:text-text-dark">{patient.age}y / {patient.gender}</span></div>
                  <div><span className="text-muted">Phone:</span> <span className="font-medium text-text dark:text-text-dark">{patient.phone}</span></div>
                  {patient.insurance_id && <div><span className="text-muted">Insurance ID:</span> <span className="font-medium text-text dark:text-text-dark">{patient.insurance_id}</span></div>}
                  {patient.allergies && <div className="col-span-2"><span className="text-error">Allergies:</span> <span className="font-medium text-text dark:text-text-dark">{patient.allergies}</span></div>}
                </div>
              </div>
            )}

            {/* Actions based on current status */}
            <div className="flex gap-3 pt-2 border-t border-border dark:border-border-dark">
              {c.status === 'draft' && (
                <>
                  <button onClick={() => handleStatusChange('submitted')} disabled={updating}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit to Payer
                  </button>
                </>
              )}
              {c.status === 'submitted' && (
                <button onClick={() => handleStatusChange('under_review')} disabled={updating}
                  className="flex-1 py-2.5 rounded-lg bg-warning text-white text-sm font-semibold hover:bg-warning/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Mark Under Review
                </button>
              )}
              {c.status === 'under_review' && (
                <>
                  <button onClick={() => handleStatusChange('approved')} disabled={updating}
                    className="flex-1 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                  </button>
                  <button onClick={() => handleStatusChange('rejected')} disabled={updating}
                    className="flex-1 py-2.5 rounded-lg bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                  </button>
                </>
              )}
              {c.status === 'approved' && (
                <button onClick={() => handleStatusChange('paid')} disabled={updating}
                  className="flex-1 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />} Mark as Paid
                </button>
              )}
              {c.status === 'rejected' && (
                <button onClick={() => handleStatusChange('appealed')} disabled={updating}
                  className="flex-1 py-2.5 rounded-lg bg-warning text-white text-sm font-semibold hover:bg-warning/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Appeal
                </button>
              )}
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 text-text dark:text-text-dark text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== Main Claims Page ==========
export default function Claims() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [activeFilter, setActiveFilter] = useState('All')
  const [claimsList, setClaimsList] = useState<Claim[]>([])
  const [stats, setStats] = useState<ClaimStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewClaim, setShowNewClaim] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [listData, statsData] = await Promise.all([
        claimsAPI.list({ limit: '100' }),
        claimsAPI.stats(),
      ])
      setClaimsList(listData.claims || [])
      setStats(statsData)
    } catch {
      setClaimsList([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredClaims = useMemo(() => {
    if (activeFilter === 'All') return claimsList
    return claimsList.filter(c => c.status === activeFilter)
  }, [activeFilter, claimsList])

  const kanbanData = useMemo(() => {
    const grouped: Record<string, Claim[]> = {}
    for (const col of kanbanColumns) grouped[col] = []
    for (const claim of claimsList) {
      if (grouped[claim.status]) grouped[claim.status].push(claim)
    }
    return grouped
  }, [claimsList])

  // Compute real chart data from claims
  const payerBreakdown = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {}
    for (const c of claimsList) {
      const key = c.payer_name || c.payer_scheme || 'Unknown'
      if (!map[key]) map[key] = { count: 0, amount: 0 }
      map[key].count++
      map[key].amount += c.claimed_amount
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 8)
  }, [claimsList])

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of claimsList) {
      const label = statusLabels[c.status] || c.status
      map[label] = (map[label] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [claimsList])

  const handleStatusChange = (claimId: string, newStatus: string) => {
    setClaimsList(prev => prev.map(c => c.id === claimId ? { ...c, status: newStatus } : c))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SmartClaims</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered claims processing for Indian hospitals</p>
          </div>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowNewClaim(true)}>New Claim</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" /></Card>
          ))
        ) : (
          <>
            <Stat label="Total Claims" value={stats?.total_claims?.toLocaleString('en-IN') || '0'}
              icon={<FileCheck className="h-5 w-5" />} />
            <Stat label="Approval Rate" value={stats?.approval_rate != null ? `${stats.approval_rate}%` : '—'}
              icon={<CheckCircle2 className="h-5 w-5" />} />
            <Stat label="Avg Processing" value={stats?.avg_processing_days != null ? `${stats.avg_processing_days} days` : '—'}
              icon={<Clock className="h-5 w-5" />} />
            <Stat label="Total Amount" value={stats?.total_amount ? formatCurrency(stats.total_amount) : '—'}
              icon={<IndianRupee className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('table')}
            className={cn('inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'table' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15')}>
            <LayoutList className="h-4 w-4" /> Table
          </button>
          <button onClick={() => setViewMode('kanban')}
            className={cn('inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'kanban' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15')}>
            <Kanban className="h-4 w-4" /> Kanban
          </button>
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
          {statusFilters.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                activeFilter === filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15')}>
              {filter === 'All' ? `All (${claimsList.length})` : `${statusLabels[filter] || filter} (${claimsList.filter(c => c.status === filter).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding="none">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Claim #</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Patient</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Diagnosis</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payer</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">ICD Codes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {filteredClaims.map((claim, idx) => (
                    <tr
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      className={cn('cursor-pointer transition-colors hover:bg-primary/5 dark:hover:bg-primary/10', idx % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]')}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-primary">{claim.claim_number}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{claim.patient_name || claim.patient_id}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-gray-700 dark:text-gray-300">{claim.diagnosis}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(claim.claimed_amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{claim.payer_name || claim.payer_scheme}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={getStatusColor(statusLabels[claim.status] || claim.status)} dot>
                          {statusLabels[claim.status] || claim.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{claim.created_at ? formatDate(claim.created_at) : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-primary">{claim.diagnosis_codes || '—'}</td>
                    </tr>
                  ))}
                  {filteredClaims.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No claims found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kanbanColumns.map(status => {
            const claims = kanbanData[status] || []
            return (
              <div key={status} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant={getStatusColor(statusLabels[status] || status)} size="md" dot>{statusLabels[status]}</Badge>
                  <span className="text-xs font-medium text-gray-400">{claims.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {claims.map(claim => (
                    <div key={claim.id} onClick={() => setSelectedClaim(claim)} className="cursor-pointer">
                    <Card padding="sm" className="transition-shadow hover:shadow-md">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-primary">{claim.claim_number}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{claim.patient_name || claim.patient_id}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(claim.claimed_amount)}</p>
                        <p className="text-xs text-muted truncate">{claim.diagnosis}</p>
                        <p className="text-[10px] text-muted">{claim.payer_name || claim.payer_scheme}</p>
                      </div>
                    </Card>
                    </div>
                  ))}
                  {claims.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-gray-400 dark:border-border-dark">Empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Analytics from real data */}
      {!loading && claimsList.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Payer Breakdown */}
          <Card header={<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Claims by Payer</h3>}>
            <div className="space-y-3">
              {payerBreakdown.map(([payer, data]) => (
                <div key={payer} className="flex items-center gap-3">
                  <div className="w-32 truncate text-xs font-medium text-text dark:text-text-dark">{payer}</div>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(data.count / claimsList.length) * 100}%` }} />
                  </div>
                  <div className="text-right w-20">
                    <p className="text-xs font-bold text-text dark:text-text-dark">{data.count}</p>
                    <p className="text-[10px] text-muted">{formatCurrency(data.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Status Breakdown */}
          <Card header={<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Claims by Status</h3>}>
            <div className="space-y-3">
              {statusBreakdown.map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-28">
                    <Badge variant={getStatusColor(status)} size="sm" dot>{status}</Badge>
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full',
                        status === 'Paid' || status === 'Approved' ? 'bg-success' :
                        status === 'Rejected' ? 'bg-error' :
                        status === 'Under Review' || status === 'Submitted' ? 'bg-warning' : 'bg-gray-400'
                      )}
                      style={{ width: `${(count / claimsList.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text dark:text-text-dark w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      {showNewClaim && (
        <NewClaimModal
          onClose={() => setShowNewClaim(false)}
          onCreated={(claim) => {
            setClaimsList(prev => [claim, ...prev])
            setShowNewClaim(false)
            loadData() // Refresh stats
          }}
        />
      )}

      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status)
            loadData() // Refresh stats
          }}
        />
      )}
    </div>
  )
}
