import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  trend?: string
  icon?: ReactNode
  className?: string
}

export function Stat({
  label,
  value,
  change,
  changeLabel,
  icon,
  className,
}: StatProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        {icon && (
          <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && (
            <TrendingUp className="h-4 w-4 text-success" />
          )}
          {isNegative && (
            <TrendingDown className="h-4 w-4 text-error" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              isPositive && 'text-success',
              isNegative && 'text-error'
            )}
          >
            {isPositive ? '+' : ''}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
