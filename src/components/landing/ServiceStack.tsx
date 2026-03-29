import { useState } from 'react'
import { ChevronDown, Server, Zap, Users, Headphones, Compass } from 'lucide-react'
import { cn } from '../../lib/utils'

const services = [
  {
    icon: Server,
    title: 'Enterprise Application Services',
    items: [
      'EMR/EHR implementation & optimization (Epic, Oracle Health, Meditech)',
      'ERP deployment (Workday, SAP for Healthcare)',
      'Revenue cycle management systems',
      'Clinical data repository setup',
      'System integration & interoperability (HL7, FHIR)',
    ],
  },
  {
    icon: Zap,
    title: 'Digital Transformation',
    items: [
      'Cloud migration (AWS, Azure healthcare workloads)',
      'Cybersecurity assessment & implementation',
      'ServiceNow healthcare workflows',
      'Data modernization & analytics platforms',
      'AI/ML model deployment for clinical workflows',
    ],
  },
  {
    icon: Users,
    title: 'Workforce Management',
    items: [
      'Healthcare IT staffing & augmentation',
      'Credential verification & tracking',
      'Skill matrix management & gap analysis',
      'AI-optimized staff scheduling',
      'Training program development & delivery',
    ],
  },
  {
    icon: Headphones,
    title: 'Managed Services',
    items: [
      '24x7 application support with SLA guarantees',
      'Infrastructure monitoring & management',
      'Help desk & service desk operations',
      'Proactive incident management',
      'Performance optimization & tuning',
    ],
  },
  {
    icon: Compass,
    title: 'Advisory & Strategy',
    items: [
      'Digital health strategy development',
      'Technology roadmap planning',
      'Vendor evaluation & selection',
      'Regulatory compliance consulting (NABH, ABDM, HIPAA)',
      'ROI analysis & transformation business cases',
    ],
  },
]

export default function ServiceStack() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-24 bg-background dark:bg-background-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text dark:text-text-dark mb-4">
            Enterprise-Grade Healthcare IT Services
          </h2>
          <p className="text-lg text-muted">
            Comprehensive service stack covering every aspect of healthcare technology transformation.
          </p>
        </div>

        <div className="space-y-3">
          {services.map((service, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={service.title}
                className={cn(
                  'rounded-xl border transition-all duration-300',
                  isOpen
                    ? 'border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm'
                    : 'border-border dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/20'
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    isOpen ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-muted'
                  )}>
                    <service.icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-display font-semibold text-text dark:text-text-dark">
                    {service.title}
                  </span>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-muted transition-transform',
                    isOpen && 'rotate-180'
                  )} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pl-19">
                    <ul className="space-y-2 ml-14">
                      {service.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
