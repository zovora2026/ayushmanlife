import { Cloud, Database, Workflow, Globe, Building, Heart, Server, Shield } from 'lucide-react'

const partners = [
  { name: 'AWS', icon: Cloud },
  { name: 'Azure', icon: Cloud },
  { name: 'ServiceNow', icon: Workflow },
  { name: 'ABDM', icon: Globe },
  { name: 'NHA', icon: Building },
  { name: 'Epic', icon: Heart },
  { name: 'Oracle Health', icon: Database },
  { name: 'Ayushman Bharat', icon: Shield },
]

export default function Partners() {
  return (
    <section className="py-16 bg-background dark:bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted mb-8">
          Works with the systems you already use
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
          {partners.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-muted" />
              </div>
              <span className="text-xs text-muted font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
