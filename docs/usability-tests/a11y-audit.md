# Auditoria de Acessibilidade — WCAG 2.1 AA

**Data:** 2026-05-22
**Metodologia:** Auditoria estática de código (grep sistemático + revisão manual de todos os componentes interativos). Não substitui uma auditoria com **axe DevTools** no navegador real nem testes com leitor de tela (**NVDA**/**VoiceOver**) — ver seção "Verificação manual pendente" no final.

---

## 1. O que foi verificado e corrigido

### 1.1 Labels de formulário (`htmlFor` / `id`)

Encontrados 4 `<label>` sem associação explícita ao campo (apenas visual, não announced corretamente por leitor de tela):

| Arquivo | Campo | Correção |
|---------|-------|----------|
| `GoalForm.tsx` | Select "Categoria" | `htmlFor="goal-category"` + `id="goal-category"` |
| `TransactionForm.tsx` | Select "Categoria" | `htmlFor="transaction-category"` + `id` + `aria-describedby` para erro |
| `TransactionForm.tsx` | Select "Subcategoria" | `htmlFor="transaction-subcategory"` + `id` |
| `TransactionForm.tsx` | Select "Vincular a uma meta" | `htmlFor="transaction-goal"` + `id` (removida `aria-label` redundante/conflitante) |

O atom `Input.tsx` já gerava `id` automaticamente a partir do `label` — não precisou de correção.

### 1.2 Foco visível (WCAG 2.4.7)

Encontrado 1 campo com `focus:outline-none` sem substituto visível (input de rename inline de subcategoria em `CategoryForm.tsx`). Adicionado `focus:ring-2 focus:ring-primary/30`.

Todos os demais inputs/botões já usam `focus:ring-2 focus:ring-primary` consistentemente (padrão do design system).

### 1.3 Modais — `role="dialog"`, foco gerenciado, Esc

Nenhum dos 5 modais customizados tinha gestão de foco. Criado hook reutilizável **`useModalA11y`** (`src/hooks/useModalA11y.ts`) que, ao montar:
- Foca automaticamente o primeiro elemento focável do modal
- Confina `Tab`/`Shift+Tab` dentro do modal (focus trap)
- `Esc` fecha o modal
- Ao desmontar, retorna o foco para o elemento que abriu o modal

Aplicado com `role="dialog" aria-modal="true" aria-labelledby="<id-do-título>"` em:

| Componente | Modal |
|------------|-------|
| `QuickAdd.tsx` | Novo lançamento (extraído para `QuickAddModal`) |
| `TransactionList.tsx` | Editar lançamento (extraído para `EditTransactionModal`) |
| `GoalForm.tsx` | Criar/editar meta |
| `CategoryForm.tsx` | Criar/editar categoria |
| `GoalCard.tsx` | Adicionar valor à meta (`ContributeModal`) |

O painel de notificações (`NotificationBell.tsx`) é um popover não-modal (não bloqueia a página) — não recebeu `role="dialog"`, mas ganhou `role="region"` + fechamento por `Esc`.

### 1.4 Botões somente-ícone sem `aria-label`

Levantamento cruzado (contagem de `<button>` vs `aria-label`/texto visível) em todos os 22 arquivos com elementos interativos. Resultado: cobertura já alta (56 `aria-label`s existentes de sessões anteriores). Ajustes finos:

- Toggle Receita/Despesa em `TransactionForm.tsx`: adicionado `aria-pressed` (estava sem indicar estado de seleção) e `aria-hidden="true"` nos ícones decorativos dentro do botão (texto visível já tornava o botão acessível, mas o ícone duplicava informação para leitor de tela).
- Ícones decorativos em botões de fechar (`X`) marcados com `aria-hidden="true"` nos modais corrigidos.

### 1.5 Imagens decorativas

Único `<img>` do app é o avatar do usuário (`AppLayout.tsx`), com `alt={nome do usuário}` — correto, pois não é decorativo (transmite identidade). Nenhuma imagem puramente decorativa encontrada que precisasse de `alt=""`.

### 1.6 Toasts (`aria-live`)

Toda notificação usa a biblioteca **Sonner**, que já implementa `role="status"` e `aria-live` internamente nos toasts — nenhuma ação adicional necessária.

### 1.7 Contraste de cores (dark mode)

Durante a implementação do dark mode (#024), identificado e corrigido contraste insuficiente do token `text-light` no tema escuro (slate-500 sobre slate-800 ≈ 2.7:1, abaixo do mínimo AA). Ajustado para slate-400 (≈5:1). Ver `docs/design-system/tokens.md`.

---

## 2. Navegação por teclado

Verificado por leitura de código (todos os elementos interativos são `<button>`, `<a>`, `<input>` ou `<select>` nativos — não há `<div onClick>` sem role/tabindex no codebase):

- **Tab / Shift+Tab:** ordem de foco segue a ordem do DOM em todos os formulários; dentro de modais, confinada pelo `useModalA11y`.
- **Enter:** submete formulários nativamente (`<form onSubmit>`); confirma edição inline de subcategoria.
- **Esc:** fecha todos os modais e o painel de notificações.
- **Setas:** não aplicável — não há nenhum componente customizado tipo combobox/radio-group que exigiria navegação por setas (selects nativos do browser já suportam isso nativamente).

---

## 3. Verificação manual pendente

Os itens abaixo exigem ferramentas que um agente de código não pode executar (navegador real, leitor de tela real) e devem ser feitos manualmente antes de considerar o sprint 100% fechado:

- [ ] Rodar **axe DevTools** em cada página (Dashboard, Lançamentos, Categorias, Relatórios, Metas, Configurações) e confirmar zero erros críticos
- [ ] Testar navegação completa com **NVDA** (Windows) ou **VoiceOver** (Mac) em pelo menos 3 fluxos: criar lançamento, criar meta, aplicar filtro
- [ ] Verificar contraste com a extensão **axe** ou [webaim.org/contrastchecker](https://webaim.org/resources/contrastchecker/) nas combinações de cor que usam hex fixo (`primary`, `accent`, `danger`, `warning`) sobre fundo escuro
- [ ] Simular daltonismo (extensão "Colorblindly") nos gráficos do Dashboard e Relatórios — confirmar que badges de tipo (Receita/Despesa) não dependem só da cor (já têm texto, mas vale confirmar visualmente)

---

## 4. Resumo

| Critério WCAG 2.1 AA | Status |
|------------------------|--------|
| 1.1.1 Conteúdo não-textual (alt) | ✅ Verificado em código |
| 1.3.1 Info e relações (labels) | ✅ Corrigido (4 labels) |
| 1.4.3 Contraste mínimo | ✅ Corrigido no dark mode · ⏳ confirmar com ferramenta |
| 2.1.1 Teclado | ✅ Verificado em código |
| 2.4.3 Ordem de foco | ✅ Verificado em código |
| 2.4.7 Foco visível | ✅ Corrigido (1 campo) |
| 4.1.2 Nome, função, valor (aria-*) | ✅ Corrigido (modais, toggle, labels) |
| Teste real com leitor de tela | ⏳ Pendente (manual) |
| Auditoria axe DevTools no navegador | ⏳ Pendente (manual) |
