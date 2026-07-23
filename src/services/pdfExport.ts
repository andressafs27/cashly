import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import type { Transaction, Category } from '@/types'

interface CategoryBreakdownRow {
  category:   Category
  total:      number
  percentage: number
}

interface ExportReportParams {
  periodLabel:        string
  totalIncome:        number
  totalExpense:       number
  balance:            number
  savingsRate:        number
  categoryBreakdown:  CategoryBreakdownRow[]
  transactions:       Transaction[]
  categories:         Category[]
  chartElementId:     string
  fileNameSuffix:     string
}

const COLORS = {
  dark:    [15, 23, 42]    as const,
  mid:     [51, 65, 85]    as const,
  light:   [148, 163, 184] as const,
  border:  [226, 232, 240] as const,
  bg:      [248, 250, 252] as const,
  accent:  [0, 196, 140]   as const,
  danger:  [239, 68, 68]   as const,
  primary: [27, 79, 222]   as const,
  violet:  [139, 92, 246]  as const,
}

export async function exportReportToPdf(params: ExportReportParams): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  let y = margin

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin - 20) {
      doc.addPage()
      y = margin
    }
  }

  // ── Cabeçalho ──
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text('Cashly', margin, y)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.light)
  doc.text('Relatório Financeiro', pageWidth - margin, y, { align: 'right' })

  y += 18
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.mid)
  doc.text(`Período: ${params.periodLabel}`, margin, y)
  y += 26

  // ── Card de resumo ──
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bg)
  doc.roundedRect(margin, y, pageWidth - margin * 2, 70, 6, 6, 'FD')

  const colWidth = (pageWidth - margin * 2) / 4
  const summaryItems: { label: string; value: string; color: readonly [number, number, number] }[] = [
    { label: 'Receitas',       value: formatCurrency(params.totalIncome),  color: COLORS.accent },
    { label: 'Despesas',       value: formatCurrency(params.totalExpense), color: COLORS.danger },
    { label: 'Economia',       value: formatCurrency(params.balance),      color: params.balance >= 0 ? COLORS.primary : COLORS.danger },
    { label: 'Taxa poupança',  value: `${Math.round(params.savingsRate)}%`, color: COLORS.violet },
  ]

  summaryItems.forEach((item, i) => {
    const x = margin + 16 + i * colWidth
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.light)
    doc.text(item.label, x, y + 22)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...item.color)
    doc.text(item.value, x, y + 42)
  })

  y += 92

  // ── Gráfico (screenshot do canvas) ──
  const chartEl = document.getElementById(params.chartElementId)
  if (chartEl) {
    const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff' })
    const imgData   = canvas.toDataURL('image/jpeg', 0.92)
    const imgWidth  = pageWidth - margin * 2
    const imgHeight = (canvas.height / canvas.width) * imgWidth

    checkPageBreak(imgHeight + 28)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.dark)
    doc.text('Receitas vs Despesas', margin, y)
    y += 14

    doc.addImage(imgData, 'JPEG', margin, y, imgWidth, imgHeight)
    y += imgHeight + 28
  }

  // ── Despesas por categoria ──
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text('Despesas por categoria', margin, y)
  y += 18

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.light)
  doc.text('Categoria', margin, y)
  doc.text('Total', margin + 240, y)
  doc.text('% do total', margin + 340, y)
  y += 4
  doc.setDrawColor(...COLORS.border)
  doc.line(margin, y, pageWidth - margin, y)
  y += 14

  params.categoryBreakdown.forEach((row) => {
    checkPageBreak(16)
    doc.setTextColor(...COLORS.mid)
    doc.text(row.category.name, margin, y)
    doc.text(formatCurrency(row.total), margin + 240, y)
    doc.text(`${row.percentage.toFixed(1)}%`, margin + 340, y)
    y += 16
  })

  y += 16

  // ── Lista de transações ──
  checkPageBreak(40)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text(`Transações do período (${params.transactions.length})`, margin, y)
  y += 18

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.light)
  doc.text('Data', margin, y)
  doc.text('Descrição', margin + 60, y)
  doc.text('Categoria', margin + 290, y)
  doc.text('Valor', pageWidth - margin, y, { align: 'right' })
  y += 4
  doc.line(margin, y, pageWidth - margin, y)
  y += 14

  const sortedTx = [...params.transactions].sort((a, b) => b.date.localeCompare(a.date))

  sortedTx.forEach((t) => {
    checkPageBreak(16)
    const cat = params.categories.find((c) => c.id === t.categoryId)

    doc.setTextColor(...COLORS.mid)
    doc.text(formatDate(t.date), margin, y)
    doc.text(t.description.length > 38 ? `${t.description.slice(0, 38)}…` : t.description, margin + 60, y)
    doc.text(cat?.name ?? '—', margin + 290, y)

    const isIncome = t.type === 'income'
    const valueColor = isIncome ? COLORS.accent : COLORS.danger
    doc.setTextColor(valueColor[0], valueColor[1], valueColor[2])
    doc.text(`${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}`, pageWidth - margin, y, { align: 'right' })
    y += 16
  })

  // ── Rodapé em todas as páginas ──
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.light)
    doc.text(
      `Gerado por Cashly em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · Página ${i} de ${pageCount}`,
      pageWidth / 2, pageHeight - 20, { align: 'center' }
    )
  }

  doc.save(`cashly-relatorio-${params.fileNameSuffix}.pdf`)
}

// ── Compartilhamento por e-mail (sem backend) ──

export function buildEmailShareLink(
  periodLabel: string,
  totalIncome: number,
  totalExpense: number,
  balance: number,
): string {
  const subject = encodeURIComponent(`Relatório Cashly — ${periodLabel}`)
  const body = encodeURIComponent(
    `Resumo financeiro de ${periodLabel}:\n\n` +
    `Receitas: ${formatCurrency(totalIncome)}\n` +
    `Despesas: ${formatCurrency(totalExpense)}\n` +
    `Saldo: ${formatCurrency(balance)}\n\n` +
    `Relatório completo gerado pelo Cashly.`
  )
  return `mailto:?subject=${subject}&body=${body}`
}
