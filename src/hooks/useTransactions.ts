import { useMemo } from 'react'
import { useTransactionStore } from '@/store'
import type { Transaction } from '@/types'

export function useTransactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactionStore()

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  )

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  )

  const balance = useMemo(
    () => totalIncome - totalExpense,
    [totalIncome, totalExpense]
  )

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  )

  function createTransaction(data: Omit<Transaction, 'id'>) {
    const transaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    }
    addTransaction(transaction)
    return transaction
  }

  return {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    recentTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}