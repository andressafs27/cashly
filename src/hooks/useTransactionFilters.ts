import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  startOfMonth, endOfMonth, subMonths,
  startOfDay, endOfDay,
  isWithinInterval, parseISO,
} from 'date-fns'
import { useTransactionStore } from '@/store'

export type TypeFilter   = 'all' | 'income' | 'expense'
export type PeriodFilter = 'all' | 'this_month' | 'last_month' | 'last_3_months' | 'custom'

export interface FilterState {
  search:      string
  type:        TypeFilter
  period:      PeriodFilter
  categoryIds: string[]
  dateFrom:    string   // 'yyyy-MM-dd'
  dateTo:      string   // 'yyyy-MM-dd'
}

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all:           'Todo o período',
  this_month:    'Este mês',
  last_month:    'Mês passado',
  last_3_months: 'Últimos 3 meses',
  custom:        'Personalizado',
}

const DEFAULT: FilterState = {
  search:      '',
  type:        'all',
  period:      'this_month',
  categoryIds: [],
  dateFrom:    '',
  dateTo:      '',
}

function buildInterval(period: PeriodFilter, dateFrom: string, dateTo: string) {
  const now = new Date()
  switch (period) {
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last_month': {
      const d = subMonths(now, 1)
      return { start: startOfMonth(d), end: endOfMonth(d) }
    }
    case 'last_3_months':
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) }
    case 'custom':
      if (dateFrom && dateTo && dateFrom <= dateTo) {
        return { start: startOfDay(parseISO(dateFrom)), end: endOfDay(parseISO(dateTo)) }
      }
      return null
    default:
      return null
  }
}

export function useTransactionFilters() {
  const transactions = useTransactionStore((s) => s.transactions)

  const [filters, setFilters]         = useState<FilterState>(DEFAULT)
  const [searchInput, setSearchInput] = useState('')

  // Debounce 300ms na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const interval = useMemo(
    () => buildInterval(filters.period, filters.dateFrom, filters.dateTo),
    [filters.period, filters.dateFrom, filters.dateTo]
  )

  const filtered = useMemo(() =>
    transactions.filter((t) => {
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (interval && !isWithinInterval(parseISO(t.date), interval)) return false
      if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(t.categoryId)) return false
      return true
    }),
    [transactions, filters, interval]
  )

  const filteredIncome  = useMemo(() => filtered.filter((t) => t.type === 'income').reduce((a, t)  => a + t.amount, 0), [filtered])
  const filteredExpense = useMemo(() => filtered.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0), [filtered])
  const filteredBalance = filteredIncome - filteredExpense

  const setType       = useCallback((type: TypeFilter)     => setFilters((f) => ({ ...f, type })), [])
  const setPeriod     = useCallback((period: PeriodFilter) => setFilters((f) => ({ ...f, period, dateFrom: '', dateTo: '' })), [])
  const setDateFrom   = useCallback((dateFrom: string)     => setFilters((f) => ({ ...f, dateFrom })), [])
  const setDateTo     = useCallback((dateTo: string)       => setFilters((f) => ({ ...f, dateTo })), [])

  const toggleCategory = useCallback((id: string) =>
    setFilters((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    })), [])

  const removeCategory = useCallback((id: string) =>
    setFilters((f) => ({ ...f, categoryIds: f.categoryIds.filter((c) => c !== id) })), [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT)
    setSearchInput('')
  }, [])

  // Período custom só conta como ativo quando ambas as datas estão preenchidas
  const isPeriodActive =
    filters.period !== 'this_month' &&
    (filters.period !== 'custom' || (!!filters.dateFrom && !!filters.dateTo))

  const activeCount =
    (isPeriodActive ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    filters.categoryIds.length

  return {
    filters,
    searchInput,
    setSearchInput,
    setType,
    setPeriod,
    setDateFrom,
    setDateTo,
    toggleCategory,
    removeCategory,
    clearFilters,
    isPeriodActive,
    activeCount,
    filtered,
    filteredIncome,
    filteredExpense,
    filteredBalance,
    total: transactions.length,
  }
}
