import type { FC } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'

interface ChartPoint {
  label:    string
  Receitas: number
  Despesas: number
}

interface TooltipEntry { name?: string; value?: unknown; color?: string }

function ChartTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: ReadonlyArray<unknown>
  label?:   string | number
}) {
  if (!active || !payload?.length) return null
  const entries = payload as TooltipEntry[]
  return (
    <div className="bg-[#070D1A] text-white text-xs rounded-xl p-3 shadow-2xl border border-white/10">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {entries.map((p) => (
        <p key={p.name} className="flex items-center gap-2 mt-1">
          <span style={{ color: p.color }}>●</span>
          {p.name}: <span className="font-semibold">{formatCurrency((p.value as number) ?? 0)}</span>
        </p>
      ))}
    </div>
  )
}

function yFmt(value: number): string {
  if (value === 0) return 'R$0'
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`
  return `R$${value}`
}

interface Props {
  data: ChartPoint[]
}

export const ReportBarChart: FC<Props> = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} barSize={data.length > 10 ? 6 : 14} barGap={4}>
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
        interval={data.length > 15 ? Math.ceil(data.length / 10) : 0} />
      <YAxis tickFormatter={yFmt} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={48} />
      <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
      <Bar dataKey="Receitas" fill="#00C48C" radius={[3, 3, 0, 0]} />
      <Bar dataKey="Despesas" fill="#EF4444" radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
)
