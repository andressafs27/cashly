import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Wallet, TrendingUp, TrendingDown, Sparkles, Trophy, Download, Mail } from 'lucide-react'
import { Button } from '@/components/atoms'
import { ReportPeriodSelector } from '@/components/organisms/ReportPeriodSelector'
import { ReportBarChart } from '@/components/organisms/ReportBarChart'
import { CategoryBreakdownTable } from '@/components/organisms/CategoryBreakdownTable'
import { FinancialHealthCard } from '@/components/organisms/FinancialHealthCard'
import { TransactionList } from '@/components/organisms/TransactionList'
import { useReportData } from '@/hooks'
import { useCategoryStore } from '@/store'
import { exportReportToPdf, buildEmailShareLink } from '@/services/pdfExport'
import { getCategoryIcon } from '@/utils/categoryIcon'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import type { ReportPeriod } from '@/types'

// ── Stat card compacto ───────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, variation, trendUp, iconBg, iconColor }: {
  icon: typeof Wallet
  label: string
  value: string
  variation: number | null
  trendUp: boolean
  iconBg: string
  iconColor: string
}) {
  const isPositive = variation !== null && (trendUp ? variation > 0 : variation < 0)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={18} className={iconColor} aria-hidden="true" />
        </div>
        {variation !== null && (
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums',
            isPositive ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
          )}>
            {isPositive ? '↑' : '↓'} {Math.abs(variation).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-light text-xs">{label}</p>
      <p className="text-dark text-xl font-bold tabular-nums mt-0.5">{value}</p>
    </div>
  )
}

// ── Reports page ──────────────────────────────────────────────────────────────

export function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [offset, setOffset] = useState(0)
  const [exporting, setExporting] = useState(false)

  const categories = useCategoryStore((s) => s.categories)

  const {
    interval, intervalLabel, transactions,
    totalIncome, totalExpense, balance, savingsRate,
    incomeVariation, expenseVariation, balanceVariation,
    categoryBreakdown, top3Categories, chartData, health,
  } = useReportData(period, offset)

  async function handleExportPdf() {
    setExporting(true)
    try {
      await exportReportToPdf({
        periodLabel: intervalLabel,
        totalIncome,
        totalExpense,
        balance,
        savingsRate,
        categoryBreakdown,
        transactions,
        categories,
        chartElementId: 'report-chart',
        fileNameSuffix: format(interval.start, 'yyyy-MM'),
      })
      toast.success('PDF exportado com sucesso!')
    } catch {
      toast.error('Erro ao gerar o PDF. Tente novamente.')
    } finally {
      setExporting(false)
    }
  }

  function handleEmailShare() {
    const link = buildEmailShareLink(intervalLabel, totalIncome, totalExpense, balance)
    window.open(link)
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-dark text-2xl font-bold">Relatórios</h1>
          <p className="text-light text-sm mt-1">Análise detalhada das suas finanças por período</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" iconLeft={<Mail size={14} />} onClick={handleEmailShare}>
            Email
          </Button>
          <Button variant="primary" size="sm" iconLeft={<Download size={14} />} onClick={handleExportPdf} loading={exporting}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <ReportPeriodSelector
          period={period}
          offset={offset}
          intervalLabel={intervalLabel}
          onPeriodChange={setPeriod}
          onOffsetChange={setOffset}
        />
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp}   label="Receitas" value={formatCurrency(totalIncome)}
          variation={incomeVariation} trendUp iconBg="bg-accent/10" iconColor="text-accent" />
        <StatCard icon={TrendingDown} label="Despesas" value={formatCurrency(totalExpense)}
          variation={expenseVariation} trendUp={false} iconBg="bg-danger/10" iconColor="text-danger" />
        <StatCard icon={Wallet} label="Economia" value={formatCurrency(balance)}
          variation={balanceVariation} trendUp iconBg={balance >= 0 ? 'bg-primary/10' : 'bg-danger/10'}
          iconColor={balance >= 0 ? 'text-primary' : 'text-danger'} />
        <StatCard icon={Sparkles} label="Taxa de poupança" value={`${Math.round(savingsRate)}%`}
          variation={null} trendUp iconBg="bg-violet-500/10" iconColor="text-violet-500" />
      </div>

      {/* Top 3 categorias */}
      {top3Categories.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-warning" aria-hidden="true" />
            <p className="text-dark font-semibold text-sm">Top categorias de gasto</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3Categories.map(({ category, total, percentage }, i) => {
              const Icon = getCategoryIcon(category.icon)
              return (
                <div key={category.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-light text-xs font-bold w-4">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}18` }}>
                    <Icon size={16} style={{ color: category.color }} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-dark text-sm font-medium truncate">{category.name}</p>
                    <p className="text-light text-xs tabular-nums">{formatCurrency(total)} · {percentage.toFixed(0)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Gráfico + Saúde financeira */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div id="report-chart" className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-dark font-semibold text-sm mb-1">Receitas vs Despesas</p>
          <p className="text-light text-xs mb-4">{intervalLabel}</p>
          <ReportBarChart data={chartData} />
        </div>
        <div className="lg:col-span-2">
          <FinancialHealthCard health={health} />
        </div>
      </div>

      {/* Tabela de categorias */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <p className="text-dark font-semibold text-sm mb-4">Despesas por categoria</p>
        <CategoryBreakdownTable data={categoryBreakdown} />
      </div>

      {/* Lista completa de transações do período */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-dark font-semibold text-sm">Transações do período</p>
          <p className="text-light text-xs">{transactions.length} no total</p>
        </div>
        <TransactionList transactions={transactions} />
      </div>

    </div>
  )
}
