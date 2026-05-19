import { TransactionList } from '@/components/organisms/TransactionList'
import { FilterBar } from '@/components/organisms/FilterBar'
import { QuickAdd } from '@/components/organisms/QuickAdd'
import { useTransactionFilters } from '@/hooks'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

export function Transactions() {
  const {
    filters, searchInput, setSearchInput,
    setType, setPeriod, setDateFrom, setDateTo,
    toggleCategory, removeCategory, clearFilters,
    isPeriodActive, activeCount,
    filtered, filteredIncome, filteredExpense, filteredBalance, total,
  } = useTransactionFilters()

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Lançamentos</h1>
        <p className="text-light text-sm mt-1">
          {filtered.length} de {total} {total === 1 ? 'transação' : 'transações'}
        </p>
      </div>

      {/* Resumo do período filtrado */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
          <p className="text-light text-xs">Saldo</p>
          <p className={cn('text-base font-bold mt-0.5 tabular-nums', filteredBalance >= 0 ? 'text-dark' : 'text-danger')}>
            {formatCurrency(filteredBalance)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
          <p className="text-light text-xs">Receitas</p>
          <p className="text-accent text-base font-bold mt-0.5 tabular-nums">{formatCurrency(filteredIncome)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
          <p className="text-light text-xs">Despesas</p>
          <p className="text-danger text-base font-bold mt-0.5 tabular-nums">{formatCurrency(filteredExpense)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setType={setType}
          setPeriod={setPeriod}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          toggleCategory={toggleCategory}
          removeCategory={removeCategory}
          clearFilters={clearFilters}
          isPeriodActive={isPeriodActive}
          activeCount={activeCount}
        />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <TransactionList transactions={filtered} />
      </div>

      <QuickAdd />
    </div>
  )
}
