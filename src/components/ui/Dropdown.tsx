import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label?: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
}: DropdownProps) {
  const selectId = label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-lg border border-border bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 transition-all duration-200',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'dark:border-border-dark dark:bg-surface-dark dark:text-gray-100 dark:focus:border-primary dark:focus:ring-primary/30',
            !value && 'text-gray-400 dark:text-gray-500'
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  )
}
