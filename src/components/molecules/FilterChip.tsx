import type { FC } from 'react'
import { X } from 'lucide-react'

interface FilterChipProps {
  label: string
  color?: string
  onRemove: () => void
}

export const FilterChip: FC<FilterChipProps> = ({ label, color, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-mid shadow-sm">
    {color && (
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
    )}
    {label}
    <button
      onClick={onRemove}
      aria-label={`Remover filtro ${label}`}
      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-100 text-light hover:text-dark transition-colors ml-0.5"
    >
      <X size={10} strokeWidth={2.5} />
    </button>
  </span>
)
