import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              'dark:border-border-dark dark:bg-surface-dark dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-primary dark:focus:ring-primary/30',
              icon && 'pl-10',
              error &&
                'border-error focus:border-error focus:ring-error/20 dark:border-error dark:focus:border-error dark:focus:ring-error/30',
              props.disabled && 'cursor-not-allowed bg-gray-50 opacity-60 dark:bg-gray-800',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
