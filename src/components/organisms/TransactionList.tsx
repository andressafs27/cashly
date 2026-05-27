import { type FC, useState } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import { TransactionCard } from '@/components/molecules/TransactionCard'
import { EmptyState } from '@/components/molecules/EmptyState'
import { TransactionForm } from '@/components/organisms/TransactionForm'
import { useCategoryStore } from '@/store'
import type { Transaction } from '@/types'

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
      <div className="divide-y divide-slate-100">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            category={categories.find((c) => c.id === transaction.categoryId)}
            onEdit={setEditing}
          />
        ))}
      </div>

      {/* Modal de edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="relative w-full max-w-md bg-surface rounded-t-3xl md:rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-dark font-bold text-lg">Editar lançamento</h2>
              <button
                onClick={() => setEditing(null)}
                aria-label="Fechar edição"
                className="p-1.5 rounded-lg text-light hover:text-dark hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <TransactionForm
              transaction={editing}
              onSuccess={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </>
  )
}
