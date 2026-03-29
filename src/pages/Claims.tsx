import { useState, useMemo } from 'react'
import type { ClaimStatus } from '../types'
import {
  FileCheck,
  Plus,
  LayoutList,
  Kanban,
  Clock,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Chart } from '../components/ui/Chart'
import { Button } from '../components/ui/Button'
import { demoClaims, chartData } from '../lib/mock-data'
import { cn, formatCurrency, formatDate, getStatusColor } from '../lib/utils'

type ViewMode = 'table' | 'kanban'

const statusFilters: ('All' | ClaimStatus)[] = [
  'All',
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Paid',
]

const kanbanColumns: ClaimStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Paid',
]

export default function Claims() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [activeFilter, setActiveFilter] = useState<'All' | ClaimStatus>('All')

  const filteredClaims = useMemo(() => {
    if (activeFilter === 'All') return demoClaims
    return demoClaims.filter((c) => c.status === activeFilter)
  }, [activeFilter])

  const kanbanData = useMemo(() => {
    const grouped: Record<ClaimStatus, typeof demoClaims> = {
      Draft: [],
      Submitted: [],
      'Under Review': [],
      Approved: [],
      Rejected: [],
      Paid: [],
    }
    for (const claim of demoClaims) {
      grouped[claim.status].push(claim)
    }
    return grouped
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              SmartClaims Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered claims lifecycle management
            </p>
          </div>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>New Claim</Button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total Claims"
          value="1,247"
          change={12.5}
          changeLabel="vs last month"
          icon={<FileCheck className="h-5 w-5" />}
        />
        <Stat
          label="Approval Rate"
          value="87.3%"
          change={3.2}
          changeLabel="vs last month"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <Stat
          label="Avg Processing Time"
          value="2.4 days"
          change={-8.1}
          changeLabel="faster"
          icon={<Clock className="h-5 w-5" />}
        />
        <Stat
          label="Pending Amount"
          value="₹1.23 Cr"
          change={-5.4}
          changeLabel="vs last month"
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('table')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            viewMode === 'table'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
          )}
        >
          <LayoutList className="h-4 w-4" />
          Table View
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            viewMode === 'kanban'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
          )}
        >
          <Kanban className="h-4 w-4" />
          Kanban View
        </button>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding="none">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 border-b border-border px-5 py-4 dark:border-border-dark">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  activeFilter === filter
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
                )}
              >
                {filter}
                {filter !== 'All' && (
                  <span className="ml-1.5 opacity-70">
                    ({demoClaims.filter((c) => c.status === filter).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Claims Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Claim ID
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Patient
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Department
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Payer
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {filteredClaims.map((claim, idx) => (
                  <tr
                    key={claim.id}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                      idx % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]'
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-primary">
                      {claim.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {claim.patientName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {claim.department}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {claim.payer}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant={getStatusColor(claim.status)} dot>
                        {claim.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(claim.submittedDate)}
                    </td>
                  </tr>
                ))}
                {filteredClaims.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                    >
                      No claims found for this filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kanbanColumns.map((status) => {
            const claims = kanbanData[status]
            return (
              <div key={status} className="flex flex-col">
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(status)} size="md" dot>
                      {status}
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {claims.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex flex-col gap-3">
                  {claims.map((claim) => (
                    <Card
                      key={claim.id}
                      padding="sm"
                      className="cursor-pointer transition-shadow hover:shadow-md"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary">
                          {claim.id}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {claim.patientName}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(claim.amount)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {claim.payer}
                        </p>
                      </div>
                    </Card>
                  ))}
                  {claims.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-gray-400 dark:border-border-dark dark:text-gray-500">
                      No claims
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          header={
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Claims by Payer
              </h3>
            </div>
          }
        >
          <Chart
            type="pie"
            data={chartData.payerMix as Record<string, unknown>[]}
            dataKeys={['value']}
            xAxisKey="name"
            height={320}
          />
        </Card>

        <Card
          header={
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Claims Trend
              </h3>
            </div>
          }
        >
          <Chart
            type="bar"
            data={chartData.claimsTrend as Record<string, unknown>[]}
            dataKeys={['submitted', 'approved']}
            xAxisKey="name"
            height={320}
          />
        </Card>
      </div>
    </div>
  )
}
