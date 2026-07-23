import { createElement, type FC } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransactionStore } from '@/store'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { Transaction, Category } from '@/types'

interface TransactionCardProps {
  transaction: Transaction
  category?: Category
  onEdit: (transaction: Transaction) => void
}

export const TransactionCard: FC<TransactionCardProps> = ({ transaction, category, onEdit }) => {
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  const CategoryIcon = getCategoryIcon(category?.icon ?? '')
  const isIncome = transaction.type === 'income'

  function handleDelete() {
    const snapshot = transaction
    deleteTransaction(transaction.id)
    toast(`"${transaction.description}" excluído`, {
      duration: 4000,
      action: {
        label: 'Desfazer',
        onClick: () => addTransaction(snapshot),
      },
    })
  }

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category ? `${category.color}20` : '#f1f5f9' }}
      >
        {createElement(CategoryIcon, {
          size: 18,
          style: { color: category?.color ?? '#94A3B8' },
          'aria-hidden': 'true',
        })}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-dark text-sm font-medium truncate">{transaction.description}</p>
        <p className="text-light text-xs mt-0.5">
          {category?.name ?? 'Sem categoria'} · {formatDate(transaction.date)}
        </p>
      </div>

      <span className={cn('text-sm font-semibold flex-shrink-0', isIncome ? 'text-accent' : 'text-danger')}>
        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
      </span>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(transaction)}
          aria-label="Editar lançamento"
          className="p-1.5 rounded-lg text-light hover:text-primary hover:bg-blue-50 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Excluir lançamento"
          className="p-1.5 rounded-lg text-light hover:text-danger hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
