import { useCallback, useMemo } from 'react'
import { useGoalStore } from '@/store'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { toast } from 'sonner'
import type { Goal } from '@/types'

export function useGoals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoalStore()

  const activeGoals = useMemo(
    () => goals.filter((g) => !g.isArchived),
    [goals]
  )

  const archivedGoals = useMemo(
    () => goals.filter((g) => g.isArchived),
    [goals]
  )

  const completedGoals = useMemo(
    () => activeGoals.filter((g) => g.currentAmount >= g.targetAmount),
    [activeGoals]
  )

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const createGoal = useCallback((data: Omit<Goal, 'id'>) => {
    const goal: Goal = { ...data, id: crypto.randomUUID() }
    addGoal(goal)
    return goal
  }, [addGoal])

  const archiveGoal = useCallback((id: string) => {
    updateGoal(id, { isArchived: true })
    toast.success('Meta arquivada')
  }, [updateGoal])

  const unarchiveGoal = useCallback((id: string) => {
    updateGoal(id, { isArchived: false })
    toast.success('Meta reativada')
  }, [updateGoal])

  // ── Contribuição (adicionar valor à meta) ─────────────────────────────────

  const addContribution = useCallback((id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    const newAmount = goal.currentAmount + amount
    updateGoal(id, { currentAmount: newAmount })

    if (newAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
      toast.success(`Meta "${goal.title}" atingida! 🎉`, { duration: 5000 })
    } else {
      toast.success(`+ ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} adicionado`)
    }
  }, [goals, updateGoal])

  // ── Utilitários ──────────────────────────────────────────────────────────

  const getProgress = useCallback((goal: Goal): number => {
    if (goal.targetAmount <= 0) return 0
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
  }, [])

  const getDaysLeft = useCallback((goal: Goal): number => {
    return differenceInCalendarDays(parseISO(goal.deadline), new Date())
  }, [])

  return {
    goals,
    activeGoals,
    archivedGoals,
    completedGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    unarchiveGoal,
    addContribution,
    getProgress,
    getDaysLeft,
  }
}
