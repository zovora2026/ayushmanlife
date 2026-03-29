import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Heart, Target, Lightbulb, Users, Award, Globe, Zap } from 'lucide-react'

const team = [
  { name: 'Ayush Sharma', role: 'Founder & CEO', bio: 'Former McKinsey healthcare practice, IIT Delhi + ISB alum.' },
  { name: 'Dr. Priya Mehta', role: 'Chief Medical Officer', bio: '15 years clinical experience, AIIMS Delhi, health informatics specialist.' },
  { name: 'Rajiv Kumar', role: 'CTO', bio: 'Ex-Amazon Health, cloud architecture expert, building AI-native healthcare systems.' },
  { name: 'Anita Desai', role: 'VP Engineering', bio: 'Ex-Flipkart, scaled platforms serving 100M+ users across India.' },
  { name: 'Dr. Vikram Singh', role: 'Head of AI', bio: 'PhD IISc Bangalore, published researcher in clinical AI and NLP.' },
  { name: 'Sunita Agarwal', role: 'Head of Academy', bio: 'Former Infosys training lead, built programs for 5,000+ consultants.' },
]

const values = [
  { icon: Heart, title: 'Patient First', description: 'Every feature we build starts with the question: does this improve patient outcomes?' },
  { icon: Target, title: 'AI-Native', description: 'Not AI-enabled or AI-bolted-on. Built from the ground up with intelligence at the core.' },
  { icon: Globe, title: 'India First', description: 'Designed for Indian healthcare — Ayushman Bharat, ABDM, CGHS, and regional health schemes.' },
  { icon: Lightbulb, title: 'Innovation', description: 'We challenge the status quo of healthcare IT consulting with platform-driven transformation.' },
  { icon: Users, title: 'Collaboration', description: 'We work alongside hospital teams, not just for them. Co-creation is our operating model.' },
  { icon: Zap, title: 'Speed', description: 'Move fast, ship weekly. Healthcare cannot wait years for digital transformation.' },
]

export default function About() {
  return (
    <div>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-text dark:text-text-dark mb-4">
              Building the Future of<br />Healthcare in India
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              AyushmanLife is on a mission to transform healthcare delivery through AI-native technology,
              making world-class healthcare accessible, efficient, and intelligent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark mb-4">Our Story</h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  India&apos;s healthcare system serves 1.4 billion people but runs on fragmented, legacy technology.
                  Hospitals struggle with 30-40% patient churn, 38% insurance claim rejections, and 15-day
                  claim processing times.
                </p>
                <p>
                  AyushmanLife was born from the belief that AI can fundamentally transform this reality — not
                  in five years, but now. Our platform combines virtual health assistance, claims automation,
                  predictive analytics, and workforce management into a single, AI-native solution.
                </p>
                <p>
                  While traditional healthcare IT companies like Optimum Healthcare IT (acquired by Infosys
                  for $465M) rely on armies of consultants, we deliver the same capabilities through software
                  — faster, more accurately, and at a fraction of the cost.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '100+', label: 'Hospitals' },
                  { value: '50K+', label: 'Claims Processed' },
                  { value: '99.2%', label: 'Platform Uptime' },
                  { value: '94%', label: 'Patient Satisfaction' },
                ].map(s => (
                  <div key={s.label} className="p-5 rounded-xl bg-primary/5 text-center">
                    <p className="font-display font-bold text-3xl text-primary">{s.value}</p>
                    <p className="text-sm text-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-5 rounded-xl gradient-primary text-white">
                <Award className="w-8 h-8 mb-3 text-white/80" />
                <p className="font-display font-semibold text-lg mb-1">₹560M+ Platform Capability</p>
                <p className="text-sm text-white/70">
                  Our AI-native platform replicates and exceeds the combined capabilities of Optimum Healthcare IT
                  ($465M) and Stratus Global ($95M) — both recently acquired by Infosys.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-10">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map(v => (
                <div key={v.title} className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                  <v.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">{v.title}</h3>
                  <p className="text-sm text-muted">{v.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-2xl text-text dark:text-text-dark text-center mb-10">Leadership Team</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map(t => (
                <div key={t.name} className="p-5 rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-3">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-display font-semibold text-text dark:text-text-dark">{t.name}</h3>
                  <p className="text-sm text-primary font-medium">{t.role}</p>
                  <p className="text-xs text-muted mt-2">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
