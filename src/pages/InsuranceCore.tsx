import { useState, useEffect } from 'react'
import {
  FileText, ShieldCheck, AlertTriangle, UserCheck, Plus, Filter,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { insurance } from '../lib/api'
import type { InsuranceProduct, InsurancePolicy, PolicyEndorsement, UnderwritingRequest } from '../lib/api'
import { generatePolicyDocument } from '../lib/pdf'

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'policies', label: 'Policies' },
  { id: 'underwriting', label: 'Underwriting' },
  { id: 'endorsements', label: 'Endorsements' },
]

const SCHEME_BADGE: Record<string, 'success' | 'warning' | 'info' | 'error' | 'neutral'> = {
  ayushman_bharat: 'success', cghs: 'info', echs: 'warning', private: 'neutral', self_pay: 'neutral',
}

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

const DECISION_BADGE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  pending: 'warning', approved: 'success', approved_with_loading: 'info', declined: 'error',
}

const RISK_BADGE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  preferred: 'success', standard: 'info', substandard: 'warning', high_risk: 'error',
}

export default function InsuranceCore() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState<InsuranceProduct[]>([])
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [policySummary, setPolicySummary] = useState<any>({})
  const [endorsements, setEndorsements] = useState<PolicyEndorsement[]>([])
  const [underwriting, setUnderwriting] = useState<UnderwritingRequest[]>([])
  const [uwSummary, setUwSummary] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [schemeFilter, setSchemeFilter] = useState('')
  const [uwFilter, setUwFilter] = useState('')
  const [showPolicyForm, setShowPolicyForm] = useState(false)
  const [showUwForm, setShowUwForm] = useState(false)
  const [showEndorsementForm, setShowEndorsementForm] = useState(false)

  useEffect(() => { loadProducts() }, [])

  useEffect(() => {
    if (tab === 'products') loadProducts()
    if (tab === 'policies') loadPolicies()
    if (tab === 'endorsements') loadEndorsements()
    if (tab === 'underwriting') loadUnderwriting()
  }, [tab, schemeFilter, uwFilter])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await insurance.products(schemeFilter || undefined)
      setProducts(data.products)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadPolicies() {
    try {
      const params: Record<string, string> = {}
      if (schemeFilter) params.scheme = schemeFilter
      const data = await insurance.policies(params)
      setPolicies(data.policies)
      setPolicySummary(data.summary)
    } catch (e) { console.error(e) }
  }

  async function loadEndorsements() {
    try {
      const data = await insurance.endorsements()
      setEndorsements(data.endorsements)
    } catch (e) { console.error(e) }
  }

  async function loadUnderwriting() {
    try {
      const data = await insurance.underwriting(uwFilter || undefined)
      setUnderwriting(data.requests)
      setUwSummary(data.summary)
    } catch (e) { console.error(e) }
  }

  async function handleEndorsementAction(id: string, status: string) {
    try {
      await insurance.updateEndorsement({ id, status, approved_by: 'usr-003' })
      loadEndorsements()
    } catch (e) { console.error(e) }
  }

  async function handleUnderwritingDecision(id: string, decision: string, loading_pct?: number, remarks?: string) {
    try {
      await insurance.updateUnderwriting({ id, decision, premium_loading: loading_pct, remarks, underwriter_id: 'usr-003' })
      loadUnderwriting()
    } catch (e) { console.error(e) }
  }

  async function handlePolicyStatusChange(id: string, status: string) {
    try {
      await insurance.updatePolicy({ id, status })
      loadPolicies()
    } catch (e) { console.error(e) }
  }

  async function handleCreatePolicy(data: Partial<InsurancePolicy>) {
    try {
      await insurance.createPolicy(data)
      setShowPolicyForm(false)
      loadPolicies()
    } catch (e) { console.error(e) }
  }

  async function handleCreateUnderwriting(data: Partial<UnderwritingRequest>) {
    try {
      await insurance.createUnderwriting(data)
      setShowUwForm(false)
      loadUnderwriting()
    } catch (e) { console.error(e) }
  }

  async function handleCreateEndorsement(data: Partial<PolicyEndorsement>) {
    try {
      await insurance.createEndorsement(data)
      setShowEndorsementForm(false)
      loadEndorsements()
    } catch (e) { console.error(e) }
  }

  if (loading && products.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text dark:text-text-dark">Insurance Core Platform</h1>
        <p className="text-sm text-muted mt-1">Policy administration, product management, underwriting & endorsements</p>
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'products' && <ProductsTab products={products} filter={schemeFilter} setFilter={setSchemeFilter} />}
      {tab === 'policies' && <PoliciesTab policies={policies} summary={policySummary} filter={schemeFilter} setFilter={setSchemeFilter} onStatusChange={handlePolicyStatusChange} showForm={showPolicyForm} setShowForm={setShowPolicyForm} onCreatePolicy={handleCreatePolicy} products={products} />}
      {tab === 'underwriting' && <UnderwritingTab requests={underwriting} summary={uwSummary} filter={uwFilter} setFilter={setUwFilter} onDecision={handleUnderwritingDecision} showForm={showUwForm} setShowForm={setShowUwForm} onCreateUw={handleCreateUnderwriting} products={products} />}
      {tab === 'endorsements' && <EndorsementsTab endorsements={endorsements} onAction={handleEndorsementAction} showForm={showEndorsementForm} setShowForm={setShowEndorsementForm} onCreateEndorsement={handleCreateEndorsement} policies={policies} />}
    </div>
  )
}

