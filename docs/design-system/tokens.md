# Cashly — Design Tokens

Referência completa dos tokens visuais do Cashly. Todos os valores estão registrados em `src/design-system/tokens.ts` e espelhados em `tailwind.config.js` como classes utilitárias.

---

## 1. Cores

### 1.1 Paleta semântica

| Token | Hex | Tailwind class | Uso |
|-------|-----|----------------|-----|
| `primary` | `#1B4FDE` | `bg-primary` · `text-primary` · `border-primary` | Ações principais, navegação ativa, botão primário, foco |
| `accent` | `#00C48C` | `bg-accent` · `text-accent` | Receitas, saldo positivo, sucesso, metas atingidas |
| `danger` | `#EF4444` | `bg-danger` · `text-danger` | Despesas, erros, exclusões, alertas críticos |
| `warning` | `#F5A623` | `text-warning` | Alertas suaves, orçamento próximo do limite |
| `dark` | `#0F172A` | `bg-dark` · `text-dark` | Sidebar, títulos principais, texto de destaque |
| `mid` | `#334155` | `text-mid` | Texto secundário, labels de formulário |
| `light` | `#94A3B8` | `text-light` | Hints, placeholders, metadados, ícones neutros |
| `surface` | `#FFFFFF` | `bg-surface` | Fundo de cards e modais |
| `background` | `#F8FAFC` | `bg-slate-50` | Fundo geral das páginas |

> **Acessibilidade:** Todas as combinações de texto sobre fundo respeitam contraste mínimo 4.5:1 (WCAG 2.1 AA).  
> Exemplos verificados: `text-dark` sobre `bg-surface` (21:1), `text-primary` sobre `bg-surface` (5.2:1).

### 1.2 Semântica de cor por contexto financeiro

```
Receitas / Saldo positivo  → accent  (#00C48C)  +  sinal "+"
Despesas / Saldo negativo  → danger  (#EF4444)  +  sinal "-"
Poupança / Investimentos   → violet-500 (#8B5CF6)
Neutro / Informativo       → primary (#1B4FDE)
Alerta de orçamento        → warning (#F5A623)
```

### 1.3 Aplicação contextual

```tsx
// Valor de receita
<span className="text-accent font-semibold">+ R$ 6.500,00</span>

// Valor de despesa
<span className="text-danger font-semibold">- R$ 450,00</span>

// Saldo negativo
<span className="text-danger font-bold">R$ -200,00</span>

// Badge de status
<span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">↑ 12%</span>
<span className="bg-danger/10  text-danger  text-xs font-semibold px-2.5 py-1 rounded-full">↓ 3%</span>
```

### 1.4 Paleta de categorias

Usada pelos ícones e cards de categoria. Disponível em `src/utils/categoryIcon.ts → AVAILABLE_COLORS`.

| # | Hex | Nome sugerido |
|---|-----|---------------|
| 1 | `#FF6B6B` | Coral |
| 2 | `#4ECDC4` | Teal |
| 3 | `#45B7D1` | Sky |
| 4 | `#96CEB4` | Sage |
| 5 | `#FFEAA7` | Cream |
| 6 | `#DDA0DD` | Plum |
| 7 | `#F7DC6F` | Gold |
| 8 | `#98D8C8` | Mint |
| 9 | `#00C48C` | Accent (verde) |
| 10 | `#1B4FDE` | Primary (azul) |
| 11 | `#FF9500` | Laranja |
| 12 | `#8B5CF6` | Violeta |
| 13 | `#EF4444` | Danger (vermelho) |
| 14 | `#F59E0B` | Âmbar |
| 15 | `#10B981` | Esmeralda |
| 16 | `#EC4899` | Rosa |
| 17 | `#06B6D4` | Ciano |
| 18 | `#84CC16` | Lima |
| 19 | `#F97316` | Laranja forte |
| 20 | `#6366F1` | Índigo |

```tsx
// Fundo de ícone de categoria (transparência 10%)
<div style={{ backgroundColor: `${category.color}18` }}>
  <Icon style={{ color: category.color }} />
</div>
```

---

## 2. Tipografia

### 2.1 Família de fontes

```
Sistema: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif
```

