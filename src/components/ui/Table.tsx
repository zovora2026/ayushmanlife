import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Column<T> {
  key: string
  label: string
  render?: (item: T, index: number) => ReactNode
  sortable?: boolean
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  className?: string
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: string) {
    const newDirection =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)
    onSort?.(key, newDirection)
  }

  function renderSortIcon(col: Column<T>) {
    if (!col.sortable) return null
    if (sortKey !== col.key) {
      return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-border dark:border-border-dark',
        className
      )}
    >
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-50 dark:border-border-dark dark:bg-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
                  col.sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200'
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                {col.label}
                {renderSortIcon(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-border-dark">
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                rowIndex % 2 === 1 && 'bg-gray-50/50 dark:bg-white/[0.02]'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300"
                >
                  {col.render
                    ? col.render(item, rowIndex)
                    : (item[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
