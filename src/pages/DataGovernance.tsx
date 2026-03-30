import { Database, Shield, FileText, CheckCircle, AlertTriangle, BarChart3, Lock, Eye, ArrowRight, UserCheck, RefreshCw, Layers, Zap, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'

const qualityScores = [
  { system: 'Hospital Information System', score: 94, records: '2.4M', issues: 12 },
  { system: 'EMR/EHR', score: 89, records: '1.8M', issues: 28 },
  { system: 'Laboratory System', score: 96, records: '850K', issues: 5 },
  { system: 'Billing & Revenue Cycle', score: 91, records: '1.2M', issues: 18 },
  { system: 'Insurance Claims', score: 87, records: '340K', issues: 34 },
  { system: 'Pharmacy Management', score: 93, records: '560K', issues: 9 },
]

const dataClasses = [
  { category: 'Protected Health Info (PHI)', count: '4.2M records', sensitivity: 'Critical', color: 'bg-error' },
  { category: 'Personally Identifiable (PII)', count: '1.8M records', sensitivity: 'High', color: 'bg-warning' },
  { category: 'Financial Data', count: '2.1M records', sensitivity: 'High', color: 'bg-warning' },
  { category: 'Operational Data', count: '8.5M records', sensitivity: 'Medium', color: 'bg-accent' },
  { category: 'Analytics/Aggregated', count: '12M records', sensitivity: 'Low', color: 'bg-success' },
]

const compliance = [
  { framework: 'IRDAI', status: 'Compliant', score: 98, lastAudit: '2026-02-15', icon: Shield },
  { framework: 'NHA / ABDM', status: 'Compliant', score: 95, lastAudit: '2026-03-01', icon: FileText },
  { framework: 'NABH', status: 'In Progress', score: 82, lastAudit: '2026-01-20', icon: CheckCircle },
  { framework: 'HIPAA Alignment', status: 'Compliant', score: 91, lastAudit: '2026-02-28', icon: Lock },
  { framework: 'DPDP Act 2023', status: 'Compliant', score: 88, lastAudit: '2026-03-10', icon: Eye },
]

export default function DataGovernance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-text dark:text-text-dark">Data & Analytics Governance</h1>
        <p className="text-muted text-sm mt-1">Enterprise data quality, classification, and regulatory compliance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Data Quality', value: '91.7%', icon: BarChart3, color: 'text-success' },
          { label: 'Systems Monitored', value: '6', icon: Database, color: 'text-primary' },
          { label: 'Active Issues', value: '106', icon: AlertTriangle, color: 'text-warning' },
          { label: 'Compliance Score', value: '94%', icon: Shield, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
            <s.icon className={cn('w-5 h-5 mb-2', s.color)} />
            <p className="font-display font-bold text-2xl text-text dark:text-text-dark">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark">
        <div className="p-5 border-b border-border dark:border-border-dark">
          <h2 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Data Quality Scorecard
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800">
                {['System', 'Quality Score', 'Records', 'Open Issues', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-muted text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qualityScores.map(s => (
                <tr key={s.system} className="border-b border-border dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-text dark:text-text-dark">{s.system}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', s.score >= 90 ? 'bg-success' : s.score >= 80 ? 'bg-warning' : 'bg-error')} style={{ width: `${s.score}%` }} />
                      </div>
                      <span className={cn('text-sm font-semibold', s.score >= 90 ? 'text-success' : s.score >= 80 ? 'text-warning' : 'text-error')}>{s.score}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{s.records}</td>
                  <td className="px-5 py-3 text-muted">{s.issues}</td>
                  <td className="px-5 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', s.score >= 90 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                      {s.score >= 90 ? 'Healthy' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
          <h2 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Data Classification
          </h2>
          <div className="space-y-3">
            {dataClasses.map(d => (
              <div key={d.category} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className={cn('w-3 h-3 rounded-full', d.color)} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text dark:text-text-dark">{d.category}</p>
                  <p className="text-xs text-muted">{d.count}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                  d.sensitivity === 'Critical' ? 'bg-error/10 text-error' :
                  d.sensitivity === 'High' ? 'bg-warning/10 text-warning' :
                  d.sensitivity === 'Medium' ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
                )}>{d.sensitivity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
          <h2 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Regulatory Compliance
          </h2>
          <div className="space-y-3">
            {compliance.map(c => (
              <div key={c.framework} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <c.icon className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text dark:text-text-dark">{c.framework}</p>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                      c.status === 'Compliant' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    )}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.score}%` }} />
                    </div>
                    <span className="text-xs text-muted">{c.score}%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Last audit: {new Date(c.lastAudit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Lineage */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
        <h2 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" /> Data Lineage
        </h2>
        <p className="text-xs text-muted mb-4">Track how data flows across systems — from source to analytics</p>
        <div className="space-y-3">
          {[
            { source: 'HIS / EMR', transforms: ['PHI Anonymization', 'Data Validation'], destination: 'Analytics Warehouse', records: '2.4M/day', status: 'Active' },
            { source: 'Claims Engine', transforms: ['Deduplication', 'FHIR Mapping'], destination: 'Payer Gateway', records: '847/day', status: 'Active' },
            { source: 'Lab Systems', transforms: ['HL7 Parsing', 'Quality Check'], destination: 'Patient Records', records: '1.2K/day', status: 'Active' },
            { source: 'Wearable APIs', transforms: ['Normalization', 'Threshold Alert'], destination: 'V-Care Dashboard', records: '12K/day', status: 'Active' },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-xs overflow-x-auto">
              <span className="shrink-0 px-2 py-1 rounded bg-primary/10 text-primary font-medium">{l.source}</span>
              <ArrowRight className="w-3 h-3 text-muted shrink-0" />
              <div className="flex gap-1 shrink-0">
                {l.transforms.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">{t}</span>
                ))}
              </div>
              <ArrowRight className="w-3 h-3 text-muted shrink-0" />
              <span className="shrink-0 px-2 py-1 rounded bg-success/10 text-success font-medium">{l.destination}</span>
              <span className="ml-auto shrink-0 text-muted">{l.records}</span>
              <span className="shrink-0 w-2 h-2 rounded-full bg-success" />
            </div>
          ))}
        </div>
      </div>

      {/* Consent Management */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
        <h2 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" /> Consent Management
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Consents', value: '12,847', color: 'text-primary' },
            { label: 'Active', value: '11,923', color: 'text-success' },
            { label: 'Expired', value: '724', color: 'text-warning' },
            { label: 'Revoked', value: '200', color: 'text-error' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <p className={cn('font-display font-bold text-xl', s.color)}>{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { type: 'Treatment Data Sharing', consent: '98.2%', purpose: 'Clinical care coordination', dpdp: 'Compliant' },
            { type: 'Insurance Claim Processing', consent: '94.7%', purpose: 'Payer claim submission', dpdp: 'Compliant' },
            { type: 'Research & Analytics', consent: '67.3%', purpose: 'De-identified research data', dpdp: 'Compliant' },
            { type: 'Marketing Communications', consent: '42.1%', purpose: 'Health tips & promotions', dpdp: 'Compliant' },
          ].map(c => (
            <div key={c.type} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text dark:text-text-dark">{c.type}</p>
                <p className="text-xs text-muted">{c.purpose}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary">{c.consent}</p>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success">DPDP {c.dpdp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Modernization */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
        <h2 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Data Modernization
        </h2>
        <p className="text-xs text-muted mb-4">Modern data stack powering real-time healthcare analytics and AI</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Records Migrated', value: '8.4M', icon: Database, color: 'text-primary' },
            { label: 'Data Quality Score', value: '96.2%', icon: CheckCircle, color: 'text-success' },
            { label: 'Migration Success', value: '99.8%', icon: TrendingUp, color: 'text-teal-500' },
            { label: 'Downtime Incidents', value: '0', icon: Zap, color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
              <s.icon className={cn('w-5 h-5 mx-auto mb-1', s.color)} />
              <p className={cn('font-display font-bold text-xl', s.color)}>{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 text-xs overflow-x-auto">
          <div className="flex flex-col gap-1 shrink-0">
            {['HIS/EMR', 'Lab Systems', 'Claims Engine', 'Wearables'].map(s => (
              <span key={s} className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">{s}</span>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
          <div className="flex flex-col gap-1 shrink-0">
            <span className="px-2 py-1 rounded bg-violet-500/10 text-violet-600 font-medium">ETL/ELT Pipeline</span>
            <span className="px-2 py-1 rounded bg-violet-500/10 text-violet-600 font-medium">FHIR Transformation</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
          <div className="shrink-0">
            <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-600 font-medium">Healthcare Data Lake</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
          <div className="flex flex-col gap-1 shrink-0">
            {['BI Dashboards', 'AI/ML Models', 'Risk Analytics', 'Payer Gateway'].map(d => (
              <span key={d} className="px-2 py-1 rounded bg-success/10 text-success font-medium">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Analytics Engine */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-5">
        <h2 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Analytics Engine Status
        </h2>
        <div className="space-y-3">
          {[
            { pipeline: 'Patient Risk Scoring', latency: '< 200ms', throughput: '12K events/min', status: 'Active', accuracy: '94.2%' },
            { pipeline: 'Claims Fraud Detection', latency: '< 500ms', throughput: '5K claims/hr', status: 'Active', accuracy: '97.1%' },
            { pipeline: 'Churn Prediction', latency: '< 1s', throughput: '2K patients/hr', status: 'Active', accuracy: '89.6%' },
            { pipeline: 'Revenue Forecasting', latency: '< 2s', throughput: 'Batch (daily)', status: 'Active', accuracy: '91.3%' },
            { pipeline: 'Operational Efficiency', latency: '< 300ms', throughput: '8K events/min', status: 'Active', accuracy: '96.8%' },
          ].map(p => (
            <div key={p.pipeline} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text dark:text-text-dark">{p.pipeline}</p>
                <div className="flex gap-4 text-xs text-muted mt-0.5">
                  <span>Latency: {p.latency}</span>
                  <span>Throughput: {p.throughput}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary">{p.accuracy}</p>
                <p className="text-[10px] text-muted">accuracy</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
