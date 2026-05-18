import { type FC, useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Input, Button } from '@/components/atoms'
import { useCategoryStore } from '@/store'
import { useTransactions } from '@/hooks'
import { cn } from '@/utils/cn'
import type { Transaction } from '@/types'

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().min(1, 'Data obrigatória'),
})

type FormErrors = Partial<Record<keyof z.infer<typeof schema>, string>>

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
}

export const TransactionForm: FC<TransactionFormProps> = ({ transaction, onSuccess }) => {
  const isEdit = !!transaction
  const { createTransaction, updateTransaction } = useTransactions()
  const categories = useCategoryStore((s) => s.categories)

  const [type, setType] = useState<'income' | 'expense'>(transaction?.type ?? 'expense')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    const result = schema.safeParse({
      description: data.get('description'),
      amount: data.get('amount'),
      categoryId: data.get('categoryId'),
      date: data.get('date'),
    })

    if (!result.success) {
      const { fieldErrors } = result.error.flatten()
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
        ) as FormErrors
      )
      return
    }

    setLoading(true)

    if (isEdit && transaction) {
      updateTransaction(transaction.id, { ...result.data, type })
      toast.success('Lançamento atualizado!')
    } else {
      createTransaction({ ...result.data, type })
      toast.success('Lançamento salvo!')
      ;(e.target as HTMLFormElement).reset()
    }

    setErrors({})
    setLoading(false)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Toggle income / expense */}
      <div className="flex rounded-xl overflow-hidden border border-light">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all',
            type === 'expense'
              ? 'bg-danger text-white'
              : 'bg-surface text-light hover:bg-slate-50'
          )}
        >
          <TrendingDown size={16} />
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all',
            type === 'income'
              ? 'bg-accent text-white'
              : 'bg-surface text-light hover:bg-slate-50'
          )}
        >
          <TrendingUp size={16} />
          Receita
        </button>
      </div>

      <Input
        name="amount"
        label="Valor (R$)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0,00"
        defaultValue={transaction?.amount}
        error={errors.amount}
      />

      <Input
        name="description"
        label="Descrição"
        placeholder="Ex: Almoço, Salário, Netflix..."
        defaultValue={transaction?.description}
        error={errors.description}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-mid">Categoria</label>
        <select
          name="categoryId"
          defaultValue={transaction?.categoryId ?? ''}
          className={cn(
            'w-full rounded-xl border px-4 py-3 text-base text-dark bg-surface transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            errors.categoryId ? 'border-danger' : 'border-light'
          )}
        >
          <option value="" disabled>Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span role="alert" className="text-sm text-danger">{errors.categoryId}</span>
        )}
      </div>

      <Input
        name="date"
        label="Data"
        type="date"
        defaultValue={transaction?.date ?? today}
        error={errors.date}
      />

      <Button type="submit" variant="primary" className="w-full mt-2" loading={loading}>
        {isEdit ? 'Salvar alterações' : 'Adicionar lançamento'}
      </Button>
    </form>
  )
}
