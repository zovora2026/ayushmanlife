import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  MessageSquareHeart, FileCheck, TrendingUp, Users, Headphones, Building2,
  GraduationCap, Database, Shield, ArrowRight, CheckCircle,
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
        </div>
      </div>
      <Footer />
    </div>
  )
}
