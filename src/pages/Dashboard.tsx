import { useEffect } from 'react'
import { useTransactions } from '@/hooks'

export function Dashboard() {
  const { transactions, createTransaction, balance, totalIncome, totalExpense } =
    useTransactions()

  useEffect(() => {
    if (transactions.length === 0) {
      const seed = [
        { type: 'income' as const,  amount: 6500,  description: 'Salário',          categoryId: 'salary',    date: '2024-05-01' },
        { type: 'expense' as const, amount: 450,   description: 'Supermercado',      categoryId: 'food',      date: '2024-05-03' },
        { type: 'expense' as const, amount: 120,   description: 'Uber',              categoryId: 'transport', date: '2024-05-05' },
        { type: 'expense' as const, amount: 89,    description: 'Netflix + Spotify', categoryId: 'streaming', date: '2024-05-06' },
        { type: 'expense' as const, amount: 200,   description: 'Academia',          categoryId: 'health',    date: '2024-05-07' },
        { type: 'income' as const,  amount: 800,   description: 'Freelance',         categoryId: 'freelance', date: '2024-05-08' },
        { type: 'expense' as const, amount: 350,   description: 'Restaurantes',      categoryId: 'food',      date: '2024-05-10' },
        { type: 'expense' as const, amount: 180,   description: 'Farmácia',          categoryId: 'health',    date: '2024-05-12' },
        { type: 'expense' as const, amount: 600,   description: 'Roupas',            categoryId: 'shopping',  date: '2024-05-14' },
        { type: 'expense' as const, amount: 95,    description: 'iFood',             categoryId: 'food',      date: '2024-05-15' },
      ]
      seed.forEach((t) => createTransaction(t))
    }
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-light text-sm">Saldo</p>
          <p className="text-dark text-2xl font-bold">
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-light text-sm">Receitas</p>
          <p className="text-accent text-2xl font-bold">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-light text-sm">Despesas</p>
          <p className="text-danger text-2xl font-bold">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-dark mb-4">Últimas transações</h2>
        {transactions.slice(0, 5).map((t) => (
          <div key={t.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
            <span className="text-mid">{t.description}</span>
            <span className={t.type === 'income' ? 'text-accent font-semibold' : 'text-danger font-semibold'}>
              {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}