import { useState, useMemo } from 'react'
import {
  Pencil, Trash2, Archive, ArchiveRestore,
  Plus, ChevronDown, PiggyBank, Gauge, Calendar, Target,
} from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/components/atoms'
import { useGoals } from '@/hooks'
import { useTransactionStore } from '@/store'
import { useCategoryStore } from '@/store'
import { formatCurrency } from '@/utils/formatCurrency'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { cn } from '@/utils/cn'
import type { Goal } from '@/types'

// ── Barra de progresso ────────────────────────────────────────────────────────

function ProgressBar({ progress, type }: { progress: number; type: 'save' | 'limit' }) {
  const barColor = type === 'save'
    ? progress >= 100 ? 'bg-accent'
    : progress >= 80  ? 'bg-accent'
    : progress >= 50  ? 'bg-primary'
    : 'bg-primary'
    : progress >= 100 ? 'bg-danger'
    : progress >= 90  ? 'bg-danger'
    : progress >= 70  ? 'bg-warning'
    : 'bg-accent'

  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar"
      aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn('h-full rounded-full transition-all duration-700', barColor)}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}

// ── Modal de contribuição ─────────────────────────────────────────────────────

function ContributeModal({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const { addContribution } = useGoals()

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const value = parseFloat(amount.replace(',', '.'))
    if (!value || value <= 0) {
      toast.error('Digite um valor válido')
      return
    }
    addContribution(goal.id, value)
    onClose()
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl md:rounded-2xl p-6 shadow-2xl">
        <h3 className="text-dark font-bold text-base mb-1">Adicionar valor</h3>
        <p className="text-light text-xs mb-4">
          Faltam <span className="font-semibold text-primary">{formatCurrency(remaining)}</span> para atingir a meta
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="contrib-amount" className="text-sm font-medium text-mid">Valor (R$)</label>
            <input
              id="contrib-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-light px-4 py-3 text-dark text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Valor a adicionar"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">Adicionar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── GoalCard ──────────────────────────────────────────────────────────────────

interface GoalCardProps {
  goal:     Goal
  onEdit:   (goal: Goal) => void
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { deleteGoal, archiveGoal, unarchiveGoal, getProgress, getDaysLeft } = useGoals()
  const transactions = useTransactionStore((s) => s.transactions)
  const categories   = useCategoryStore((s) => s.categories)

  const [showContribute, setShowContribute] = useState(false)
  const [showDetail,     setShowDetail]     = useState(false)

  // Para metas de limite: currentAmount é calculado das transações do mês atual na categoria
  const effectiveCurrentAmount = useMemo(() => {
    if (goal.type !== 'limit' || !goal.categoryId) return goal.currentAmount
    const now = new Date()
    const iv  = { start: startOfMonth(now), end: endOfMonth(now) }
    return transactions
      .filter((t) =>
        t.categoryId === goal.categoryId &&
        t.type === 'expense' &&
        isWithinInterval(parseISO(t.date), iv)
      )
      .reduce((a, t) => a + t.amount, 0)
  }, [goal, transactions])

  const effectiveProgress = goal.targetAmount > 0
    ? Math.min(Math.round((effectiveCurrentAmount / goal.targetAmount) * 100), 100)
    : 0

  const progress  = goal.type === 'limit' ? effectiveProgress : getProgress(goal)
  const daysLeft  = getDaysLeft(goal)
  const isOverdue = daysLeft < 0
  const isDone    = progress >= 100
  const category  = goal.categoryId ? categories.find((c) => c.id === goal.categoryId) : undefined
  const CategoryIcon = category ? getCategoryIcon(category.icon) : null

  // Transações vinculadas à meta
  const relatedTx = transactions.filter((t) => t.goalId === goal.id)

  function handleDelete() {
    deleteGoal(goal.id)
    toast(`"${goal.title}" excluída`, {
      duration: 4000,
      action: { label: 'Desfazer', onClick: () => { /* restore not implemented */ } },
    })
  }

  function handleArchive() {
    if (goal.isArchived) unarchiveGoal(goal.id)
    else archiveGoal(goal.id)
  }

  // Label dos dias restantes
  const daysLabel = isOverdue
    ? `Venceu há ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) !== 1 ? 's' : ''}`
    : daysLeft === 0
    ? 'Vence hoje!'
    : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`

  const daysColor = isOverdue || daysLeft === 0
    ? 'text-danger'
    : daysLeft <= 7
    ? 'text-warning'
    : 'text-light'

  return (
    <>
      <div className={cn(
        'bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-4 transition-all',
        goal.isArchived ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:shadow-md'
      )}>

        {/* Header: tipo + ícone categoria + título */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
              goal.type === 'save' ? 'bg-primary/10' : 'bg-warning/10'
            )}>
              {goal.type === 'save'
                ? <PiggyBank size={18} className="text-primary" aria-hidden="true" />
                : <Gauge     size={18} className="text-warning" aria-hidden="true" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-dark font-semibold text-sm truncate">{goal.title}</p>
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                goal.type === 'save'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-warning/10 text-warning'
              )}>
                {goal.type === 'save' ? 'Economizar' : 'Limite'}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-1 flex-shrink-0">
            {!goal.isArchived && goal.type === 'save' && (
              <button
                onClick={() => setShowContribute(true)}
                aria-label="Adicionar valor"
                title="Adicionar valor"
                className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Plus size={14} />
              </button>
            )}
            {!goal.isArchived && (
              <button onClick={() => onEdit(goal)} aria-label="Editar meta"
                className="p-1.5 rounded-lg text-light hover:text-primary hover:bg-blue-50 transition-colors">
                <Pencil size={14} />
              </button>
            )}
            <button onClick={handleArchive}
              aria-label={goal.isArchived ? 'Reativar meta' : 'Arquivar meta'}
              className="p-1.5 rounded-lg text-light hover:text-mid hover:bg-slate-100 transition-colors">
              {goal.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            </button>
            <button onClick={handleDelete} aria-label="Excluir meta"
              className="p-1.5 rounded-lg text-light hover:text-danger hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progresso */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end text-xs">
            <span className="text-mid tabular-nums">
              {formatCurrency(effectiveCurrentAmount)}
              <span className="text-light"> / {formatCurrency(goal.targetAmount)}</span>
            </span>
            <span className={cn('font-bold text-base tabular-nums', isDone ? 'text-accent' : 'text-dark')}>
              {progress}%
            </span>
          </div>
          <ProgressBar progress={progress} type={goal.type} />
          {goal.type === 'limit' && goal.categoryId && (
            <p className="text-light text-xs">calculado dos gastos deste mês</p>
          )}
          {isDone && (
            <p className={cn('text-xs font-semibold text-center', goal.type === 'limit' ? 'text-danger' : 'text-accent')}>
              {goal.type === 'limit' ? 'Limite atingido! ⚠️' : 'Meta atingida! 🎉'}
            </p>
          )}
        </div>

        {/* Prazo + categoria */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-light" aria-hidden="true" />
            <span className="text-light">
              {format(parseISO(goal.deadline), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <span className={cn('font-medium', daysColor)}>{daysLabel}</span>
        </div>

        {/* Categoria vinculada */}
        {category && CategoryIcon && (
          <div className="flex items-center gap-2 text-xs text-light">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}>
              <CategoryIcon size={11} style={{ color: category.color }} aria-hidden="true" />
            </div>
            <span className="text-mid">{category.name}</span>
          </div>
        )}

        {/* Descrição */}
        {goal.description && (
          <p className="text-light text-xs leading-relaxed">{goal.description}</p>
        )}

        {/* Transações relacionadas (expandível) */}
        {relatedTx.length > 0 && (
          <div>
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-light hover:text-mid transition-colors w-full"
            >
              <Target size={12} aria-hidden="true" />
              {relatedTx.length} transação{relatedTx.length !== 1 ? 'ões' : ''} vinculada{relatedTx.length !== 1 ? 's' : ''}
              <ChevronDown size={12} className={cn('ml-auto transition-transform', showDetail && 'rotate-180')} aria-hidden="true" />
            </button>

            {showDetail && (
              <div className="mt-2 border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                {relatedTx.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-mid truncate flex-1 mr-2">{t.description}</span>
                    <span className="text-light mr-2">{format(parseISO(t.date), 'dd/MM', { locale: ptBR })}</span>
                    <span className={cn('font-semibold tabular-nums', t.type === 'income' ? 'text-accent' : 'text-danger')}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
                {relatedTx.length > 5 && (
                  <p className="text-light text-xs text-center">+{relatedTx.length - 5} mais</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de contribuição */}
      {showContribute && (
        <ContributeModal goal={goal} onClose={() => setShowContribute(false)} />
      )}
    </>
  )
}
