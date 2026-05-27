# CASHLY — Contexto para Claude Code

**Produto:** App de controle financeiro pessoal — portfólio de pós-graduação (PUC Minas UX Engineering + Alura React).
**Repo:** `andressafs27/cashly` · branch ativa: `develop`
**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Zustand persist · React Router v6 · Firebase Auth · Recharts · date-fns · Sonner · Zod

> Docs detalhados: `docs/claude/features.md` (specs de features) · `docs/claude/recipes.md` (padrões de código prontos)
> Slash commands: `/sprint`, `/feature`, `/ui`

---

## CONTEXTO DO PRODUTO

**Firebase:** projeto `cashly-9ede3` — somente Auth (Google OAuth). Dados em localStorage via Zustand persist. **Sem Firestore. Sem PWA.**

Qualidade de código, UX e acessibilidade importam tanto quanto features — este é um portfólio técnico.

---

## PERSONAS

| Persona | Perfil | Necessidade |
|---------|--------|-------------|
| João, 28 | Analista, renda fixa + freelance | Gráficos, controle por categoria, análise detalhada |
| Ana, 24 | Estudante, orçamento apertado | Lançamento rápido, metas simples, alertas visuais |

**Regra:** se confunde a Ana, é complexo demais. Se não tem gráfico/insight, o João vai embora.

---

## SPRINTS — STATUS E ENTREGAS

| Sprint | Objetivo | Extras premium | Status |
|--------|----------|----------------|--------|
| S0 | Setup, personas, Figma, repo | — | ✅ |
| S1 | Atoms, routing, layout, stores, tokens | — | ✅ |
| S2 | Transações CRUD + validação Zod | Quick-add flutuante · Empty states | ✅ |
| S3 | Categorias + filtros + busca | Orçamento por categoria · Transações recorrentes | ⬜ próximo |
| S4 | Dashboard com Recharts | Score de saúde financeira · Insights automáticos · Onboarding | ⬜ |
| S5 | Metas financeiras + progress bars | Calendário financeiro | ⬜ |
| S6 | Relatórios + export PDF | — | ⬜ |
| S7 | Testes · dark mode · a11y · CI/CD · deploy Vercel | — | ⬜ |

**Sprint atual: S2.** Sempre priorizar o que desbloqueia o sprint corrente.

---

## O QUE JÁ ESTÁ CONSTRUÍDO

```
Auth:        Login.tsx — Google OAuth, visual completo
Layout:      AppLayout.tsx — sidebar desktop, bottom nav mobile
Atoms:       Button, Input, Badge, Icon (src/components/atoms/)
Hooks:       useTransactions (balance/income/expense/CRUD), useGoals
Stores:      transactionStore · categoryStore · goalStore · settingsStore
Types:       Transaction · Category · Goal · User · ReportSummary (src/types/index.ts)
Constants:   DEFAULT_CATEGORIES — 12 categorias com id/name/color/icon
Utils:       cn() — className merge
Tokens:      tokens.ts · tailwind.config.js (colors, borderRadius)
```

**Páginas com shell vazio (precisam ser implementadas):**
`Categories` · `Reports` · `Goals` · `Settings`
`Dashboard` — tem seed hardcoded, sem gráficos reais

**Páginas implementadas no S2:**
`Transactions` — busca, filtro por tipo, resumo de saldo, lista com edit/delete/undo, QuickAdd flutuante

---

## DESIGN SYSTEM

### Tokens Tailwind (tailwind.config.js)

```
bg-dark / text-dark       #0F172A   sidebar, títulos fortes
bg-primary / text-primary #1B4FDE   ações, nav ativo
text-accent / bg-accent   #00C48C   receitas, sucesso
text-danger / bg-danger   #EF4444   despesas, erro
text-warning              #F5A623   alertas suaves
text-mid                  #334155   texto secundário
text-light                #94A3B8   labels, hints
bg-surface / text-surface #FFFFFF   cards
bg-slate-50               fundo das páginas
```

### Padrões visuais frequentes

