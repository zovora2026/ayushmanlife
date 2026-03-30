import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, Shield, Award, Globe } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'V-Care AI Assistant', href: '/solutions' },
    { label: 'SmartClaims', href: '/solutions' },
    { label: 'Analytics Engine', href: '/solutions' },
    { label: 'Workforce Management', href: '/solutions' },
    { label: 'Payer Platform', href: '/solutions' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Insights', href: '/insights' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/about' },
    { label: 'Partners', href: '/about' },
  ],
  Resources: [
    { label: 'Documentation', href: '/platform' },
    { label: 'Case Studies', href: '/insights' },
    { label: 'Whitepapers', href: '/insights' },
    { label: 'Blog', href: '/insights' },
    { label: 'API Reference', href: '/platform' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/about' },
    { label: 'Terms of Service', href: '/about' },
    { label: 'Security', href: '/about' },
    { label: 'Compliance', href: '/about' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Ayushman<span className="text-secondary">Life</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
              AI-Native Healthcare Platform transforming hospital operations, insurance processing, and patient care across India.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>New Delhi, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>hello@ayushmanlife.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+91 11 4567 8900</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5" /> HIPAA Aligned
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Globe className="w-3.5 h-3.5" /> ABDM Integrated
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Award className="w-3.5 h-3.5" /> SOC 2 Ready
              </div>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2026 AyushmanLife Technologies Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
