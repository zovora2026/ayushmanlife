import { useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import { cn } from '../../lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

const typeConfig: Record<
  ToastType,
  { borderColor: string; icon: typeof CheckCircle; iconColor: string }
> = {
  success: {
    borderColor: 'border-l-success',
    icon: CheckCircle,
    iconColor: 'text-success',
  },
  error: {
    borderColor: 'border-l-error',
    icon: XCircle,
    iconColor: 'text-error',
  },
  warning: {
    borderColor: 'border-l-warning',
    icon: AlertTriangle,
    iconColor: 'text-warning',
  },
  info: {
    borderColor: 'border-l-accent',
    icon: Info,
    iconColor: 'text-accent',
  },
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border bg-white dark:bg-surface-dark px-4 py-3 shadow-lg',
        'border-l-4 dark:border-border-dark dark:bg-surface-dark',
        config.borderColor
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} />
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        {message}
      </p>
      <button
        onClick={onClose}
        className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
