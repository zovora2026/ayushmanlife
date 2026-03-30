import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for small clinics getting started with AI healthcare.',
    features: [
      'V-Care AI chatbot (100 queries/day)',
      'Basic claims processing',
      'Up to 500 patient records',
      'Standard analytics dashboard',
      'Email support',
      'Single department',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹49,999',
    period: '/month',
    description: 'Full platform access for growing hospitals and clinics.',
    features: [
      'Unlimited V-Care AI queries',
      'SmartClaims with AI coding',
      'Up to 10,000 patient records',
      'Advanced predictive analytics',
      'Workforce management (5 depts)',
      'Managed services portal',
      'Payer integration',
      'Priority support (24x7)',
      'CareerPath Academy access',
      'Dark mode & customization',
    ],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Unlimited scale for hospital networks and health systems.',
    features: [
      'Everything in Professional',
      'Unlimited patients & claims',
      'Unlimited departments',
      'Dedicated AI model tuning',
      'Custom integrations (Epic, Oracle)',
      'On-premise deployment option',
      'SLA guarantees (99.9% uptime)',
      'Dedicated success manager',
      'Custom training programs',
      'HIPAA BAA & compliance support',
      'White-label option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl p-8 flex flex-col',
                plan.popular
                  ? 'bg-white dark:bg-surface-dark border-2 border-primary shadow-xl md:scale-105'
                  : 'bg-white dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm hover:shadow-md transition-shadow'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="font-display font-bold text-xl text-text dark:text-text-dark">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="font-display font-extrabold text-4xl text-text dark:text-text-dark">{plan.price}</span>
                <span className="text-muted text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-muted mb-8">{plan.description}</p>

              <Link
                to="/contact"
                className={cn(
                  'block text-center py-3 rounded-xl font-semibold text-sm transition-colors mb-8',
                  plan.popular
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-100 dark:bg-slate-700 text-text dark:text-text-dark hover:bg-gray-200 dark:hover:bg-slate-600'
                )}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
