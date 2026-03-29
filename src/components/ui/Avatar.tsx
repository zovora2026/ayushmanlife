import { cn, getInitials } from '../../lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary font-semibold text-white',
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
