# CASHLY — Recipes de Código

Padrões prontos para copiar/adaptar. Todos seguem os tokens e convenções do projeto.

---

## FORMULÁRIO COM ZOD

```tsx
import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTransactionStore } from '@/store'

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number({ invalid_type_error: 'Digite um valor' }).positive('Deve ser positivo'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data inválida'),
})
type FormData = z.infer<typeof schema>

export function TransactionForm() {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const addTransaction = useTransactionStore((s) => s.addTransaction)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const raw = Object.fromEntries(new FormData(e.currentTarget))
    const result = schema.safeParse({ ...raw, amount: Number(raw.amount) })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])))
      return
    }

    addTransaction({ ...result.data, id: crypto.randomUUID(), type: 'expense', createdAt: new Date().toISOString() })
    toast.success('Lançamento salvo!')
    e.currentTarget.reset()
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <input name="description" placeholder="Descrição" className="input-base" />
        {errors.description && <p role="alert" className="text-danger text-xs mt-1">{errors.description}</p>}
      </div>
      <button type="submit" className="btn-primary">Salvar</button>
    </form>
  )
}
```

---

## TOAST COM DESFAZER

```tsx
import { toast } from 'sonner'
import { useTransactionStore } from '@/store'

function handleDelete(id: string, description: string) {
  const store = useTransactionStore.getState()
  const transaction = store.transactions.find((t) => t.id === id)

  store.deleteTransaction(id)

  toast(`"${description}" excluído`, {
    duration: 4000,
    action: {
      label: 'Desfazer',
      onClick: () => transaction && store.addTransaction(transaction),
    },
  })
}
```

---

## SONNER SETUP (adicionar em App.tsx ou main.tsx)

```tsx
import { Toaster } from 'sonner'

// Dentro do JSX raiz:
<Toaster position="top-right" richColors />
```

---

## GRÁFICO PIZZA (Recharts)

```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PieData { name: string; value: number; color: string }

export function CategoryPieChart({ data }: { data: PieData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) =>
            value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

## GRÁFICO LINHA (Recharts)

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// data: [{ month: 'Jan', income: 7300, expense: 3050, balance: 4250 }]
export function BalanceLineChart({ data }: { data: MonthData[] }) {
  const fmt = (v: number) => `R$${(v / 1000).toFixed(1)}k`

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: '#94A3B8' }} />
        <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <Legend />
        <Line type="monotone" dataKey="income"  stroke="#00C48C" strokeWidth={2} dot={false} name="Receitas" />
        <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} name="Despesas" />
        <Line type="monotone" dataKey="balance" stroke="#1B4FDE" strokeWidth={2} dot={false} name="Saldo" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## BARRA DE PROGRESSO DE ORÇAMENTO

```tsx
interface BudgetBarProps {
  spent: number
  limit: number
  color: string
}

export function BudgetBar({ spent, limit, color }: BudgetBarProps) {
  const pct = Math.min((spent / limit) * 100, 100)
  const barColor = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-accent'

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-light mb-1">
        <span>{spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        <span>{pct.toFixed(0)}% de {limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

---

## EMPTY STATE (componente genérico)

```tsx
import { FC } from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-light" />
    </div>
    <h3 className="text-dark font-semibold text-lg mb-2">{title}</h3>
    <p className="text-light text-sm max-w-xs mb-6">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
      >
        {action.label}
      </button>
    )}
  </div>
)
```

---

## SCORE DE SAÚDE FINANCEIRA

```typescript
// src/hooks/useFinancialScore.ts
import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useBudgets } from './useBudgets'
import { useGoals } from './useGoals'

export function useFinancialScore() {
  const { totalIncome, totalExpense } = useTransactions()
  const { budgets } = useBudgets()
  const { goals } = useGoals()

  return useMemo(() => {
    // Poupança (35%)
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0
    const savingsScore = Math.min(savingsRate * 2, 1) * 100  // 50% poupança = 100 pts

    // Orçamentos (35%)
    const budgetScore = budgets.length === 0
      ? 70  // sem orçamentos definidos = score neutro
      : (budgets.filter((b) => b.percentage < 100).length / budgets.length) * 100

    // Metas (30%)
    const activeGoals = goals.filter((g) => !g.isArchived)
    const goalScore = activeGoals.length === 0
      ? 70
      : (activeGoals.filter((g) => (g.currentAmount / g.targetAmount) >= 0.5).length / activeGoals.length) * 100

    const score = Math.round(savingsScore * 0.35 + budgetScore * 0.35 + goalScore * 0.30)

    const label =
      score >= 80 ? 'Excelente!' :
      score >= 60 ? 'Indo bem!' :
      score >= 40 ? 'Em desenvolvimento' : 'Precisa de atenção'

    const color = score >= 60 ? 'text-accent' : score >= 40 ? 'text-warning' : 'text-danger'

    return { score, label, color, savingsScore, budgetScore, goalScore }
  }, [totalIncome, totalExpense, budgets, goals])
}
```

---

## FORMATAÇÃO DE MOEDA E DATA

```typescript
// src/utils/formatCurrency.ts
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// src/utils/formatDate.ts
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "d 'de' MMM", { locale: ptBR })
}

export function formatMonth(dateString: string): string {
  return format(parseISO(dateString), 'MMM', { locale: ptBR })
}
```

---

## FILTRO DE TRANSAÇÕES POR MÊS

```typescript
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'

function filterByCurrentMonth(transactions: Transaction[]): Transaction[] {
  const now = new Date()
  const interval = { start: startOfMonth(now), end: endOfMonth(now) }
  return transactions.filter((t) => isWithinInterval(parseISO(t.date), interval))
}
```

---

## QUICK-ADD BUTTON

```tsx
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
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-surface rounded-t-3xl md:rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-dark font-bold text-lg">Novo lançamento</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar">
                <X size={20} className="text-light" />
              </button>
            </div>
            <TransactionForm onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
```
