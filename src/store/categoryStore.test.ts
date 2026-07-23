import { describe, it, expect, beforeEach } from 'vitest'
import { useCategoryStore } from './categoryStore'
import type { Category, Subcategory } from '@/types'

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c1',
    name: 'Categoria',
    color: '#FF0000',
    icon: 'Star',
    type: 'expense',
    isDefault: false,
    isActive: true,
    subcategories: [],
    ...overrides,
  }
}

function makeSubcategory(overrides: Partial<Subcategory> = {}): Subcategory {
  return { id: 's1', name: 'Sub', isDefault: false, isActive: true, ...overrides }
}

beforeEach(() => {
  useCategoryStore.setState({ categories: [] })
  localStorage.clear()
})

describe('categoryStore', () => {
  it('addCategory adiciona uma categoria à lista', () => {
    useCategoryStore.getState().addCategory(makeCategory({ id: 'c1' }))
    expect(useCategoryStore.getState().categories.map((c) => c.id)).toEqual(['c1'])
  })

  it('updateCategory atualiza apenas os campos informados', () => {
    useCategoryStore.getState().addCategory(makeCategory({ id: 'c1', name: 'Antigo' }))
    useCategoryStore.getState().updateCategory('c1', { name: 'Novo' })

    const updated = useCategoryStore.getState().categories.find((c) => c.id === 'c1')
    expect(updated?.name).toBe('Novo')
    expect(updated?.color).toBe('#FF0000')
  })

  it('deleteCategory remove a categoria correta', () => {
    useCategoryStore.getState().addCategory(makeCategory({ id: 'c1' }))
    useCategoryStore.getState().addCategory(makeCategory({ id: 'c2' }))
    useCategoryStore.getState().deleteCategory('c1')

    expect(useCategoryStore.getState().categories.map((c) => c.id)).toEqual(['c2'])
  })

  it('addSubcategory adiciona subcategoria à categoria correta', () => {
    useCategoryStore.getState().addCategory(makeCategory({ id: 'c1' }))
    useCategoryStore.getState().addCategory(makeCategory({ id: 'c2' }))

    useCategoryStore.getState().addSubcategory('c1', makeSubcategory({ id: 's1' }))

    const c1 = useCategoryStore.getState().categories.find((c) => c.id === 'c1')
    const c2 = useCategoryStore.getState().categories.find((c) => c.id === 'c2')
    expect(c1?.subcategories).toHaveLength(1)
    expect(c2?.subcategories).toHaveLength(0)
  })

  it('updateSubcategory atualiza apenas a subcategoria informada', () => {
    useCategoryStore.getState().addCategory(
      makeCategory({ id: 'c1', subcategories: [makeSubcategory({ id: 's1', name: 'Antiga' })] })
    )

    useCategoryStore.getState().updateSubcategory('c1', 's1', { name: 'Nova' })

    const sub = useCategoryStore.getState().categories[0].subcategories.find((s) => s.id === 's1')
    expect(sub?.name).toBe('Nova')
  })

  it('deleteSubcategory remove a subcategoria correta', () => {
    useCategoryStore.getState().addCategory(
      makeCategory({
        id: 'c1',
        subcategories: [makeSubcategory({ id: 's1' }), makeSubcategory({ id: 's2' })],
      })
    )

    useCategoryStore.getState().deleteSubcategory('c1', 's1')

    const subs = useCategoryStore.getState().categories[0].subcategories
    expect(subs.map((s) => s.id)).toEqual(['s2'])
  })
})
