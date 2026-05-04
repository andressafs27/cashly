import { useMemo } from 'react'
import { useGoalStore } from '@/store'
import type { Goal } from '@/types'

export function useGoals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalStore()

  const activeGoals = useMemo(
    () => goals.filter((g) => !g.isArchived),
    [goals]
  )

  const completedGoals = useMemo(
    () => goals.filter((g) => g.currentAmount >= g.targetAmount),
    [goals]
  )

  function createGoal(data: Omit<Goal, 'id'>) {
    const goal: Goal = {
      ...data,
      id: crypto.randomUUID(),
    }
    addGoal(goal)
    return goal
  }

  function getProgress(goal: Goal) {
    return Math.min(
      Math.round((goal.currentAmount / goal.targetAmount) * 100),
      100
    )
  }

  return {
    goals,
    activeGoals,
    completedGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getProgress,
  }
}