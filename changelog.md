# Changelog

Todas as mudanças notáveis deste projeto estão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.0.0] — 2026

### 🎯 Sprint 7 — Qualidade, Acessibilidade e Deploy
#### Adicionado
- Dark mode completo com toggle e detecção de `prefers-color-scheme`
- Auditoria WCAG 2.1 AA — aria-labels, navegação por teclado, contraste
- Deploy em produção na Vercel com CI/CD automático
- README profissional com banner, badges, screenshots e documentação completa
- CHANGELOG com histórico completo por sprint

---

### 📄 Sprint 6 — Relatórios e Exportação
#### Adicionado
- Página de relatórios com seletor de período (semanal, quinzenal, mensal, anual)
- Gráfico de barras comparativo por semana do mês
- Tabela de despesas por categoria com valor, percentual e variação
- Indicador de saúde financeira baseado na regra 50/30/20
- Exportação de relatório em PDF com jsPDF + html2canvas
- Comparativo automático com período anterior

---

### 🎯 Sprint 5 — Metas Financeiras
#### Adicionado
- CRUD completo de metas financeiras
- Tipos de meta: Economizar e Limite de gastos
- Progress bar animada com percentual de conclusão
- Alertas: meta atingida, 80% do limite e 7 dias para o prazo
- Tela de celebração ao atingir meta
- Estado vazio com CTA para criar primeira meta

---

### 📊 Sprint 4 — Dashboard e Gráficos
#### Adicionado
- Dashboard com 5 cards: economia, receitas, despesas, taxa de poupança e saldo acumulado
- Variação percentual vs mês anterior em cada card
- Gráfico de área (evolução mensal) com seletor de 3, 6 ou 12 meses
- Gráfico de pizza (gastos por categoria) com legenda interativa
- Clique na fatia filtra transações por categoria
- Skeleton loading durante carregamento

---

### 🏷️ Sprint 3 — Categorias e Filtros
#### Adicionado
- CRUD de categorias personalizadas com ícone e cor
- Subcategorias vinculadas às categorias principais
- Filtro rápido por período: Hoje, Esta semana, Este mês, Este ano
- Filtro por categoria com multi-select e chips visuais
- Busca textual em tempo real com debounce de 300ms
- Verificação de dependência ao excluir categoria com transações vinculadas

---

### 💸 Sprint 2 — Autenticação e Layout
#### Adicionado
- Login com Google via Firebase Authentication
- Layout base com sidebar dark (desktop) e bottom navigation (mobile)
- Roteamento com React Router v6 usando createBrowserRouter
- Proteção de rotas — redireciona para login se não autenticado
- Dados de seed para desenvolvimento com 10 transações fictícias

---

### 🏗️ Sprint 1 — Fundação da Aplicação
#### Adicionado
- Setup Vite + React 18 + TypeScript
- Tailwind CSS v3 com tokens de design personalizados
- ESLint + Prettier + path alias @/ configurados
- Atomic Design: atoms Button, Input, Badge, Icon
- Zustand stores com persistência localStorage (prefixo cashly_v1_)
- Hooks customizados: useTransactions e useGoals
- Interfaces TypeScript: Transaction, Category, Goal, User, ReportSummary
- 12 categorias padrão pré-configuradas com ícone e cor
- Design tokens: cores, tipografia, espaçamento, border-radius

---

### 🔬 Sprint 0 — UX Research e Design System
#### Adicionado
- Repositório GitHub com branch protection na main e develop
- GitHub Projects como quadro Kanban com 8 sprints e 28 cards
- Formulário Google Forms com 10 perguntas para usuários reais
- Persona 1 — Elvis: Programador, 34 anos, usuário avançado
- Persona 2 — Fernanda: Escriturária, 25 anos, usuária iniciante
- User Journey Maps no Miro para cada persona (4 fases completas)
- Wireframes baseados no Finance Management UI/UX Kit (Figma Community)
- Design System: paleta, tipografia, espaçamentos e tokens
- LICENSE MIT e README inicial

---

*Cashly · 2026 · [cashly-drab.vercel.app](https://cashly-drab.vercel.app/)*