import { type FC } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { differenceInCalendarMonths } from 'date-fns'
import { PERIOD_LABELS } from '@/hooks/useReportData'
import { cn } from '@/utils/cn'
import type { ReportPeriod } from '@/types'

const PERIODS: ReportPeriod[] = ['weekly', 'biweekly', 'monthly', 'yearly']

interface Props {
  period:         ReportPeriod
  offset:         number
  intervalLabel:  string
  onPeriodChange: (p: ReportPeriod) => void
  onOffsetChange: (o: number) => void
}

export const ReportPeriodSelector: FC<Props> = ({
  period, offset, intervalLabel, onPeriodChange, onOffsetChange,
}) => {
  function handlePeriodChange(p: ReportPeriod) {
    onPeriodChange(p)
    onOffsetChange(0)
  }

  function handleMonthPick(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return
    const [y, m] = e.target.value.split('-').map(Number)
    const picked = new Date(y, m - 1, 1)
    onOffsetChange(Math.max(0, differenceInCalendarMonths(new Date(), picked)))
  }

  function handleYearPick(e: React.ChangeEvent<HTMLInputElement>) {
    const year = Number(e.target.value)
    if (!year) return
    onOffsetChange(Math.max(0, new Date().getFullYear() - year))
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

      {/* Tipo de período */}
      <div className="flex bg-slate-100 rounded-xl p-1" role="group" aria-label="Selecionar tipo de período">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            aria-pressed={period === p}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              period === p ? 'bg-white text-dark shadow-sm' : 'text-light hover:text-mid'
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Navegação + seletor customizado */}
      <div className="flex items-center gap-2">
        {period === 'monthly' && (
          <input
            type="month"
            onChange={handleMonthPick}
            aria-label="Selecionar mês e ano"
            className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-mid focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
        {period === 'yearly' && (
          <input
            type="number"
            placeholder="Ano"
            min="2000"
            max={new Date().getFullYear()}
            onChange={handleYearPick}
            aria-label="Selecionar ano"
            className="w-20 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-mid focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
          <button
            onClick={() => onOffsetChange(offset + 1)}
            aria-label="Período anterior"
            className="p-1 rounded-lg text-light hover:text-dark hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-dark px-2 capitalize min-w-[140px] text-center">
            {intervalLabel}
          </span>
          <button
            onClick={() => onOffsetChange(Math.max(0, offset - 1))}
            disabled={offset === 0}
            aria-label="Próximo período"
            className="p-1 rounded-lg text-light hover:text-dark hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
