export const APP_NAME = 'AyushmanLife'
export const APP_TAGLINE = 'AI-Native Healthcare Platform for India'
export const APP_DESCRIPTION = 'Transform healthcare delivery with AI-powered claims automation, virtual health assistance, predictive analytics, and managed services.'

export const DEMO_EMAIL = 'demo@ayushmanlife.in'
export const DEMO_PASSWORD = 'demo123'

export const COLORS = {
  primary: '#0D7377',
  primaryLight: '#10918A',
  primaryDark: '#0A5C5F',
  secondary: '#FF6B35',
  accent: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const

export const CHART_COLORS = [
  '#0D7377',
  '#2563EB',
  '#FF6B35',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
] as const

export const NAV_ITEMS = {
  public: [
    { label: 'Solutions', href: '/solutions' },
    { label: 'Platform', href: '/platform' },
    { label: 'Insights', href: '/insights' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  dashboard: {
    core: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'V-Care', href: '/vcare', icon: 'MessageSquareHeart' },
      { label: 'SmartClaims', href: '/claims', icon: 'FileCheck' },
    ],
    intelligence: [
      { label: 'Analytics', href: '/analytics', icon: 'TrendingUp' },
      { label: 'Data Governance', href: '/data-governance', icon: 'Database' },
    ],
    operations: [
      { label: 'Managed Services', href: '/services', icon: 'Headphones' },
      { label: 'Workforce', href: '/workforce', icon: 'Users' },
    ],
    payer: [
      { label: 'Payer Platform', href: '/payer', icon: 'Building2' },
    ],
    growth: [
      { label: 'CareerPath Academy', href: '/academy', icon: 'GraduationCap' },
      { label: 'Insights', href: '/insights', icon: 'Lightbulb' },
    ],
    system: [
      { label: 'Admin', href: '/admin', icon: 'Settings' },
    ],
  },
} as const

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'West Bengal',
] as const

export const PAYER_SCHEMES = [
  'Ayushman Bharat - PMJAY',
  'CGHS',
  'ECHS',
  'ESI',
  'Star Health Insurance',
  'HDFC ERGO',
  'ICICI Lombard',
  'Max Bupa',
  'New India Assurance',
  'Self Pay',
] as const

export const DEPARTMENTS = [
  'Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Pediatrics',
  'Obstetrics & Gynecology', 'General Surgery', 'Internal Medicine',
  'Emergency', 'Radiology', 'Pathology', 'Dermatology', 'ENT',
  'Ophthalmology', 'Psychiatry', 'Pulmonology',
] as const
