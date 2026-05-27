# CASHLY — Especificações de Features

Referência completa de todas as features planejadas. Use junto com `claude.md` para implementação.

---

## S2 — TRANSAÇÕES CRUD

### 2.1 Formulário de Lançamento (TransactionForm)

**Arquivo:** `src/components/organisms/TransactionForm.tsx`
**Validação:** Zod

**Campos:**
- `type` — toggle Income/Expense (padrão: expense)
- `amount` — número positivo, formatado como moeda
- `description` — string, mín. 1 char
- `categoryId` — select com ícone + cor da categoria
- `date` — date picker (padrão: hoje)

**Comportamento:**
- Submit com Enter
- Toast de sucesso via Sonner ao salvar
- Toast de erro se validação falhar
- Limpar form após submit bem-sucedido

**Store:** `useTransactionStore.addTransaction()`

---

### 2.2 Lista de Transações (TransactionList)

**Arquivo:** `src/components/organisms/TransactionList.tsx`

**Item da lista:** ícone da categoria (cor), descrição, categoria, data formatada (date-fns), valor +/- colorido, menu de contexto (editar/excluir)

**Exclusão:** toast com "Desfazer" por 4s antes de confirmar no store

**Edição:** abre TransactionForm preenchido

**Ordenação padrão:** data decrescente

---

### 2.3 Quick-Add Flutuante

**Arquivo:** `src/components/organisms/QuickAdd.tsx`

**UI:**
- Botão circular `+` fixo: `fixed bottom-6 right-6` (mobile) / `fixed bottom-8 right-8` (desktop), `bg-primary`, 56px, sombra intensa, `z-50`
- Clique abre modal slide-up animado com `transition` Tailwind
- Modal com campos mínimos: valor (destaque) + categoria + descrição opcional
- Submit com Enter ou botão "Salvar"
- ESC fecha o modal

**Não duplicar:** usa o mesmo TransactionForm (prop `compact={true}`)

---

### 2.4 Empty State de Transações

**Arquivo:** `src/components/molecules/EmptyState.tsx` (componente genérico reutilizável)

```tsx
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}
```

**Uso em Transactions:**
```tsx
<EmptyState
  icon={ArrowLeftRight}
  title="Nenhum lançamento ainda"
  description="Registre seu primeiro gasto — leva menos de 10 segundos."
  action={{ label: '+ Adicionar lançamento', onClick: openQuickAdd }}
/>
```

---

## S3 — CATEGORIAS + FILTROS

### 3.1 Gerenciamento de Categorias

**Arquivo:** `src/pages/Categories.tsx`

**Lista:** grid de cards com ícone (Lucide), nome, cor, badge "padrão" ou "custom"
**Ações:** criar (formulário inline), editar nome/cor/ícone, excluir (bloquear se há transações vinculadas com toast explicativo)
**Formulário:** nome + seletor de ícone (grid de 20 ícones Lucide) + seletor de cor (8 opções pré-definidas)

---

### 3.2 Filtros em Lançamentos

**Arquivo:** `src/components/organisms/FilterBar.tsx`

**Filtros:**
- Busca por texto (debounce 300ms)
- Período: Este mês / Mês passado / Últimos 3 meses / Personalizado (date range)
- Tipo: Todos / Receitas / Despesas
- Categoria: multi-select com chips coloridos

**Chips ativos:** mostrar abaixo da barra, cada chip tem X para remover
**Estado:** manter no hook `useTransactions` com `FilterOptions`

---

### 3.3 Orçamento por Categoria ⭐ PREMIUM

**Arquivo:** `src/store/budgetStore.ts` + `src/components/organisms/BudgetList.tsx`

**Conceito:** usuário define um limite mensal por categoria de despesa (ex: Alimentação = R$800/mês).

**Tipo novo em `src/types/index.ts`:**
```typescript
interface Budget {
  id: string
  categoryId: string
  limitAmount: number
  period: 'monthly'
}
```

**Store:** `budgetStore` com persist `cashly_v1_budgets`

**UI na página Categorias:**
- Ao lado de cada categoria de despesa: campo "Limite mensal" opcional
- Se definido, aparece barra de progresso: gastos atuais / limite
- Cores: verde (0-70%) → amarelo (70-90%) → vermelho (90%+)
- Badge "No limite!" quando ≥ 100%

