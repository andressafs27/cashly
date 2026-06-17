import { useMemo } from 'react'
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
  startOfDay, endOfDay, subWeeks, subMonths, subYears,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
  isWithinInterval, parseISO, format, min, max,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTransactionStore, useCategoryStore } from '@/store'
import type { ReportPeriod, Transaction } from '@/types'

// Categorias consideradas "necessidades" na regra 50/30/20 (simplificação)
const ESSENTIAL_CATEGORY_IDS = new Set(['food', 'housing', 'health', 'transport', 'education'])

interface Interval { start: Date; end: Date }

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  weekly:   'Semanal',
  biweekly: 'Quinzenal',
  monthly:  'Mensal',
  yearly:   'Anual',
}

function filterByInterval(txs: Transaction[], iv: Interval) {
  return txs.filter((t) => isWithinInterval(parseISO(t.date), iv))
}

function sumByType(txs: Transaction[], type: 'income' | 'expense') {
  return txs.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0)
}

function variation(curr: number, prev: number): number | null {
  if (prev === 0) return null
  return ((curr - prev) / prev) * 100
}

// ── Quinzena: índice global (mês*2 + metade) para navegação por offset ──────

function biweeklyIndex(date: Date): number {
  const half = date.getDate() > 15 ? 1 : 0
  return (date.getFullYear() * 12 + date.getMonth()) * 2 + half
}

function biweeklyIntervalFromIndex(index: number): Interval {
  const monthIndex = Math.floor(index / 2)
  const half = index % 2
  const year  = Math.floor(monthIndex / 12)
  const month = ((monthIndex % 12) + 12) % 12
  if (half === 0) {
    return { start: new Date(year, month, 1, 0, 0, 0), end: new Date(year, month, 15, 23, 59, 59, 999) }
  }
  return { start: new Date(year, month, 16, 0, 0, 0), end: endOfMonth(new Date(year, month, 1)) }
}

// ── Intervalo a partir de período + offset (0 = atual, 1 = anterior...) ─────

export function getReportInterval(period: ReportPeriod, offset: number): Interval {
  const now = new Date()
  switch (period) {
    case 'weekly': {
      const ref = subWeeks(now, offset)
      return { start: startOfWeek(ref, { weekStartsOn: 1 }), end: endOfWeek(ref, { weekStartsOn: 1 }) }
    }
    case 'biweekly':
      return biweeklyIntervalFromIndex(biweeklyIndex(now) - offset)
    case 'yearly': {
      const ref = subYears(now, offset)
      return { start: startOfYear(ref), end: endOfYear(ref) }
    }
    default: {
      const ref = subMonths(now, offset)
      return { start: startOfMonth(ref), end: endOfMonth(ref) }
    }
  }
}

export function formatIntervalLabel(period: ReportPeriod, iv: Interval): string {
  if (period === 'yearly')  return format(iv.start, 'yyyy')
  if (period === 'monthly') return format(iv.start, "MMMM 'de' yyyy", { locale: ptBR })
  return `${format(iv.start, 'dd/MM')} – ${format(iv.end, 'dd/MM/yyyy')}`
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useReportData(period: ReportPeriod, offset: number) {
  const transactions = useTransactionStore((s) => s.transactions)
  const categories   = useCategoryStore((s) => s.categories)

  return useMemo(() => {
    const interval     = getReportInterval(period, offset)
    const prevInterval = getReportInterval(period, offset + 1)

    const txInPeriod = filterByInterval(transactions, interval)
    const txPrev      = filterByInterval(transactions, prevInterval)

    const totalIncome  = sumByType(txInPeriod, 'income')
    const totalExpense = sumByType(txInPeriod, 'expense')
    const balance      = totalIncome - totalExpense
    const savingsRate  = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

    const prevIncome  = sumByType(txPrev, 'income')
    const prevExpense = sumByType(txPrev, 'expense')
    const prevBalance = prevIncome - prevExpense

    // ── Breakdown por categoria ──
    const expenseTx     = txInPeriod.filter((t) => t.type === 'expense')
    const prevExpenseTx = txPrev.filter((t) => t.type === 'expense')

    const categoryBreakdown = categories
      .map((cat) => {
        const total     = expenseTx.filter((t) => t.categoryId === cat.id).reduce((a, t) => a + t.amount, 0)
        const prevTotal = prevExpenseTx.filter((t) => t.categoryId === cat.id).reduce((a, t) => a + t.amount, 0)
        return {
          category:   cat,
          total,
          percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
          variation:  variation(total, prevTotal),
        }
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)

    const top3Categories = categoryBreakdown.slice(0, 3)

    // ── Dados do gráfico — buckets adaptativos por período ──
    let chartData: { label: string; Receitas: number; Despesas: number }[] = []

    if (period === 'yearly') {
      chartData = eachMonthOfInterval(interval).map((m) => {
        const mIv = { start: startOfMonth(m), end: endOfMonth(m) }
        const tx  = filterByInterval(transactions, mIv)
        return { label: format(m, 'MMM', { locale: ptBR }), Receitas: sumByType(tx, 'income'), Despesas: sumByType(tx, 'expense') }
      })
    } else if (period === 'monthly') {
      const weeks = eachWeekOfInterval(interval, { weekStartsOn: 1 })
      chartData = weeks.map((w, i) => {
        const wStart = max([startOfWeek(w, { weekStartsOn: 1 }), interval.start])
        const wEnd   = min([endOfWeek(w, { weekStartsOn: 1 }), interval.end])
        const tx = filterByInterval(transactions, { start: wStart, end: wEnd })
        return { label: `Sem ${i + 1}`, Receitas: sumByType(tx, 'income'), Despesas: sumByType(tx, 'expense') }
      })
    } else {
      chartData = eachDayOfInterval(interval).map((d) => {
        const dIv = { start: startOfDay(d), end: endOfDay(d) }
        const tx  = filterByInterval(transactions, dIv)
        return { label: format(d, 'dd/MM'), Receitas: sumByType(tx, 'income'), Despesas: sumByType(tx, 'expense') }
      })
    }

    // ── Saúde financeira (regra 50/30/20 simplificada) ──
    const necessitiesTotal = expenseTx.filter((t) => ESSENTIAL_CATEGORY_IDS.has(t.categoryId)).reduce((a, t) => a + t.amount, 0)
    const wantsTotal        = totalExpense - necessitiesTotal
    const necessitiesPct    = totalIncome > 0 ? (necessitiesTotal / totalIncome) * 100 : 0
    const wantsPct          = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0

    return {
      interval,
      prevInterval,
      intervalLabel: formatIntervalLabel(period, interval),
      transactions: txInPeriod,
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      incomeVariation:  variation(totalIncome, prevIncome),
      expenseVariation: variation(totalExpense, prevExpense),
      balanceVariation: variation(balance, prevBalance),
      categoryBreakdown,
      top3Categories,
      chartData,
      health: { necessitiesPct, wantsPct, savingsPct: savingsRate },
    }
  }, [transactions, categories, period, offset])
}
