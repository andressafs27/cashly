import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-semibold',
  {
    variants: {
      variant: {
        income:  'bg-green-100 text-green-700',
        expense: 'bg-red-100 text-red-700',
        neutral: 'bg-slate-100 text-slate-600',
        warning: 'bg-yellow-100 text-yellow-700',
        primary: 'bg-blue-100 text-blue-700',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </span>
  )
}