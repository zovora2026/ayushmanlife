import { BarChart3, Shield, Cpu, Clock, Database } from 'lucide-react'

interface TestimonialsProps {
  stats?: { total_patients?: number; active_claims?: number; monthly_revenue?: number }
}

const capabilities = [
  {
    title: 'AI-Powered Claims Processing',
    description: 'Automated ICD-10 and CPT coding with Claude AI integration. Submit, adjudicate, and track claims end-to-end with real-time fraud detection.',
    icon: Cpu,
    metric: 'AI Coding Engine',
  },
  {
    title: 'IRDAI Regulatory Compliance',
    description: 'Real-time loss ratio monitoring, turnaround time tracking, and automated IRDAI report generation across Ayushman Bharat, CGHS, ECHS, and private schemes.',
    icon: Shield,
    metric: 'Compliance Dashboard',
  },
  {
    title: 'Full-Stack Healthcare Operations',
    description: '16 integrated modules covering hospital operations, payer management, workforce scheduling, EMR testing, and patient engagement — all on Cloudflare D1.',
    icon: Database,
    metric: '16 Applications',
  },
]

export default function Testimonials({ stats }: TestimonialsProps) {
  const platformMetrics = [
    { value: `${stats?.total_patients || 50}+`, label: 'Patient Records in D1' },
    { value: '16', label: 'Integrated Applications' },
    { value: '24/7', label: 'AI Clinical Assistant' },
    { value: '70+', label: 'API Endpoints' },
    { value: 'APAC', label: 'Cloudflare D1 Region' },
  ]

  return (
    <section className="py-16 md:py-24 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-20 text-center">
          {platformMetrics.map((m) => (
            <div key={m.label}>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-gradient">{m.value}</p>
              <p className="text-sm text-muted mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-4 tracking-tight">
            Platform Capabilities
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Built for Indian healthcare — Ayushman Bharat, CGHS, ECHS, and private insurers. Every feature backed by real Cloudflare D1 data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="p-8 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-primary/5 text-primary text-xs font-semibold mb-3">
                {c.metric}
              </div>
              <h3 className="font-display font-bold text-lg text-text dark:text-text-dark mb-2">
                {c.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
