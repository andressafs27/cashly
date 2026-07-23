import { useState } from 'react'
import { Plus, Target, PiggyBank, Gauge, Archive } from 'lucide-react'
import { Button } from '@/components/atoms'
import { EmptyState } from '@/components/molecules/EmptyState'
import { GoalForm } from '@/components/organisms/GoalForm'
import { GoalCard } from '@/components/organisms/GoalCard'
import { useGoals } from '@/hooks'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { Goal } from '@/types'

// ── Resumo de metas ───────────────────────────────────────────────────────────

function GoalSummary({ activeGoals, completedGoals }: {
  activeGoals:    Goal[]
  completedGoals: Goal[]
}) {
  const totalTarget  = activeGoals.reduce((a, g) => a + g.targetAmount, 0)
  const totalCurrent = activeGoals.reduce((a, g) => a + g.currentAmount, 0)
  const overallPct   = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  const saveGoals  = activeGoals.filter((g) => g.type === 'save')
  const limitGoals = activeGoals.filter((g) => g.type === 'limit')

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-light text-xs">Metas ativas</p>
        <p className="text-dark text-2xl font-bold mt-1 tabular-nums">{activeGoals.length}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-light">
          <span className="flex items-center gap-1"><PiggyBank size={11} /> {saveGoals.length}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Gauge size={11} /> {limitGoals.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-light text-xs">Concluídas</p>
        <p className="text-accent text-2xl font-bold mt-1 tabular-nums">{completedGoals.length}</p>
        <p className="text-light text-xs mt-1">de {activeGoals.length} ativas</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-light text-xs">Total acumulado</p>
        <p className="text-dark text-xl font-bold mt-1 tabular-nums">{formatCurrency(totalCurrent)}</p>
        <p className="text-light text-xs mt-1">de {formatCurrency(totalTarget)}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-light text-xs">Progresso geral</p>
        <p className={cn('text-2xl font-bold mt-1 tabular-nums', overallPct >= 80 ? 'text-accent' : 'text-dark')}>
          {overallPct}%
        </p>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
          <div
            className={cn('h-full rounded-full transition-all duration-700',
              overallPct >= 80 ? 'bg-accent' : overallPct >= 50 ? 'bg-primary' : 'bg-primary'
            )}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Goals page ────────────────────────────────────────────────────────────────

export function Goals() {
  const { activeGoals, archivedGoals, completedGoals } = useGoals()

  const [formOpen,      setFormOpen]      = useState(false)
  const [editing,       setEditing]       = useState<Goal | null>(null)
  const [showArchived,  setShowArchived]  = useState(false)

  function handleEdit(goal: Goal) {
    setEditing(goal)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditing(null)
  }

  const saveGoals  = activeGoals.filter((g) => g.type === 'save')
  const limitGoals = activeGoals.filter((g) => g.type === 'limit')

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-dark text-2xl font-bold">Metas financeiras</h1>
          <p className="text-light text-sm mt-1">
            {activeGoals.length} ativa{activeGoals.length !== 1 ? 's' : ''}
            {archivedGoals.length > 0 && ` · ${archivedGoals.length} arquivada${archivedGoals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true) }} iconLeft={<Plus size={16} />} size="md">
          Nova meta
        </Button>
      </div>

      {/* Resumo */}
      {activeGoals.length > 0 && (
        <GoalSummary activeGoals={activeGoals} completedGoals={completedGoals} />
      )}

      {/* Estado vazio global */}
      {activeGoals.length === 0 && (
        <EmptyState
          icon={Target}
          title="Nenhuma meta ainda"
          description="Defina objetivos financeiros e acompanhe seu progresso. Curto, médio ou longo prazo."
          action={{ label: '+ Criar primeira meta', onClick: () => setFormOpen(true) }}
        />
      )}

      {/* Economizar */}
      {saveGoals.length > 0 && (
        <section aria-labelledby="save-heading" className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
              <PiggyBank size={14} className="text-primary" aria-hidden="true" />
            </div>
            <h2 id="save-heading" className="text-dark text-sm font-semibold">
              Economizar
              <span className="text-light font-normal ml-2">({saveGoals.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saveGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
            ))}
          </div>
        </section>
      )}

      {/* Limite */}
      {limitGoals.length > 0 && (
        <section aria-labelledby="limit-heading" className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-warning/10 rounded-lg flex items-center justify-center">
              <Gauge size={14} className="text-warning" aria-hidden="true" />
            </div>
            <h2 id="limit-heading" className="text-dark text-sm font-semibold">
              Limite de gastos
              <span className="text-light font-normal ml-2">({limitGoals.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
            ))}
          </div>
        </section>
      )}

      {/* Arquivadas */}
      {archivedGoals.length > 0 && (
        <section aria-labelledby="archived-heading">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-2 text-light hover:text-mid transition-colors mb-3"
          >
            <Archive size={14} aria-hidden="true" />
            <h2 id="archived-heading" className="text-sm font-medium">
              Arquivadas ({archivedGoals.length})
            </h2>
          </button>

          {showArchived && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal */}
      {formOpen && (
        <GoalForm goal={editing ?? undefined} onClose={handleClose} />
      )}
    </div>
  )
}