```tsx
// Card padrão
<div className="bg-surface rounded-2xl p-4 shadow-sm">

// Label + valor
<p className="text-light text-sm">Saldo</p>
<p className="text-dark text-2xl font-bold">R$ 4.250,00</p>

// Valor positivo / negativo
<span className="text-accent font-semibold">+ R$ 800,00</span>
<span className="text-danger font-semibold">- R$ 120,00</span>

// Botão primário
<button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all">

// Input padrão
<input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-mid focus:outline-none focus:ring-2 focus:ring-primary" />
```

---

## BIBLIOTECAS — DECISÕES FIXAS

| Lib | Uso |
|-----|-----|
| `recharts` | Gráficos — PieChart, LineChart, BarChart |
| `date-fns` | Datas — format, parseISO, startOfMonth, endOfMonth |
| `sonner` | Toasts — sucesso, erro, desfazer |
| `zod` | Validação de formulários |
| `lucide-react` | Ícones (já instalado) |
| `zustand` + persist | State (já instalado) |

**Nunca usar:** Chart.js · react-hot-toast · yup · moment.js · Firestore · service workers

**Instalar quando necessário:** `npm i recharts date-fns sonner zod`

---

## PADRÕES DE CÓDIGO

### Componente

```typescript
import { FC } from 'react'

interface CardProps {
  title: string
  variant?: 'default' | 'highlight'
}

export const Card: FC<CardProps> = ({ title, variant = 'default' }) => {
  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <p className="text-dark font-semibold">{title}</p>
    </div>
  )
}
```

### Hook

```typescript
import { useCallback, useMemo } from 'react'
import { useTransactionStore } from '@/store'

export function useTransactions() {
  const transactions = useTransactionStore((s) => s.transactions)

  const total = useMemo(
    () => transactions.reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  )
  const add = useCallback((data: Omit<Transaction, 'id'>) => { /* ... */ }, [])

  return { transactions, total, add }
}
```

### Zustand Store

```typescript
export const useItemStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: 'cashly-items' }
  )
)
```

### Validação com Zod

```typescript
const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number({ invalid_type_error: 'Digite um valor' }).positive('Valor deve ser positivo'),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data inválida'),
})
type FormData = z.infer<typeof schema>
```

### Toast com Sonner

```typescript
import { toast } from 'sonner'
toast.success('Transação salva!')
toast.error('Erro ao salvar')
toast('Transação excluída', { action: { label: 'Desfazer', onClick: handleUndo } })
```

---

## TIPOS ESSENCIAIS

```typescript
Transaction { id, type: 'income'|'expense', amount, date, createdAt, categoryId, description, goalId? }
Category    { id, name, color, icon, isDefault }
Goal        { id, title, targetAmount, currentAmount, deadline, type: 'save'|'limit', categoryId?, isArchived }
User        { id, name, email, currency, theme: 'light'|'dark' }
ReportSummary { period, startDate, endDate, totalIncome, totalExpense, balance, byCategory: CategorySummary[] }

// Novos tipos necessários (ainda não em index.ts):
Budget      { id, categoryId, limitAmount, period: 'monthly' }
RecurringTransaction { id, templateData: Omit<Transaction,'id'|'date'|'createdAt'>, frequency: 'daily'|'weekly'|'monthly'|'yearly', nextDate: string, isActive: boolean }
FinancialInsight { id, type: string, message: string, severity: 'info'|'warning'|'success', generatedAt: string }
```

---

## CONVENÇÕES

**Commits:** `tipo(escopo): descrição` — escopos: `transactions` · `categories` · `dashboard` · `goals` · `reports` · `auth` · `ui` · `hooks` · `store` · `utils`

**Path alias:** `@/` → `src/`

**TypeScript — `verbatimModuleSyntax: true` (tsconfig.app.json):**
- Tipo sozinho: `import type { FC } from 'react'`
- Misto com valor: `import { type FC, useState } from 'react'`
- Verificar sempre com: `npx tsc --noEmit -p tsconfig.app.json`

**A11y obrigatório:** `aria-label` em ícones · `role="alert"` + `aria-live="polite"` em erros e mensagens dinâmicas · navegação por teclado (Tab/Enter/Esc)

---

## CHECKLIST ANTES DE COMMITAR

- [ ] `tsc --noEmit` sem erros
- [ ] Componentes com `aria-label` onde necessário
- [ ] Formulários com validação Zod
- [ ] Sem `console.log` ou `debugger`
- [ ] Commit segue `tipo(escopo): descrição`
