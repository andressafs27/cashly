import { type FC, useState } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import { TransactionCard } from '@/components/molecules/TransactionCard'
import { EmptyState } from '@/components/molecules/EmptyState'
import { TransactionForm } from '@/components/organisms/TransactionForm'
import { useCategoryStore } from '@/store'
import { useModalA11y } from '@/hooks'
import type { Transaction } from '@/types'

function EditTransactionModal({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const modalRef = useModalA11y(onClose)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaction-title"
        className="relative w-full max-w-md bg-surface rounded-t-3xl md:rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="edit-transaction-title" className="text-dark font-bold text-lg">Editar lançamento</h2>
          <button
            onClick={onClose}
            aria-label="Fechar edição"
            className="p-1.5 rounded-lg text-light hover:text-dark hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <TransactionForm transaction={transaction} onSuccess={onClose} />
      </div>
    </div>
  )
}

interface TransactionListProps {
  transactions: Transaction[]
}

export const TransactionList: FC<TransactionListProps> = ({ transactions }) => {
  const categories = useCategoryStore((s) => s.categories)
  const [editing, setEditing] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Nenhum lançamento ainda"
        description="Registre seu primeiro gasto — leva menos de 10 segundos."
      />
    )
  }

  return (
    <>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            category={categories.find((c) => c.id === transaction.categoryId)}
            onEdit={setEditing}
          />
        ))}
      </div>

      {editing && (
        <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
