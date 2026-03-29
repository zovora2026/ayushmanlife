import { useState, useMemo } from 'react'
import {
  Building2,
  FileCheck,
  Shield,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Users,
  CircleDollarSign,
  ClipboardList,
  Search as SearchIcon,
  Star,
  CheckCircle2,
  XCircle,
  Brain,
} from 'lucide-react'
import { cn, formatCurrency, formatDate, getRiskColor } from '../lib/utils'
import { demoPolicies, demoFraudAlerts, demoClaims, chartData } from '../lib/mock-data'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { Table } from '../components/ui/Table'
import { Chart } from '../components/ui/Chart'
import type { Policy, FraudAlert } from '../types'

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
  { id: 'policies', label: 'Policy Manager', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'adjudication', label: 'Claims Adjudication', icon: <FileCheck className="h-4 w-4" /> },
  { id: 'tpa', label: 'TPA Management', icon: <Users className="h-4 w-4" /> },
  { id: 'fraud', label: 'Fraud Detection', icon: <Shield className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
]

const PAYER_SCHEMES_FILTER = ['All', 'Ayushman Bharat - PMJAY', 'CGHS', 'ECHS', 'ESI', 'Star Health Insurance', 'HDFC ERGO', 'ICICI Lombard', 'Max Bupa', 'New India Assurance'] as const

function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'Active': return 'success'
    case 'Expired': return 'error'
    case 'Lapsed': return 'warning'
    case 'Pending': return 'info'
    default: return 'neutral'
  }
}

function getFraudStatusVariant(status: string): 'warning' | 'error' | 'success' {
  switch (status) {
    case 'Under Investigation': return 'warning'
    case 'Confirmed': return 'error'
    case 'Cleared': return 'success'
    default: return 'warning'
  }
}

function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-success'
  if (score >= 70) return 'text-warning'
  return 'text-error'
}

function getScoreColor(score: number): string {
  if (score >= 4) return 'text-success'
  if (score >= 3) return 'text-warning'
  return 'text-error'
}

// Kanban data derived from demoClaims
const KANBAN_COLUMNS = ['Received', 'Adjudicated', 'Approved', 'Settled', 'Denied'] as const

function mapClaimToKanban() {
  const columns: Record<string, typeof demoClaims> = {
    Received: [],
    Adjudicated: [],
    Approved: [],
    Settled: [],
    Denied: [],
  }

  demoClaims.forEach((claim) => {
    switch (claim.status) {
      case 'Submitted':
        columns.Received.push(claim)
        break
      case 'Under Review':
        columns.Adjudicated.push(claim)
        break
      case 'Approved':
        columns.Approved.push(claim)
        break
      case 'Paid':
        columns.Settled.push(claim)
        break
      case 'Rejected':
        columns.Denied.push(claim)
        break
      default:
        columns.Received.push(claim)
    }
  })

  return columns
}

// TPA data
const TPA_DATA = [
  { name: 'MedAssist TPA', hospitals: 142, score: 4.5, activeClaims: 68, status: 'Active' },
  { name: 'HealthBridge Services', hospitals: 98, score: 3.8, activeClaims: 45, status: 'Active' },
  { name: 'VitalCare TPA', hospitals: 210, score: 4.2, activeClaims: 87, status: 'Active' },
  { name: 'PrimeCare Network', hospitals: 76, score: 3.2, activeClaims: 32, status: 'Active' },
  { name: 'SafeGuard Health', hospitals: 165, score: 4.7, activeClaims: 56, status: 'Active' },
  { name: 'MediConnect TPA', hospitals: 54, score: 2.9, activeClaims: 19, status: 'Under Review' },
]

// High-cost claimants
const HIGH_COST_CLAIMANTS = [
  { name: 'Rajesh Khanna', totalClaims: 3, totalAmount: 820000, scheme: 'Ayushman Bharat - PMJAY' },
  { name: 'Suresh Yadav', totalClaims: 2, totalAmount: 645000, scheme: 'Max Bupa' },
  { name: 'Mohammed Ali', totalClaims: 1, totalAmount: 450000, scheme: 'Star Health Insurance' },
  { name: 'Arjun Malhotra', totalClaims: 1, totalAmount: 125000, scheme: 'ICICI Lombard' },
  { name: 'Anita Kumari', totalClaims: 1, totalAmount: 85000, scheme: 'Ayushman Bharat - PMJAY' },
]

const KANBAN_COLUMN_COLORS: Record<string, string> = {
  Received: 'bg-blue-50 dark:bg-blue-900/10',
  Adjudicated: 'bg-amber-50 dark:bg-amber-900/10',
  Approved: 'bg-emerald-50 dark:bg-emerald-900/10',
  Settled: 'bg-teal-50 dark:bg-teal-900/10',
  Denied: 'bg-red-50 dark:bg-red-900/10',
}

