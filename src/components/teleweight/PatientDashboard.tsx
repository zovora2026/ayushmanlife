import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  Scale,
  Activity,
  TrendingDown,
  TrendingUp,
  Target,
  Video,
  Phone,
  MessageSquare,
  Pill,
  CalendarClock,
  CreditCard,
  ClipboardPlus,
  AlertCircle,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Stat } from '../../components/ui/Stat'
import { Progress } from '../../components/ui/Progress'
import { Chart } from '../../components/ui/Chart'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { teleweight } from '../../lib/api'
import type {
  TWWeightProfile,
  TWWeightLog,
  TWConsultation,
  TWPrescription,
  TWPharmacyOrder,
  TWPatientSubscription,
} from '../../lib/api'
import { cn, formatDate, formatCurrency } from '../../lib/utils'

interface PatientDashboardProps {
  patientId: string
}

interface DashboardData {
  patient: { name: string; age: number; gender: string; phone: string; email: string }
  profile: TWWeightProfile | null
  weight_trend: TWWeightLog[]
  weight_change: { first_weight: number; latest_weight: number; change_kg: number }
  target_progress: { progress_pct: number }
  upcoming_consultations: TWConsultation[]
  consultation_stats: { total: number; completed: number }
  active_prescriptions: TWPrescription[]
  recent_pharmacy_orders: TWPharmacyOrder[]
  subscription: (TWPatientSubscription & { plan_name?: string; status: string; next_payment_date?: string | null }) | null
}

interface WeightFormData {
  weight_kg: string
  waist_cm: string
  blood_glucose: string
  blood_pressure_systolic: string
  blood_pressure_diastolic: string
}

function getBmiCategory(bmi: number): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } {
  if (bmi < 18.5) return { label: 'Underweight', variant: 'info' }
  if (bmi < 25) return { label: 'Normal', variant: 'success' }
  if (bmi < 30) return { label: 'Overweight', variant: 'warning' }
  return { label: 'Obese', variant: 'error' }
}

function getConsultationModeIcon(mode: string) {
  switch (mode.toLowerCase()) {
    case 'video':
      return <Video className="h-4 w-4" />
    case 'audio':
      return <Phone className="h-4 w-4" />
    case 'chat':
      return <MessageSquare className="h-4 w-4" />
    default:
      return <Video className="h-4 w-4" />
  }
}

function getConsultationModeBadgeVariant(mode: string): 'info' | 'success' | 'warning' {
  switch (mode.toLowerCase()) {
    case 'video':
      return 'info'
    case 'audio':
      return 'success'
    case 'chat':
      return 'warning'
    default:
      return 'info'
  }
}

