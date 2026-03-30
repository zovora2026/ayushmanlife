import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="py-16 md:py-20 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gradient-primary p-12 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 tracking-tight">
                Ready to Transform Healthcare Delivery?
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Join 100+ hospitals already using AyushmanLife to deliver better patient outcomes with AI-native technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <div className="flex w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="flex-1 sm:w-80 px-5 py-3.5 rounded-l-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                />
                <button className="px-8 py-3.5 rounded-r-xl bg-secondary text-white font-semibold hover:bg-secondary-dark transition-colors flex items-center gap-2 shrink-0">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/60 text-sm">
              <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-white/90 transition-colors">
                <Phone className="w-4 h-4" /> +91 12345 67890
              </a>
              <a href="mailto:hello@ayushmanlife.in" className="flex items-center gap-2 hover:text-white/90 transition-colors">
                <Mail className="w-4 h-4" /> hello@ayushmanlife.in
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> New Delhi, India
              </span>
            </div>

            <p className="text-white/30 text-xs text-center mt-6">
              Free trial available. No credit card required. Enterprise plans include dedicated success manager.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
