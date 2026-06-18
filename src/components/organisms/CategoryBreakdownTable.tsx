import type { FC } from 'react'
import { TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { EmptyState } from '@/components/molecules/EmptyState'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { Category } from '@/types'

export interface BreakdownRow {
  category:   Category
  total:      number
  percentage: number
  variation:  number | null
}

interface Props {
  data: BreakdownRow[]
}

export const CategoryBreakdownTable: FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nenhuma despesa no período"
        description="Não há gastos registrados no período selecionado."
      />
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="text-left text-light text-xs border-b border-slate-100 dark:border-slate-700">
            <th className="font-medium pb-2 pl-1">Categoria</th>
            <th className="font-medium pb-2 text-right">Total</th>
            <th className="font-medium pb-2 text-right">% do total</th>
            <th className="font-medium pb-2 text-right pr-1">Variação</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ category, total, percentage, variation }) => {
            const Icon = getCategoryIcon(category.icon)
            const isIncrease = variation !== null && variation > 0
            return (
              <tr key={category.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60/60 transition-colors">
                <td className="py-2.5 pl-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${category.color}18` }}
                    >
                      <Icon size={13} style={{ color: category.color }} aria-hidden="true" />
                    </div>
                    <span className="text-dark font-medium truncate">{category.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right text-dark font-semibold tabular-nums">{formatCurrency(total)}</td>
                <td className="py-2.5 text-right text-mid tabular-nums">{percentage.toFixed(1)}%</td>
                <td className="py-2.5 text-right pr-1 tabular-nums">
                  {variation === null ? (
                    <span className="text-light text-xs">—</span>
                  ) : (
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold',
                      isIncrease ? 'text-danger' : 'text-accent'
                    )}>
                      {isIncrease ? <TrendingUp size={11} aria-hidden="true" /> : <TrendingDown size={11} aria-hidden="true" />}
                      {Math.abs(variation).toFixed(0)}%
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
