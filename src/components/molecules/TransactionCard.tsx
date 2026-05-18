import type { FC } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import {
  UtensilsCrossed, Car, Heart, GraduationCap, Gamepad2,
  ShoppingBag, Home, Tv, Wallet, Briefcase, MoreHorizontal, Plus,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTransactionStore } from '@/store'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { Transaction, Category } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Car, Heart, GraduationCap, Gamepad2,
  ShoppingBag, Home, Tv, Wallet, Briefcase, MoreHorizontal, Plus,
}

interface TransactionCardProps {
  transaction: Transaction
  category?: Category
  onEdit: (transaction: Transaction) => void
}

export const TransactionCard: FC<TransactionCardProps> = ({ transaction, category, onEdit }) => {
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)

  const CategoryIcon = category ? (ICON_MAP[category.icon] ?? MoreHorizontal) : MoreHorizontal
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
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors group">
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category ? `${category.color}20` : '#f1f5f9' }}
      >
        <CategoryIcon
          size={18}
          style={{ color: category?.color ?? '#94A3B8' }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-dark text-sm font-medium truncate">{transaction.description}</p>
        <p className="text-light text-xs mt-0.5">
          {category?.name ?? 'Sem categoria'} · {formatDate(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <span className={cn(
        'text-sm font-semibold flex-shrink-0',
        isIncome ? 'text-accent' : 'text-danger'
      )}>
        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
      </span>

      {/* Actions — aparecem no hover */}
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
