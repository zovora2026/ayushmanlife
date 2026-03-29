import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 dark:bg-primary dark:hover:bg-primary/90',
  secondary:
    'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/90',
  outline:
    'border border-border bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-border-dark dark:text-gray-200 dark:hover:bg-white/5 dark:active:bg-white/10',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-white/10 dark:active:bg-white/15',
  danger:
    'bg-error text-white hover:bg-error/90 active:bg-error/80 dark:bg-error dark:hover:bg-error/90',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  loading,
  icon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
