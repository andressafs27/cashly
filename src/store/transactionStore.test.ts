import { describe, it, expect, beforeEach } from 'vitest'
import { useTransactionStore } from './transactionStore'
import type { Transaction } from '@/types'

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    type: 'expense',
    amount: 100,
    date: '2026-03-05',
    createdAt: '2026-03-05T10:00:00.000Z',
    categoryId: 'food',
    description: 'Almoço',
    ...overrides,
  }
}

beforeEach(() => {
  useTransactionStore.setState({ transactions: [] })
  localStorage.clear()
})

describe('transactionStore', () => {
  it('começa com a lista de transações vazia', () => {
    expect(useTransactionStore.getState().transactions).toEqual([])
  })

  it('addTransaction adiciona a transação no início da lista', () => {
    const t1 = makeTransaction({ id: 't1' })
    const t2 = makeTransaction({ id: 't2' })

    useTransactionStore.getState().addTransaction(t1)
    useTransactionStore.getState().addTransaction(t2)

    const { transactions } = useTransactionStore.getState()
    expect(transactions).toHaveLength(2)
    expect(transactions[0].id).toBe('t2')
    expect(transactions[1].id).toBe('t1')
  })

  it('updateTransaction atualiza apenas os campos informados', () => {
    useTransactionStore.getState().addTransaction(makeTransaction({ id: 't1', amount: 100 }))

    useTransactionStore.getState().updateTransaction('t1', { amount: 250 })

    const updated = useTransactionStore.getState().transactions.find((t) => t.id === 't1')
    expect(updated?.amount).toBe(250)
    expect(updated?.description).toBe('Almoço')
  })

  it('deleteTransaction remove a transação correta', () => {
    useTransactionStore.getState().addTransaction(makeTransaction({ id: 't1' }))
    useTransactionStore.getState().addTransaction(makeTransaction({ id: 't2' }))

    useTransactionStore.getState().deleteTransaction('t1')

    const { transactions } = useTransactionStore.getState()
    expect(transactions).toHaveLength(1)
    expect(transactions[0].id).toBe('t2')
  })

  it('clearTransactions esvazia a lista', () => {
    useTransactionStore.getState().addTransaction(makeTransaction())
    useTransactionStore.getState().clearTransactions()
    expect(useTransactionStore.getState().transactions).toEqual([])
  })
})
