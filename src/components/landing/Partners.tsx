import { Cloud, Database, Workflow, Globe, Building, Heart, Server, Shield, Award, Star, CheckCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const partners = [
  { name: 'AWS', icon: Cloud },
  { name: 'Azure', icon: Cloud },
  { name: 'ServiceNow', icon: Workflow },
  { name: 'ABDM', icon: Globe },
  { name: 'NHA', icon: Building },
  { name: 'Epic', icon: Heart },
  { name: 'Oracle Health', icon: Database },
  { name: 'Ayushman Bharat', icon: Shield },
]

const recognitions = [
  {
    title: 'Best Healthcare AI Platform',
    org: 'NASSCOM Digital India Awards 2026',
    year: '2026',
    icon: Award,
    color: 'text-warning bg-warning/10',
  },
  {
    title: 'Top 10 HealthTech Startups',
    org: 'Inc42 Healthcare Innovation',
    year: '2026',
    icon: Star,
    color: 'text-secondary bg-secondary/10',
  },
  {
    title: 'ABDM Certified Platform',
    org: 'National Health Authority',
    year: '2025',
    icon: CheckCircle,
    color: 'text-success bg-success/10',
  },
  {
    title: 'SOC 2 Type II Compliant',
    org: 'Independent Security Audit',
    year: '2025',
    icon: Shield,
    color: 'text-primary bg-primary/10',
  },
]

export default function Partners() {
  return (
    <section className="py-12 md:py-16 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Recognition */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-4 tracking-tight">
              Recognition & Compliance
            </h2>
            <p className="text-lg text-muted leading-relaxed">
              Trusted by healthcare leaders and recognized for innovation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {recognitions.map((rec) => (
              <div
                key={rec.title}
                className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-center hover:shadow-md transition-shadow"
              >
                <div className={cn('w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center', rec.color)}>
                  <rec.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-sm text-text dark:text-text-dark mb-1">
                  {rec.title}
                </h3>
                <p className="text-xs text-muted">{rec.org}</p>
                <p className="text-xs text-muted mt-1">{rec.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Partners */}
        <p className="text-center text-sm text-muted mb-8">
          Works with the systems you already use
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {partners.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-muted" />
              </div>
              <span className="text-xs text-muted font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
