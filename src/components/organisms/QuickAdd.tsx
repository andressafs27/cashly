import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { TransactionForm } from '@/components/organisms/TransactionForm'

export function QuickAdd() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Adicionar lançamento"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md bg-surface rounded-t-3xl md:rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-dark font-bold text-lg">Novo lançamento</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar formulário"
                className="p-1.5 rounded-lg text-light hover:text-dark hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <TransactionForm onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
