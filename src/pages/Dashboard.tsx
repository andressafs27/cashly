import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  format, subMonths, startOfMonth, endOfMonth,
  isWithinInterval, parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, Sparkles, ArrowRight,
  type LucideIcon,
} from 'lucide-react'
// Tipo local para custom tooltips do Recharts (evita incompatibilidade de versão)
interface ChartTooltip {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, string> }>
  label?: string
}
import { useTransactions } from '@/hooks'
import { useCategoryStore } from '@/store'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { auth } from '@/services/firebase'
import { cn } from '@/utils/cn'
import type { Transaction, Category } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function monthInterval(offset = 0) {
  const d = subMonths(new Date(), offset)
  return { start: startOfMonth(d), end: endOfMonth(d) }
}

function filterByInterval(transactions: Transaction[], interval: { start: Date; end: Date }) {
  return transactions.filter((t) => isWithinInterval(parseISO(t.date), interval))
}

function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

// ── Sub-componentes internos ────────────────────────────────────────────────

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend: number | null
  trendUp?: boolean
  iconBg: string
  iconColor: string
}

function StatCard({ icon: Icon, label, value, trend, trendUp, iconBg, iconColor }: StatCardProps) {
  const hasPositiveTrend = trend !== null && (trendUp ? trend > 0 : trend < 0)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} aria-hidden="true" />
        </div>
        {trend !== null && (
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full',
            hasPositiveTrend ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
          )}>
            {hasPositiveTrend ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-light text-sm mb-1">{label}</p>
        <p className="text-dark text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function BarChartTooltip({ active, payload, label }: ChartTooltip) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#070D1A] text-white text-xs rounded-xl p-3 shadow-2xl border border-white/10">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex gap-2">
          <span style={{ color: p.color }}>●</span>
          {p.name}: <span className="font-semibold">{formatCurrency(p.value ?? 0)}</span>
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: ChartTooltip) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-[#070D1A] text-white text-xs rounded-xl p-3 shadow-2xl border border-white/10">
      <p className="font-semibold" style={{ color: d.payload?.['color'] as string }}>{d.name}</p>
      <p className="mt-1">{formatCurrency(d.value ?? 0)}</p>
    </div>
  )
}

