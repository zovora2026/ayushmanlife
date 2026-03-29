import { cn } from '../../lib/utils'

type ProgressSize = 'sm' | 'md' | 'lg'

interface ProgressProps {
  value: number
  size?: ProgressSize
  color?: string
  label?: string
  showValue?: boolean
  className?: string
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function Progress({
  value,
  size = 'md',
  color,
  label,
  showValue,
  className,
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            !color && 'bg-primary'
          )}
          style={{
            width: `${clampedValue}%`,
            ...(color ? { backgroundColor: color } : {}),
          }}
        />
      </div>
    </div>
  )
}
