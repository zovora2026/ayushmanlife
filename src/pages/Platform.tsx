import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Layers, Cloud, Shield, Cpu, Database, Globe, Zap, ArrowRight,
  CheckCircle, Server, Lock, RefreshCw, Settings, BarChart3,
  Monitor, TrendingUp, Users, FileText, Activity, Workflow, Star,
  Rocket, GitBranch, Box, Gauge, Award, BadgeCheck, Heart, Clock,
} from 'lucide-react'

const architecture = [
  { icon: Layers, title: 'AI-Native Core', description: 'Claude-powered intelligence embedded in every workflow — not bolted on as an afterthought.' },
  { icon: Cloud, title: 'Cloud-First', description: 'Deployed on Cloudflare edge network for sub-100ms response times across India.' },
  { icon: Shield, title: 'Security-First', description: 'HIPAA-aligned encryption, ABDM-compliant data handling, SOC 2 controls built in.' },
  { icon: Database, title: 'FHIR R4 Native', description: 'HL7 FHIR R4 as the core data model — seamless interoperability with any health system.' },
  { icon: Globe, title: 'India-Optimized', description: 'Ayushman Bharat, CGHS, ECHS, ABDM integrations pre-built and ready to deploy.' },
  { icon: Zap, title: 'Real-Time', description: 'WebSocket-powered real-time updates for claims tracking, chat, and operational dashboards.' },
]

