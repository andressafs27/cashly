import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransactions } from './useTransactions'
import { useTransactionStore } from '@/store'

beforeEach(() => {
  useTransactionStore.setState({ transactions: [] })
  localStorage.clear()
})

describe('useTransactions', () => {
  it('calcula totalIncome, totalExpense e balance a partir das transações', () => {
    useTransactionStore.setState({
      transactions: [
        { id: '1', type: 'income', amount: 1000, date: '2026-03-01', createdAt: '2026-03-01T00:00:00.000Z', categoryId: 'salary', description: 'Salário' },
        { id: '2', type: 'expense', amount: 300, date: '2026-03-02', createdAt: '2026-03-02T00:00:00.000Z', categoryId: 'food', description: 'Mercado' },
        { id: '3', type: 'expense', amount: 200, date: '2026-03-03', createdAt: '2026-03-03T00:00:00.000Z', categoryId: 'transport', description: 'Uber' },
      ],
    })

    const { result } = renderHook(() => useTransactions())

    expect(result.current.totalIncome).toBe(1000)
    expect(result.current.totalExpense).toBe(500)
    expect(result.current.balance).toBe(500)
  })

  it('retorna balance zero quando não há transações', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.balance).toBe(0)
  })

  it('createTransaction adiciona uma transação com id e createdAt gerados', () => {
    const { result } = renderHook(() => useTransactions())

    act(() => {
      result.current.createTransaction({
        type: 'expense',
        amount: 50,
        date: '2026-03-05',
        categoryId: 'food',
        description: 'Lanche',
      })
    })

    expect(result.current.transactions).toHaveLength(1)
    expect(result.current.transactions[0]).toMatchObject({ amount: 50, description: 'Lanche' })
    expect(result.current.transactions[0].id).toBeTruthy()
    expect(result.current.transactions[0].createdAt).toBeTruthy()
  })

  it('deleteTransaction remove a transação do estado', () => {
    const { result } = renderHook(() => useTransactions())

    act(() => {
      result.current.createTransaction({
        type: 'expense',
        amount: 50,
        date: '2026-03-05',
        categoryId: 'food',
        description: 'Lanche',
      })
    })

    const id = result.current.transactions[0].id

    act(() => {
      result.current.deleteTransaction(id)
    })

    expect(result.current.transactions).toHaveLength(0)
  })

  it('recentTransactions retorna no máximo os 5 primeiros itens', () => {
    useTransactionStore.setState({
      transactions: Array.from({ length: 8 }, (_, i) => ({
        id: String(i),
        type: 'expense' as const,
        amount: 10,
        date: '2026-03-05',
        createdAt: '2026-03-05T00:00:00.000Z',
        categoryId: 'food',
        description: `Item ${i}`,
      })),
    })

    const { result } = renderHook(() => useTransactions())
    expect(result.current.recentTransactions).toHaveLength(5)
  })
})