**Toast automático:**
- Ao atingir 80%: `toast('Atenção! Você usou 80% do orçamento de Alimentação')`
- Ao atingir 100%: `toast.error('Limite de Alimentação atingido! R$800 gastos')`
- Disparar no `useTransactions` ao adicionar nova transação

**Hook:** `useBudgets()` — retorna array com `{ budget, category, spent, percentage, status: 'ok'|'warning'|'exceeded' }`

---

### 3.4 Transações Recorrentes ⭐ PREMIUM

**Arquivo:** `src/store/recurringStore.ts` + `src/components/organisms/RecurringList.tsx`

**Conceito:** modelos de transação que se repetem automaticamente (salário, Netflix, academia, aluguel).

**Tipo novo:**
```typescript
interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDate: string    // ISO — próxima data de geração
  isActive: boolean
}
```

**Geração automática:** no `App.tsx`, ao montar, verificar recorrentes com `nextDate <= hoje`:
1. Criar transação via `transactionStore.addTransaction()`
2. Atualizar `nextDate` para próxima ocorrência
3. Toast: `'Lançamento automático: Salário — R$6.500,00'`

**UI:** lista de recorrentes em Settings > Recorrentes (separado de categorias)
- Ícone de frequência, nome, valor, próxima data, toggle ativo/inativo
- Botão "Adicionar recorrente" com formulário igual ao TransactionForm + campo de frequência

---

## S4 — DASHBOARD

### 4.1 Cards de Resumo

**Arquivo:** refatorar `src/pages/Dashboard.tsx`

**Layout:** grid 3 colunas desktop / 1 coluna mobile
- **Saldo:** `text-dark` + comparativo vs mês anterior em `text-accent` (↑) ou `text-danger` (↓)
- **Receitas:** `text-accent` + total do mês corrente
- **Despesas:** `text-danger` + total do mês corrente
- **Taxa de poupança:** (receitas - despesas) / receitas × 100

**Data:** sempre filtrado pelo mês corrente (date-fns: `startOfMonth`, `endOfMonth`, `isWithinInterval`)

---

### 4.2 Gráfico Pizza — Gastos por Categoria

**Componente:** `src/components/organisms/CategoryPieChart.tsx`

```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// data: [{ name: 'Alimentação', value: 800, color: '#FF6B6B' }, ...]
// Usar cores das categorias do categoryStore
// Tooltip: nome + valor + porcentagem
// Legenda abaixo do gráfico
```

---

### 4.3 Gráfico Linha — Balanço Últimos 6 Meses

**Componente:** `src/components/organisms/BalanceLineChart.tsx`

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// data: [{ month: 'Jan', income: 7300, expense: 3050, balance: 4250 }, ...]
// 3 linhas: receita (accent), despesa (danger), saldo (primary)
// XAxis: nome curto do mês (date-fns format(date, 'MMM', { locale: ptBR }))
```

---

### 4.4 Score de Saúde Financeira ⭐ PREMIUM

**Arquivo:** `src/hooks/useFinancialScore.ts` + `src/components/organisms/HealthScore.tsx`

**Cálculo (0–100):**
```
Taxa de poupança:   peso 35% → [(receitas-despesas)/receitas] × 100
Controle orçamento: peso 35% → % de budgets não estourados no mês
Progresso de metas: peso 30% → % de metas não arquivadas com progresso ≥ 50%

score = (savingsScore × 0.35) + (budgetScore × 0.35) + (goalScore × 0.30)
```

**UI:**
```
Score: 74/100
████████████░░░  "Você está indo bem!"

Detalhes:
├── Poupança    28%   ██████░░░░  Excelente
├── Orçamentos  85%   █████████░  Atenção
└── Metas       60%   ██████░░░░  Bom
```

**Labels por faixa:**
- 0–39: "Precisa de atenção" (danger)
- 40–59: "Em desenvolvimento" (warning)
- 60–79: "Indo bem!" (accent)
- 80–100: "Excelente!" (accent)

---

### 4.5 Insights Automáticos ⭐ PREMIUM

**Arquivo:** `src/hooks/useInsights.ts`

**Regras (executar na montagem do Dashboard):**
```typescript
// 1. Gasto de categoria aumentou vs mês anterior
if (currentMonth[cat] > lastMonth[cat] * 1.2) →
  "Você gastou X% a mais com {categoria} que no mês passado"

