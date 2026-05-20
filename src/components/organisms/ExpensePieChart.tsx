import { useState } from 'react'
import { PieChart, Pie, Tooltip, ResponsiveContainer, type PieProps } from 'recharts'
import { PieChart as PieChartIcon, X } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PieChartItem {
  name:       string
  value:      number
  color:      string
  categoryId: string
}

interface Props {
  data:          PieChartItem[]
  selectedId:    string | null
  onSelect:      (id: string | null) => void
}

// ── Tooltip customizado ───────────────────────────────────────────────────────

interface TooltipEntry {
  name?:    string
  value?:   number
  payload?: { color?: string }
}

function ChartTooltip({ active, payload, total }: {
  active?:  boolean
  payload?: ReadonlyArray<unknown>
  total:    number
}) {
  if (!active || !payload?.length) return null
  const d     = payload[0] as TooltipEntry
  const val   = d.value ?? 0
  const pct   = total > 0 ? ((val / total) * 100).toFixed(1) : '0'
  const color = d.payload?.color

  return (
    <div className="bg-[#070D1A] text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl border border-white/10 space-y-1">
      <div className="flex items-center gap-2 font-semibold">
        {color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />}
        {d.name}
      </div>
      <p className="text-slate-300 tabular-nums">{formatCurrency(val)}</p>
      <p className="text-slate-400">{pct}% do total</p>
    </div>
  )
}

// ── Linha da legenda ──────────────────────────────────────────────────────────

function LegendRow({
  item, total, selected, onClick,
}: {
  item:     PieChartItem
  total:    number
  selected: boolean
  onClick:  () => void
}) {
  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-left group',
        selected
          ? 'bg-slate-100 ring-1 ring-slate-200'
          : 'hover:bg-slate-50'
      )}
      aria-pressed={selected}
      aria-label={`${item.name}: ${formatCurrency(item.value)}, ${pct}%`}
    >
      {/* Cor */}
      <span
        className="w-3 h-3 rounded-sm flex-shrink-0 transition-transform group-hover:scale-110"
        style={{ backgroundColor: item.color }}
        aria-hidden="true"
      />

      {/* Nome */}
      <span className={cn(
        'flex-1 text-sm truncate transition-colors',
        selected ? 'text-dark font-semibold' : 'text-mid'
      )}>
        {item.name}
      </span>

      {/* % */}
      <span className={cn(
        'text-xs tabular-nums',
        selected ? 'text-mid' : 'text-light'
      )}>
        {pct}%
      </span>

      {/* Valor */}
      <span className={cn(
        'text-xs font-semibold tabular-nums min-w-[72px] text-right',
        selected ? 'text-dark' : 'text-mid'
      )}>
        {formatCurrency(item.value)}
      </span>
    </button>
  )
}

// ── ExpensePieChart ───────────────────────────────────────────────────────────

export function ExpensePieChart({ data, selectedId, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const total = data.reduce((a, d) => a + d.value, 0)

  // Aplica dimming nas fatias não selecionadas
  const chartData = data.map((d) => {
    const isSelected = selectedId === d.categoryId
    const isHovered  = hoveredId  === d.categoryId
    const dimmed     = selectedId !== null && !isSelected && !isHovered

    return {
      ...d,
      fill:        dimmed ? `${d.color}30` : d.color,
      stroke:      isSelected ? '#fff' : 'transparent',
      strokeWidth: isSelected ? 2 : 0,
    }
  })

  function handlePieClick(_: unknown, index: number) {
    const item = data[index]
    if (!item) return
    onSelect(selectedId === item.categoryId ? null : item.categoryId)
  }

  // Estado vazio
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
          <PieChartIcon size={24} className="text-light" aria-hidden="true" />
        </div>
        <p className="text-light text-sm text-center">Nenhuma despesa no período</p>
      </div>
    )
  }

  const selectedItem = selectedId ? data.find((d) => d.categoryId === selectedId) : null

  return (
    <div className="flex flex-col gap-4">

      {/* Donut chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive
              animationBegin={100}
              animationDuration={900}
              onClick={handlePieClick as PieProps['onClick']}
              onMouseEnter={(_, index) => setHoveredId(data[index]?.categoryId ?? null)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            />
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip active={active} payload={payload} total={total} />
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Texto central do donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {selectedItem ? (
            <>
              <span className="text-xs text-light text-center px-4 truncate max-w-[120px]">
                {selectedItem.name}
              </span>
              <span
                className="text-lg font-bold text-dark tabular-nums"
                style={{ color: selectedItem.color }}
              >
                {total > 0 ? Math.round((selectedItem.value / total) * 100) : 0}%
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-light">Total</span>
              <span className="text-sm font-bold text-dark tabular-nums">
                {formatCurrency(total)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legenda interativa */}
      <div className="flex flex-col gap-0.5">
        {/* Header da legenda + botão limpar */}
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[10px] font-semibold text-light uppercase tracking-wider">
            Categoria
          </span>
          {selectedId && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="flex items-center gap-1 text-[10px] text-light hover:text-danger transition-colors"
              aria-label="Limpar seleção de categoria"
            >
              <X size={11} aria-hidden="true" />
              Limpar filtro
            </button>
          )}
        </div>

        {data.map((item) => (
          <LegendRow
            key={item.categoryId}
            item={item}
            total={total}
            selected={selectedId === item.categoryId}
            onClick={() => onSelect(selectedId === item.categoryId ? null : item.categoryId)}
          />
        ))}
      </div>
    </div>
  )
}
