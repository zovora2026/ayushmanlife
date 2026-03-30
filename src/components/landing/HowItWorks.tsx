import { Link2, Cpu, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Link2,
    title: 'Connect',
    description: 'Integrate with your existing hospital information systems, EMR/EHR, billing, and insurance platforms through our FHIR R4 & HL7 interfaces.',
    color: 'bg-primary text-white',
  },
  {
    icon: Cpu,
    title: 'Automate',
    description: 'AI processes claims, manages patient queries, optimizes scheduling, detects fraud, and generates actionable insights — all autonomously.',
    color: 'bg-accent text-white',
  },
  {
    icon: Rocket,
    title: 'Transform',
    description: 'Achieve measurable outcomes: 70% less patient churn, 3x faster claims, 90%+ satisfaction scores, and significant revenue growth.',
    color: 'bg-secondary text-white',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Three steps to complete healthcare transformation.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary via-accent to-secondary" />

            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className={`w-16 h-16 rounded-2xl ${step.color} mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-primary flex items-center justify-center z-20">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-text dark:text-text-dark mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
