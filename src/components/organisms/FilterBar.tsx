import { useRef, useState, useEffect, type FC } from 'react'
import { format, parseISO } from 'date-fns'
import { Search, X, ChevronDown, Tag, CalendarDays, SlidersHorizontal } from 'lucide-react'
import { FilterChip } from '@/components/molecules/FilterChip'
import { useCategoryStore } from '@/store'
import { cn } from '@/utils/cn'
import {
  PERIOD_LABELS,
  type TypeFilter,
  type PeriodFilter,
  type FilterState,
} from '@/hooks/useTransactionFilters'

interface FilterBarProps {
  filters:         FilterState
  searchInput:     string
  setSearchInput:  (v: string) => void
  setType:         (v: TypeFilter) => void
  setPeriod:       (v: PeriodFilter) => void
  setDateFrom:     (v: string) => void
  setDateTo:       (v: string) => void
  toggleCategory:  (id: string) => void
  removeCategory:  (id: string) => void
  clearFilters:    () => void
  isPeriodActive:  boolean
  activeCount:     number
}

const TYPE_OPTIONS: { label: string; value: TypeFilter }[] = [
  { label: 'Todos',    value: 'all'     },
  { label: 'Receitas', value: 'income'  },
  { label: 'Despesas', value: 'expense' },
]

const PERIOD_OPTIONS = Object.keys(PERIOD_LABELS) as PeriodFilter[]

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function getPeriodButtonLabel(filters: FilterState): string {
  if (filters.period === 'custom') {
    if (filters.dateFrom && filters.dateTo) {
      return `${format(parseISO(filters.dateFrom), 'dd/MM')} – ${format(parseISO(filters.dateTo), 'dd/MM')}`
    }
    return 'Personalizado'
  }
  return PERIOD_LABELS[filters.period]
}

function getPeriodChipLabel(filters: FilterState): string {
  if (filters.period === 'custom' && filters.dateFrom && filters.dateTo) {
    return `${format(parseISO(filters.dateFrom), 'dd/MM')} – ${format(parseISO(filters.dateTo), 'dd/MM')}`
  }
  return PERIOD_LABELS[filters.period]
}

