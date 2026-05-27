import { cn } from '@/utils/cn'

interface IconProps {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
  label?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

export function Icon({ icon, size = 'md', className, label }: IconProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center', sizeMap[size], className)}
      aria-label={label}
      aria-hidden={!label}
      role={label ? 'img' : undefined}
    >
      {icon}
    </span>
  )
}