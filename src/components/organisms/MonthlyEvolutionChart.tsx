import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts'
import {
  format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { Transaction } from '@/types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Period = 3 | 6 | 12

interface ChartPoint {
  month:    string   // abreviado: 'Jan', 'Fev'…
  label:    string   // completo: 'janeiro de 2026' (tooltip)
  Receitas: number
  Despesas: number
  balance:  number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function filterByInterval(txs: Transaction[], iv: { start: Date; end: Date }) {
  return txs.filter((t) => isWithinInterval(parseISO(t.date), iv))
}

function yFmt(value: number): string {
  if (value === 0) return 'R$0'
  if (value >= 1000) return `R$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  return `R$${value}`
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipPayloadEntry { name?: string; value?: unknown; stroke?: string }

function ChartTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: ReadonlyArray<unknown>
  label?:   string
}) {
  if (!active || !payload?.length) return null

  const entries = payload as TooltipPayloadEntry[]
  const income  = (entries.find((e) => e.name === 'Receitas')?.value as number) ?? 0
  const expense = (entries.find((e) => e.name === 'Despesas')?.value as number) ?? 0
  const balance = income - expense

  return (
    <div className="bg-[#070D1A] text-white text-xs rounded-xl px-3.5 py-3 shadow-2xl border border-white/10 min-w-[180px]">
      <p className="font-semibold text-slate-300 mb-2.5 capitalize">{label}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" aria-hidden="true" />
            Receitas
          </span>
          <span className="font-semibold tabular-nums text-accent">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-danger inline-block" aria-hidden="true" />
            Despesas
          </span>
          <span className="font-semibold tabular-nums text-danger">{formatCurrency(expense)}</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex items-center justify-between gap-6">
          <span className="text-slate-400">Saldo</span>
          <span className={cn('font-bold tabular-nums', balance >= 0 ? 'text-accent' : 'text-danger')}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── MonthlyEvolutionChart ────────────────────────────────────────────────────

interface Props {
  transactions: Transaction[]
  monthOffset:  number
}

const PERIODS: Period[] = [3, 6, 12]

export function MonthlyEvolutionChart({ transactions, monthOffset }: Props) {
  const [period, setPeriod] = useState<Period>(6)

  // Dados: `period` meses terminando no mês selecionado
  const data = useMemo((): ChartPoint[] =>
    Array.from({ length: period }, (_, i) => {
      const offset = monthOffset + (period - 1 - i)
      const date   = subMonths(new Date(), offset)
      const iv     = { start: startOfMonth(date), end: endOfMonth(date) }
      const tx     = filterByInterval(transactions, iv)
      const income  = tx.filter((t) => t.type === 'income').reduce((a, t)  => a + t.amount, 0)
      const expense = tx.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
      return {
        month:    format(date, 'MMM', { locale: ptBR }),
        label:    format(date, "MMMM 'de' yyyy", { locale: ptBR }),
        Receitas: income,
        Despesas: expense,
        balance:  income - expense,
      }
    }),
    [transactions, period, monthOffset]
  )

  const last  = data[data.length - 1]

  return (
    <div className="flex flex-col gap-4">

      {/* Header + seletor de período */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark font-semibold">Evolução mensal</p>
          <p className="text-light text-xs mt-0.5">Receitas e despesas</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1" role="group" aria-label="Selecionar período">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                period === p
                  ? 'bg-white text-dark shadow-sm'
                  : 'text-light hover:text-mid'
              )}
            >
              {p}M
            </button>
          ))}
        </div>
      </div>

      {/* AreaChart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>

          {/* Gradientes de preenchimento */}
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00C48C" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00C48C" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grid horizontal apenas */}
          <CartesianGrid vertical={false} stroke="#f1f5f9" />

          {/* Eixos */}
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={yFmt}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          {/* Tooltip */}
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} payload={payload} label={label} />
            )}
            cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {/* Área de despesas (abaixo, menos importante visualmente) */}
          <Area
            type="monotone"
            dataKey="Despesas"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#expenseGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#EF4444', stroke: 'white', strokeWidth: 2 }}
            isAnimationActive
            animationBegin={150}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* Área de receitas (acima, mais importante) */}
          <Area
            type="monotone"
            dataKey="Receitas"
            stroke="#00C48C"
            strokeWidth={2}
            fill="url(#incomeGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#00C48C', stroke: 'white', strokeWidth: 2 }}
            isAnimationActive
            animationBegin={50}
            animationDuration={1200}
            animationEasing="ease-out"
          />

          {/* Pontos destacados no mês selecionado (último) */}
          {last && last.Receitas > 0 && (
            <ReferenceDot
              x={last.month} y={last.Receitas}
              r={5} fill="#00C48C" stroke="white" strokeWidth={2}
              isFront
            />
          )}
          {last && last.Despesas > 0 && (
            <ReferenceDot
              x={last.month} y={last.Despesas}
              r={5} fill="#EF4444" stroke="white" strokeWidth={2}
              isFront
            />
          )}

        </AreaChart>
      </ResponsiveContainer>

      {/* Sumário abaixo do gráfico */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-mid">
            <span className="w-8 h-0.5 bg-accent rounded-full inline-block" aria-hidden="true" />
            Receitas
          </span>
          <span className="flex items-center gap-1.5 text-mid">
            <span className="w-8 h-0.5 bg-danger rounded-full inline-block" aria-hidden="true" />
            Despesas
          </span>
        </div>
        {last && (
          <p className={cn(
            'text-xs font-semibold tabular-nums',
            last.balance >= 0 ? 'text-accent' : 'text-danger'
          )}>
            {last.balance >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(last.balance))} no período
          </p>
        )}
      </div>
    </div>
  )
}