function ProductsTab({ products, filter, setFilter }: { products: InsuranceProduct[]; filter: string; setFilter: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
          <option value="">All Schemes</option>
          <option value="ayushman_bharat">Ayushman Bharat</option>
          <option value="cghs">CGHS</option>
          <option value="echs">ECHS</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <Card key={p.id}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-text dark:text-text-dark">{p.product_name}</h3>
                <p className="text-xs font-mono text-muted">{p.product_code}</p>
              </div>
              <Badge variant={SCHEME_BADGE[p.scheme] || 'neutral'}>{p.scheme.replace('_', ' ')}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Coverage</span>
                <span className="font-medium text-text dark:text-text-dark">{formatINR(p.coverage_amount)}</span>
              </div>
              {(p.premium_range_min || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Premium</span>
                  <span className="font-medium text-text dark:text-text-dark">{formatINR(p.premium_range_min || 0)} - {formatINR(p.premium_range_max || 0)}/yr</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Age</span>
                <span className="text-text dark:text-text-dark">{p.min_age} - {p.max_age} years</span>
              </div>
              {p.co_pay_pct > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Co-pay</span>
                  <span className="text-text dark:text-text-dark">{p.co_pay_pct}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Waiting Period</span>
                <span className="text-text dark:text-text-dark">{p.waiting_period_days} days</span>
              </div>
            </div>
            {p.coverage_rules && <p className="text-xs text-muted mt-3 pt-3 border-t border-border dark:border-border-dark">{p.coverage_rules}</p>}
            {p.exclusions && <p className="text-xs text-error/70 mt-1">Exclusions: {p.exclusions}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}

function PoliciesTab({ policies, summary, filter, setFilter, onStatusChange, showForm, setShowForm, onCreatePolicy, products }: {
  policies: InsurancePolicy[]; summary: any; filter: string; setFilter: (v: string) => void; onStatusChange: (id: string, status: string) => void;
  showForm: boolean; setShowForm: (v: boolean) => void; onCreatePolicy: (d: Partial<InsurancePolicy>) => void; products: InsuranceProduct[]
}) {
  const [form, setForm] = useState({ patient_id: '', product_id: '', scheme: 'ayushman_bharat', holder_name: '', coverage_amount: '', premium_amount: '', start_date: '' })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Policies" value={policies.length} />
        <Stat label="Active" value={summary?.by_status?.active || 0} />
        <Stat label="Total Coverage" value={formatINR(summary?.total_coverage || 0)} />
        <Stat label="Premium Collected" value={formatINR(summary?.total_premium || 0)} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
            <option value="">All Schemes</option>
            <option value="ayushman_bharat">Ayushman Bharat</option>
            <option value="cghs">CGHS</option>
            <option value="echs">ECHS</option>
            <option value="private">Private</option>
          </select>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      {showForm && (
        <Card>
          <h3 className="font-medium text-text dark:text-text-dark mb-3">Create New Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Patient ID (e.g. pat-001)" value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.product_name} ({p.product_code})</option>)}
            </select>
            <input placeholder="Holder Name" value={form.holder_name} onChange={e => setForm({ ...form, holder_name: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <select value={form.scheme} onChange={e => setForm({ ...form, scheme: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="ayushman_bharat">Ayushman Bharat</option>
              <option value="cghs">CGHS</option>
              <option value="echs">ECHS</option>
              <option value="private">Private</option>
            </select>
            <input type="number" placeholder="Coverage Amount" value={form.coverage_amount} onChange={e => setForm({ ...form, coverage_amount: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input type="date" placeholder="Start Date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { if (form.patient_id && form.product_id && form.holder_name) onCreatePolicy({ patient_id: form.patient_id, product_id: form.product_id, scheme: form.scheme, holder_name: form.holder_name, coverage_amount: Number(form.coverage_amount) || 500000, start_date: form.start_date || new Date().toISOString().slice(0, 10) } as any) }} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark">Create Policy</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted hover:text-text border border-border rounded-lg">Cancel</button>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 text-muted font-medium">Policy #</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Holder</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Scheme</th>
                <th className="text-right py-2 px-3 text-muted font-medium">Coverage</th>
                <th className="text-right py-2 px-3 text-muted font-medium">Premium</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Period</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Status</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-3 font-mono text-xs">{p.policy_number}</td>
                  <td className="py-2 px-3">
                    <p className="font-medium text-text dark:text-text-dark">{p.holder_name}</p>
                    {p.patient_name && <p className="text-xs text-muted">Patient: {p.patient_name}</p>}
                  </td>
                  <td className="py-2 px-3"><Badge variant={SCHEME_BADGE[p.scheme] || 'neutral'}>{p.scheme.replace('_', ' ')}</Badge></td>
                  <td className="py-2 px-3 text-right font-medium">{formatINR(p.coverage_amount || 0)}</td>
                  <td className="py-2 px-3 text-right text-muted">{p.premium_amount ? formatINR(p.premium_amount) : '—'}</td>
                  <td className="py-2 px-3 text-xs text-muted">{p.start_date}{p.end_date ? ` → ${p.end_date}` : ''}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={p.status === 'active' ? 'success' : p.status === 'expired' ? 'warning' : p.status === 'cancelled' ? 'error' : 'neutral'} dot>{p.status}</Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <select value={p.status} onChange={e => onStatusChange(p.id, e.target.value)} className="px-2 py-1 rounded border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-xs">
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <button
                        onClick={() => { const doc = generatePolicyDocument(p as unknown as Record<string, unknown>); doc.save(`Policy_${p.policy_number}.pdf`); }}
                        title="Download Policy PDF"
                        className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function UnderwritingTab({ requests, summary, filter, setFilter, onDecision, showForm, setShowForm, onCreateUw, products }: {
  requests: UnderwritingRequest[]; summary: any; filter: string; setFilter: (v: string) => void;
  onDecision: (id: string, decision: string, loading?: number, remarks?: string) => void;
  showForm: boolean; setShowForm: (v: boolean) => void; onCreateUw: (d: Partial<UnderwritingRequest>) => void; products: InsuranceProduct[]
}) {
  const [form, setForm] = useState({ patient_id: '', product_id: '', request_type: 'new_policy', patient_name: '', patient_age: '', smoker: false, bmi: '', pre_existing_conditions: '', medical_history: '' })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Requests" value={requests.length} />
        <Stat label="Pending" value={summary?.by_decision?.pending || 0} />
        <Stat label="Approved" value={(summary?.by_decision?.approved || 0) + (summary?.by_decision?.approved_with_loading || 0)} />
        <Stat label="Declined" value={summary?.by_decision?.declined || 0} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
            <option value="">All Decisions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="approved_with_loading">Approved (with loading)</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {showForm && (
        <Card>
          <h3 className="font-medium text-text dark:text-text-dark mb-3">Submit Underwriting Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input placeholder="Patient ID (e.g. pat-001)" value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input placeholder="Patient Name" value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
            </select>
            <select value={form.request_type} onChange={e => setForm({ ...form, request_type: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="new_policy">New Policy</option>
              <option value="renewal">Renewal</option>
              <option value="enhancement">Enhancement</option>
            </select>
            <input type="number" placeholder="Age" value={form.patient_age} onChange={e => setForm({ ...form, patient_age: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input type="number" placeholder="BMI" step="0.1" value={form.bmi} onChange={e => setForm({ ...form, bmi: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <label className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
              <input type="checkbox" checked={form.smoker} onChange={e => setForm({ ...form, smoker: e.target.checked })} /> Smoker
            </label>
            <input placeholder="Pre-existing conditions" value={form.pre_existing_conditions} onChange={e => setForm({ ...form, pre_existing_conditions: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input placeholder="Medical history" value={form.medical_history} onChange={e => setForm({ ...form, medical_history: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { if (form.patient_id && form.product_id) onCreateUw({ patient_id: form.patient_id, product_id: form.product_id, request_type: form.request_type, patient_name: form.patient_name, patient_age: Number(form.patient_age) || undefined, smoker: form.smoker, bmi: Number(form.bmi) || undefined, pre_existing_conditions: form.pre_existing_conditions || undefined, medical_history: form.medical_history || undefined } as any) }} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark">Submit Request</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted hover:text-text border border-border rounded-lg">Cancel</button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {requests.map(r => (
          <Card key={r.id}>
            <div className="flex items-start gap-3">
              <UserCheck className={`w-5 h-5 mt-0.5 shrink-0 ${r.risk_category === 'high_risk' ? 'text-error' : r.risk_category === 'substandard' ? 'text-warning' : 'text-success'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted">{r.id}</span>
                  <Badge variant={RISK_BADGE[r.risk_category] || 'neutral'}>{r.risk_category.replace('_', ' ')}</Badge>
                  <Badge variant={DECISION_BADGE[r.decision] || 'neutral'} dot>{r.decision.replace('_', ' ')}</Badge>
                  <Badge variant="info">{r.request_type.replace('_', ' ')}</Badge>
                </div>
                <h3 className="font-medium text-text dark:text-text-dark mt-1">
                  {r.patient_name || 'Unknown'} {r.patient_age ? `(${r.patient_age}y)` : ''} — {r.product_name || 'Unknown Product'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-muted">
                  {r.risk_score != null && <span>Risk Score: <strong className="text-text dark:text-text-dark">{r.risk_score}</strong></span>}
                  {r.bmi != null && <span>BMI: <strong className="text-text dark:text-text-dark">{r.bmi}</strong></span>}
                  <span>Smoker: <strong className="text-text dark:text-text-dark">{r.smoker ? 'Yes' : 'No'}</strong></span>
                  {r.premium_loading > 0 && <span>Loading: <strong className="text-warning">{r.premium_loading}%</strong></span>}
                </div>
                {r.pre_existing_conditions && <p className="text-xs text-warning mt-1">Pre-existing: {r.pre_existing_conditions}</p>}
                {r.medical_history && <p className="text-xs text-muted mt-1">{r.medical_history}</p>}
                {r.remarks && <div className="mt-2 p-2 rounded-lg bg-primary/5 text-sm text-primary">{r.remarks}</div>}
              </div>
              {r.decision === 'pending' && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => onDecision(r.id, 'approved', 0, 'Standard approval')} className="px-3 py-1 text-xs bg-success text-white rounded hover:opacity-90 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => onDecision(r.id, 'approved_with_loading', 20, 'Approved with 20% loading')} className="px-3 py-1 text-xs bg-warning text-white rounded hover:opacity-90 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +Loading
                  </button>
                  <button onClick={() => onDecision(r.id, 'declined', 0, 'Risk too high')} className="px-3 py-1 text-xs bg-error text-white rounded hover:opacity-90 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Decline
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {requests.length === 0 && <Card><p className="text-center text-muted py-8">No underwriting requests found</p></Card>}
      </div>
    </div>
  )
}

function EndorsementsTab({ endorsements, onAction, showForm, setShowForm, onCreateEndorsement, policies }: {
  endorsements: PolicyEndorsement[]; onAction: (id: string, status: string) => void;
  showForm: boolean; setShowForm: (v: boolean) => void; onCreateEndorsement: (d: Partial<PolicyEndorsement>) => void; policies: InsurancePolicy[]
}) {
  const [form, setForm] = useState({ policy_id: '', endorsement_type: 'address_change', description: '', old_value: '', new_value: '', effective_date: '', premium_impact: '' })
  const pending = endorsements.filter(e => e.status === 'pending' || e.status === 'under_review')
  const processed = endorsements.filter(e => e.status === 'approved' || e.status === 'rejected')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Endorsements" value={endorsements.length} />
        <Stat label="Pending" value={pending.length} />
        <Stat label="Approved" value={endorsements.filter(e => e.status === 'approved').length} />
        <Stat label="Premium Impact" value={formatINR(endorsements.reduce((a, e) => a + (e.premium_impact || 0), 0))} />
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Endorsement
        </button>
      </div>

      {showForm && (
        <Card>
          <h3 className="font-medium text-text dark:text-text-dark mb-3">Submit Endorsement Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.policy_id} onChange={e => setForm({ ...form, policy_id: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="">Select Policy</option>
              {policies.map(p => <option key={p.id} value={p.id}>{p.policy_number} — {p.holder_name}</option>)}
            </select>
            <select value={form.endorsement_type} onChange={e => setForm({ ...form, endorsement_type: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm">
              <option value="address_change">Address Change</option>
              <option value="nominee_change">Nominee Change</option>
              <option value="coverage_enhancement">Coverage Enhancement</option>
              <option value="coverage_reduction">Coverage Reduction</option>
              <option value="rider_addition">Rider Addition</option>
              <option value="name_correction">Name Correction</option>
            </select>
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input placeholder="Old Value" value={form.old_value} onChange={e => setForm({ ...form, old_value: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input placeholder="New Value" value={form.new_value} onChange={e => setForm({ ...form, new_value: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input type="date" placeholder="Effective Date" value={form.effective_date} onChange={e => setForm({ ...form, effective_date: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
            <input type="number" placeholder="Premium Impact (±)" value={form.premium_impact} onChange={e => setForm({ ...form, premium_impact: e.target.value })} className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-slate-900 text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { if (form.policy_id && form.description) onCreateEndorsement({ policy_id: form.policy_id, endorsement_type: form.endorsement_type, description: form.description, old_value: form.old_value || undefined, new_value: form.new_value || undefined, effective_date: form.effective_date || new Date().toISOString().slice(0, 10), premium_impact: Number(form.premium_impact) || 0 } as any) }} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark">Submit</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted hover:text-text border border-border rounded-lg">Cancel</button>
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" /> Pending Approval ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map(e => (
              <Card key={e.id}>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="warning" dot>{e.endorsement_type.replace('_', ' ')}</Badge>
                      <span className="text-xs font-mono text-muted">{e.policy_number}</span>
                      <span className="text-xs text-muted">{e.holder_name}</span>
                    </div>
                    <p className="font-medium text-text dark:text-text-dark mt-1">{e.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted">
                      {e.old_value && <span>From: {e.old_value}</span>}
                      {e.new_value && <span>To: {e.new_value}</span>}
                      <span>Effective: {e.effective_date}</span>
                      {e.premium_impact !== 0 && (
                        <span className={e.premium_impact > 0 ? 'text-error' : 'text-success'}>
                          Premium: {e.premium_impact > 0 ? '+' : ''}{formatINR(e.premium_impact)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => onAction(e.id, 'approved')} className="px-3 py-1.5 text-xs bg-success text-white rounded hover:opacity-90">Approve</button>
                    <button onClick={() => onAction(e.id, 'rejected')} className="px-3 py-1.5 text-xs bg-error text-white rounded hover:opacity-90">Reject</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <h3 className="text-sm font-semibold text-text dark:text-text-dark flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-success" /> Processed Endorsements
      </h3>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 text-muted font-medium">Policy</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Type</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Description</th>
                <th className="text-right py-2 px-3 text-muted font-medium">Premium Impact</th>
                <th className="text-center py-2 px-3 text-muted font-medium">Status</th>
                <th className="text-left py-2 px-3 text-muted font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {processed.map(e => (
                <tr key={e.id} className="border-b border-border/50 dark:border-border-dark/50">
                  <td className="py-2 px-3 text-xs font-mono text-muted">{e.policy_number}</td>
                  <td className="py-2 px-3"><Badge variant="info">{e.endorsement_type.replace('_', ' ')}</Badge></td>
                  <td className="py-2 px-3 text-text dark:text-text-dark">{e.description}</td>
                  <td className="py-2 px-3 text-right">
                    {e.premium_impact !== 0 ? (
                      <span className={e.premium_impact > 0 ? 'text-error' : 'text-success'}>{e.premium_impact > 0 ? '+' : ''}{formatINR(e.premium_impact)}</span>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center"><Badge variant={e.status === 'approved' ? 'success' : 'error'} dot>{e.status}</Badge></td>
                  <td className="py-2 px-3 text-xs text-muted">{e.effective_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
