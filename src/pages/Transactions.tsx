import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { TransactionList } from '@/components/organisms/TransactionList'
import { QuickAdd } from '@/components/organisms/QuickAdd'
import { Input } from '@/components/atoms'
import { useTransactions } from '@/hooks'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

type FilterType = 'all' | 'income' | 'expense'

export function Transactions() {
  const { transactions, totalIncome, totalExpense, balance } = useTransactions()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === 'all' || t.type === filterType
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [transactions, search, filterType])

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Receitas', value: 'income' },
    { label: 'Despesas', value: 'expense' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Lançamentos</h1>
        <p className="text-light text-sm mt-1">
          {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
        </p>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-2xl p-3 shadow-sm">
          <p className="text-light text-xs">Saldo</p>
          <p className={cn('text-base font-bold mt-0.5', balance >= 0 ? 'text-dark' : 'text-danger')}>
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="bg-surface rounded-2xl p-3 shadow-sm">
          <p className="text-light text-xs">Receitas</p>
          <p className="text-accent text-base font-bold mt-0.5">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-surface rounded-2xl p-3 shadow-sm">
          <p className="text-light text-xs">Despesas</p>
          <p className="text-danger text-base font-bold mt-0.5">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-4">
        <Input
          placeholder="Buscar por descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          iconLeft={<Search size={16} />}
          iconRight={
            search ? (
              <button onClick={() => setSearch('')} aria-label="Limpar busca">
                <X size={16} />
              </button>
            ) : undefined
          }
        />

        <div className="flex gap-2">
          {filterButtons.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilterType(value)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filterType === value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-mid border border-light hover:bg-slate-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
        <TransactionList transactions={filtered} />
      </div>

      {/* Quick Add flutuante */}
      <QuickAdd />
    </div>
  )
}