export default function PatientDashboard({ patientId }: PatientDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logSubmitting, setLogSubmitting] = useState(false)
  const [logError, setLogError] = useState<string | null>(null)
  const [logSuccess, setLogSuccess] = useState(false)

  const [weightForm, setWeightForm] = useState<WeightFormData>({
    weight_kg: '',
    waist_cm: '',
    blood_glucose: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
  })

  const loadDashboard = useCallback(async () => {
    try {
      setError(null)
      const result = await teleweight.patientDashboard(patientId)
      setData(result as DashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  async function handleLogWeight(e: React.FormEvent) {
    e.preventDefault()
    const weight = parseFloat(weightForm.weight_kg)
    if (!weight || weight <= 0) {
      setLogError('Please enter a valid weight')
      return
    }

    setLogSubmitting(true)
    setLogError(null)
    setLogSuccess(false)

    try {
      await teleweight.logWeight({
        patient_id: patientId,
        weight_kg: weight,
        ...(weightForm.waist_cm ? { waist_cm: parseFloat(weightForm.waist_cm) } : {}),
        ...(weightForm.blood_glucose ? { blood_glucose: parseFloat(weightForm.blood_glucose) } : {}),
        ...(weightForm.blood_pressure_systolic ? { blood_pressure_systolic: parseFloat(weightForm.blood_pressure_systolic) } : {}),
        ...(weightForm.blood_pressure_diastolic ? { blood_pressure_diastolic: parseFloat(weightForm.blood_pressure_diastolic) } : {}),
      })
      setLogSuccess(true)
      setWeightForm({ weight_kg: '', waist_cm: '', blood_glucose: '', blood_pressure_systolic: '', blood_pressure_diastolic: '' })
      // Reload dashboard data to reflect the new log
      await loadDashboard()
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'Failed to log weight')
    } finally {
      setLogSubmitting(false)
    }
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // --- Error state ---
  if (error || !data) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <div className="flex flex-col items-center gap-3 py-8">
          <AlertCircle className="h-10 w-10 text-error" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Failed to load dashboard</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error || 'An unexpected error occurred'}</p>
          <Button variant="outline" onClick={() => { setLoading(true); loadDashboard() }}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  // --- No profile state ---
  if (!data.profile) {
    return (
      <Card className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ClipboardPlus className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome, {data.patient.name}
          </h2>
          <p className="max-w-md text-gray-500 dark:text-gray-400">
            Complete your Health Intake to start your weight management journey.
            Your personalized dashboard with weight tracking, consultations, and
            prescription management will appear here once your profile is set up.
          </p>
        </div>
      </Card>
    )
  }

  // --- Chart data ---
  const chartData = data.weight_trend.map((entry) => ({
    name: formatDate(entry.logged_at),
    weight: entry.weight_kg,
    bmi: entry.bmi,
  }))

  const bmiInfo = getBmiCategory(data.profile.bmi)
  const weightChangeIsLoss = data.weight_change.change_kg < 0

  return (
    <div className="space-y-6">
      {/* Row 1: Stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Current Weight"
          value={`${data.profile.current_weight_kg} kg`}
          icon={<Scale className="h-5 w-5" />}
        />
        <Stat
          label={`BMI — ${bmiInfo.label}`}
          value={data.profile.bmi.toFixed(1)}
          icon={<Activity className="h-5 w-5" />}
        />
        <Stat
          label="Weight Change"
          value={`${data.weight_change.change_kg > 0 ? '+' : ''}${data.weight_change.change_kg.toFixed(1)} kg`}
          change={data.weight_change.change_kg !== 0 ? (weightChangeIsLoss ? -Math.abs(data.weight_change.change_kg) : Math.abs(data.weight_change.change_kg)) : undefined}
          changeLabel="since start"
          icon={
            weightChangeIsLoss ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )
          }
        />
        <div className="rounded-xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Target Progress
              </p>
              <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.target_progress.progress_pct}%
              </p>
            </div>
            <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <Progress
            value={data.target_progress.progress_pct}
            size="md"
            className="mt-3"
          />
        </div>
      </div>

      {/* Row 2: Weight Trend Chart + Quick Log */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Weight Trend Chart */}
        <Card
          className="lg:col-span-2"
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Weight Trend
            </h3>
          }
        >
          {chartData.length > 0 ? (
            <Chart
              type="area"
              data={chartData}
              dataKeys={['weight']}
              xAxisKey="name"
              height={300}
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400 dark:text-gray-500">
              No weight data yet. Log your first weight to see trends.
            </div>
          )}
        </Card>

        {/* Right: Quick Weight Log */}
        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Quick Weight Log
            </h3>
          }
        >
          <form onSubmit={handleLogWeight} className="space-y-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="e.g. 82.5"
              value={weightForm.weight_kg}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, weight_kg: e.target.value }))}
              required
            />
            <Input
              label="Waist (cm)"
              type="number"
              step="0.1"
              min="30"
              max="200"
              placeholder="Optional"
              value={weightForm.waist_cm}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, waist_cm: e.target.value }))}
            />
            <Input
              label="Blood Glucose (mg/dL)"
              type="number"
              step="1"
              min="30"
              max="500"
              placeholder="Optional"
              value={weightForm.blood_glucose}
              onChange={(e) => setWeightForm((prev) => ({ ...prev, blood_glucose: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="BP Systolic"
                type="number"
                step="1"
                min="60"
                max="250"
                placeholder="Optional"
                value={weightForm.blood_pressure_systolic}
                onChange={(e) => setWeightForm((prev) => ({ ...prev, blood_pressure_systolic: e.target.value }))}
              />
              <Input
                label="BP Diastolic"
                type="number"
                step="1"
                min="30"
                max="150"
                placeholder="Optional"
                value={weightForm.blood_pressure_diastolic}
                onChange={(e) => setWeightForm((prev) => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
              />
            </div>

            {logError && (
              <p className="text-sm text-error">{logError}</p>
            )}
            {logSuccess && (
              <p className="text-sm text-success">Weight logged successfully!</p>
            )}

            <Button type="submit" className="w-full" loading={logSubmitting}>
              Log Weight
            </Button>
          </form>
        </Card>
      </div>

      {/* Row 3: Consultations + Prescriptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Upcoming Consultations */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upcoming Consultations
              </h3>
              {data.consultation_stats && (
                <Badge variant="neutral" size="sm">
                  {data.consultation_stats.completed}/{data.consultation_stats.total} completed
                </Badge>
              )}
            </div>
          }
        >
          {data.upcoming_consultations.length > 0 ? (
            <div className="divide-y divide-border dark:divide-border-dark">
              {data.upcoming_consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {consultation.doctor_name || 'Doctor'}
                    </p>
                    {consultation.doctor_specialty && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {consultation.doctor_specialty}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDate(consultation.scheduled_at)}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Badge
                      variant={getConsultationModeBadgeVariant(consultation.mode)}
                      size="sm"
                    >
                      <span className="flex items-center gap-1">
                        {getConsultationModeIcon(consultation.mode)}
                        {consultation.mode}
                      </span>
                    </Badge>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {formatCurrency(consultation.consultation_fee)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CalendarClock className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming consultations
              </p>
            </div>
          )}
        </Card>

        {/* Right: Active Prescriptions */}
        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Active Prescriptions
            </h3>
          }
        >
          {data.active_prescriptions.length > 0 ? (
            <div className="divide-y divide-border dark:divide-border-dark">
              {data.active_prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {prescription.doctor_name || 'Doctor'}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {prescription.diagnosis}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDate(prescription.prescription_date)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge
                      variant={prescription.status === 'active' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {prescription.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Pill className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No active prescriptions
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Row 4: Subscription Status */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Subscription
            </h3>
          </div>
        }
      >
        {data.subscription ? (
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {data.subscription.plan_name}
              </p>
            </div>
            <Badge
              variant={data.subscription.status === 'active' ? 'success' : data.subscription.status === 'expired' ? 'error' : 'warning'}
              size="md"
              dot
            >
              {data.subscription.status}
            </Badge>
            {data.subscription.next_payment_date && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Next Payment</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(data.subscription.next_payment_date)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No active subscription
            </p>
            <a
              href="#plans"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View Plans
            </a>
          </div>
        )}
      </Card>
    </div>
  )
}
