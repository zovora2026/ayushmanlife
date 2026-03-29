import { useState } from 'react'
import {
  TrendingUp,
  Activity,
  Users,
  BedDouble,
  Clock,
  Star,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  IndianRupee,
  Target,
  ArrowUpRight,
  Smile,
  Meh,
  Frown,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Chart } from '../components/ui/Chart'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { demoPatients, chartData } from '../lib/mock-data'
import { cn, formatCurrency, getRiskColor } from '../lib/utils'

const analyticsTabs = [
  { id: 'risk', label: 'Patient Risk', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'operations', label: 'Operations', icon: <Activity className="h-4 w-4" /> },
  { id: 'satisfaction', label: 'Satisfaction', icon: <Smile className="h-4 w-4" /> },
  { id: 'revenue', label: 'Revenue', icon: <IndianRupee className="h-4 w-4" /> },
]

const feedbackItems = [
  { id: 1, rating: 5, comment: 'Excellent care by Dr. Kapoor. Very thorough examination and clear explanation of treatment plan.', department: 'Cardiology', date: '2026-03-28' },
  { id: 2, rating: 4, comment: 'Quick service in emergency. Minor delay in discharge paperwork but overall good experience.', department: 'Emergency', date: '2026-03-27' },
  { id: 3, rating: 3, comment: 'Long waiting time for OPD consultation. Doctor was good but 45 min wait is too much.', department: 'Orthopedics', date: '2026-03-26' },
  { id: 4, rating: 5, comment: 'The pediatric team is wonderful. My child was comfortable throughout the visit.', department: 'Pediatrics', date: '2026-03-25' },
  { id: 5, rating: 2, comment: 'Billing issues took multiple rounds to resolve. Staff was not helpful at billing counter.', department: 'General', date: '2026-03-24' },
]

const departmentMetrics = [
  { name: 'Cardiology', patientsPerDay: 48, avgWait: 14, revenue: 2450000 },
  { name: 'Orthopedics', patientsPerDay: 36, avgWait: 18, revenue: 1870000 },
  { name: 'Emergency', patientsPerDay: 62, avgWait: 8, revenue: 580000 },
  { name: 'Neurology', patientsPerDay: 28, avgWait: 16, revenue: 1540000 },
  { name: 'Oncology', patientsPerDay: 22, avgWait: 12, revenue: 1320000 },
  { name: 'Pediatrics', patientsPerDay: 42, avgWait: 10, revenue: 760000 },
  { name: 'Pulmonology', patientsPerDay: 30, avgWait: 15, revenue: 980000 },
  { name: 'Internal Medicine', patientsPerDay: 55, avgWait: 20, revenue: 650000 },
]

const aiRecommendations = [
  {
    id: 1,
    title: 'Schedule urgent follow-up for Sunita Devi',
    description: 'Risk score 85 with deteriorating vitals. BP trending upward over last 3 visits. Recommend endocrinology consult within 48 hours.',
    priority: 'High' as const,
    impact: 'Prevent potential diabetic crisis',
  },
  {
    id: 2,
    title: 'Initiate care coordination for Amit Singh',
    description: 'Post-CABG patient with risk score 78. Cardiac rehab adherence at 60%. Assign dedicated care coordinator to improve outcomes.',
    priority: 'High' as const,
    impact: 'Reduce readmission risk by 35%',
  },
  {
    id: 3,
    title: 'Medication review for Rajesh Kumar',
    description: 'Risk score 62, on 3 concurrent medications. Potential interaction flagged between Metformin and new renal function results.',
    priority: 'Medium' as const,
    impact: 'Optimize treatment efficacy',
  },
  {
    id: 4,
    title: 'Preventive screening campaign',
    description: '12 patients aged 50+ have not completed annual health screening. Automated reminder campaign recommended.',
    priority: 'Low' as const,
    impact: 'Early detection for 8-10% of cohort',
  },
]

