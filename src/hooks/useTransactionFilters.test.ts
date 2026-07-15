import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransactionFilters } from './useTransactionFilters'
import { useTransactionStore } from '@/store'
import type { Transaction } from '@/types'

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: overrides.id ?? Math.random().toString(),
    type: 'expense',
    amount: 100,
    date: '2026-03-10',
    createdAt: '2026-03-10T00:00:00.000Z',
    categoryId: 'food',
    description: 'Transação',
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-15T12:00:00'))
  useTransactionStore.setState({ transactions: [] })
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTransactionFilters', () => {
  it('filtra por período "this_month" por padrão, excluindo outros meses', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', date: '2026-03-05' }),
        tx({ id: '2', date: '2026-02-20' }),
        tx({ id: '3', date: '2026-04-01' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())
    expect(result.current.filtered.map((t) => t.id)).toEqual(['1'])
  })

  it('filtra por tipo income/expense', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'income', date: '2026-03-05' }),
        tx({ id: '2', type: 'expense', date: '2026-03-06' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())

    act(() => result.current.setType('income'))
    expect(result.current.filtered.map((t) => t.id)).toEqual(['1'])

    act(() => result.current.setType('expense'))
    expect(result.current.filtered.map((t) => t.id)).toEqual(['2'])
  })

  it('filtra por período "last_month"', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', date: '2026-02-10' }),
        tx({ id: '2', date: '2026-03-10' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())
    act(() => result.current.setPeriod('last_month'))

    expect(result.current.filtered.map((t) => t.id)).toEqual(['1'])
  })

  it('filtra por intervalo customizado de datas', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', date: '2026-01-05' }),
        tx({ id: '2', date: '2026-03-10' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())
    act(() => result.current.setPeriod('custom'))
    act(() => result.current.setDateFrom('2026-01-01'))
    act(() => result.current.setDateTo('2026-01-31'))

    expect(result.current.filtered.map((t) => t.id)).toEqual(['1'])
  })

  it('filtra por categoria selecionada', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', categoryId: 'food', date: '2026-03-05' }),
        tx({ id: '2', categoryId: 'transport', date: '2026-03-06' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())
    act(() => result.current.setPeriod('all'))
    act(() => result.current.toggleCategory('food'))

    expect(result.current.filtered.map((t) => t.id)).toEqual(['1'])
  })

  it('aplica busca por descrição após debounce de 300ms', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', description: 'Mercado', date: '2026-03-05' }),
        tx({ id: '2', description: 'Uber', date: '2026-03-06' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())

    act(() => result.current.setSearchInput('merc'))
    // ainda não passou o debounce
    expect(result.current.filtered).toHaveLength(2)

    act(() => vi.advanceTimersByTime(300))
    expect(result.current.filtered.map((t) => t.id)).toEqual(['1'])
  })

  it('calcula filteredIncome, filteredExpense e filteredBalance', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'income', amount: 1000, date: '2026-03-05' }),
        tx({ id: '2', type: 'expense', amount: 300, date: '2026-03-06' }),
      ],
    })

    const { result } = renderHook(() => useTransactionFilters())
    expect(result.current.filteredIncome).toBe(1000)
    expect(result.current.filteredExpense).toBe(300)
    expect(result.current.filteredBalance).toBe(700)
  })

  it('clearFilters restaura o estado padrão', () => {
    const { result } = renderHook(() => useTransactionFilters())

    act(() => result.current.setType('income'))
    act(() => result.current.toggleCategory('food'))
    act(() => result.current.clearFilters())

    expect(result.current.filters.type).toBe('all')
    expect(result.current.filters.categoryIds).toEqual([])
    expect(result.current.filters.period).toBe('this_month')
  })
})
