import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReportData } from './useReportData'
import { useTransactionStore, useCategoryStore } from '@/store'
import { DEFAULT_CATEGORIES } from '@/constants/categories'
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
  vi.setSystemTime(new Date('2026-03-20T12:00:00'))
  useTransactionStore.setState({ transactions: [] })
  useCategoryStore.setState({ categories: DEFAULT_CATEGORIES })
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useReportData', () => {
  it('calcula totalIncome, totalExpense e balance do período mensal', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'income', amount: 2000, categoryId: 'salary', date: '2026-03-05' }),
        tx({ id: '2', type: 'expense', amount: 300, categoryId: 'food', date: '2026-03-06' }),
        tx({ id: '3', type: 'expense', amount: 200, categoryId: 'transport', date: '2026-03-07' }),
        // fora do período (mês anterior): não deve contar
        tx({ id: '4', type: 'expense', amount: 999, categoryId: 'food', date: '2026-02-15' }),
      ],
    })

    const { result } = renderHook(() => useReportData('monthly', 0))

    expect(result.current.totalIncome).toBe(2000)
    expect(result.current.totalExpense).toBe(500)
    expect(result.current.balance).toBe(1500)
  })

  it('calcula o total por categoria (categoryBreakdown) ordenado do maior para o menor', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'expense', amount: 100, categoryId: 'transport', date: '2026-03-05' }),
        tx({ id: '2', type: 'expense', amount: 300, categoryId: 'food', date: '2026-03-06' }),
        tx({ id: '3', type: 'expense', amount: 200, categoryId: 'food', date: '2026-03-07' }),
      ],
    })

    const { result } = renderHook(() => useReportData('monthly', 0))

    const [first, second] = result.current.categoryBreakdown
    expect(first.category.id).toBe('food')
    expect(first.total).toBe(500)
    expect(second.category.id).toBe('transport')
    expect(second.total).toBe(100)
  })

  it('calcula a porcentagem de cada categoria sobre o total de despesas', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'expense', amount: 300, categoryId: 'food', date: '2026-03-05' }),
        tx({ id: '2', type: 'expense', amount: 100, categoryId: 'transport', date: '2026-03-06' }),
      ],
    })

    const { result } = renderHook(() => useReportData('monthly', 0))
    const food = result.current.categoryBreakdown.find((c) => c.category.id === 'food')
    expect(food?.percentage).toBeCloseTo(75)
  })

  it('retorna savingsRate zero quando não há receita no período', () => {
    useTransactionStore.setState({
      transactions: [tx({ id: '1', type: 'expense', amount: 100, date: '2026-03-05' })],
    })

    const { result } = renderHook(() => useReportData('monthly', 0))
    expect(result.current.savingsRate).toBe(0)
  })

  it('offset 1 desloca o período para o mês anterior', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'income', amount: 500, categoryId: 'salary', date: '2026-02-10' }),
        tx({ id: '2', type: 'income', amount: 999, categoryId: 'salary', date: '2026-03-10' }),
      ],
    })

    const { result } = renderHook(() => useReportData('monthly', 1))
    expect(result.current.totalIncome).toBe(500)
  })

  it('monta chartData por mês para o período anual', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'income', amount: 1000, categoryId: 'salary', date: '2026-01-10' }),
        tx({ id: '2', type: 'expense', amount: 200, categoryId: 'food', date: '2026-06-10' }),
      ],
    })

    const { result } = renderHook(() => useReportData('yearly', 0))
    expect(result.current.chartData).toHaveLength(12)
    expect(result.current.totalIncome).toBe(1000)
  })

  it('monta chartData por dia para o período semanal', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'expense', amount: 50, categoryId: 'food', date: '2026-03-18' }),
      ],
    })

    const { result } = renderHook(() => useReportData('weekly', 0))
    expect(result.current.chartData).toHaveLength(7)
  })

  it('retorna variação nula quando não há dados no período anterior para comparar', () => {
    useTransactionStore.setState({
      transactions: [
        tx({ id: '1', type: 'income', amount: 1000, categoryId: 'salary', date: '2026-03-10' }),
      ],
    })

    const { result } = renderHook(() => useReportData('monthly', 0))
    expect(result.current.incomeVariation).toBeNull()
  })
})
