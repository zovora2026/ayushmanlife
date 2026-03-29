import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  size?: BadgeSize
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    'bg-success/10 text-success dark:bg-success/20 dark:text-success',
  warning:
    'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
  error:
    'bg-error/10 text-error dark:bg-error/20 dark:text-error',
  info:
    'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent',
  neutral:
    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-accent',
  neutral: 'bg-gray-400 dark:bg-gray-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({
  variant = 'neutral',
  children,
  size = 'sm',
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotStyles[variant])}
        />
      )}
      {children}
    </span>
  )
}