const techStack = [
  { category: 'Frontend', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Framer Motion'] },
  { category: 'Backend', items: ['Cloudflare Workers', 'Edge Functions', 'FHIR R4 APIs', 'WebSocket'] },
  { category: 'AI/ML', items: ['Anthropic Claude', 'Custom NLP Models', 'Risk Prediction ML', 'Fraud Detection AI'] },
  { category: 'Infrastructure', items: ['Cloudflare Pages', 'AWS/Azure Ready', 'CDN Edge Delivery', 'Auto-Scaling'] },
  { category: 'Security', items: ['AES-256 Encryption', 'RBAC', 'Audit Logging', 'ABDM Consent Manager'] },
  { category: 'Standards', items: ['FHIR R4', 'HL7 v2', 'ICD-10', 'CPT', 'SNOMED CT', 'DICOM'] },
]

const capabilities = [
  'Process 50,000+ claims per month with 87% first-pass approval',
  'Handle 10,000+ concurrent patient interactions via V-Care',
  'Real-time analytics across 30+ operational metrics',
  'Automated ICD-10/CPT coding with 94% accuracy',
  'Fraud detection covering 100% of claim submissions',
  'Sub-3-minute claim processing end-to-end',
  '99.9% platform availability with edge deployment',
  'ABDM integration in under 2 weeks for any hospital',
]

const migrationSystems = [
  { name: 'EMR/EHR System', progress: 100, status: 'Complete' },
  { name: 'Claims Processing', progress: 100, status: 'Complete' },
  { name: 'Analytics Platform', progress: 95, status: 'In Progress' },
  { name: 'Patient Portal', progress: 100, status: 'Complete' },
  { name: 'Billing & RCM', progress: 88, status: 'In Progress' },
  { name: 'Lab Information System', progress: 72, status: 'In Progress' },
]

const transformationProjects = [
  { name: 'AI-Powered Discharge Summaries', status: 'active', progress: 78 },
  { name: 'Real-Time Bed Management', status: 'active', progress: 65 },
  { name: 'Predictive Readmission Model', status: 'active', progress: 82 },
  { name: 'ABDM Health Locker Integration', status: 'active', progress: 45 },
  { name: 'Voice-to-Clinical-Notes NLP', status: 'active', progress: 55 },
  { name: 'Automated Prior Authorization', status: 'active', progress: 91 },
  { name: 'Patient Risk Stratification v2', status: 'active', progress: 70 },
  { name: 'Smart Scheduling Optimizer', status: 'active', progress: 60 },
  { name: 'Revenue Leakage Detection', status: 'active', progress: 88 },
  { name: 'Clinical Decision Support v3', status: 'active', progress: 50 },
  { name: 'Insurance Eligibility Checker', status: 'active', progress: 95 },
  { name: 'Pharmacy Inventory AI', status: 'active', progress: 40 },
]

const completedThisQuarter = [
  'SmartClaims AI v2.0 Launch',
  'V-Care Multilingual Support',
  'FHIR R4 Gateway Upgrade',
  'Zero-Trust Network Rollout',
]

export default function Platform() {
  const [deployTimestamp] = useState(() => new Date().toISOString())
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [uptimePulse, setUptimePulse] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setUptimePulse(p => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-text dark:text-text-dark mb-4">
              Platform Architecture
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Built from the ground up as an AI-native platform — not a legacy system with AI bolted on.
              Every layer is designed for healthcare intelligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {architecture.map(a => (
              <div key={a.title} className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <a.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">{a.title}</h3>
                <p className="text-sm text-muted">{a.description}</p>
              </div>
            ))}
          </div>

          <div className="mb-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-10">Technology Stack</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map(t => (
                <div key={t.category} className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                  <h3 className="font-display font-semibold text-primary mb-3">{t.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {t.items.map(item => (
                      <span key={item} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-xs text-muted">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20 p-8 rounded-2xl gradient-primary text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display font-bold text-3xl mb-4">Platform Capabilities</h2>
                <p className="text-white/70 mb-6">
                  Designed to handle enterprise-scale healthcare operations with AI-native intelligence.
                </p>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-surface-dark text-primary font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  Request Technical Deep-Dive <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {capabilities.map(c => (
                  <div key={c} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                    <p className="text-sm text-white/90">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark mb-4">Security & Compliance</h2>
            <p className="text-muted mb-10">Enterprise-grade security aligned with global healthcare standards.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: 'HIPAA Aligned' },
                { icon: Globe, label: 'ABDM Integrated' },
                { icon: Shield, label: 'SOC 2 Ready' },
                { icon: RefreshCw, label: 'IRDAI Compliant' },
                { icon: Server, label: 'DPDP Act 2023' },
                { icon: Cpu, label: 'ISO 27001 Ready' },
                { icon: Database, label: 'NABH Compatible' },
                { icon: Shield, label: 'CERT-In Aligned' },
              ].map(b => (
                <div key={b.label} className="p-4 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark flex flex-col items-center gap-2">
                  <b.icon className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium text-text dark:text-text-dark">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Migration Roadmap */}
          <div className="mt-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-4">
              Cloud Migration for Healthcare &amp; Insurance
            </h2>
            <p className="text-muted text-center mb-10 max-w-2xl mx-auto">
              Proven migration methodology for moving healthcare and insurance workloads to AWS, Azure, or hybrid cloud with zero downtime.
            </p>

            {/* Migration phases */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                {
                  step: 1,
                  title: 'Assess',
                  description: 'Evaluate current on-premise infrastructure, application dependencies, PHI data flows, and compliance requirements.',
                  color: 'border-blue-500',
                },
                {
                  step: 2,
                  title: 'Plan',
                  description: 'Design target cloud architecture with HIPAA/DPDP compliance, data residency, DR strategy, and cost optimization.',
                  color: 'border-violet-500',
                },
                {
                  step: 3,
                  title: 'Migrate',
                  description: 'Execute phased migration with zero-downtime cutover, data validation, and parallel run testing.',
                  color: 'border-teal-500',
                },
                {
                  step: 4,
                  title: 'Optimize',
                  description: 'Continuous optimization with FinOps, auto-scaling, monitoring, and managed services.',
                  color: 'border-amber-500',
                },
              ].map(phase => (
                <div
                  key={phase.title}
                  className={`p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark border-t-4 ${phase.color}`}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm mb-3">
                    {phase.step}
                  </span>
                  <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">{phase.title}</h3>
                  <p className="text-sm text-muted">{phase.description}</p>
                </div>
              ))}
            </div>

            {/* Migration stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { value: '40+', label: 'Migrations Completed' },
                { value: '99.9%', label: 'Uptime During Migration' },
                { value: '35%', label: 'Avg Cost Reduction' },
                { value: 'Certified', label: 'India Data Residency' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-center"
                >
                  <p className="font-display font-bold text-2xl text-primary mb-1">{stat.value}</p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Healthcare Cloud Partners */}
            <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark text-center mb-6">
              Healthcare Cloud Partners
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'AWS' },
                { name: 'Azure' },
                { name: 'GCP' },
                { name: 'Oracle Cloud' },
              ].map(partner => (
                <div
                  key={partner.name}
                  className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark flex flex-col items-center gap-2"
                >
                  <Cloud className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-text dark:text-text-dark">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EMR/EHR Optimization */}
          <div className="mt-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-4">
              EMR/EHR Optimization
            </h2>
            <p className="text-muted text-center mb-12 max-w-3xl mx-auto">
              Maximize the value of your EMR/EHR investment with AI-driven optimization — equivalent to
              Epic Refuel and Oracle Health Performance services.
            </p>

            {/* Optimization Dashboard Preview */}
            <div className="mb-12 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
              <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-6 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Optimization Dashboard Preview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* System Utilization */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted">System Utilization</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark mb-1">73%</p>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 mb-1">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '73%' }} />
                  </div>
                  <p className="text-xs text-muted">Target: 90%</p>
                </div>

                {/* Unused Features */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-muted">Unused Features</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark mb-1">127</p>
                  <p className="text-xs text-muted mb-1">identified</p>
                  <span className="text-xs font-medium text-primary cursor-pointer hover:underline">View Report</span>
                </div>

                {/* Workflow Efficiency */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-teal-500" />
                    <span className="text-xs font-medium text-muted">Workflow Efficiency</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-teal-500 mb-1">+28%</p>
                  <p className="text-xs text-muted">improvement</p>
                </div>

                {/* User Satisfaction */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-muted">User Satisfaction</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark mb-1">4.2<span className="text-base text-muted font-normal">/5.0</span></p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(s => (
                      <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                    <Star className="w-3 h-3 text-gray-300 dark:text-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Capabilities Grid */}
            <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark text-center mb-6">
              Optimization Capabilities
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: RefreshCw,
                  title: 'Epic Refuel Equivalent',
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10',
                  bullets: [
                    'Configuration review & realignment',
                    'Workflow optimization & redesign',
                    'Build quality assessment & remediation',
                  ],
                },
                {
                  icon: Database,
                  title: 'Oracle Health Optimization',
                  color: 'text-violet-500',
                  bg: 'bg-violet-500/10',
                  bullets: [
                    'Revenue cycle tuning & automation',
                    'Clinical workflow enhancement',
                    'System configuration health check',
                  ],
                },
                {
                  icon: Workflow,
                  title: 'Meditech Expanse Migration',
                  color: 'text-teal-500',
                  bg: 'bg-teal-500/10',
                  bullets: [
                    'Legacy to Expanse migration planning',
                    'Data migration & validation',
                    'Go-live execution & stabilization',
                  ],
                },
                {
                  icon: Globe,
                  title: 'Interoperability Enhancement',
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10',
                  bullets: [
                    'HL7/FHIR interface optimization',
                    'Data exchange improvements',
                    'Cross-system integration testing',
                  ],
                },
                {
                  icon: BarChart3,
                  title: 'Custom Reports & Dashboards',
                  color: 'text-rose-500',
                  bg: 'bg-rose-500/10',
                  bullets: [
                    'Reporting optimization & cleanup',
                    'KPI dashboard creation',
                    'Executive & clinical analytics',
                  ],
                },
                {
                  icon: Zap,
                  title: 'Performance Tuning',
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-500/10',
                  bullets: [
                    'System performance analysis',
                    'Database optimization & indexing',
                    'Load testing & capacity planning',
                  ],
                },
              ].map(card => (
                <div
                  key={card.title}
                  className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark"
                >
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <h4 className="font-display font-semibold text-text dark:text-text-dark mb-3">{card.title}</h4>
                  <ul className="space-y-2">
                    {card.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Transformation */}
          <div className="mt-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-4">
              Technical Transformation
            </h2>
            <p className="text-muted text-center mb-12 max-w-3xl mx-auto">
              End-to-end digital transformation for healthcare organizations — from legacy modernization to AI-native architecture.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Rocket, value: '18', label: 'Transformations Delivered', color: 'text-violet-500' },
                { icon: GitBranch, value: '94%', label: 'On-Time Delivery', color: 'text-teal-500' },
                { icon: Gauge, value: '3.2x', label: 'Avg Efficiency Gain', color: 'text-blue-500' },
                { icon: TrendingUp, value: '₹120Cr', label: 'Client Value Created', color: 'text-amber-500' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-center">
                  <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark">{s.value}</p>
                  <p className="text-xs text-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active Projects + Technology Modernization Score */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Active Projects Summary */}
              <div className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-text dark:text-text-dark flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-500" /> Active Transformation Projects
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold">12 Active</span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {(showAllProjects ? transformationProjects : transformationProjects.slice(0, 6)).map(proj => (
                    <div key={proj.name} className="flex items-center gap-3">
                      <span className="text-xs text-muted w-36 shrink-0 truncate">{proj.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${proj.progress >= 90 ? 'bg-success' : proj.progress >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${proj.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-text dark:text-text-dark w-8 text-right">{proj.progress}%</span>
                    </div>
                  ))}
                </div>
                {!showAllProjects && transformationProjects.length > 6 && (
                  <button onClick={() => setShowAllProjects(true)} className="mt-3 text-xs text-primary font-medium hover:underline">
                    Show all {transformationProjects.length} projects
                  </button>
                )}
                {showAllProjects && (
                  <button onClick={() => setShowAllProjects(false)} className="mt-3 text-xs text-primary font-medium hover:underline">
                    Show fewer
                  </button>
                )}
                <div className="mt-4 pt-3 border-t border-border dark:border-border-dark">
                  <p className="text-xs text-muted flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    <span><strong className="text-success">4 Completed This Quarter:</strong> {completedThisQuarter.join(', ')}</span>
                  </p>
                </div>
              </div>

              {/* Technology Modernization Score */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-violet-500/20 dark:border-violet-500/30">
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-violet-500" /> Technology Modernization Score
                </h3>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-200 dark:text-slate-700" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#modernGradient)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(87 / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`} />
                      <defs>
                        <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display font-bold text-3xl text-text dark:text-text-dark">87</span>
                      <span className="text-xs text-muted">/100</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Cloud Maturity', score: 92, color: 'bg-success' },
                    { label: 'AI/ML Adoption', score: 85, color: 'bg-blue-500' },
                    { label: 'Security Posture', score: 94, color: 'bg-violet-500' },
                    { label: 'Data Integration', score: 78, color: 'bg-amber-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-muted w-28 shrink-0">{item.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-text dark:text-text-dark w-8 text-right">{item.score}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted text-center mt-4">Overall platform health assessment across 4 dimensions</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Box, title: 'Legacy Modernization', color: 'text-violet-500', bg: 'bg-violet-500/10', desc: 'Migrate monolithic HIS/EMR to microservices architecture with zero data loss and minimal downtime.' },
                { icon: Cpu, title: 'AI Integration', color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Embed AI/ML into clinical workflows — from diagnosis assistance to predictive resource planning.' },
                { icon: Database, title: 'Data Lake & Warehouse', color: 'text-teal-500', bg: 'bg-teal-500/10', desc: 'Unified healthcare data lake with FHIR R4, HL7, and custom connectors for real-time analytics.' },
                { icon: Workflow, title: 'Process Automation', color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'RPA and intelligent automation for billing, scheduling, discharge summaries, and insurance pre-auth.' },
                { icon: Shield, title: 'Zero Trust Architecture', color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Implement zero-trust security model with identity-based access, micro-segmentation, and continuous verification.' },
                { icon: RefreshCw, title: 'DevOps & CI/CD', color: 'text-indigo-500', bg: 'bg-indigo-500/10', desc: 'Automated deployment pipelines with healthcare-specific testing, HIPAA compliance gates, and rollback capability.' },
              ].map(card => (
                <div key={card.title} className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <h4 className="font-display font-semibold text-text dark:text-text-dark mb-2">{card.title}</h4>
                  <p className="text-sm text-muted">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Services Deep Dive */}
          <div className="mt-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-4">
              Cloud Services for Healthcare
            </h2>
            <p className="text-muted text-center mb-12 max-w-3xl mx-auto">
              AWS, Azure, and GCP managed services tailored for healthcare compliance, performance, and cost optimization.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { provider: 'AWS', badge: 'Advanced Partner', services: ['EC2 HIPAA-eligible', 'HealthLake (FHIR)', 'SageMaker Health AI', 'S3 PHI Storage'], color: 'border-t-amber-500' },
                { provider: 'Microsoft Azure', badge: 'Gold Partner', services: ['Azure Health Data Services', 'Azure API for FHIR', 'Power BI Healthcare', 'Azure Sentinel SIEM'], color: 'border-t-blue-500' },
                { provider: 'Google Cloud', badge: 'Technology Partner', services: ['Cloud Healthcare API', 'Vertex AI for Health', 'BigQuery Analytics', 'Anthos Hybrid Cloud'], color: 'border-t-teal-500' },
              ].map(p => (
                <div key={p.provider} className={`p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark border-t-4 ${p.color}`}>
                  <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-1">{p.provider}</h3>
                  <span className="text-xs text-primary font-medium">{p.badge}</span>
                  <ul className="mt-4 space-y-2">
                    {p.services.map(s => (
                      <li key={s} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm text-muted">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-surface-dark border border-border dark:border-border-dark">
              <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" /> Managed Cloud Operations
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '24x7 NOC Monitoring', value: '99.99%', sub: 'Uptime SLA' },
                  { label: 'Incident Response', value: '<15 min', sub: 'MTTD (Avg)' },
                  { label: 'Cost Optimization', value: '35%', sub: 'Avg Savings' },
                  { label: 'Compliance Audits', value: 'Monthly', sub: 'Auto-generated' },
                ].map(s => (
                  <div key={s.label} className="text-center p-3">
                    <p className="font-display font-bold text-xl text-primary">{s.value}</p>
                    <p className="text-sm font-medium text-text dark:text-text-dark mt-1">{s.label}</p>
                    <p className="text-xs text-muted">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-Time Cloud Infrastructure Status */}
            <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Cloud Infrastructure Status
                </h3>
                <span className="flex items-center gap-2 text-xs text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  Last deploy: {new Date(deployTimestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-success ${uptimePulse ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-medium text-muted">Platform Uptime</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-success">99.97%</p>
                  <p className="text-xs text-muted mt-1">All systems operational</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted">Active Regions</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark">3</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['Mumbai', 'Singapore', 'US-East'].map(r => (
                      <span key={r} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-medium text-muted">CDN Edge Nodes</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark">285+</p>
                  <p className="text-xs text-muted mt-1">Global edge network</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-border dark:border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-medium text-muted">Avg Latency</span>
                  </div>
                  <p className="font-display font-bold text-2xl text-text dark:text-text-dark">47ms</p>
                  <p className="text-xs text-muted mt-1">Edge response time (India)</p>
                </div>
              </div>
              <div className="text-xs text-muted text-right">
                Deployment: <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{deployTimestamp}</code>
              </div>
            </div>

            {/* Migration Tracker */}
            <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
              <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark mb-6 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" /> Cloud Migration Tracker
              </h3>
              <div className="space-y-4">
                {migrationSystems.map(sys => (
                  <div key={sys.name} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text dark:text-text-dark w-44 shrink-0">{sys.name}</span>
                    <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${sys.progress === 100 ? 'bg-success' : sys.progress >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${sys.progress}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-12 text-right ${sys.progress === 100 ? 'text-success' : 'text-blue-500'}`}>
                      {sys.progress}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sys.status === 'Complete' ? 'bg-success/10 text-success' : 'bg-blue-500/10 text-blue-500'}`}>
                      {sys.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border dark:border-border-dark flex items-center gap-2 text-sm text-muted">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>4 of 6 systems fully migrated. Overall progress: {Math.round(migrationSystems.reduce((s, m) => s + m.progress, 0) / migrationSystems.length)}%</span>
              </div>
            </div>
          </div>
          {/* Recognition & Awards */}
          <div className="mt-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-4">
              Recognition & Awards
            </h2>
            <p className="text-muted text-center mb-10 max-w-2xl mx-auto">
              Industry recognition for innovation, quality, and impact in healthcare technology.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Award,
                  title: 'Top Rated Healthcare AI Platform 2026',
                  badge: 'Peer-Reviewed',
                  color: 'border-t-amber-500',
                  bg: 'bg-amber-500/10',
                  iconColor: 'text-amber-500',
                },
                {
                  icon: Star,
                  title: 'Best-in-KLAS Equivalent',
                  badge: 'Category Leader',
                  color: 'border-t-violet-500',
                  bg: 'bg-violet-500/10',
                  iconColor: 'text-violet-500',
                },
                {
                  icon: Heart,
                  title: 'NABH Digital Health Accredited',
                  badge: 'Certified',
                  color: 'border-t-teal-500',
                  bg: 'bg-teal-500/10',
                  iconColor: 'text-teal-500',
                },
                {
                  icon: BadgeCheck,
                  title: 'ABDM Compliant',
                  badge: 'Verified',
                  color: 'border-t-blue-500',
                  bg: 'bg-blue-500/10',
                  iconColor: 'text-blue-500',
                },
              ].map(award => (
                <div key={award.title} className={`p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark border-t-4 ${award.color} text-center`}>
                  <div className={`w-14 h-14 rounded-2xl ${award.bg} flex items-center justify-center mx-auto mb-4`}>
                    <award.icon className={`w-7 h-7 ${award.iconColor}`} />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-text dark:text-text-dark mb-2">{award.title}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full ${award.bg} ${award.iconColor} text-xs font-semibold`}>
                    {award.badge}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-muted">
                Ratings based on client satisfaction surveys, platform performance metrics, and independent healthcare IT assessments.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