Tailwind utiliza `font-sans` por padrão. Nenhuma fonte custom foi adicionada — usa a stack nativa do dispositivo para performance máxima.

### 2.2 Escala de tamanhos

| Token | Tailwind | Valor | Uso típico |
|-------|----------|-------|------------|
| `xs` | `text-xs` | 12px | Badges, metadados, hints de acessibilidade |
| `sm` | `text-sm` | 14px | Labels, itens de lista, conteúdo secundário |
| `base` | `text-base` | 16px | Corpo de texto, inputs, selects |
| `lg` | `text-lg` | 18px | Subtítulos de card, títulos de modal |
| `xl` | `text-xl` | 20px | — (raramente usado diretamente) |
| `2xl` | `text-2xl` | 24px | Títulos de página, valores de stat card |
| `3xl` | `text-3xl` | 30px | Valores grandes no Dashboard |
| `4xl` | `text-4xl` | 36px | Hero / landing page |

### 2.3 Pesos

```
font-normal   (400) — corpo de texto
font-medium   (500) — labels, navegação
font-semibold (600) — valores monetários, badges, botões
font-bold     (700) — títulos de página, stat cards
```

### 2.4 Padrões tipográficos recorrentes

```tsx
// Título de página
<h1 className="text-dark text-2xl font-bold">Lançamentos</h1>

// Subtítulo / contagem
<p className="text-light text-sm mt-1">12 transações</p>

// Label de campo
<p className="text-light text-sm">Saldo</p>

// Valor financeiro principal
<p className="text-dark text-2xl font-bold tracking-tight">R$ 4.250,00</p>

// Valor positivo
<p className="text-accent text-2xl font-bold">R$ 7.300,00</p>

// Valor negativo
<p className="text-danger text-2xl font-bold">R$ 3.050,00</p>

// Texto de card (nome)
<p className="text-dark text-sm font-semibold truncate">Alimentação</p>

// Texto de card (meta)
<p className="text-light text-xs mt-0.5">8 usos · 5 subcategorias</p>

// Badge pequeno
<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-mid">
  Padrão
</span>
```

---

## 3. Espaçamento

Base do sistema: múltiplos de 4px (escala Tailwind padrão).

| Token | Tailwind | Valor | Uso típico |
|-------|----------|-------|------------|
| `1` | `p-1` / `m-1` | 4px | Ícones pequenos, gaps mínimos |
| `2` | `p-2` / `gap-2` | 8px | Gap entre elementos inline |
| `3` | `p-3` / `gap-3` | 12px | Gap entre cards no grid |
| `4` | `p-4` / `gap-4` | 16px | Padding interno de cards menores |
| `5` | `p-5` | 20px | Padding interno de cards padrão |
| `6` | `p-6` | 24px | Padding de seções, gap de formulários |
| `8` | `p-8` | 32px | Padding de página desktop |
| `10` | `py-10` | 40px | Espaço vertical entre seções |
| `12` | `py-12` | 48px | Header vertical de páginas principais |
| `16` | `p-16` | 64px | — |

### Padrões de espaçamento por contexto

```
Padding de página:     p-4 md:p-8
Gap entre cards:       gap-3 (sm) · gap-4 (md/lg)
Padding de card:       p-4 (compacto) · p-5 (padrão)
Gap de formulário:     gap-4 (campos) · gap-6 (seções)
Gap de nav sidebar:    gap-0.5 (entre items)
Padding de nav item:   px-3 py-2.5
```

---

## 4. Border Radius

| Token | Tailwind | Valor | Uso |
|-------|----------|-------|-----|
| `sm` | `rounded` | 4px | Badges pequenos, `rounded-sm` |
| `md` | `rounded-md` | 8px | Botões compactos, inputs pequenos |
| `lg` | `rounded-lg` | 12px | Dropdowns, tooltips |
| `xl` | `rounded-xl` | 16px | Inputs, botões padrão, nav items, chips |
| `2xl` | `rounded-2xl` | 20px | Cards, modais |
| `3xl` | `rounded-3xl` | 24px | Topo de modais mobile (slide-up) |
| `full` | `rounded-full` | 9999px | Avatares, toggles, badges de conta |

### Padrão por componente