const KANBAN_HEADER_COLORS: Record<string, string> = {
  Received: 'text-blue-700 dark:text-blue-400',
  Adjudicated: 'text-amber-700 dark:text-amber-400',
  Approved: 'text-emerald-700 dark:text-emerald-400',
  Settled: 'text-teal-700 dark:text-teal-400',
  Denied: 'text-red-700 dark:text-red-400',
}

export default function Payer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [schemeFilter, setSchemeFilter] = useState('All')

  const filteredPolicies = useMemo(
    () =>
      schemeFilter === 'All'
        ? demoPolicies
        : demoPolicies.filter((p) => p.scheme === schemeFilter),
    [schemeFilter]
  )

  const statusCounts = useMemo(() => {
    const counts = { Active: 0, Expired: 0, Lapsed: 0, Pending: 0 }
    demoPolicies.forEach((p) => {
      if (p.status in counts) counts[p.status as keyof typeof counts]++
    })
    return counts
  }, [])

  const kanbanColumns = useMemo(() => mapClaimToKanban(), [])

  const recentClaims = demoClaims.slice(0, 5)

  const totalFraudSavings = 4500000

  const policyColumns = [
    { key: 'policyNumber', label: 'Policy Number', render: (item: Record<string, unknown>) => (
      <span className="font-mono text-xs">{item.policyNumber as string}</span>
    ) },
    { key: 'scheme', label: 'Scheme' },
    { key: 'beneficiaryName', label: 'Beneficiary' },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge variant={getStatusVariant(item.status as string)} dot>
          {item.status as string}
        </Badge>
      ),
    },
    {
      key: 'sumInsured',
      label: 'Sum Insured',
      sortable: true,
      render: (item: Record<string, unknown>) => formatCurrency(item.sumInsured as number),
    },
    {
      key: 'premium',
      label: 'Premium',
      render: (item: Record<string, unknown>) =>
        (item.premium as number) === 0 ? (
          <span className="text-gray-400 dark:text-gray-500">Govt. Funded</span>
        ) : (
          formatCurrency(item.premium as number)
        ),
    },
    { key: 'claimsCount', label: 'Claims' },
  ]

  const tpaColumns = [
    { key: 'name', label: 'TPA Name', render: (item: Record<string, unknown>) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name as string}</span>
    ) },
    { key: 'hospitals', label: 'Empanelled Hospitals' },
    {
      key: 'score',
      label: 'Performance Score',
      sortable: true,
      render: (item: Record<string, unknown>) => {
        const score = item.score as number
        return (
          <div className="flex items-center gap-1.5">
            <Star className={cn('h-4 w-4', getScoreColor(score))} fill="currentColor" />
            <span className={cn('font-semibold', getScoreColor(score))}>{score.toFixed(1)}</span>
            <span className="text-gray-400 dark:text-gray-500">/ 5</span>
          </div>
        )
      },
    },
    { key: 'activeClaims', label: 'Active Claims' },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge
          variant={(item.status as string) === 'Active' ? 'success' : 'warning'}
          dot
        >
          {item.status as string}
        </Badge>
      ),
    },
  ]

  const highCostColumns = [
    { key: 'name', label: 'Patient Name', render: (item: Record<string, unknown>) => (
      <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name as string}</span>
    ) },
    { key: 'totalClaims', label: 'Total Claims' },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (item: Record<string, unknown>) => (
        <span className="font-semibold">{formatCurrency(item.totalAmount as number)}</span>
      ),
    },
    { key: 'scheme', label: 'Scheme' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Payer & Insurance Platform
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Policy management, claims adjudication, TPA oversight, and fraud analytics
        </p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Overview ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total Policies"
              value="2,450"
              change={5.2}
              changeLabel="vs last month"
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <Stat
              label="Active Claims"
              value={342}
              change={12}
              changeLabel="vs last month"
              icon={<FileCheck className="h-5 w-5" />}
            />
            <Stat
              label="Settlement Ratio"
              value="91.3%"
              change={2.1}
              changeLabel="vs last month"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <Stat
              label="Fraud Flags"
              value={8}
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              header={
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Portfolio by Scheme
                </h3>
              }
            >
              <Chart
                type="pie"
                data={chartData.portfolioByScheme}
                dataKeys={['value']}
                xAxisKey="name"
                height={280}
              />
            </Card>

            <Card
              header={
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Recent Claims Activity
                </h3>
              }
            >
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 dark:border-border-dark"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{claim.id}</span>
                        <Badge variant={getStatusVariant(claim.status)} size="sm">
                          {claim.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {claim.patientName} -- {claim.diagnosis}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(claim.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Policy Manager ────────────────────────────────────────── */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Active" value={statusCounts.Active} icon={<CheckCircle2 className="h-5 w-5" />} />
            <Stat label="Expired" value={statusCounts.Expired} icon={<XCircle className="h-5 w-5" />} />
            <Stat label="Lapsed" value={statusCounts.Lapsed} icon={<AlertTriangle className="h-5 w-5" />} />
            <Stat label="Pending" value={statusCounts.Pending} icon={<ClipboardList className="h-5 w-5" />} />
          </div>

          <div className="flex flex-wrap gap-2">
            {PAYER_SCHEMES_FILTER.map((scheme) => (
              <button
                key={scheme}
                onClick={() => setSchemeFilter(scheme)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  schemeFilter === scheme
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                )}
              >
                {scheme}
              </button>
            ))}
          </div>

          <Table
            columns={policyColumns}
            data={filteredPolicies as unknown as Record<string, unknown>[]}
          />
        </div>
      )}

      {/* ── Claims Adjudication ───────────────────────────────────── */}
      {activeTab === 'adjudication' && (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Stat
              label="Auto-Adjudication Rate"
              value="72%"
              change={4.5}
              changeLabel="vs last month"
              icon={<Brain className="h-5 w-5" />}
              className="max-w-xs"
            />
          </div>

          <div className="grid grid-cols-5 gap-3">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col}>
                <div
                  className={cn(
                    'mb-2 rounded-lg px-3 py-2 text-center',
                    KANBAN_COLUMN_COLORS[col]
                  )}
                >
                  <p className={cn('text-sm font-semibold', KANBAN_HEADER_COLORS[col])}>
                    {col}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {kanbanColumns[col].length} claim{kanbanColumns[col].length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  {kanbanColumns[col].map((claim) => (
                    <Card key={claim.id} padding="sm" className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                          {claim.id}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(claim.amount)}
                      </p>
                      <p className="mt-0.5 truncate text-gray-500 dark:text-gray-400">
                        {claim.payer}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">AI Confidence</span>
                        <span
                          className={cn(
                            'ml-auto font-bold',
                            getConfidenceColor(claim.preAuthProbability)
                          )}
                        >
                          {claim.preAuthProbability}%
                        </span>
                      </div>
                    </Card>
                  ))}
                  {kanbanColumns[col].length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-gray-400 dark:border-border-dark dark:text-gray-500">
                      No claims
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TPA Management ────────────────────────────────────────── */}
      {activeTab === 'tpa' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            TPA Directory
          </h2>
          <Table
            columns={tpaColumns}
            data={TPA_DATA as unknown as Record<string, unknown>[]}
          />
        </div>
      )}

      {/* ── Fraud Detection ───────────────────────────────────────── */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Total Alerts" value={8} icon={<AlertTriangle className="h-5 w-5" />} />
            <Stat label="Under Investigation" value={4} icon={<SearchIcon className="h-5 w-5" />} />
            <Stat label="Confirmed" value={2} icon={<XCircle className="h-5 w-5" />} />
            <Stat label="Cleared" value={2} icon={<CheckCircle2 className="h-5 w-5" />} />
            <Stat
              label="Total Savings"
              value={formatCurrency(totalFraudSavings)}
              icon={<CircleDollarSign className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoFraudAlerts.map((alert) => (
              <Card key={alert.id} className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                      {alert.id} / {alert.claimId}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                      {alert.anomalyType}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-lg font-bold',
                        getRiskColor(alert.riskScore)
                      )}
                    >
                      {alert.riskScore}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Risk Score</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Provider: <span className="font-medium text-gray-900 dark:text-gray-100">{alert.provider}</span></p>
                  <p>Amount: <span className="font-semibold">{formatCurrency(alert.amount)}</span></p>
                  <p>Detected: {formatDate(alert.detectedDate)}</p>
                </div>
                <div className="mt-3">
                  <Badge variant={getFraudStatusVariant(alert.status)} dot>
                    {alert.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <Card
            header={
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Fraud Savings Trend (in Lakhs)
              </h3>
            }
          >
            <Chart
              type="bar"
              data={chartData.fraudSavings}
              dataKeys={['savings']}
              xAxisKey="name"
              height={280}
              colors={['#10B981']}
            />
          </Card>
        </div>
      )}

      {/* ── Analytics ─────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              header={
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Loss Ratio Trend (%)
                </h3>
              }
            >
              <Chart
                type="line"
                data={chartData.lossRatio}
                dataKeys={['ratio']}
                xAxisKey="name"
                height={280}
                colors={['#EF4444']}
              />
            </Card>

            <Card
              header={
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Claims by Scheme
                </h3>
              }
            >
              <Chart
                type="bar"
                data={chartData.claimsByScheme}
                dataKeys={['claims']}
                xAxisKey="name"
                height={280}
              />
            </Card>
          </div>

          <Card
            header={
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                High-Cost Claimants (Top 5)
              </h3>
            }
          >
            <Table
              columns={highCostColumns}
              data={HIGH_COST_CLAIMANTS as unknown as Record<string, unknown>[]}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
