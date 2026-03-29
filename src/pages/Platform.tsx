import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  Layers, Cloud, Shield, Cpu, Database, Globe, Zap, ArrowRight,
  CheckCircle, Server, Lock, RefreshCw,
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
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-semibold hover:bg-gray-100 transition-colors">
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
        </div>
      </div>
      <Footer />
    </div>
  )
}