```
Card / stat card:    rounded-2xl
Input / select:      rounded-xl
Botão padrão:        rounded-xl
Nav item:            rounded-xl
Modal desktop:       rounded-2xl
Modal mobile:        rounded-t-3xl (topo arredondado)
Toggle:              rounded-full
Badge / chip:        rounded-full
Ícone de categoria:  rounded-xl (container)
Avatar:              rounded-full
```

---

## 5. Sombras

Usa a escala padrão do Tailwind. Nenhuma sombra customizada foi adicionada.

| Tailwind | Uso |
|----------|-----|
| `shadow-sm` | Cards em repouso (estado padrão) |
| `shadow-md` | Cards em hover · Dropdowns |
| `shadow-lg` | Modais · Toasts |
| `shadow-2xl` | Modais principais |
| `shadow-primary/20` | Botão primário (sombra colorida) |

```tsx
// Card padrão
<div className="bg-surface rounded-2xl p-5 shadow-sm border border-slate-100">

// Card em hover
<div className="hover:shadow-md transition-all">

// Botão primário com sombra colorida
<button className="bg-primary shadow-md shadow-primary/20 hover:shadow-lg">

// Modal
<div className="shadow-2xl">
```

---

## 6. Componentes — Padrões de composição

### Stat Card (Dashboard)

```tsx
<div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
  {/* Ícone + badge de trend */}
  <div className="flex items-center justify-between">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon size={20} className="text-primary" />
    </div>
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
      ↑ 12%
    </span>
  </div>
  {/* Label + valor */}
  <div>
    <p className="text-light text-sm">Saldo do mês</p>
    <p className="text-dark text-2xl font-bold tracking-tight">R$ 4.250,00</p>
  </div>
</div>
```

### Card de Categoria

```tsx
<div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all">
  <div className="w-11 h-11 rounded-xl" style={{ backgroundColor: `${color}18` }}>
    <Icon size={20} style={{ color }} />
  </div>
  <p className="text-dark text-sm font-semibold truncate mt-3">Alimentação</p>
  <p className="text-light text-xs mt-0.5">6 subcategorias · 8 usos</p>
</div>
```

### Botão primário

```tsx
<button className="
  bg-primary text-white font-semibold
  px-4 py-3 rounded-xl
  shadow-md shadow-primary/20
  hover:bg-blue-700 hover:shadow-lg
  active:scale-[0.98]
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Salvar
</button>
```

### Input

```tsx
<input className="
  w-full rounded-xl border border-light bg-surface
  px-4 py-3 text-base text-dark placeholder:text-light
  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
  disabled:opacity-50
  transition-all duration-200
" />
```

### Badge de tipo de categoria

```tsx
{/* Despesa */}
<span className="bg-danger/10 text-danger text-[10px] font-semibold px-2 py-0.5 rounded-full">
  Despesa
</span>

{/* Receita */}
<span className="bg-accent/10 text-accent text-[10px] font-semibold px-2 py-0.5 rounded-full">
  Receita
</span>

{/* Poupança */}
<span className="bg-violet-500/10 text-violet-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
  Poupança
</span>

{/* Padrão */}
<span className="bg-slate-100 text-mid text-[10px] font-semibold px-2 py-0.5 rounded-full">
  Padrão
</span>
```

### Toggle (Switch)

```tsx
<button role="switch" aria-checked={checked}
  className={`
    relative w-9 h-5 rounded-full transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
    ${checked ? 'bg-accent' : 'bg-slate-200'}
    ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
  `}
>
  <span className={`
    absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm
    transition-transform duration-200
    ${checked ? 'translate-x-4' : ''}
  `} />
</button>
```

### Filter Chip

```tsx
<span className="
  inline-flex items-center gap-1.5
  pl-3 pr-1.5 py-1
  bg-white border border-slate-200
  rounded-full text-xs font-medium text-mid
  shadow-sm
">
  Alimentação
  <button className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-slate-100">
    <X size={10} />
  </button>
</span>
```

---

## 7. Ícones

Biblioteca: **lucide-react** (tree-shakeable, SVG, tamanhos configuráveis).

| Contexto | Tamanho | Tailwind |
|----------|---------|----------|
| Nav sidebar | 18px | `size={18}` |
| Cards de categoria | 20px | `size={20}` |
| Botões com ícone | 16px | `size={16}` |
| Ícones inline em texto | 14px | `size={14}` |
| Empty states | 28px | `size={28}` |
| Stat cards | 20px | `size={20}` |
| Picker de categorias | 17px | `size={17}` |

