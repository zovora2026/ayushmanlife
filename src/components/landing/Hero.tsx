import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Shield, Globe, Award, Heart, Activity, FileCheck, Brain } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { DashboardKPIs } from '../../lib/api'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count.toLocaleString('en-IN')}{suffix}</span>
}

const floatingIcons = [
  { icon: Heart, x: '10%', y: '20%', delay: 0 },
  { icon: Activity, x: '85%', y: '15%', delay: 1 },
  { icon: FileCheck, x: '75%', y: '70%', delay: 2 },
  { icon: Brain, x: '15%', y: '75%', delay: 0.5 },
]

export default function Hero({ stats }: { stats?: DashboardKPIs | null }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {floatingIcons.map((item, i) => {
        const Icon = item.icon
        return (
          <div
            key={i}
            className="absolute text-white/5 animate-float hidden md:block"
            style={{ left: item.x, top: item.y, animationDelay: `${item.delay}s` }}
          >
            <Icon className="w-16 h-16" />
          </div>
        )
      })}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32 md:py-40">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          AI-Native Healthcare Platform — Now Live
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white leading-[1.1] tracking-tight mb-6">
          AI-Native Healthcare{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">
            Platform for India
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform hospital operations, automate insurance claims, and deliver exceptional patient care
          with India&apos;s most comprehensive AI-powered healthcare platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-secondary text-white font-semibold text-lg hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/25"
          >
            Request Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/platform"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
          >
            <Play className="w-5 h-5" /> Explore Platform
          </Link>
        </div>

        <div className="flex justify-center gap-8 sm:gap-12 mb-12">
          {[
            { value: stats?.active_claims ?? 0, suffix: '+', label: 'Claims Processed' },
            { value: stats?.total_patients ?? 0, suffix: '+', label: 'Patients Served' },
            { value: stats?.satisfaction_score ?? 0, suffix: '%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-2xl sm:text-3xl text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs sm:text-sm text-white/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8">
          {[
            { icon: Shield, label: 'Ayushman Bharat' },
            { icon: Globe, label: 'ABDM Integrated' },
            { icon: Shield, label: 'HIPAA Aligned' },
            { icon: Award, label: 'SOC 2 Ready' },
          ].map((badge) => (
            <div key={badge.label} className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              'bg-white/5 border border-white/10 text-white/60 text-xs backdrop-blur-sm'
            )}>
              <badge.icon className="w-3.5 h-3.5" />
              {badge.label}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background dark:from-background-dark to-transparent" />
    </section>
  )
}