// 2. Assinaturas caras
if (recurrings.filter(r => r.categoryId === 'streaming').reduce(sum) > 200) →
  "Suas assinaturas chegam a R$X/mês — R$Y/ano"

// 3. Projeção de poupança
if (balance > 0 && daysRemaining > 0) →
  "No ritmo atual, você vai poupar R$X este mês"

// 4. Meta em risco
if (goal.deadline < 60dias && goalProgress < 50%) →
  "A meta '{nome}' está em risco — faltam R$X em Y dias"

// 5. Dia da semana com mais gastos
→ "Você gasta mais às {dia-da-semana}"
```

**UI:** carousel ou lista de cards com ícone + mensagem + severity color

---

### 4.6 Onboarding Flow ⭐ PREMIUM

**Arquivo:** `src/pages/Onboarding.tsx` + `src/store/settingsStore.ts` (flag `onboardingCompleted`)

**Trigger:** se `settingsStore.onboardingCompleted === false` após login, redirecionar para `/onboarding`

**Passos:**
1. "Qual é sua renda mensal?" → salva como recorrente (income, Salário, monthly)
2. "Quanto quer poupar por mês?" → cria meta automática (type: 'save', deadline: 12 meses)
3. "Personalize suas categorias" → toggle de 6 categorias mais comuns para ativar
4. "Registre seu primeiro gasto" → TransactionForm embedded

**UI:** progress bar no topo, botão "Pular" em cada passo, "Voltar" + "Próximo"

---

## S5 — METAS

### 5.1 CRUD de Metas

**Arquivo:** `src/pages/Goals.tsx`

**Card de meta:**
- Título + descrição + tipo (save/limit)
- Barra de progresso com porcentagem
- Valor atual vs meta + data limite
- Dias restantes (date-fns `differenceInDays`)
- Actions: editar, arquivar, excluir

**Formulário:** título, valor alvo, data limite, tipo (save = acumular / limit = não gastar mais que), categoria opcional

**Celebração:** ao atingir 100%, toast com confetti (CSS confetti simples) + message "Meta atingida!"

---

### 5.2 Calendário Financeiro ⭐ PREMIUM

**Arquivo:** `src/pages/Calendar.tsx` (nova página) + nav item

**UI:**
- Grade 7×5 do mês atual
- Cada dia com pontos coloridos: verde (receitas), vermelho (despesas)
- Dias com recorrentes futuros destacados com borda `border-primary`
- Clique no dia abre drawer lateral com lista de transações do dia
- Navegação: mês anterior / próximo mês

**Nav item:** adicionar `{ to: '/calendar', label: 'Calendário', icon: CalendarDays }` no AppLayout

---

## S6 — RELATÓRIOS

### 6.1 Relatório por Período

**Arquivo:** `src/pages/Reports.tsx`

**Seletor de período:** Semanal / Mensal / Trimestral / Anual + range customizado (date-fns)

**Seções:**
- Resumo: receitas, despesas, saldo, taxa de poupança
- Gráfico de barras: receita vs despesa por semana/mês
- Tabela: gastos por categoria com % do total
- Comparativo: período atual vs período anterior (delta % colorido)

---

### 6.2 Export PDF

**Arquivo:** `src/services/pdfExport.ts`

**Biblioteca:** `jspdf` + `html2canvas` ou `@react-pdf/renderer`
**Conteúdo:** logo Cashly + período + resumo + tabela de transações + gráficos (screenshot)
**Trigger:** botão "Baixar PDF" na página de Relatórios

---

## S7 — QUALIDADE

### 7.1 Dark Mode

**Estratégia:** Tailwind `dark:` classes + classe `dark` no `<html>` controlada por `settingsStore.theme`

**Tokens dark (adicionar ao tailwind.config.js):**
```
dark background: #0F172A → #020617
dark surface: #FFFFFF → #1E293B
dark text-dark: #0F172A → #F8FAFC
dark text-mid: #334155 → #94A3B8
```

**Toggle:** Settings > Aparência > switch claro/escuro

---

### 7.2 Testes

**Framework:** Vitest + Testing Library
**Prioridade de teste:**
1. `useTransactions` — cálculos de saldo, income, expense
2. `useInsights` — cada regra de insight
3. `useFinancialScore` — cálculo do score
4. `formatCurrency`, `formatDate` — utils
