import { api } from './api'
import type { Category, Goal, Transaction } from '@/types'

// Formatos que a API devolve (ver cashly-api/prisma/schema.prisma).
// Valores monetários vêm como string (Decimal), e nulos no lugar de opcionais.
interface ApiCategory {
  id: string
  name: string
  color: string
  icon: string
  isDefault: boolean
}

interface ApiTransaction {
  id: string
  type: 'income' | 'expense'
  amount: string | number
  description: string
  date: string
  createdAt: string
  categoryId: string
  goalId: string | null
}

interface ApiGoal {
  id: string
  title: string
  description: string | null
  type: 'save' | 'limit'
  targetAmount: string | number
  currentAmount: string | number
  deadline: string
  categoryId: string | null
  isArchived: boolean
}

// A API ainda não tem tipo, subcategorias nem status ativo em categorias.
// Estes valores padrão mantêm o formato que o front já usa.
function toCategory(c: ApiCategory): Category {
  return { ...c, type: 'expense', isActive: true, subcategories: [] }
}

function toTransaction(t: ApiTransaction): Transaction {
  return {
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    date: t.date,
    createdAt: t.createdAt,
    categoryId: t.categoryId,
    goalId: t.goalId ?? undefined,
  }
}

function toGoal(g: ApiGoal): Goal {
  return {
    id: g.id,
    title: g.title,
    description: g.description ?? undefined,
    type: g.type,
    targetAmount: Number(g.targetAmount),
    currentAmount: Number(g.currentAmount),
    deadline: g.deadline,
    categoryId: g.categoryId ?? undefined,
    isArchived: g.isArchived,
  }
}

// ── Categorias ──────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiCategory[]>('/categories')
  return data.map(toCategory)
}

export async function createCategory(input: { name: string; color: string; icon: string }): Promise<Category> {
  const { data } = await api.post<ApiCategory>('/categories', input)
  return toCategory(data)
}

export async function updateCategory(id: string, input: Partial<{ name: string; color: string; icon: string }>): Promise<Category> {
  const { data } = await api.put<ApiCategory>(`/categories/${id}`, input)
  return toCategory(data)
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}

// ── Lançamentos ─────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<ApiTransaction[]>('/transactions')
  return data.map(toTransaction)
}

export async function createTransaction(
  input: Pick<Transaction, 'type' | 'amount' | 'description' | 'date' | 'categoryId'> & { goalId?: string },
): Promise<Transaction> {
  const { data } = await api.post<ApiTransaction>('/transactions', { ...input, goalId: input.goalId ?? null })
  return toTransaction(data)
}

export async function updateTransaction(id: string, input: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
  const { data } = await api.put<ApiTransaction>(`/transactions/${id}`, input)
  return toTransaction(data)
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`)
}

// ── Metas ───────────────────────────────────────────────────

export async function fetchGoals(): Promise<Goal[]> {
  const { data } = await api.get<ApiGoal[]>('/goals')
  return data.map(toGoal)
}

export async function createGoal(input: Omit<Goal, 'id' | 'currentAmount' | 'isArchived'>): Promise<Goal> {
  const { data } = await api.post<ApiGoal>('/goals', input)
  return toGoal(data)
}

export async function updateGoal(id: string, input: Partial<Omit<Goal, 'id'>>): Promise<Goal> {
  const { data } = await api.put<ApiGoal>(`/goals/${id}`, input)
  return toGoal(data)
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`)
}
