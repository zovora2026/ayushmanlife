import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  Layers, Cloud, Shield, Cpu, Database, Globe, Zap, ArrowRight,
  CheckCircle, Server, Lock, RefreshCw, Settings, BarChart3,
  Monitor, TrendingUp, Users, FileText, Activity, Workflow, Star,
  Rocket, GitBranch, Box, Gauge,
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

export default function Platform() {
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
