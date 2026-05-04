import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from '@/types'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

interface CategoryStore {
  categories: Category[]
  addCategory: (category: Category) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,

      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        })),

      updateCategory: (id, data) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    { name: 'cashly_v1_categories' }
  )
)