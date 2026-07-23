import { describe, it, expect } from 'vitest'
import { getGoalProgress, getEffectiveCurrentAmount } from './goalProgress'
import type { Goal, Transaction } from '@/types'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: 'Meta',
    targetAmount: 1000,
    currentAmount: 0,
    deadline: '2026-12-31',
    type: 'save',
    isArchived: false,
    ...overrides,
  }
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    type: 'expense',
    amount: 100,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    categoryId: 'food',
    description: 'Compra',
    ...overrides,
  }
}

describe('getGoalProgress', () => {
  it('calcula a porcentagem de progresso', () => {
    expect(getGoalProgress(1000, 250)).toBe(25)
  })

  it('arredonda o resultado', () => {
    expect(getGoalProgress(300, 100)).toBe(33)
  })

  it('retorna 0 quando o valor alvo é zero', () => {
    expect(getGoalProgress(0, 100)).toBe(0)
  })

  it('retorna 0 quando o valor alvo é negativo', () => {
    expect(getGoalProgress(-100, 50)).toBe(0)
  })

  it('permite ultrapassar 100 quando o valor atual excede o alvo', () => {
    expect(getGoalProgress(100, 150)).toBe(150)
  })
})

describe('getEffectiveCurrentAmount', () => {
  it('retorna currentAmount para metas do tipo "save"', () => {
    const goal = makeGoal({ type: 'save', currentAmount: 400 })
    expect(getEffectiveCurrentAmount(goal, [])).toBe(400)
  })

  it('retorna currentAmount quando meta de limite não tem categoria vinculada', () => {
    const goal = makeGoal({ type: 'limit', categoryId: undefined, currentAmount: 200 })
    expect(getEffectiveCurrentAmount(goal, [])).toBe(200)
  })

  it('soma despesas do mês corrente na categoria vinculada para metas de limite', () => {
    const goal = makeGoal({ type: 'limit', categoryId: 'food', currentAmount: 0 })
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10`

    const transactions: Transaction[] = [
      makeTransaction({ categoryId: 'food', type: 'expense', amount: 50, date: thisMonth }),
      makeTransaction({ categoryId: 'food', type: 'expense', amount: 30, date: thisMonth }),
      // outra categoria: não deve contar
      makeTransaction({ categoryId: 'transport', type: 'expense', amount: 999, date: thisMonth }),
      // receita na mesma categoria: não deve contar
      makeTransaction({ categoryId: 'food', type: 'income', amount: 999, date: thisMonth }),
    ]

    expect(getEffectiveCurrentAmount(goal, transactions)).toBe(80)
  })

  it('ignora despesas de meses anteriores', () => {
    const goal = makeGoal({ type: 'limit', categoryId: 'food' })
    const transactions: Transaction[] = [
      makeTransaction({ categoryId: 'food', type: 'expense', amount: 500, date: '2020-01-05' }),
    ]
    expect(getEffectiveCurrentAmount(goal, transactions)).toBe(0)
  })
})
