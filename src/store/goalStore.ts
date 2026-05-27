import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal } from '@/types'

interface GoalStore {
  goals: Goal[]
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, data: Partial<Goal>) => void
  deleteGoal: (id: string) => void
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],

      addGoal: (goal) =>
        set((state) => ({
          goals: [goal, ...state.goals],
        })),

      updateGoal: (id, data) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...data } : g
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
    }),
    { name: 'cashly_v1_goals' }
  )
)