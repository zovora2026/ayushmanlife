import {
  MessageSquareHeart, FileCheck, Building2, TrendingUp, Users,
  GraduationCap, Headphones, Workflow, Shield, Database,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const features = [
  {
    icon: MessageSquareHeart,
    title: 'V-Care AI Assistant',
    description: '24/7 AI-powered virtual health assistant for patient queries, appointment booking, symptom assessment, and medication management.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: FileCheck,
    title: 'SmartClaims Automation',
    description: 'AI-driven claims processing with auto ICD-10/CPT coding, FHIR R4 compliance, and payer-specific formatting for Ayushman Bharat, CGHS & more.',
    color: 'text-accent bg-accent/10',
  },
  {
    icon: Building2,
    title: 'Payer & Insurance Platform',
    description: 'Complete payer technology stack — policy management, claims adjudication, TPA operations, and AI fraud detection for Indian insurers.',
    color: 'text-secondary bg-secondary/10',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description: 'Patient risk stratification, churn prediction, revenue forecasting, and operational intelligence powered by machine learning.',
    color: 'text-success bg-success/10',
  },
  {
    icon: Users,
    title: 'Workforce Intelligence',
    description: 'Talent management, skill matrix tracking, AI-optimized scheduling, credential monitoring, and deployment planning.',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: GraduationCap,
    title: 'CareerPath Academy',
    description: 'Healthcare IT apprenticeship and training platform with structured learning paths, certifications, and placement tracking.',
    color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
  },
  {
    icon: Headphones,
    title: 'Managed Services',
    description: 'SLA-backed IT service management with AI-powered ticket triage, knowledge base, and 24x7 support operations.',
    color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    icon: Workflow,
    title: 'ServiceNow Healthcare',
    description: 'Enterprise workflow automation purpose-built for healthcare — incident management, change requests, and ITIL compliance.',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    description: 'HIPAA-aligned, ABDM-integrated, IRDAI-compliant security framework with continuous monitoring and audit trails.',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  },
  {
    icon: Database,
    title: 'Data & Analytics Governance',
    description: 'Enterprise data quality management, PHI/PII classification, regulatory reporting, and self-service analytics governance.',
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  },
]

export default function Features() {
  return (
    <section className="py-24 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text dark:text-text-dark mb-4">
            One Platform. Complete Healthcare Transformation.
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Everything you need to run a modern healthcare enterprise — from AI-powered patient care to insurance operations and workforce management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                'group p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark',
                'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', feature.color)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
              <p className="mt-3 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