function DashboardRow({ transaction, category }: { transaction: Transaction; category?: Category }) {
  const isIncome = transaction.type === 'income'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category ? `${category.color}18` : '#f1f5f9' }}
      >
        <span className="text-lg leading-none" aria-hidden="true">
          <span style={{ color: category?.color ?? '#94A3B8', fontSize: 8 }}>●</span>
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-dark text-sm font-medium truncate">{transaction.description}</p>
        <p className="text-light text-xs mt-0.5">{category?.name} · {formatDate(transaction.date)}</p>
      </div>
      <span className={cn('text-sm font-semibold flex-shrink-0', isIncome ? 'text-accent' : 'text-danger')}>
        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
      </span>
    </div>
  )
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export function Dashboard() {
  const { transactions, createTransaction } = useTransactions()
  const categories = useCategoryStore((s) => s.categories)
  const seeded = useRef(false)

  // ── Seed data (datas relativas ao mês atual) ──
  useEffect(() => {
    if (seeded.current || transactions.length > 0) return
    seeded.current = true
    const now = new Date()
    const d = (day: number) =>
      new Date(now.getFullYear(), now.getMonth(), day).toISOString().split('T')[0]
    const prev = (day: number) =>
      new Date(now.getFullYear(), now.getMonth() - 1, day).toISOString().split('T')[0]

    const seed = [
      { type: 'income'  as const, amount: 6500, description: 'Salário',          categoryId: 'salary',    date: d(1) },
      { type: 'expense' as const, amount: 450,  description: 'Supermercado',      categoryId: 'food',      date: d(3) },
      { type: 'expense' as const, amount: 120,  description: 'Uber',              categoryId: 'transport', date: d(5) },
      { type: 'expense' as const, amount: 89,   description: 'Netflix + Spotify', categoryId: 'streaming', date: d(6) },
      { type: 'expense' as const, amount: 200,  description: 'Academia',          categoryId: 'health',    date: d(7) },
      { type: 'income'  as const, amount: 800,  description: 'Freelance',         categoryId: 'freelance', date: d(8) },
      { type: 'expense' as const, amount: 350,  description: 'Restaurantes',      categoryId: 'food',      date: d(10) },
      { type: 'expense' as const, amount: 180,  description: 'Farmácia',          categoryId: 'health',    date: d(12) },
      { type: 'expense' as const, amount: 95,   description: 'iFood',             categoryId: 'food',      date: d(15) },
      { type: 'income'  as const, amount: 5800, description: 'Salário',           categoryId: 'salary',    date: prev(1) },
      { type: 'expense' as const, amount: 600,  description: 'Roupas',            categoryId: 'shopping',  date: prev(14) },
      { type: 'expense' as const, amount: 320,  description: 'Supermercado',      categoryId: 'food',      date: prev(20) },
    ]
    seed.forEach(createTransaction)
  }, [])

  // ── Métricas do mês atual ──
  const thisMonth = useMemo(() => {
    const iv = monthInterval(0)
    const tx = filterByInterval(transactions, iv)
    const income  = tx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
    const expense = tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [transactions])

  const lastMonth = useMemo(() => {
    const iv = monthInterval(1)
    const tx = filterByInterval(transactions, iv)
    const income  = tx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
    const expense = tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [transactions])

  const savingsRate = thisMonth.income > 0
    ? Math.round(((thisMonth.income - thisMonth.expense) / thisMonth.income) * 100)
    : 0

  // ── Dados do gráfico de barras (últimos 6 meses) ──
  const barData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i)
      const iv = { start: startOfMonth(date), end: endOfMonth(date) }
      const tx = filterByInterval(transactions, iv)
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        Receitas: tx.filter((t) => t.type === 'income').reduce((a, t)  => a + t.amount, 0),
        Despesas: tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
      }
    }),
    [transactions]
  )

  // ── Dados do gráfico de pizza (gastos por categoria) ──
  const pieData = useMemo(() => {
    const iv = monthInterval(0)
    const expenses = filterByInterval(transactions, iv).filter((t) => t.type === 'expense')
    return categories
      .map((cat) => ({
        name: cat.name,
        value: expenses.filter((t) => t.categoryId === cat.id).reduce((a, t) => a + t.amount, 0),
        color: cat.color,
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [transactions, categories])

  // ── Últimas transações ──
  const recent = useMemo(() => transactions.slice(0, 5), [transactions])

  const user = auth.currentUser
  const firstName = user?.displayName?.split(' ')[0] ?? 'usuário'
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-light text-sm capitalize">{currentMonth}</p>
          <h1 className="text-dark text-2xl font-bold mt-0.5">
            {getGreeting()}, {firstName} 👋
          </h1>
        </div>
        <Link
          to="/transactions"
          className="hidden md:flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>+ Novo lançamento</span>
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Wallet}
          label="Saldo do mês"
          value={formatCurrency(thisMonth.balance)}
          trend={trendPct(thisMonth.balance, lastMonth.balance)}
          trendUp
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Receitas"
          value={formatCurrency(thisMonth.income)}
          trend={trendPct(thisMonth.income, lastMonth.income)}
          trendUp
          iconBg="bg-accent/10"
          iconColor="text-accent"
        />
        <StatCard
          icon={TrendingDown}
          label="Despesas"
          value={formatCurrency(thisMonth.expense)}
          trend={trendPct(thisMonth.expense, lastMonth.expense)}
          trendUp={false}
          iconBg="bg-danger/10"
          iconColor="text-danger"
        />
        <StatCard
          icon={Sparkles}
          label="Taxa de poupança"
          value={`${savingsRate}%`}
          trend={null}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">

        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-dark font-semibold">Receita vs Despesa</p>
              <p className="text-light text-xs mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-light">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
                Receitas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" />
                Despesas
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={10} barGap={4}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<BarChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="Receitas" fill="#00C48C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="mb-4">
            <p className="text-dark font-semibold">Gastos por categoria</p>
            <p className="text-light text-xs mt-0.5">Este mês</p>
          </div>

          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-light text-sm">Sem despesas este mês</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col gap-1.5 mt-2">
                {pieData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-mid">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-dark font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Últimas transações ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-dark font-semibold">Últimas transações</p>
            <p className="text-light text-xs mt-0.5">{transactions.length} no total</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:gap-2.5 transition-all"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-light text-sm text-center py-8">
            Nenhum lançamento ainda.
          </p>
        ) : (
          <div>
            {recent.map((t) => (
              <DashboardRow
                key={t.id}
                transaction={t}
                category={categories.find((c) => c.id === t.categoryId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
