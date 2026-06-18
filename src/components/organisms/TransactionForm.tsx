import { type FC, useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Input, Button } from '@/components/atoms'
import { useCategoryStore } from '@/store'
import { useGoalStore } from '@/store'
import { useTransactions } from '@/hooks'
import { cn } from '@/utils/cn'
import type { Transaction } from '@/types'

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount:      z.coerce.number().positive('Valor deve ser positivo'),
  date:        z.string().min(1, 'Data obrigatória'),
})

type FormErrors = Partial<Record<keyof z.infer<typeof schema> | 'categoryId', string>>

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?:   () => void
}

const selectCls = (error?: string) => cn(
  'w-full rounded-xl border px-4 py-3 text-base text-dark bg-surface transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
  error ? 'border-danger' : 'border-light'
)

export const TransactionForm: FC<TransactionFormProps> = ({ transaction, onSuccess }) => {
  const isEdit = !!transaction
  const { createTransaction, updateTransaction } = useTransactions()

  // Categorias ativas + a atual da transação (mesmo que inativa)
  const allCategories = useCategoryStore((s) =>
    s.categories.filter((c) => (c.isActive ?? true) || c.id === transaction?.categoryId)
  )

  const [type,      setType]      = useState<'income' | 'expense'>(transaction?.type ?? 'expense')
  const [catId,     setCatId]     = useState(transaction?.categoryId   ?? '')
  const [subcatId,  setSubcatId]  = useState(transaction?.subcategoryId ?? '')
  const [goalId,    setGoalId]    = useState(transaction?.goalId ?? '')
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [loading,   setLoading]   = useState(false)

  // Metas ativas de tipo "Economizar" (save) para vincular ao lançamento
  const saveGoals = useGoalStore((s) =>
    s.goals.filter((g) => !g.isArchived && g.type === 'save' && g.currentAmount < g.targetAmount)
  )

  const today = new Date().toISOString().split('T')[0]

  // Subcategorias ativas da categoria selecionada
  const selectedCat = allCategories.find((c) => c.id === catId)
  const activeSubcats = (selectedCat?.subcategories ?? []).filter((s) => s.isActive ?? true)

  // Ao trocar categoria, limpar subcategoria
  function handleCategoryChange(e: { target: HTMLSelectElement }) {
    setCatId(e.target.value)
    setSubcatId('')
    setErrors((prev) => ({ ...prev, categoryId: undefined }))
  }

  function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const result = schema.safeParse({
      description: data.get('description'),
      amount:      data.get('amount'),
      date:        data.get('date'),
    })

    const nextErrors: FormErrors = {}
    if (!result.success) {
      const { fieldErrors } = result.error.flatten((issue) => issue.message)
      Object.entries(fieldErrors).forEach(([k, v]) => {
        nextErrors[k as keyof FormErrors] = v?.[0]
      })
    }
    if (!catId) nextErrors.categoryId = 'Selecione uma categoria'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    const payload = {
      ...(result.data as z.infer<typeof schema>),
      type,
      categoryId:    catId,
      subcategoryId: subcatId || undefined,
      goalId:        goalId   || undefined,
    }

    if (isEdit && transaction) {
      updateTransaction(transaction.id, payload)
      toast.success('Lançamento atualizado!')
    } else {
      createTransaction(payload)
      toast.success('Lançamento salvo!')
      e.currentTarget.reset()
      setCatId('')
      setSubcatId('')
      setGoalId('')
    }

    setErrors({})
    setLoading(false)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Toggle receita / despesa */}
      <div className="flex rounded-xl overflow-hidden border border-light">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all',
              type === t
                ? t === 'expense' ? 'bg-danger text-white' : 'bg-accent text-white'
                : 'bg-surface text-light hover:bg-slate-50 dark:hover:bg-slate-800/60'
            )}
          >
            {t === 'expense' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            {t === 'expense' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>

      <Input name="amount" label="Valor (R$)" type="number" step="0.01" min="0.01"
        placeholder="0,00" defaultValue={transaction?.amount} error={errors.amount} />

      <Input name="description" label="Descrição" placeholder="Ex: Almoço, Salário, Netflix..."
        defaultValue={transaction?.description} error={errors.description} />

      {/* Categoria — agrupada por tipo conforme o tipo da transação */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-mid">Categoria</label>
        <select
          value={catId}
          onChange={handleCategoryChange}
          className={selectCls(errors.categoryId)}
          aria-invalid={!!errors.categoryId}
        >
          <option value="" disabled>Selecione uma categoria</option>
          {type === 'income' ? (
            // Receita: só categorias de income
            allCategories
              .filter((c) => (c.type ?? 'expense') === 'income')
              .map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)
          ) : (
            // Despesa: expense e saving em grupos separados
            <>
              {allCategories.filter((c) => (c.type ?? 'expense') === 'expense').length > 0 && (
                <optgroup label="Despesas">
                  {allCategories
                    .filter((c) => (c.type ?? 'expense') === 'expense')
                    .map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </optgroup>
              )}
              {allCategories.filter((c) => c.type === 'saving').length > 0 && (
                <optgroup label="Poupança">
                  {allCategories
                    .filter((c) => c.type === 'saving')
                    .map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </optgroup>
              )}
            </>
          )}
        </select>
        {errors.categoryId && <span role="alert" className="text-sm text-danger">{errors.categoryId}</span>}
      </div>

      {/* Subcategoria — aparece só quando há subcategorias ativas */}
      {activeSubcats.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-mid">
            Subcategoria
            <span className="text-light font-normal ml-1">(opcional)</span>
          </label>
          <select
            value={subcatId}
            onChange={(e) => setSubcatId(e.target.value)}
            className={selectCls()}
          >
            <option value="">Nenhuma</option>
            {activeSubcats.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Meta (opcional — só para metas de Economizar ativas) */}
      {saveGoals.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-mid">
            Vincular a uma meta
            <span className="text-light font-normal ml-1">(opcional)</span>
          </label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className={selectCls()}
            aria-label="Vincular lançamento a uma meta"
          >
            <option value="">Nenhuma meta</option>
            {saveGoals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
      )}

      <Input name="date" label="Data" type="date"
        defaultValue={transaction?.date ?? today} error={errors.date} />

      <Button type="submit" variant="primary" className="w-full mt-2" loading={loading}>
        {isEdit ? 'Salvar alterações' : 'Adicionar lançamento'}
      </Button>
    </form>
  )
}
