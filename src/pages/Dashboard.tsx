import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts'
import {
  Wallet, TrendingUp, TrendingDown, Sparkles, ArrowRight,
  PiggyBank, Info, ChevronLeft, ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { useTransactions } from '@/hooks'
import { useCountUp } from '@/hooks'
import { useCategoryStore } from '@/store'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { auth } from '@/services/firebase'
import { cn } from '@/utils/cn'
import {
  SkeletonStatCard, SkeletonChartCard, SkeletonTransactionRow,
} from '@/components/atoms'
import type { Transaction, Category } from '@/types'

// ── Tipos internos ────────────────────────────────────────────────────────────

interface ChartTooltip {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, string> }>
  label?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function monthInterval(offset: number) {
  const d = subMonths(new Date(), offset)
  return { start: startOfMonth(d), end: endOfMonth(d) }
}

function filterByInterval(txs: Transaction[], interval: { start: Date; end: Date }) {
  return txs.filter((t) => isWithinInterval(parseISO(t.date), interval))
}

function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

function deltaLabel(
  current: number,
  previous: number,
  trendUp = true,
): { text: string; color: string } | null {
  if (previous === 0) return null
  const diff = current - previous
  if (diff === 0) return null
  const isGood = trendUp ? diff > 0 : diff < 0
  return {
    text: `${diff > 0 ? '+' : '-'} ${formatCurrency(Math.abs(diff))} vs mês anterior`,
    color: isGood ? 'text-accent' : 'text-danger',
  }
}

// ── Componentes de valor animado ──────────────────────────────────────────────

function AnimatedCurrency({ amount }: { amount: number }) {
  const animated = useCountUp(amount)
  return (
    <span className="tabular-nums">
      {animated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </span>
  )
}

function AnimatedPercent({ value }: { value: number }) {
  const animated = useCountUp(value)
  return <span className="tabular-nums">{Math.round(animated)}%</span>
}

// ── Tooltip informativo ───────────────────────────────────────────────────────

function InfoTooltip({ content }: { content: string }) {
  return (
    <div className="relative group/tip inline-flex">
      <Info size={13} className="text-light hover:text-mid cursor-help transition-colors" aria-label={`Informação: ${content}`} />
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30
        opacity-0 pointer-events-none group-hover/tip:opacity-100
        transition-opacity duration-200
      ">
        <div className="bg-[#070D1A] text-white text-xs rounded-xl px-3 py-2 shadow-2xl border border-white/10 w-56 leading-relaxed text-center">
          {content}
        </div>
        <div className="w-2.5 h-2.5 bg-[#070D1A] rotate-45 mx-auto -mt-1.5 border-r border-b border-white/10" aria-hidden="true" />
      </div>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:          LucideIcon
  label:         string
  tooltip:       string
  isCurrency?:   boolean
  rawValue:      number
  trend:         number | null
  trendUp?:      boolean
  iconBg:        string
  iconColor:     string
  delta?:        { text: string; color: string } | null
  progress?:     number
  progressLabel?: string
  highlight?:    boolean
}

function StatCard({
  icon: Icon, label, tooltip, isCurrency = true, rawValue,
  trend, trendUp, iconBg, iconColor,
  delta, progress, progressLabel, highlight,
}: StatCardProps) {
  const hasPositiveTrend = trend !== null && (trendUp ? trend > 0 : trend < 0)

  return (
    <div className={cn(
      'bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-3 hover:shadow-md transition-all duration-200',
      highlight ? 'border-primary/20 ring-1 ring-primary/10' : 'border-slate-100'
    )}>

      {/* Topo: ícone + badge de variação % */}
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon size={20} className={iconColor} aria-hidden="true" />
        </div>
        {trend !== null && (
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums',
            hasPositiveTrend ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
          )}>
            {hasPositiveTrend ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Label + valor animado */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-light text-sm">{label}</p>
          <InfoTooltip content={tooltip} />
        </div>
        <p className="text-dark text-2xl font-bold tracking-tight">
          {isCurrency
            ? <AnimatedCurrency amount={rawValue} />
            : <AnimatedPercent value={rawValue} />
          }
        </p>
      </div>

      {/* Barra de progresso (taxa de poupança) */}
      {progress !== undefined && (
        <div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                progress >= 20 ? 'bg-violet-500' : progress >= 10 ? 'bg-warning' : 'bg-danger'
              )}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {progressLabel && <p className="text-light text-xs mt-1">{progressLabel}</p>}
        </div>
      )}

      {/* Delta absoluto vs mês anterior */}
      {delta && (
        <p className={cn('text-xs font-medium', delta.color)}>{delta.text}</p>
      )}
    </div>
  )
}

// ── Seletor de mês ────────────────────────────────────────────────────────────

interface MonthSelectorProps {
  offset:    number
  onChange:  (offset: number) => void
  maxOffset: number
}

function MonthSelector({ offset, onChange, maxOffset }: MonthSelectorProps) {
  const label = format(subMonths(new Date(), offset), "MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
      <button
        onClick={() => onChange(Math.min(offset + 1, maxOffset))}
        disabled={offset >= maxOffset}
        aria-label="Mês anterior"
        className="p-1 rounded-lg text-light hover:text-dark hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      <span className="text-sm font-medium text-dark px-2 capitalize min-w-[150px] text-center">
        {label}
      </span>
      <button
        onClick={() => onChange(Math.max(offset - 1, 0))}
        disabled={offset === 0}
        aria-label="Próximo mês"
        className="p-1 rounded-lg text-light hover:text-dark hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

// ── Tooltips dos gráficos ─────────────────────────────────────────────────────

function BarChartTooltip({ active, payload, label }: ChartTooltip) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#070D1A] text-white text-xs rounded-xl p-3 shadow-2xl border border-white/10">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 mt-1">
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
      <p className="mt-1 text-slate-300">{formatCurrency(d.value ?? 0)}</p>
    </div>
  )
}

// ── DashboardRow ──────────────────────────────────────────────────────────────

function DashboardRow({ transaction, category }: { transaction: Transaction; category?: Category }) {
  const isIncome = transaction.type === 'income'
  const Icon = getCategoryIcon(category?.icon ?? '')

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-xl px-1 transition-colors">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category ? `${category.color}18` : '#f1f5f9' }}
      >
        <Icon size={16} style={{ color: category?.color ?? '#94A3B8' }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-dark text-sm font-medium truncate">{transaction.description}</p>
        <p className="text-light text-xs mt-0.5">
          {category?.name ?? 'Sem categoria'} · {formatDate(transaction.date)}
        </p>
      </div>
      <span className={cn('text-sm font-semibold flex-shrink-0 tabular-nums', isIncome ? 'text-accent' : 'text-danger')}>
        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
      </span>
    </div>
  )
}

// ── Dashboard (página principal) ──────────────────────────────────────────────

export function Dashboard() {
  const { transactions, balance, createTransaction } = useTransactions()
  const categories = useCategoryStore((s) => s.categories)
  const seeded  = useRef(false)
  const [monthOffset, setMonthOffset] = useState(0)   // 0 = mês atual, 1 = mês passado…
  const [loading, setLoading]         = useState(true)

  // Skeleton loading: 700ms no primeiro mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // Seed de dados (apenas quando não há transações)
  useEffect(() => {
    if (seeded.current || transactions.length > 0) return
    seeded.current = true
    const now  = new Date()
    const d    = (day: number) => new Date(now.getFullYear(), now.getMonth(),     day).toISOString().split('T')[0]
    const prev = (day: number) => new Date(now.getFullYear(), now.getMonth() - 1, day).toISOString().split('T')[0]
    const seed = [
      { type: 'income'  as const, amount: 6500, description: 'Salário',          categoryId: 'salary',    date: d(1)     },
      { type: 'expense' as const, amount: 450,  description: 'Supermercado',      categoryId: 'food',      date: d(3)     },
      { type: 'expense' as const, amount: 120,  description: 'Uber',              categoryId: 'transport', date: d(5)     },
      { type: 'expense' as const, amount: 89,   description: 'Netflix + Spotify', categoryId: 'streaming', date: d(6)     },
      { type: 'expense' as const, amount: 200,  description: 'Academia',          categoryId: 'health',    date: d(7)     },
      { type: 'income'  as const, amount: 800,  description: 'Freelance',         categoryId: 'freelance', date: d(8)     },
      { type: 'expense' as const, amount: 350,  description: 'Restaurantes',      categoryId: 'food',      date: d(10)    },
      { type: 'expense' as const, amount: 180,  description: 'Farmácia',          categoryId: 'health',    date: d(12)    },
      { type: 'expense' as const, amount: 95,   description: 'iFood',             categoryId: 'food',      date: d(15)    },
      { type: 'income'  as const, amount: 5800, description: 'Salário',           categoryId: 'salary',    date: prev(1)  },
      { type: 'expense' as const, amount: 600,  description: 'Roupas',            categoryId: 'shopping',  date: prev(14) },
      { type: 'expense' as const, amount: 320,  description: 'Supermercado',      categoryId: 'food',      date: prev(20) },
    ]
    seed.forEach(createTransaction)
  }, [])

  // ── Métricas do mês selecionado ───────────────────────────────────────────

  const selected = useMemo(() => {
    const iv = monthInterval(monthOffset)
    const tx = filterByInterval(transactions, iv)
    const income  = tx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
    const expense = tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    return { income, expense, economia: income - expense }
  }, [transactions, monthOffset])

  const previous = useMemo(() => {
    const iv = monthInterval(monthOffset + 1)
    const tx = filterByInterval(transactions, iv)
    const income  = tx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
    const expense = tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    return { income, expense, economia: income - expense }
  }, [transactions, monthOffset])

  const savingsRate = selected.income > 0
    ? Math.max(0, Math.round((selected.economia / selected.income) * 100))
    : 0

  // ── Dados dos gráficos ────────────────────────────────────────────────────

  const barData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const offset = monthOffset + (5 - i)
      const iv = monthInterval(offset)
      const tx = filterByInterval(transactions, iv)
      return {
        month:    format(subMonths(new Date(), offset), 'MMM', { locale: ptBR }),
        Receitas: tx.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0),
        Despesas: tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
      }
    }),
    [transactions, monthOffset]
  )

  const pieData = useMemo(() => {
    const expenses = filterByInterval(transactions, monthInterval(monthOffset))
      .filter((t) => t.type === 'expense')
    return categories
      .map((cat) => ({
        name:  cat.name,
        value: expenses.filter((t) => t.categoryId === cat.id).reduce((a, t) => a + t.amount, 0),
        color: cat.color,
        fill:  cat.color,
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [transactions, categories, monthOffset])

  const recent = useMemo(() => {
    if (monthOffset === 0) return transactions.slice(0, 5)
    const iv = monthInterval(monthOffset)
    return filterByInterval(transactions, iv).slice(0, 5)
  }, [transactions, monthOffset])

  // ── Render ────────────────────────────────────────────────────────────────

  const user      = auth.currentUser
  const firstName = user?.displayName?.split(' ')[0] ?? 'usuário'

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-light text-sm">
            {getGreeting()}, <span className="text-dark font-semibold">{firstName}</span> 👋
          </p>
          <h1 className="text-dark text-2xl font-bold mt-0.5">
            Visão financeira
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector
            offset={monthOffset}
            onChange={setMonthOffset}
            maxOffset={11}
          />
          <Link
            to="/transactions"
            className="hidden md:flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            + Novo
          </Link>
        </div>
      </div>

      {/* ── Cards de resumo financeiro ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={PiggyBank}
              label="Economia do mês"
              tooltip="Diferença entre suas receitas e despesas no período. Positivo = você poupou dinheiro."
              rawValue={selected.economia}
              trend={trendPct(selected.economia, previous.economia)}
              trendUp
              iconBg={selected.economia >= 0 ? 'bg-accent/10' : 'bg-danger/10'}
              iconColor={selected.economia >= 0 ? 'text-accent' : 'text-danger'}
              delta={deltaLabel(selected.economia, previous.economia, true)}
              highlight
            />

            <StatCard
              icon={TrendingUp}
              label="Receitas"
              tooltip="Total de entradas (salário, freelance, outras rendas) no período selecionado."
              rawValue={selected.income}
              trend={trendPct(selected.income, previous.income)}
              trendUp
              iconBg="bg-accent/10"
              iconColor="text-accent"
              delta={deltaLabel(selected.income, previous.income, true)}
            />

            <StatCard
              icon={TrendingDown}
              label="Despesas"
              tooltip="Total de saídas (gastos, poupança e assinaturas) no período selecionado."
              rawValue={selected.expense}
              trend={trendPct(selected.expense, previous.expense)}
              trendUp={false}
              iconBg="bg-danger/10"
              iconColor="text-danger"
              delta={deltaLabel(selected.expense, previous.expense, false)}
            />

            <StatCard
              icon={Sparkles}
              label="Taxa de poupança"
              tooltip="Percentual da renda que foi economizada. Meta recomendada: ≥ 20% da renda mensal."
              isCurrency={false}
              rawValue={savingsRate}
              trend={null}
              iconBg="bg-violet-500/10"
              iconColor="text-violet-500"
              progress={savingsRate}
              progressLabel={
                selected.economia > 0
                  ? `${formatCurrency(selected.economia)} poupados`
                  : 'Despesas maiores que receitas'
              }
            />

            <StatCard
              icon={Wallet}
              label="Saldo acumulado"
              tooltip="Balanço total de todas as transações registradas no app (não apenas o mês selecionado)."
              rawValue={balance}
              trend={null}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
          </>
        )}
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">

        {loading ? (
          <>
            <SkeletonChartCard className="lg:col-span-3" />
            <SkeletonChartCard className="lg:col-span-2" />
          </>
        ) : (
          <>
            {/* Barras: receita vs despesa */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-dark font-semibold">Receita vs Despesa</p>
                  <p className="text-light text-xs mt-0.5">6 meses até o período selecionado</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-light">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" aria-hidden="true" />
                    Receitas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" aria-hidden="true" />
                    Despesas
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={10} barGap={4}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<BarChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="Receitas" fill="#00C48C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut: gastos por categoria */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="mb-4">
                <p className="text-dark font-semibold">Gastos por categoria</p>
                <p className="text-light text-xs mt-0.5">
                  {format(subMonths(new Date(), monthOffset), "MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-light text-sm">Sem despesas no período</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={48} outerRadius={72}
                        paddingAngle={3} dataKey="value" strokeWidth={0}
                      />
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex flex-col gap-2 mt-2">
                    {pieData.slice(0, 4).map((item) => {
                      const total = pieData.reduce((a, c) => a + c.value, 0)
                      const pct   = total > 0 ? Math.round((item.value / total) * 100) : 0
                      return (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
                          <span className="text-mid flex-1 truncate">{item.name}</span>
                          <span className="text-light tabular-nums">{pct}%</span>
                          <span className="text-dark font-medium tabular-nums">{formatCurrency(item.value)}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Últimas transações do período ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-dark font-semibold">Transações do período</p>
            <p className="text-light text-xs mt-0.5">{transactions.length} no total</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:gap-2.5 transition-all"
          >
            Ver todas <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonTransactionRow key={i} />)
        ) : recent.length === 0 ? (
          <p className="text-light text-sm text-center py-8">Nenhuma transação no período.</p>
        ) : (
          recent.map((t) => (
            <DashboardRow
              key={t.id}
              transaction={t}
              category={categories.find((c) => c.id === t.categoryId)}
            />
          ))
        )}
      </div>

    </div>
  )
}
