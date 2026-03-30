import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  MessageSquareHeart, FileCheck, TrendingUp, Users, Headphones, Building2,
  GraduationCap, Database, Shield, ArrowRight, CheckCircle,
  Server, Lock, Fingerprint, Cloud, Boxes, Settings,
  Activity, Layers, RefreshCw, BarChart3, Zap, Monitor,
} from 'lucide-react'

const solutions = [
  {
    icon: MessageSquareHeart,
    title: 'V-Care AI Health Assistant',
    description: '24/7 AI-powered virtual health assistant handling patient queries, appointment booking, symptom assessment, medication reminders, and care coordination.',
    features: ['Natural language patient interaction', 'Smart symptom triage & escalation', 'Automated appointment scheduling', 'Medication adherence tracking', 'Multilingual support (Hindi, English)'],
    color: 'from-primary to-teal-400',
    link: '/vcare',
  },
  {
    icon: FileCheck,
    title: 'SmartClaims Automation',
    description: 'End-to-end AI-driven insurance claims processing — from document extraction to FHIR R4 bundle generation, reducing processing from days to minutes.',
    features: ['Automatic ICD-10/CPT coding', 'FHIR R4 compliance', 'Pre-authorization prediction', 'Multi-payer formatting', 'Rejection analysis & resubmission'],
    color: 'from-accent to-blue-400',
    link: '/claims',
  },
  {
    icon: Building2,
    title: 'Payer & Insurance Platform',
    description: 'Complete technology stack for insurance companies, TPAs, and government payers — policy management, claims adjudication, and AI fraud detection.',
    features: ['Policy lifecycle management', 'AI claims adjudication', 'TPA management portal', 'Fraud detection engine', 'Regulatory compliance (IRDAI)'],
    color: 'from-secondary to-orange-400',
    link: '/payer',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics Engine',
    description: 'Hospital intelligence powered by AI — patient risk stratification, churn prediction, revenue analytics, and operational optimization.',
    features: ['Patient churn prediction', 'Risk stratification scoring', 'Revenue forecasting', 'Operational bottleneck detection', 'NPS & satisfaction tracking'],
    color: 'from-success to-emerald-400',
    link: '/analytics',
  },
  {
    icon: Users,
    title: 'Workforce Intelligence',
    description: 'Healthcare workforce management with AI-optimized scheduling, skill matrix tracking, credential monitoring, and deployment planning.',
    features: ['AI-optimized shift scheduling', 'Skill matrix & gap analysis', 'Credential tracking & alerts', 'Staff utilization analytics', 'Deployment planning'],
    color: 'from-purple-500 to-purple-400',
    link: '/workforce',
  },
  {
    icon: Headphones,
    title: 'Managed Services Portal',
    description: 'SLA-backed IT service management for healthcare — ticket management, AI triage, knowledge base, and 24x7 support operations.',
    features: ['AI-powered ticket triage', 'SLA monitoring & alerts', 'Knowledge base search', 'Incident management', 'Performance analytics'],
    color: 'from-cyan-500 to-cyan-400',
    link: '/services',
  },
  {
    icon: GraduationCap,
    title: 'CareerPath Academy',
    description: 'Healthcare IT workforce development platform — structured learning paths, certifications, apprenticeship programs, and placement tracking.',
    features: ['10+ learning paths', 'Certification management', 'Apprenticeship cohorts', 'AI skill assessment', 'Placement tracking'],
    color: 'from-pink-500 to-pink-400',
    link: '/academy',
  },
  {
    icon: Database,
    title: 'Data & Analytics Governance',
    description: 'Enterprise data quality management, PHI/PII classification, regulatory reporting, and analytics governance for healthcare organizations.',
    features: ['Data quality scorecards', 'PHI/PII classification', 'Regulatory reporting (IRDAI, NHA)', 'Consent management', 'Data lineage tracking'],
    color: 'from-indigo-500 to-indigo-400',
    link: '/data-governance',
  },
  {
    icon: Server,
    title: 'EMR/EHR Advisory & Implementation',
    description: 'End-to-end EMR implementation, optimization, and migration services for Epic, Oracle Health, and Meditech environments — from assessment to go-live and beyond.',
    features: ['Epic, Oracle Health & Meditech certified consultants', 'Clinical workflow redesign & optimization', 'Data migration & interface development', 'Go-live command center & 24x7 support', 'Post-live optimization & Epic Refuel equivalent'],
    color: 'from-rose-500 to-rose-400',
    link: '/solutions',
  },
  {
    icon: Boxes,
    title: 'ERP & Enterprise Services',
    description: 'Healthcare ERP modernization — Workday, SAP, and PeopleSoft implementation, optimization, and managed services for hospital finance, HR, and supply chain.',
    features: ['Workday HCM & Finance implementation', 'SAP S/4HANA healthcare modules', 'Supply chain & procurement automation', 'Revenue cycle management integration', 'HR & payroll system modernization'],
    color: 'from-amber-500 to-amber-400',
    link: '/solutions',
  },
  {
    icon: Settings,
    title: 'ServiceNow Healthcare Workflows',
    description: 'Purpose-built ServiceNow modules for healthcare IT service management, clinical device management, and provider lifecycle workflows.',
    features: ['IT Service Management (ITSM) for hospitals', 'Clinical device & asset management', 'Provider credentialing workflows', 'Change & release management', 'CMDB for healthcare infrastructure'],
    color: 'from-emerald-500 to-emerald-400',
    link: '/services',
  },
  {
    icon: Cloud,
    title: 'Cloud & Infrastructure Services',
    description: 'AWS and Azure cloud migration, optimization, and managed services for healthcare organizations — HIPAA-compliant architecture with India data residency.',
    features: ['AWS & Azure cloud migration', 'HIPAA/DPDP-compliant architecture', 'India data residency compliance', 'Cost optimization & FinOps', 'Disaster recovery & business continuity'],
    color: 'from-sky-500 to-sky-400',
    link: '/platform',
  },
  {
    icon: Lock,
    title: 'Cybersecurity & Compliance',
    description: 'Healthcare-specific cybersecurity operations — SOC monitoring, vulnerability management, incident response, and regulatory compliance for DPDP, HIPAA, and CERT-In.',
    features: ['24x7 SOC monitoring & threat detection', 'Vulnerability assessment & pen testing', 'DPDP Act & HIPAA compliance audits', 'Incident response & forensics', 'Security awareness training for staff'],
    color: 'from-red-500 to-red-400',
    link: '/data-governance',
  },
  {
    icon: Fingerprint,
    title: 'Digital Identity & Verification',
    description: 'CLEAR-equivalent healthcare identity verification — Aadhaar-based eKYC, biometric authentication, ABHA ID integration, and role-based access management.',
    features: ['Aadhaar eKYC & biometric verification', 'ABHA (Ayushman Bharat Health Account) integration', 'Multi-factor authentication for clinical access', 'Role-based access control (RBAC)', 'Patient identity matching & deduplication'],
    color: 'from-violet-500 to-violet-400',
    link: '/admin',
  },
]

