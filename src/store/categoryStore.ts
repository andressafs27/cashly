import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, Subcategory } from '@/types'
import { DEFAULT_CATEGORIES } from '@/constants/categories'

interface CategoryStore {
  categories: Category[]
  addCategory:    (category: Category) => void
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addSubcategory:    (categoryId: string, subcat: Subcategory) => void
  updateSubcategory: (categoryId: string, subcatId: string, data: Partial<Subcategory>) => void
  deleteSubcategory: (categoryId: string, subcatId: string) => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,

      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => c.id === id ? { ...c, ...data } : c),
        })),

      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addSubcategory: (categoryId, subcat) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: [...(c.subcategories ?? []), subcat] }
              : c
          ),
        })),

      updateSubcategory: (categoryId, subcatId, data) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  subcategories: (c.subcategories ?? []).map((s) =>
                    s.id === subcatId ? { ...s, ...data } : s
                  ),
                }
              : c
          ),
        })),

      deleteSubcategory: (categoryId, subcatId) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: (c.subcategories ?? []).filter((s) => s.id !== subcatId) }
              : c
          ),
        })),
    }),
    // v3: força re-inicialização com os novos dados (subcategorias)
    { name: 'cashly_v4_categories' }
  )
)
