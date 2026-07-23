import { type FC, useState } from 'react'
import { z } from 'zod'
import { X, PiggyBank, Gauge } from 'lucide-react'
import { toast } from 'sonner'
import { Input, Button } from '@/components/atoms'
import { useCategoryStore } from '@/store'
import { useGoals, useModalA11y } from '@/hooks'
import { cn } from '@/utils/cn'
import type { Goal } from '@/types'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title:         z.string().min(1, 'Título obrigatório').max(50, 'Máximo 50 caracteres'),
  targetAmount:  z.coerce.number().positive('Valor deve ser positivo'),
  currentAmount: z.coerce.number().min(0, 'Não pode ser negativo'),
  deadline:      z.string().min(1, 'Prazo obrigatório'),
  description:   z.string().max(200, 'Máximo 200 caracteres').optional(),
})

type FormErrors = Partial<Record<keyof z.infer<typeof schema> | 'type', string>>

// ── Tipos de meta ─────────────────────────────────────────────────────────────

const GOAL_TYPES = [
  { value: 'save',  label: 'Economizar', desc: 'Acumular um valor ao longo do tempo',  icon: PiggyBank },
  { value: 'limit', label: 'Limite',     desc: 'Não gastar mais que X em uma categoria', icon: Gauge     },
] as const

// ── GoalForm ──────────────────────────────────────────────────────────────────

interface GoalFormProps {
  goal?:    Goal
  onClose:  () => void
}

export const GoalForm: FC<GoalFormProps> = ({ goal, onClose }) => {
  const isEdit = !!goal
  const { createGoal, updateGoal } = useGoals()
  const categories = useCategoryStore((s) => s.categories)

  const [type,       setType]       = useState<'save' | 'limit'>(goal?.type ?? 'save')
  const [categoryId, setCategoryId] = useState(goal?.categoryId ?? '')
  const [errors,     setErrors]     = useState<FormErrors>({})

  const modalRef = useModalA11y(onClose)
  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const result = schema.safeParse({
      title:         data.get('title'),
      targetAmount:  data.get('targetAmount'),
      // limit goals: currentAmount é calculado automaticamente das transações
      currentAmount: type === 'limit' ? '0' : (data.get('currentAmount') || '0'),
      deadline:      data.get('deadline'),
      description:   data.get('description') || undefined,
    })

    if (!result.success) {
      const { fieldErrors } = result.error.flatten((i) => i.message)
      setErrors(Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
      ) as FormErrors)
      return
    }

    const payload: Omit<Goal, 'id'> = {
      ...result.data,
      type,
      categoryId: categoryId || undefined,
      isArchived: goal?.isArchived ?? false,
    }

    if (isEdit && goal) {
      updateGoal(goal.id, payload)
      toast.success('Meta atualizada!')
    } else {
      createGoal(payload)
      toast.success('Meta criada!')
    }

    onClose()
  }

  const selectCls = cn(
    'w-full rounded-xl border border-light px-4 py-3 text-base text-dark bg-surface',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-form-title"
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h2 id="goal-form-title" className="text-dark font-bold text-lg">{isEdit ? 'Editar meta' : 'Nova meta'}</h2>
          <button onClick={onClose} aria-label="Fechar" className="p-1.5 rounded-lg text-light hover:text-dark hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto">

          {/* Tipo de meta */}
          <div>
            <p className="text-sm font-medium text-mid mb-2">Tipo de meta</p>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  aria-pressed={type === value}
                  className={cn(
                    'flex flex-col items-start gap-1.5 p-3.5 rounded-xl border text-left transition-all',
                    type === value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <Icon size={18} className={type === value ? 'text-primary' : 'text-light'} aria-hidden="true" />
                  <span className={cn('text-sm font-semibold', type === value ? 'text-primary' : 'text-dark')}>{label}</span>
                  <span className="text-xs text-light leading-snug">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <Input name="title" label="Título da meta" placeholder="Ex: Viagem para Europa, Fundo de emergência..."
            defaultValue={goal?.title} error={errors.title} maxLength={50} />

          {/* Valor alvo + progresso inicial */}
          <div className={type === 'save' ? 'grid grid-cols-2 gap-3' : ''}>
            <Input name="targetAmount" label={type === 'save' ? 'Valor alvo (R$)' : 'Limite mensal (R$)'}
              type="number" step="0.01" min="0.01" placeholder="0,00"
              defaultValue={goal?.targetAmount} error={errors.targetAmount} />
            {type === 'save' && (
              <Input name="currentAmount" label="Já tenho (R$)"
                type="number" step="0.01" min="0" placeholder="0,00"
                defaultValue={goal?.currentAmount ?? 0} error={errors.currentAmount}
                helperText="Valor que você já tem guardado" />
            )}
          </div>

          {/* Prazo */}
          <Input name="deadline" label="Prazo" type="date"
            defaultValue={goal?.deadline ?? ''} min={today} error={errors.deadline} />

          {/* Categoria (especialmente útil para limite) */}
          <div className="flex flex-col gap-1">
            <label htmlFor="goal-category" className="text-sm font-medium text-mid">
              Categoria
              <span className="text-light font-normal ml-1">(opcional)</span>
            </label>
            <select id="goal-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls}>
              <option value="">Nenhuma categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <label htmlFor="goal-desc" className="text-sm font-medium text-mid">
              Descrição
              <span className="text-light font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              id="goal-desc"
              name="description"
              placeholder="Por que essa meta é importante para você?"
              defaultValue={goal?.description ?? ''}
              maxLength={200}
              rows={3}
              className={cn(selectCls, 'resize-none')}
            />
            {errors.description && <span role="alert" className="text-sm text-danger">{errors.description}</span>}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">
              {isEdit ? 'Salvar alterações' : 'Criar meta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