const departmentRevenueTable = [
  { name: 'Cardiology', revenue: 2450000, target: 2200000, growth: 8.2 },
  { name: 'Orthopedics', revenue: 1870000, target: 1800000, growth: 5.6 },
  { name: 'Neurology', revenue: 1540000, target: 1600000, growth: -2.1 },
  { name: 'Oncology', revenue: 1320000, target: 1200000, growth: 12.4 },
  { name: 'Pulmonology', revenue: 980000, target: 950000, growth: 3.8 },
  { name: 'Pediatrics', revenue: 760000, target: 700000, growth: 6.1 },
  { name: 'Internal Medicine', revenue: 650000, target: 680000, growth: -1.4 },
  { name: 'Emergency', revenue: 580000, target: 500000, growth: 9.7 },
]

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('risk')

  const sortedPatients = [...demoPatients].sort((a, b) => b.riskScore - a.riskScore)
  const highRisk = demoPatients.filter((p) => p.riskScore >= 70).length
  const mediumRisk = demoPatients.filter((p) => p.riskScore >= 40 && p.riskScore < 70).length
  const lowRisk = demoPatients.filter((p) => p.riskScore < 40).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-powered insights across patients, operations, and revenue
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs tabs={analyticsTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Patient Risk Tab ── */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Distribution Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-l-4 border-l-error">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Risk</p>
                  <p className="mt-1 text-3xl font-bold text-error">{highRisk}</p>
                  <p className="mt-1 text-xs text-gray-400">Score &ge; 70</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
                  <AlertTriangle className="h-6 w-6 text-error" />
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medium Risk</p>
                  <p className="mt-1 text-3xl font-bold text-warning">{mediumRisk}</p>
                  <p className="mt-1 text-xs text-gray-400">Score 40-69</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                  <Activity className="h-6 w-6 text-warning" />
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Risk</p>
                  <p className="mt-1 text-3xl font-bold text-success">{lowRisk}</p>
                  <p className="mt-1 text-xs text-gray-400">Score &lt; 40</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <ThumbsUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </Card>
          </div>

          {/* Risk Stratification Table */}
          <Card
            padding="none"
            header={
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Risk Stratification
              </h3>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Patient</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Age</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Risk Score</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Conditions</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Insurance</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {sortedPatients.map((patient, idx) => (
                    <tr
                      key={patient.id}
                      className={cn(
                        'transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                        idx % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]'
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {patient.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                        {patient.age}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={cn('text-sm font-bold', getRiskColor(patient.riskScore))}>
                          {patient.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {patient.conditions.length > 0
                            ? patient.conditions.slice(0, 2).map((c) => (
                                <Badge key={c} size="sm" variant="neutral">
                                  {c}
                                </Badge>
                              ))
                            : <span className="text-xs text-gray-400">None</span>
                          }
                          {patient.conditions.length > 2 && (
                            <Badge size="sm" variant="neutral">
                              +{patient.conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                        {patient.insuranceType}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Churn Prediction Chart */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Churn Prediction (AI Model)
                </h3>
              </div>
            }
          >
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Predicted patient churn rate declining with proactive interventions
            </p>
            <Chart
              type="line"
              data={chartData.churnData as Record<string, unknown>[]}
              dataKeys={['rate']}
              xAxisKey="name"
              height={280}
            />
          </Card>

          {/* AI Recommendations */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  AI Recommendations
                </h3>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                    rec.priority === 'High'
                      ? 'border-error/30 bg-error/5'
                      : rec.priority === 'Medium'
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-border dark:border-border-dark'
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {rec.title}
                    </h4>
                    <Badge
                      variant={
                        rec.priority === 'High' ? 'error' : rec.priority === 'Medium' ? 'warning' : 'neutral'
                      }
                      size="sm"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                    {rec.description}
                  </p>
                  <p className="text-xs font-medium text-primary">
                    Impact: {rec.impact}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Operations Tab ── */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Operations KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Avg Wait Time"
              value="12 min"
              change={-6.2}
              changeLabel="vs last week"
              icon={<Clock className="h-5 w-5" />}
            />
            <Stat
              label="Bed Occupancy"
              value="84%"
              change={2.1}
              changeLabel="vs last week"
              icon={<BedDouble className="h-5 w-5" />}
            />
            <Stat
              label="Staff Utilization"
              value="78%"
              change={4.5}
              changeLabel="vs last week"
              icon={<Users className="h-5 w-5" />}
            />
            <Stat
              label="Avg Turnaround"
              value="45 min"
              change={-3.8}
              changeLabel="faster"
              icon={<Activity className="h-5 w-5" />}
            />
          </div>

          {/* Department Metrics Table */}
          <Card
            padding="none"
            header={
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Department Performance
              </h3>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Patients/Day</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Wait (min)</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {departmentMetrics.map((dept, idx) => (
                    <tr
                      key={dept.name}
                      className={cn(
                        'transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                        idx % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]'
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {dept.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                        {dept.patientsPerDay}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={cn(
                          'font-medium',
                          dept.avgWait > 15 ? 'text-error' : dept.avgWait > 10 ? 'text-warning' : 'text-success'
                        )}>
                          {dept.avgWait} min
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(dept.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bed Occupancy Chart */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Bed Occupancy by Ward
                </h3>
              </div>
            }
          >
            <Chart
              type="bar"
              data={chartData.bedOccupancy as Record<string, unknown>[]}
              dataKeys={['occupied', 'total']}
              xAxisKey="name"
              height={320}
            />
          </Card>
        </div>
      )}

      {/* ── Satisfaction Tab ── */}
      {activeTab === 'satisfaction' && (
        <div className="space-y-6">
          {/* NPS Score and Sentiment */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* NPS Score */}
            <Card>
              <div className="flex flex-col items-center py-6">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Net Promoter Score
                </p>
                <div className="relative mt-4 flex h-40 w-40 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={`${(78 / 100) * 314} 314`}
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute text-4xl font-bold text-gray-900 dark:text-gray-100">
                    78
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="success" size="md">Excellent</Badge>
                  <span className="text-xs text-gray-400">Industry avg: 42</span>
                </div>
              </div>
            </Card>

            {/* Sentiment Breakdown */}
            <Card
              header={
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Patient Sentiment
                </h3>
              }
            >
              <div className="space-y-6 py-4">
                {/* Positive */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <Smile className="h-5 w-5 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Positive</span>
                      <span className="text-sm font-bold text-success">65%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-2.5 rounded-full bg-success" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>

                {/* Neutral */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
                    <Meh className="h-5 w-5 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Neutral</span>
                      <span className="text-sm font-bold text-warning">22%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-2.5 rounded-full bg-warning" style={{ width: '22%' }} />
                    </div>
                  </div>
                </div>

                {/* Negative */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10">
                    <Frown className="h-5 w-5 text-error" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Negative</span>
                      <span className="text-sm font-bold text-error">13%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-2.5 rounded-full bg-error" style={{ width: '13%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Department Satisfaction */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Department Satisfaction Scores
                </h3>
              </div>
            }
          >
            <Chart
              type="bar"
              data={chartData.departmentSatisfaction as Record<string, unknown>[]}
              dataKeys={['score']}
              xAxisKey="name"
              height={300}
            />
          </Card>

          {/* Recent Feedback */}
          <Card
            header={
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recent Patient Feedback
              </h3>
            }
          >
            <div className="space-y-4">
              {feedbackItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border p-4 dark:border-border-dark"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < item.rating
                              ? 'fill-warning text-warning'
                              : 'text-gray-200 dark:text-gray-600'
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">{item.department}</Badge>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {item.comment}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Revenue Tab ── */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              label="Total Revenue"
              value="₹8.4 Cr"
              change={5.2}
              changeLabel="MoM"
              icon={<IndianRupee className="h-5 w-5" />}
            />
            <Stat
              label="Claims Realization"
              value="91%"
              change={2.8}
              changeLabel="vs last month"
              icon={<Target className="h-5 w-5" />}
            />
            <Stat
              label="MoM Growth"
              value="4.2%"
              change={1.1}
              changeLabel="accelerating"
              icon={<ArrowUpRight className="h-5 w-5" />}
            />
          </div>

          {/* Revenue vs Target Chart */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Revenue vs Target
                </h3>
              </div>
            }
          >
            <Chart
              type="area"
              data={chartData.revenueByMonth as Record<string, unknown>[]}
              dataKeys={['revenue', 'target']}
              xAxisKey="name"
              height={320}
            />
          </Card>

          {/* Revenue by Payer */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Revenue by Payer
                </h3>
              </div>
            }
          >
            <Chart
              type="bar"
              data={chartData.payerMix as Record<string, unknown>[]}
              dataKeys={['revenue']}
              xAxisKey="name"
              height={300}
            />
          </Card>

          {/* Department Revenue Table */}
          <Card
            padding="none"
            header={
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Department Revenue Comparison
              </h3>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Revenue</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Target</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Achievement</th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {departmentRevenueTable.map((dept, idx) => {
                    const achievement = Math.round((dept.revenue / dept.target) * 100)
                    return (
                      <tr
                        key={dept.name}
                        className={cn(
                          'transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                          idx % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]'
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {dept.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(dept.revenue)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                          {formatCurrency(dept.target)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-gray-700">
                              <div
                                className={cn(
                                  'h-2 rounded-full',
                                  achievement >= 100 ? 'bg-success' : achievement >= 90 ? 'bg-warning' : 'bg-error'
                                )}
                                style={{ width: `${Math.min(achievement, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {achievement}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={cn(
                            'text-sm font-medium',
                            dept.growth >= 0 ? 'text-success' : 'text-error'
                          )}>
                            {dept.growth >= 0 ? '+' : ''}{dept.growth}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
