import { describe, it, expect, beforeEach } from 'vitest'
import { useGoalStore } from './goalStore'
import type { Goal } from '@/types'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: 'Viagem',
    targetAmount: 5000,
    currentAmount: 0,
    deadline: '2026-12-31',
    type: 'save',
    isArchived: false,
    ...overrides,
  }
}

beforeEach(() => {
  useGoalStore.setState({ goals: [] })
  localStorage.clear()
})

describe('goalStore', () => {
  it('começa com a lista de metas vazia', () => {
    expect(useGoalStore.getState().goals).toEqual([])
  })

  it('addGoal adiciona a meta no início da lista', () => {
    useGoalStore.getState().addGoal(makeGoal({ id: 'g1' }))
    useGoalStore.getState().addGoal(makeGoal({ id: 'g2' }))

    const { goals } = useGoalStore.getState()
    expect(goals).toHaveLength(2)
    expect(goals[0].id).toBe('g2')
  })

  it('updateGoal atualiza apenas os campos informados', () => {
    useGoalStore.getState().addGoal(makeGoal({ id: 'g1', currentAmount: 0 }))

    useGoalStore.getState().updateGoal('g1', { currentAmount: 1500 })

    const updated = useGoalStore.getState().goals.find((g) => g.id === 'g1')
    expect(updated?.currentAmount).toBe(1500)
    expect(updated?.title).toBe('Viagem')
  })

  it('deleteGoal remove a meta correta', () => {
    useGoalStore.getState().addGoal(makeGoal({ id: 'g1' }))
    useGoalStore.getState().addGoal(makeGoal({ id: 'g2' }))

    useGoalStore.getState().deleteGoal('g1')

    const { goals } = useGoalStore.getState()
    expect(goals).toHaveLength(1)
    expect(goals[0].id).toBe('g2')
  })
})