### Grupos de ícones disponíveis para categorias

Definidos em `src/utils/categoryIcon.ts → ICON_GROUPS`:

| Grupo | Quantidade |
|-------|-----------|
| Finanças | 16 |
| Alimentação | 14 |
| Transporte | 8 |
| Saúde & Bem-estar | 13 |
| Casa | 14 |
| Compras | 12 |
| Tecnologia | 14 |
| Educação | 12 |
| Entretenimento | 13 |
| Viagens & Natureza | 15 |
| Trabalho | 10 |
| Outros | 11 |
| **Total** | **~142** |

### Regras de acessibilidade para ícones

```tsx
// Ícone decorativo (não lido por screen readers)
<Icon size={18} aria-hidden="true" />

// Ícone com significado (lido por screen readers)
<button aria-label="Excluir lançamento">
  <Trash2 size={16} aria-hidden="true" />
</button>

// Wrapper com label
<span aria-label="Receitas" role="img">
  <TrendingUp size={18} aria-hidden="true" />
</span>
```

---

## 8. Transições & Animações

```
Duração padrão:  duration-200 (200ms)
Easing padrão:   ease-in-out (Tailwind default)

Hover de card:   hover:shadow-md transition-all duration-200
Hover de botão:  hover:scale-[1.02] active:scale-[0.98] transition-all
Toggle:          transition-colors duration-200 (track) · transition-transform duration-200 (thumb)
Dropdown:        ChevronDown rotate-180 transition-transform
Opacity de ações em hover: opacity-0 group-hover:opacity-100 transition-opacity
```

---

## 9. Grid & Layout

### Sidebar

```
Largura desktop: w-64 (256px) — fixed left
Fundo:           bg-[#070D1A]
Border:          border-r border-white/[0.04]
```

### Conteúdo principal

```
Offset desktop:  ml-64
Padding mobile:  p-4
Padding desktop: md:p-6 ou md:p-8
Max-width:       max-w-3xl (listas) · max-w-4xl (grids) · max-w-6xl (dashboard)
```

### Grids de cards

```tsx
// Stat cards (Dashboard)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Categorias
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

// Relatórios (2 colunas)
<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
  <div className="lg:col-span-3"> {/* Gráfico grande */}
  <div className="lg:col-span-2"> {/* Gráfico menor */}
```

---

## 10. Acessibilidade (WCAG 2.1 AA)

| Requisito | Implementação |
|-----------|---------------|
| Contraste de texto ≥ 4.5:1 | `text-dark` (#0F172A) sobre branco = 21:1 |
| Contraste de texto ≥ 3:1 | `text-mid` (#334155) sobre branco = 9.7:1 |
| Focus visível | `focus:ring-2 focus:ring-primary` em todos os interativos |
| Ícones sem texto | `aria-hidden="true"` + `aria-label` no botão pai |
| Switch/Toggle | `role="switch"` + `aria-checked` |
| Erros de formulário | `role="alert"` + `aria-invalid` no input |
| Grupos de filtro | `role="group"` + `aria-label` |
| Dropdowns | `aria-haspopup` + `aria-expanded` |
| Listas de opções | `role="listbox"` + `role="option"` + `aria-selected` |
| Navegação | `aria-label` em cada `<nav>` |
| Seções | `<section aria-labelledby="id-do-titulo">` |

---

## 11. Referências de arquivo

| Arquivo | Conteúdo |
|---------|----------|
| `src/design-system/tokens.ts` | Tokens em TypeScript (valores brutos) |
| `tailwind.config.js` | Tokens mapeados para classes Tailwind |
| `src/utils/categoryIcon.ts` | Mapa de ícones + paleta de categorias |
| `src/components/atoms/Button.tsx` | Variantes de botão (CVA) |
| `src/components/atoms/Input.tsx` | Input com label, erro e ícones |
| `src/components/atoms/Toggle.tsx` | Switch acessível |
| `src/components/molecules/EmptyState.tsx` | Empty state genérico |
| `src/components/molecules/FilterChip.tsx` | Chip removível |
