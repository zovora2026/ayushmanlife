import { useState, useEffect } from 'react'
import {
  Scale, Activity, UserSearch, LayoutDashboard, MessageSquare,
  Pill, Package, Loader2, Heart, TrendingDown, Users, Video,
  Star, IndianRupee, ShieldCheck, ArrowRight, CheckCircle,
  Stethoscope, BarChart3, MonitorPlay,
} from 'lucide-react'
import { Tabs } from '../components/ui/Tabs'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { cn } from '../lib/utils'
import { formatCurrency } from '../lib/utils'
import { teleweight } from '../lib/api'
import IntakeForm from '../components/teleweight/IntakeForm'
import DoctorDiscovery from '../components/teleweight/DoctorDiscovery'
import PatientDashboard from '../components/teleweight/PatientDashboard'
import ConsultationsList from '../components/teleweight/ConsultationsList'
import PrescriptionView from '../components/teleweight/PrescriptionView'
import PharmacyOrders from '../components/teleweight/PharmacyOrders'
import DoctorPanel from '../components/teleweight/DoctorPanel'
import AdminAnalytics from '../components/teleweight/AdminAnalytics'
import ConsultationRoom from '../components/teleweight/ConsultationRoom'
import { useAuthStore } from '../store/authStore'

const tabs = [
  { id: 'overview', label: 'Overview', icon: <Scale className="w-4 h-4" /> },
  { id: 'intake', label: 'Health Intake', icon: <Activity className="w-4 h-4" /> },
  { id: 'doctors', label: 'Find Doctors', icon: <UserSearch className="w-4 h-4" /> },
  { id: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'consultations', label: 'Consultations', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'room', label: 'Consult Room', icon: <MonitorPlay className="w-4 h-4" /> },
  { id: 'prescriptions', label: 'Prescriptions', icon: <Pill className="w-4 h-4" /> },
  { id: 'pharmacy', label: 'Pharmacy', icon: <Package className="w-4 h-4" /> },
  { id: 'doctor-panel', label: 'Doctor Panel', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'admin', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
]

// Demo patient for the current session (linked to logged-in user context)
function usePatientId() {
  const { user } = useAuthStore()
  // Map demo user to a patient ID that has TeleWeight seed data
  return user?.id === 'usr-001' ? 'pat-001' : 'pat-001'
}

export default function TeleWeight() {
  const [activeTab, setActiveTab] = useState('overview')
  const patientId = usePatientId()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                TeleWeight
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Telemedicine Weight Management Platform
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>Platform Active</Badge>
          <Badge variant="info">Facilitator Only</Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'intake' && <IntakeForm patientId={patientId} onComplete={() => setActiveTab('doctors')} />}
        {activeTab === 'doctors' && <DoctorDiscovery patientId={patientId} />}
        {activeTab === 'dashboard' && <PatientDashboard patientId={patientId} />}
        {activeTab === 'consultations' && <ConsultationsList patientId={patientId} />}
        {activeTab === 'room' && <ConsultationRoom patientId={patientId} />}
        {activeTab === 'prescriptions' && <PrescriptionView patientId={patientId} />}
        {activeTab === 'pharmacy' && <PharmacyOrders patientId={patientId} />}
        {activeTab === 'doctor-panel' && <DoctorPanel defaultDoctorId="doc-tw-001" />}
        {activeTab === 'admin' && <AdminAnalytics />}
      </div>
    </div>
  )
}

// ---- Overview Tab ----
function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, plansRes] = await Promise.allSettled([
          teleweight.adminAnalytics(),
          teleweight.plans(),
        ])
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value)
        if (plansRes.status === 'fulfilled') setPlans(plansRes.value.plans || [])
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const cm = analytics?.consultation_metrics || {}
  const sm = analytics?.subscription_metrics || {}
  const pm = analytics?.patient_stats || {}

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Your Weight Management Journey Starts Here</h2>
            <p className="text-emerald-100 text-lg mb-6">
              Connect with ABMS-certified specialists via secure video consultation.
              Get personalized treatment plans, track your progress, and achieve your health goals.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('intake')}
                className="px-6 py-2.5 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                Start Health Assessment <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('doctors')}
                className="px-6 py-2.5 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                Browse Doctors
              </button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        </div>
      </Card>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Active Patients"
          value={pm?.total_profiles || 0}
          icon={<Users className="w-5 h-5" />}
        />
        <Stat
          label="Consultations"
          value={cm?.total || 0}
          icon={<Video className="w-5 h-5" />}
        />
        <Stat
          label="Active Subscribers"
          value={sm?.total_active || 0}
          icon={<Heart className="w-5 h-5" />}
        />
        <Stat
          label="Total Revenue"
          value={formatCurrency(cm?.total_revenue || 0)}
          icon={<IndianRupee className="w-5 h-5" />}
        />
      </div>

      {/* How It Works */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">How TeleWeight Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Health Intake', desc: 'Complete your health assessment with BMI, medical history, and lifestyle data', icon: Activity, color: 'bg-blue-500' },
            { step: 2, title: 'Find a Doctor', desc: 'Browse certified specialists, check availability, and book a video consultation', icon: UserSearch, color: 'bg-emerald-500' },
            { step: 3, title: 'Video Consult', desc: 'Meet your doctor via secure video call. First consultation must be video per Indian regulations', icon: Video, color: 'bg-purple-500' },
            { step: 4, title: 'Track Progress', desc: 'Log weight, follow prescriptions, order medications, and track your journey', icon: TrendingDown, color: 'bg-orange-500' },
          ].map(({ step, title, desc, icon: Icon, color }) => (
            <div key={step} className="text-center">
              <div className={cn('w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white', color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-gray-400 mb-1">STEP {step}</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Subscription Plans */}
      {plans.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Subscription Plans</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan: any) => {
              let features: string[] = []
              try { features = JSON.parse(plan.features || '[]') } catch { /* */ }
              const isPopular = plan.name === 'Standard'
              return (
                <Card key={plan.id} className={cn('relative', isPopular && 'ring-2 ring-emerald-500')}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="success">Most Popular</Badge>
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{plan.description}</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(plan.price_monthly)}
                      <span className="text-sm font-normal text-gray-400">/month</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {features.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 text-center space-y-0.5">
                    <p>Quarterly: {formatCurrency(plan.price_quarterly)}</p>
                    <p>Annual: {formatCurrency(plan.price_annual)}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Compliance Notice */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Regulatory Compliance</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              AyushmanLife TeleWeight operates as a <strong>technology platform facilitator</strong> connecting patients
              with registered medical practitioners. All doctors hold valid NMC/State Medical Council registration.
              First consultations are conducted via video per Telemedicine Practice Guidelines 2020.
              Patient consent is collected and audited per DPDP Act 2023.
              AyushmanLife does not prescribe, dispense, or provide medical advice directly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
