import type { FC } from 'react'
import { HeartPulse } from 'lucide-react'
import { cn } from '@/utils/cn'

interface HealthData {
  necessitiesPct: number
  wantsPct:       number
  savingsPct:     number
}

interface Props {
  health: HealthData
}

interface BarRowProps {
  label:  string
  actual: number
  target: number
  color:  string
}

function BarRow({ label, actual, target, color }: BarRowProps) {
  const clamped = Math.min(Math.max(actual, 0), 100)
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-mid font-medium">{label}</span>
        <span className="text-light tabular-nums">
          <span className="text-dark font-semibold">{actual.toFixed(0)}%</span> · meta {target}%
        </span>
      </div>
      <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${clamped}%` }} />
        {/* Marcador da meta */}
        <div className="absolute top-0 h-full w-0.5 bg-dark/30" style={{ left: `${target}%` }} aria-hidden="true" />
      </div>
    </div>
  )
}

function getVerdict(savingsPct: number): { text: string; color: string } {
  if (savingsPct < 0)  return { text: 'Alerta: você gastou mais do que ganhou neste período.', color: 'text-danger' }
  if (savingsPct < 10) return { text: 'Atenção: sua poupança está abaixo do recomendado.',      color: 'text-warning' }
  if (savingsPct < 20) return { text: 'Bom! Está perto da meta — busque poupar 20% da renda.',   color: 'text-primary' }
  return { text: 'Excelente! Você está dentro da meta de poupança (20%+).', color: 'text-accent' }
}

export const FinancialHealthCard: FC<Props> = ({ health }) => {
  const { necessitiesPct, wantsPct, savingsPct } = health
  const verdict = getVerdict(savingsPct)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
          <HeartPulse size={16} className="text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-dark font-semibold text-sm">Saúde financeira</p>
          <p className="text-light text-xs">Baseado na regra 50/30/20</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <BarRow label="Necessidades" actual={necessitiesPct} target={50} color="bg-primary" />
        <BarRow label="Desejos"      actual={wantsPct}       target={30} color="bg-warning" />
        <BarRow label="Poupança"     actual={Math.max(savingsPct, 0)} target={20} color="bg-accent" />
      </div>

      <p className={cn('text-xs font-medium mt-4 pt-3 border-t border-slate-100 dark:border-slate-700', verdict.color)}>
        {verdict.text}
      </p>
    </div>
  )
}
