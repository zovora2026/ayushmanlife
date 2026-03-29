import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  padding?: CardPadding
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export function Card({
  children,
  className,
  header,
  footer,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white shadow-sm dark:border-border-dark dark:bg-surface-dark',
        className
      )}
    >
      {header && (
        <div className="border-b border-border px-5 py-4 dark:border-border-dark">
          {header}
        </div>
      )}
      <div className={cn(paddingStyles[padding])}>{children}</div>
      {footer && (
        <div className="border-t border-border px-5 py-4 dark:border-border-dark">
          {footer}
        </div>
      )}
    </div>
  )
}