export default function Solutions() {
  return (
    <div>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-text dark:text-text-dark mb-4">
              Solutions for Every Healthcare Challenge
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              From patient engagement to insurance operations, our AI-native platform covers the full spectrum of healthcare IT.
            </p>
          </div>

          <div className="space-y-8">
            {solutions.map((s, i) => (
              <div key={s.title} className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center p-8 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark`}>
                <div className="md:w-1/3 flex justify-center">
                  <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                    <s.icon className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark mb-3">{s.title}</h2>
                  <p className="text-muted mb-4">{s.description}</p>
                  <div className="grid sm:grid-cols-2 gap-2 mb-4">
                    {s.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted">
                        <CheckCircle className="w-4 h-4 text-success shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <Link to={s.link} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Explore {s.title.split(' ')[0]} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* EMR/EHR Advisory & Implementation Deep-Dive */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-sm font-medium mb-4">
                <Server className="w-4 h-4" /> Deep Dive
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-3">
                EMR/EHR Advisory & Implementation
              </h2>
              <p className="text-muted max-w-2xl mx-auto">
                End-to-end EMR advisory services from system selection through optimization, delivered by certified consultants with deep clinical workflow expertise.
              </p>
            </div>

            {/* Implementation Methodology */}
            <div className="mb-16">
              <h3 className="font-display font-semibold text-xl text-text dark:text-text-dark text-center mb-8">
                Implementation Methodology
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    phase: 'Phase 1',
                    title: 'Assessment',
                    timeline: '4-6 Weeks',
                    icon: BarChart3,
                    color: 'from-rose-500 to-rose-400',
                    tasks: ['Current-state workflow analysis', 'Gap assessment & readiness scoring', 'Vendor evaluation & selection advisory', 'ROI & TCO modeling'],
                  },
                  {
                    phase: 'Phase 2',
                    title: 'Design',
                    timeline: '8-12 Weeks',
                    icon: Layers,
                    color: 'from-amber-500 to-amber-400',
                    tasks: ['Clinical workflow redesign', 'System configuration blueprint', 'Integration architecture (ABDM, FHIR)', 'Data migration strategy'],
                  },
                  {
                    phase: 'Phase 3',
                    title: 'Build',
                    timeline: '12-20 Weeks',
                    icon: Settings,
                    color: 'from-blue-500 to-blue-400',
                    tasks: ['Environment build & configuration', 'Interface development & testing', 'Data migration & validation', 'End-user training programs'],
                  },
                  {
                    phase: 'Phase 4',
                    title: 'Go-Live',
                    timeline: '4-6 Weeks',
                    icon: Zap,
                    color: 'from-emerald-500 to-emerald-400',
                    tasks: ['Command center activation (24x7)', 'Parallel run & cutover execution', 'At-the-elbow support', 'Post-live stabilization & optimization'],
                  },
                ].map(p => (
                  <div key={p.phase} className="relative p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-md`}>
                      <p.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">{p.phase}</span>
                    <h4 className="font-display font-bold text-lg text-text dark:text-text-dark mt-1 mb-1">{p.title}</h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-xs font-medium text-muted mb-3">
                      {p.timeline}
                    </span>
                    <ul className="space-y-2">
                      {p.tasks.map(t => (
                        <li key={t} className="flex items-start gap-2 text-sm text-muted">
                          <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted mt-4">
                Typical end-to-end timeline: <span className="font-semibold text-text dark:text-text-dark">28-44 weeks</span> depending on organization size and system complexity.
              </p>
            </div>

            {/* Supported EMR Systems */}
            <div className="mb-16">
              <h3 className="font-display font-semibold text-xl text-text dark:text-text-dark text-center mb-8">
                Supported EMR Systems
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Epic',
                    status: 'Certified Partner',
                    statusColor: 'bg-success/10 text-success',
                    capabilities: ['MyChart patient portal', 'Ambulatory & inpatient modules', 'Epic Refuel optimization', 'Interoperability hub (Care Everywhere)'],
                  },
                  {
                    name: 'Oracle Health (Cerner)',
                    status: 'Implementation Partner',
                    statusColor: 'bg-primary/10 text-primary',
                    capabilities: ['Millennium platform', 'Revenue cycle integration', 'PowerChart clinical workflows', 'HealtheIntent population health'],
                  },
                  {
                    name: 'Meditech',
                    status: 'Advisory Partner',
                    statusColor: 'bg-amber-500/10 text-amber-600',
                    capabilities: ['Expanse platform migration', 'Acute & ambulatory workflows', '6.x to Expanse upgrades', 'MEDITECH-as-a-Service advisory'],
                  },
                  {
                    name: 'ABDM-Native EMR',
                    status: 'Built In-House',
                    statusColor: 'bg-violet-500/10 text-violet-600',
                    capabilities: ['ABHA ID native integration', 'ABDM Health Information Exchange', 'UHI-compliant discovery', 'India regulatory compliance (NHA)'],
                  },
                ].map(sys => (
                  <div key={sys.name} className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                    <div className="flex items-center justify-between mb-4">
                      <Monitor className="w-8 h-8 text-rose-500" />
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sys.statusColor}`}>
                        {sys.status}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-text dark:text-text-dark mb-3">{sys.name}</h4>
                    <ul className="space-y-2">
                      {sys.capabilities.map(c => (
                        <li key={c} className="flex items-start gap-2 text-sm text-muted">
                          <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory Outcomes Metrics */}
            <div className="mb-16 p-8 rounded-2xl gradient-primary text-white">
              <h3 className="font-display font-bold text-2xl text-center mb-8">Advisory Outcomes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '45+', label: 'Implementations Completed', icon: CheckCircle },
                  { value: '32 Wks', label: 'Avg Go-Live Time', icon: Activity },
                  { value: '96%', label: 'User Adoption Rate', icon: Users },
                  { value: '28%', label: 'Avg Cost Savings vs. Big 4', icon: TrendingUp },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <m.icon className="w-8 h-8 mx-auto mb-2 text-white/80" />
                    <p className="font-display font-bold text-3xl">{m.value}</p>
                    <p className="text-sm text-white/70 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Modernization */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-medium mb-4">
                <Database className="w-4 h-4" /> Data Modernization
              </div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-3">
                Healthcare Data Modernization
              </h2>
              <p className="text-muted max-w-2xl mx-auto">
                Migrate, transform, and modernize healthcare data estates with zero downtime, full lineage tracking, and ABDM-compliant data governance.
              </p>
            </div>

            {/* Migration Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { value: '120M+', label: 'Records Migrated', icon: Database, color: 'from-indigo-500 to-indigo-400' },
                { value: '99.7%', label: 'Data Quality Score', icon: Shield, color: 'from-emerald-500 to-emerald-400' },
                { value: '99.99%', label: 'Migration Success Rate', icon: RefreshCw, color: 'from-blue-500 to-blue-400' },
                { value: 'Zero', label: 'Downtime Migrations', icon: Zap, color: 'from-amber-500 to-amber-400' },
              ].map(stat => (
                <div key={stat.label} className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-center">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark">{stat.value}</p>
                  <p className="text-sm text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Modern Data Stack Visualization */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
              <h3 className="font-display font-semibold text-xl text-text dark:text-text-dark text-center mb-8">
                Modern Healthcare Data Stack
              </h3>
              {/* Pipeline flow: cards with arrows between them */}
              <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-0">
                {[
                  {
                    stage: 'Source Systems',
                    color: 'bg-rose-500/10 border-rose-500/20',
                    iconColor: 'text-rose-500',
                    icon: Server,
                    items: ['Epic / Cerner / Meditech', 'Lab & Radiology (DICOM)', 'Claims & Billing', 'ABDM Health Records'],
                  },
                  {
                    stage: 'ETL / ELT',
                    color: 'bg-amber-500/10 border-amber-500/20',
                    iconColor: 'text-amber-500',
                    icon: RefreshCw,
                    items: ['FHIR R4 normalization', 'PHI/PII de-identification', 'Real-time CDC pipelines', 'Data quality validation'],
                  },
                  {
                    stage: 'Data Lake / Warehouse',
                    color: 'bg-blue-500/10 border-blue-500/20',
                    iconColor: 'text-blue-500',
                    icon: Database,
                    items: ['Cloud data lake (AWS/Azure)', 'OMOP CDM standardization', 'Consent-aware access layer', 'Data catalog & lineage'],
                  },
                  {
                    stage: 'Analytics & BI',
                    color: 'bg-emerald-500/10 border-emerald-500/20',
                    iconColor: 'text-emerald-500',
                    icon: BarChart3,
                    items: ['Operational dashboards', 'Clinical outcome analytics', 'AI/ML feature store', 'Regulatory reporting (NHA, IRDAI)'],
                  },
                ].map((s, idx, arr) => (
                  <div key={s.stage} className="flex flex-col md:flex-row items-center flex-1">
                    <div className={`w-full p-5 rounded-xl border ${s.color} flex flex-col items-center text-center`}>
                      <s.icon className={`w-8 h-8 ${s.iconColor} mb-3`} />
                      <h4 className="font-display font-semibold text-sm text-text dark:text-text-dark mb-3">{s.stage}</h4>
                      <ul className="space-y-1.5 w-full">
                        {s.items.map(item => (
                          <li key={item} className="text-xs text-muted">{item}</li>
                        ))}
                      </ul>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="shrink-0 flex items-center justify-center md:px-2 py-2 md:py-0">
                        <ArrowRight className="w-5 h-5 text-muted/50 hidden md:block" />
                        <ArrowRight className="w-5 h-5 text-muted/50 rotate-90 md:hidden" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition-shadow">
                Schedule EMR Advisory Consultation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
