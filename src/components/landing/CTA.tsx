import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-24 bg-background dark:bg-background-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gradient-primary p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Ready to Transform Healthcare Delivery?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Join 100+ hospitals already using AyushmanLife to deliver better patient outcomes with AI-native technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 sm:w-72 px-5 py-3 rounded-l-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                />
                <button className="px-6 py-3 rounded-r-xl bg-secondary text-white font-semibold hover:bg-secondary-dark transition-colors flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-white/40 text-sm mt-4">
              Or schedule a call with our team — hello@ayushmanlife.in
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
