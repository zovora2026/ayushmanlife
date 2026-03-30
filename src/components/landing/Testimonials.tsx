import { Star, Quote } from 'lucide-react'

const metrics = [
  { value: '35% → 10%', label: 'Patient Churn Reduction' },
  { value: '3x Faster', label: 'Claims Processing' },
  { value: '24/7', label: 'AI-Powered Support' },
  { value: '90%+', label: 'Patient Satisfaction' },
  { value: '₹560M+', label: 'Platform Capability' },
]

const testimonials = [
  {
    quote: "AyushmanLife transformed our hospital operations. Patient churn dropped from 35% to under 12% in just 8 months. The AI-powered claims processing alone saved us ₹1.8 crore annually.",
    name: 'Dr. Vikram Mehta',
    role: 'CEO, Metro Heart Institute, Delhi',
    rating: 5,
  },
  {
    quote: "The V-Care assistant handles over 2,000 patient queries daily, freeing our staff to focus on critical care. Our patient satisfaction scores went from 72% to 94% — remarkable.",
    name: 'Dr. Sunita Agarwal',
    role: 'Clinical Director, City Care Hospitals',
    rating: 5,
  },
  {
    quote: "As a TPA, we needed a modern claims adjudication system. AyushmanLife's payer platform reduced our processing time from 14 days to 3 days with AI-powered fraud detection.",
    name: 'Rajiv Singhania',
    role: 'Head of Operations, MedAssist TPA',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-20 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-gradient">{m.value}</p>
              <p className="text-sm text-muted mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text dark:text-text-dark mb-4 tracking-tight">
            Trusted by Healthcare Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-8 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm text-muted leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-sm text-text dark:text-text-dark">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
