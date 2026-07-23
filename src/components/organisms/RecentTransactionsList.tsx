import { createElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, PlusCircle } from 'lucide-react'
import { isToday, isYesterday, differenceInCalendarDays, parseISO } from 'date-fns'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { Transaction, Category } from '@/types'

// ── Helper: data relativa em português ───────────────────────────────────────

function relativeDate(dateString: string): string {
  const date = parseISO(dateString)
  if (isToday(date))     return 'hoje'
  if (isYesterday(date)) return 'ontem'
  const days = differenceInCalendarDays(new Date(), date)
  if (days <= 6)         return `há ${days} dias`
  return formatDate(dateString)
}

// ── TransactionRow ────────────────────────────────────────────────────────────

function TransactionRow({ transaction, category }: {
  transaction: Transaction
  category?:   Category
}) {
  const isIncome = transaction.type === 'income'
  const Icon = getCategoryIcon(category?.icon ?? '')

  return (
    <li className="flex items-center gap-3.5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60/60 rounded-xl px-2 -mx-2 transition-colors">

      {/* Ícone da categoria */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: category ? `${category.color}18` : '#f1f5f9' }}
        aria-hidden="true"
      >
        {createElement(Icon, { size: 18, style: { color: category?.color ?? '#94A3B8' } })}
      </div>

      {/* Descrição + categoria + badge */}
      <div className="flex-1 min-w-0">
        <p className="text-dark text-sm font-medium truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-light text-xs truncate max-w-[100px]">
            {category?.name ?? 'Sem categoria'}
          </span>
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0',
            isIncome
              ? 'bg-accent/10 text-accent'
              : 'bg-danger/10 text-danger'
          )}>
            {isIncome ? 'Receita' : 'Despesa'}
          </span>
        </div>
      </div>

      {/* Valor + data relativa */}
      <div className="text-right flex-shrink-0 ml-2">
        <p className={cn(
          'text-sm font-semibold tabular-nums',
          isIncome ? 'text-accent' : 'text-danger'
        )}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        <p className="text-light text-xs mt-0.5">{relativeDate(transaction.date)}</p>
      </div>
    </li>
  )
}

// ── Estado vazio ──────────────────────────────────────────────────────────────

function EmptyTransactions({ filterLabel }: { filterLabel?: string }) {
  const navigate = useNavigate()

  if (filterLabel) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
          <ArrowLeftRight size={20} className="text-light" aria-hidden="true" />
        </div>
        <p className="text-dark text-sm font-medium">Sem transações em "{filterLabel}"</p>
        <p className="text-light text-xs text-center max-w-[240px]">
          Selecione outra categoria ou mude o período para ver transações.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
        <ArrowLeftRight size={24} className="text-light" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-dark text-sm font-semibold">Nenhuma transação ainda</p>
        <p className="text-light text-xs mt-1 max-w-[240px] mx-auto">
          Registre seu primeiro lançamento e comece a acompanhar seu financeiro.
        </p>
      </div>
      <button
        onClick={() => navigate('/transactions')}
        className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] mt-1"
      >
        <PlusCircle size={16} aria-hidden="true" />
        Adicionar lançamento
      </button>
    </div>
  )
}

// ── RecentTransactionsList ────────────────────────────────────────────────────

interface Props {
  transactions:  Transaction[]
  categories:    Category[]
  totalCount:    number           // total de transações (não apenas as exibidas)
  filterLabel?:  string           // nome da categoria quando filtrando
}

export function RecentTransactionsList({
  transactions,
  categories,
  totalCount,
  filterLabel,
}: Props) {
  return (
    <section aria-label="Últimas transações">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-dark font-semibold">Transações recentes</p>
            {filterLabel && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                aria-label={`Filtrado por ${filterLabel}`}
              >
                {filterLabel}
              </span>
            )}
          </div>
          <p className="text-light text-xs mt-0.5">
            {totalCount === 0
              ? 'Nenhuma transação'
              : `${totalCount} no total`}
          </p>
        </div>

        {totalCount > 0 && (
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:gap-2.5 transition-all"
            aria-label="Ver todas as transações"
          >
            Ver todas
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Lista ou estado vazio */}
      {transactions.length === 0 ? (
        <EmptyTransactions filterLabel={filterLabel} />
      ) : (
        <ul className="divide-y-0">
          {transactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              category={categories.find((c) => c.id === t.categoryId)}
            />
          ))}
        </ul>
      )}

    </section>
  )
}
