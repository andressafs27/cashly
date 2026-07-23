import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import type { Goal, Transaction } from '@/types'

/**
 * Para metas de limite com categoria vinculada, o valor atual é a soma das
 * despesas do mês corrente naquela categoria. Para metas de economizar,
 * é o valor acumulado manualmente (goal.currentAmount).
 */
export function getEffectiveCurrentAmount(goal: Goal, transactions: Transaction[]): number {
  if (goal.type !== 'limit' || !goal.categoryId) return goal.currentAmount
  const now = new Date()
  const iv  = { start: startOfMonth(now), end: endOfMonth(now) }
  return transactions
    .filter((t) =>
      t.categoryId === goal.categoryId &&
      t.type === 'expense' &&
      isWithinInterval(parseISO(t.date), iv)
    )
    .reduce((a, t) => a + t.amount, 0)
}

export function getGoalProgress(targetAmount: number, currentAmount: number): number {
  if (targetAmount <= 0) return 0
  return Math.round((currentAmount / targetAmount) * 100)
}
