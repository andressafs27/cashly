import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGoals } from './useGoals'
import { useGoalStore } from '@/store'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  useGoalStore.setState({ goals: [] })
  localStorage.clear()
})

describe('useGoals', () => {
  it('separa metas ativas e arquivadas', () => {
    useGoalStore.setState({
      goals: [
        { id: '1', title: 'A', targetAmount: 100, currentAmount: 0, deadline: '2026-12-31', type: 'save', isArchived: false },
        { id: '2', title: 'B', targetAmount: 100, currentAmount: 0, deadline: '2026-12-31', type: 'save', isArchived: true },
      ],
    })

    const { result } = renderHook(() => useGoals())
    expect(result.current.activeGoals).toHaveLength(1)
    expect(result.current.archivedGoals).toHaveLength(1)
  })

  it('identifica metas já concluídas', () => {
    useGoalStore.setState({
      goals: [
        { id: '1', title: 'Concluída', targetAmount: 100, currentAmount: 100, deadline: '2026-12-31', type: 'save', isArchived: false },
        { id: '2', title: 'Em andamento', targetAmount: 100, currentAmount: 50, deadline: '2026-12-31', type: 'save', isArchived: false },
      ],
    })

    const { result } = renderHook(() => useGoals())
    expect(result.current.completedGoals).toHaveLength(1)
    expect(result.current.completedGoals[0].id).toBe('1')
  })

  it('createGoal adiciona uma meta com id gerado', () => {
    const { result } = renderHook(() => useGoals())

    act(() => {
      result.current.createGoal({
        title: 'Nova meta',
        targetAmount: 500,
        currentAmount: 0,
        deadline: '2026-12-31',
        type: 'save',
        isArchived: false,
      })
    })

    expect(result.current.goals).toHaveLength(1)
    expect(result.current.goals[0].id).toBeTruthy()
  })

  it('getProgress calcula a porcentagem corretamente e limita a 100', () => {
    const { result } = renderHook(() => useGoals())
    const goal = { id: '1', title: 'X', targetAmount: 200, currentAmount: 50, deadline: '2026-12-31', type: 'save' as const, isArchived: false }
    expect(result.current.getProgress(goal)).toBe(25)
    expect(result.current.getProgress({ ...goal, currentAmount: 400 })).toBe(100)
  })

  it('getProgress retorna 0 quando targetAmount é inválido', () => {
    const { result } = renderHook(() => useGoals())
    const goal = { id: '1', title: 'X', targetAmount: 0, currentAmount: 50, deadline: '2026-12-31', type: 'save' as const, isArchived: false }
    expect(result.current.getProgress(goal)).toBe(0)
  })

  it('addContribution soma o valor ao currentAmount da meta', () => {
    const { result } = renderHook(() => useGoals())

    act(() => {
      result.current.createGoal({
        title: 'Meta', targetAmount: 1000, currentAmount: 100, deadline: '2026-12-31', type: 'save', isArchived: false,
      })
    })

    const id = result.current.goals[0].id

    act(() => {
      result.current.addContribution(id, 200)
    })

    expect(result.current.goals[0].currentAmount).toBe(300)
  })

  it('archiveGoal marca a meta como arquivada', () => {
    const { result } = renderHook(() => useGoals())

    act(() => {
      result.current.createGoal({
        title: 'Meta', targetAmount: 1000, currentAmount: 0, deadline: '2026-12-31', type: 'save', isArchived: false,
      })
    })

    const id = result.current.goals[0].id

    act(() => {
      result.current.archiveGoal(id)
    })

    expect(result.current.goals[0].isArchived).toBe(true)
  })

  it('unarchiveGoal reativa uma meta arquivada', () => {
    const { result } = renderHook(() => useGoals())

    act(() => {
      result.current.createGoal({
        title: 'Meta', targetAmount: 1000, currentAmount: 0, deadline: '2026-12-31', type: 'save', isArchived: true,
      })
    })

    const id = result.current.goals[0].id

    act(() => {
      result.current.unarchiveGoal(id)
    })

    expect(result.current.goals[0].isArchived).toBe(false)
  })

  it('addContribution não quebra ao receber um id inexistente', () => {
    const { result } = renderHook(() => useGoals())

    act(() => {
      result.current.addContribution('id-que-nao-existe', 100)
    })

    expect(result.current.goals).toHaveLength(0)
  })

  it('addContribution reconhece quando a meta é atingida pela contribuição', () => {
    const { result } = renderHook(() => useGoals())

    act(() => {
      result.current.createGoal({
        title: 'Meta', targetAmount: 500, currentAmount: 400, deadline: '2026-12-31', type: 'save', isArchived: false,
      })
    })

    const id = result.current.goals[0].id

    act(() => {
      result.current.addContribution(id, 100)
    })

    expect(result.current.goals[0].currentAmount).toBe(500)
  })

  it('getDaysLeft calcula os dias restantes até o prazo', () => {
    const { result } = renderHook(() => useGoals())
    const goal = { id: '1', title: 'X', targetAmount: 100, currentAmount: 0, deadline: '2026-12-31', type: 'save' as const, isArchived: false }
    expect(typeof result.current.getDaysLeft(goal)).toBe('number')
  })
})
