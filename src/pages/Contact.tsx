import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', hospital: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-text dark:text-text-dark mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto">
              Ready to transform your healthcare operations? Schedule a demo or reach out to our team.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              {submitted ? (
                <div className="p-10 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-center">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark mb-2">Thank You!</h2>
                  <p className="text-muted">
                    We&apos;ve received your message and will get back to you within 24 hours.
                    In the meantime, feel free to explore our platform with the demo login.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark space-y-5">
                  <h2 className="font-display font-semibold text-xl text-text dark:text-text-dark">Request a Demo</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Full Name</label>
                      <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. Priya Sharma" required
                        className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Email</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="priya@hospital.com" required
                        className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Hospital / Organization</label>
                    <input type="text" value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})} placeholder="City Care Hospitals"
                      className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Message</label>
                    <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us about your needs..." rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark text-text dark:text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">Office</p>
                      <p className="text-sm text-muted">Connaught Place, New Delhi 110001, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">Email</p>
                      <p className="text-sm text-muted">hello@ayushmanlife.in</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">Phone</p>
                      <p className="text-sm text-muted">+91 11 4567 8900</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl gradient-primary text-white">
                <h3 className="font-display font-semibold text-lg mb-2">Try the Platform Now</h3>
                <p className="text-sm text-white/70 mb-4">
                  Access the full demo instantly with our demo credentials.
                </p>
                <div className="p-3 rounded-lg bg-white/10 text-sm space-y-1">
                  <p><span className="text-white/50">Email:</span> demo@ayushmanlife.in</p>
                  <p><span className="text-white/50">Password:</span> demo123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