export const FilterBar: FC<FilterBarProps> = ({
  filters, searchInput, setSearchInput,
  setType, setPeriod, setDateFrom, setDateTo,
  toggleCategory, removeCategory, clearFilters,
  isPeriodActive, activeCount,
}) => {
  const categories = useCategoryStore((s) => s.categories)
  const [periodOpen, setPeriodOpen]     = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const periodRef   = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  useClickOutside(periodRef,   () => setPeriodOpen(false))
  useClickOutside(categoryRef, () => setCategoryOpen(false))

  const selectedCategories = categories.filter((c) => filters.categoryIds.includes(c.id))
  const customDatesInvalid = filters.period === 'custom' && filters.dateFrom && filters.dateTo
    && filters.dateFrom > filters.dateTo

  return (
    <div className="flex flex-col gap-3">

      {/* ── Busca ── */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 text-light pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar por descrição..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Buscar transações"
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-dark placeholder:text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} aria-label="Limpar busca" className="absolute right-3.5 text-light hover:text-dark transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-2 items-center">

        {/* Período */}
        <div ref={periodRef} className="relative">
          <button
            onClick={() => { setPeriodOpen((o) => !o); setCategoryOpen(false) }}
            aria-expanded={periodOpen}
            aria-haspopup="listbox"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
              isPeriodActive
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-mid border-slate-200 hover:border-slate-300'
            )}
          >
            <CalendarDays size={14} aria-hidden="true" />
            {getPeriodButtonLabel(filters)}
            <ChevronDown size={13} className={cn('transition-transform', periodOpen && 'rotate-180')} aria-hidden="true" />
          </button>

          {periodOpen && (
            <div
              role="listbox"
              aria-label="Selecionar período"
              className="absolute top-full mt-1.5 left-0 z-30 bg-white border border-slate-100 rounded-xl shadow-lg min-w-[220px]"
            >
              {/* Opções de período */}
              <div className="py-1">
                {PERIOD_OPTIONS.map((value) => (
                  <button
                    key={value}
                    role="option"
                    aria-selected={filters.period === value}
                    onClick={() => {
                      setPeriod(value)
                      if (value !== 'custom') setPeriodOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                      filters.period === value
                        ? 'text-primary font-semibold bg-primary/5'
                        : 'text-mid hover:bg-slate-50'
                    )}
                  >
                    {PERIOD_LABELS[value]}
                    {filters.period === value && (
                      <span className="text-primary text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Inputs de data personalizada */}
              {filters.period === 'custom' && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <p className="text-light text-xs font-medium mb-2.5">Intervalo personalizado</p>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label htmlFor="date-from" className="text-xs text-mid mb-1 block">Data início</label>
                      <input
                        id="date-from"
                        type="date"
                        value={filters.dateFrom}
                        max={filters.dateTo || undefined}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className={cn(
                          'w-full border rounded-lg px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
                          customDatesInvalid ? 'border-danger' : 'border-slate-200'
                        )}
                      />
                    </div>
                    <div>
                      <label htmlFor="date-to" className="text-xs text-mid mb-1 block">Data fim</label>
                      <input
                        id="date-to"
                        type="date"
                        value={filters.dateTo}
                        min={filters.dateFrom || undefined}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={cn(
                          'w-full border rounded-lg px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
                          customDatesInvalid ? 'border-danger' : 'border-slate-200'
                        )}
                      />
                    </div>
                  </div>

                  {customDatesInvalid && (
                    <p role="alert" className="text-danger text-xs mt-2">
                      Data inicial deve ser anterior à data final
                    </p>
                  )}
                  {!filters.dateFrom || !filters.dateTo ? (
                    <p className="text-light text-xs mt-2">Selecione início e fim para filtrar</p>
                  ) : !customDatesInvalid && (
                    <button
                      onClick={() => setPeriodOpen(false)}
                      className="mt-3 w-full bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Aplicar intervalo
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tipo */}
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden" role="group" aria-label="Filtrar por tipo">
          {TYPE_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              aria-pressed={filters.type === value}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-all',
                filters.type === value
                  ? value === 'income'  ? 'bg-accent text-white'
                  : value === 'expense' ? 'bg-danger text-white'
                  : 'bg-primary text-white'
                  : 'text-mid hover:bg-slate-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Categoria */}
        <div ref={categoryRef} className="relative">
          <button
            onClick={() => { setCategoryOpen((o) => !o); setPeriodOpen(false) }}
            aria-expanded={categoryOpen}
            aria-haspopup="listbox"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
              filters.categoryIds.length > 0
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-mid border-slate-200 hover:border-slate-300'
            )}
          >
            <Tag size={14} aria-hidden="true" />
            Categoria
            {filters.categoryIds.length > 0 && (
              <span className="bg-white/25 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {filters.categoryIds.length}
              </span>
            )}
            <ChevronDown size={13} className={cn('transition-transform', categoryOpen && 'rotate-180')} aria-hidden="true" />
          </button>

          {categoryOpen && (
            <div
              role="listbox"
              aria-label="Selecionar categorias"
              aria-multiselectable="true"
              className="absolute top-full mt-1.5 left-0 z-30 bg-white border border-slate-100 rounded-xl shadow-lg py-1 min-w-[200px] max-h-56 overflow-y-auto"
            >
              {categories.map((cat) => {
                const selected = filters.categoryIds.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                      selected ? 'bg-primary/5' : 'hover:bg-slate-50'
                    )}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                    <span className={cn('flex-1 text-left', selected ? 'text-primary font-semibold' : 'text-mid')}>{cat.name}</span>
                    {selected && <span className="text-primary text-xs font-bold">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Limpar filtros */}
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-light hover:text-danger transition-colors"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Limpar ({activeCount})
          </button>
        )}
      </div>

      {/* ── Chips de filtros ativos ── */}
      {(isPeriodActive || filters.type !== 'all' || filters.categoryIds.length > 0) && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Filtros ativos">
          {isPeriodActive && (
            <FilterChip
              label={getPeriodChipLabel(filters)}
              onRemove={() => setPeriod('this_month')}
            />
          )}
          {filters.type !== 'all' && (
            <FilterChip
              label={filters.type === 'income' ? 'Receitas' : 'Despesas'}
              onRemove={() => setType('all')}
            />
          )}
          {selectedCategories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              color={cat.color}
              onRemove={() => removeCategory(cat.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
