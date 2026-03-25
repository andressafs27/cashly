export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  categoryId: string
  description: string
  goalId?: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  isDefault: boolean
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  type: 'save' | 'limit'
  categoryId?: string
  description?: string
  isArchived: boolean
}

export interface User {
  id: string
  name: string
  email: string
  currency: string
  theme: 'light' | 'dark'
}

export type ReportPeriod = 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export interface ReportSummary {
  period: ReportPeriod
  startDate: string
  endDate: string
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: CategorySummary[]
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number
}