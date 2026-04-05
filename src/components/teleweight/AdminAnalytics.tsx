import { useState, useEffect } from 'react'
import {
  Loader2,
  Users,
  Video,
  IndianRupee,
  Heart,
  AlertCircle,
  Package,
  Truck,
  Clock,
  ShieldCheck,
  Pill,
  Trophy,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Stat } from '../../components/ui/Stat'
import { Chart } from '../../components/ui/Chart'
import { teleweight } from '../../lib/api'
import { cn, formatCurrency } from '../../lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DoctorUtilization {
  id: string
  full_name: string
  specialty: string
  consultation_fee: number
  rating: number
  total_consultations: number
  completed_consultations: number
  revenue_generated: number
  avg_session_minutes: number
}

interface PlanBreakdown {
  plan_name: string
  price_monthly: number
  subscriber_count: number
  active_count: number
  monthly_recurring_revenue: number
}

interface ConsentRow {
  consent_type: string
  total: number
  consented: number
  withdrawn: number
}

interface MonthlyTrend {
  month: string
  total: number
  completed: number
  revenue: number
}

interface AnalyticsData {
  overview: {
    total_patients: number
    active_subscriptions: number
    total_consultations: number
    total_revenue: number
  }
  consultation_metrics: {
    total_consultations: number
    completed: number
    scheduled: number
    cancelled: number
    in_progress: number
    total_consultation_revenue: number
    total_platform_fees: number
    total_doctor_payouts: number
    avg_duration_minutes: number
    unique_patients: number
    active_doctors: number
  }
  doctor_utilization: DoctorUtilization[]
  subscription_metrics: {
    total_subscriptions: number
    active: number
    cancelled: number
    paused: number
    by_plan: PlanBreakdown[]
  }
  pharmacy_metrics: {
    total_orders: number
    delivered: number
    in_transit: number
    pending: number
    cancelled: number
    total_pharmacy_revenue: number
  }
  patient_stats: {
    total_profiles: number
    intake_completed: number
    intake_pending: number
    avg_bmi: number
    avg_weight: number
    bmi_distribution: {
      normal: number
      overweight: number
      obese_class1: number
      obese_class2: number
      obese_class3: number
    }
  }
  prescription_stats: {
    total_prescriptions: number
    active: number
    dispensed: number
    controlled_substance_count: number
  }
  consent_compliance: ConsentRow[]
  monthly_trend: MonthlyTrend[]
  revenue_breakdown: {
    consultation_fees: number
    subscription_mrr: number
    pharmacy_commissions: number
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const result = await teleweight.adminAnalytics()
        setData(result as AnalyticsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // --- Error ---
  if (error || !data) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <div className="flex flex-col items-center gap-3 py-8">
          <AlertCircle className="h-10 w-10 text-error" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Failed to load analytics
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error || 'An unexpected error occurred'}
          </p>
        </div>
      </Card>
    )
  }

  // --- Derived chart data ---

  // Monthly Consultation Trend (line chart)
  const trendData: Record<string, unknown>[] = data.monthly_trend.map((m) => ({
    name: m.month,
    Consultations: m.total,
    Completed: m.completed,
  }))

  // Revenue Breakdown (pie chart)
  const revenueData: Record<string, unknown>[] = [
    { name: 'Platform Fees', value: data.revenue_breakdown.consultation_fees },
    { name: 'Subscription MRR', value: data.revenue_breakdown.subscription_mrr },
    { name: 'Pharmacy Commissions', value: data.revenue_breakdown.pharmacy_commissions },
  ]

  // Subscription distribution (bar chart)
  const subscriptionData: Record<string, unknown>[] = data.subscription_metrics.by_plan.map(
    (p) => ({
      name: p.plan_name,
      Subscribers: p.subscriber_count,
      MRR: p.monthly_recurring_revenue,
    })
  )

  // BMI distribution (bar chart)
  const bmiData: Record<string, unknown>[] = [
    { name: 'Normal', value: data.patient_stats.bmi_distribution.normal },
    { name: 'Overweight', value: data.patient_stats.bmi_distribution.overweight },
    { name: 'Obese I', value: data.patient_stats.bmi_distribution.obese_class1 },
    { name: 'Obese II', value: data.patient_stats.bmi_distribution.obese_class2 },
    { name: 'Obese III', value: data.patient_stats.bmi_distribution.obese_class3 },
  ]

  // Doctor utilization sorted by revenue desc
  const sortedDoctors = [...data.doctor_utilization].sort(
    (a, b) => b.revenue_generated - a.revenue_generated
  )
  const topDoctorId = sortedDoctors.length > 0 ? sortedDoctors[0].id : null

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Row 1: KPI Cards                                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Patients"
          value={data.overview.total_patients}
          icon={<Users className="h-5 w-5" />}
        />
        <Stat
          label="Total Consultations"
          value={data.consultation_metrics.total_consultations}
          icon={<Video className="h-5 w-5" />}
        />
        <Stat
          label="Monthly Revenue"
          value={formatCurrency(data.overview.total_revenue)}
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <Stat
          label="Active Subscriptions"
          value={data.overview.active_subscriptions}
          icon={<Heart className="h-5 w-5" />}
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 2: Trend Line + Revenue Pie                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Monthly Consultation Trend
            </h3>
          }
        >
          {trendData.length > 0 ? (
            <Chart
              type="line"
              data={trendData}
              dataKeys={['Consultations', 'Completed']}
              xAxisKey="name"
              height={300}
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400 dark:text-gray-500">
              No trend data available
            </div>
          )}
        </Card>

        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue Breakdown
            </h3>
          }
        >
          <Chart
            type="pie"
            data={revenueData}
            dataKeys={['value']}
            xAxisKey="name"
            height={250}
          />
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 3: Doctor Utilization Table                                    */}
      {/* ----------------------------------------------------------------- */}
      <Card
        header={
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Doctor Utilization
          </h3>
        }
        padding="none"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Doctor Name
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Specialty
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                  Fee
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                  Rating
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                  Consultations
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                  Completed
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                  Revenue
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {sortedDoctors.map((doc) => (
                <tr
                  key={doc.id}
                  className={cn(
                    'transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                    doc.id === topDoctorId && 'bg-primary/5 dark:bg-primary/10'
                  )}
                >
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {doc.full_name}
                      </span>
                      {doc.id === topDoctorId && (
                        <Badge variant="warning" size="sm">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Top
                          </span>
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600 dark:text-gray-300">
                    {doc.specialty}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                    {formatCurrency(doc.consultation_fee)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                    {doc.rating.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                    {doc.total_consultations}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                    {doc.completed_consultations}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(doc.revenue_generated)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-gray-600 dark:text-gray-300">
                    {doc.avg_session_minutes} min
                  </td>
                </tr>
              ))}
              {sortedDoctors.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-gray-400 dark:text-gray-500"
                  >
                    No doctor data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Row 4: Subscription Distribution + BMI Distribution               */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Subscription Distribution
            </h3>
          }
        >
          {subscriptionData.length > 0 ? (
            <Chart
              type="bar"
              data={subscriptionData}
              dataKeys={['Subscribers']}
              xAxisKey="name"
              height={250}
            />
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-400 dark:text-gray-500">
              No subscription data
            </div>
          )}
        </Card>

        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              BMI Distribution
            </h3>
          }
        >
          <Chart
            type="bar"
            data={bmiData}
            dataKeys={['value']}
            xAxisKey="name"
            height={250}
          />
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 5: Pharmacy Metrics + Consent Compliance                      */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pharmacy Metrics */}
        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pharmacy Metrics
            </h3>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4 dark:border-border-dark">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.pharmacy_metrics.total_orders}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 dark:border-border-dark">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Delivered</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-success">
                {data.pharmacy_metrics.delivered}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 dark:border-border-dark">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">In Transit</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-warning">
                {data.pharmacy_metrics.in_transit}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 dark:border-border-dark">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <IndianRupee className="h-4 w-4" />
                <span className="text-sm font-medium">Revenue</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(data.pharmacy_metrics.total_pharmacy_revenue)}
              </p>
            </div>
          </div>
        </Card>

        {/* Consent Compliance */}
        <Card
          header={
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Consent Compliance
            </h3>
          }
          padding="none"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Consent Type
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                    Total
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                    Consented
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                    Withdrawn
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">
                    Compliance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.consent_compliance.map((row) => {
                  const rate = row.total > 0 ? ((row.consented / row.total) * 100).toFixed(1) : '0.0'
                  const rateNum = parseFloat(rate)
                  return (
                    <tr
                      key={row.consent_type}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium capitalize text-gray-900 dark:text-gray-100">
                        {row.consent_type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                        {row.total}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                        {row.consented}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-gray-900 dark:text-gray-100">
                        {row.withdrawn}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <Badge
                          variant={rateNum >= 90 ? 'success' : rateNum >= 70 ? 'warning' : 'error'}
                          size="sm"
                        >
                          {rate}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
                {data.consent_compliance.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-gray-400 dark:text-gray-500"
                    >
                      No consent data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Row 6: Prescription Stats                                         */}
      {/* ----------------------------------------------------------------- */}
      <Card
        header={
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Prescription Stats
            </h3>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Prescriptions
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.prescription_stats.total_prescriptions}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
            <p className="mt-1 text-2xl font-bold text-success">
              {data.prescription_stats.active}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dispensed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.prescription_stats.dispensed}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Controlled Substances
            </p>
            <p className={cn(
              'mt-1 text-2xl font-bold',
              data.prescription_stats.controlled_substance_count > 0
                ? 'text-warning'
                : 'text-gray-900 dark:text-gray-100'
            )}>
              {data.prescription_stats.controlled_substance_count}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
