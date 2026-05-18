import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/atoms'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-light" />
    </div>
    <h3 className="text-dark font-semibold text-lg mb-2">{title}</h3>
    <p className="text-light text-sm max-w-xs mb-6">{description}</p>
    {action && (
      <Button onClick={action.onClick} size="md">
        {action.label}
      </Button>
    )}
  </div>
)
