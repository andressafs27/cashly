Faça uma análise rápida do estado atual do projeto Cashly sem explorar node_modules.

Leia os seguintes arquivos para entender o que está construído:
- `claude.md` (sprint status e o que está feito)
- `src/types/index.ts` (tipos definidos)
- Arquivos em `src/pages/` (quais estão implementados vs vazios)
- Arquivos em `src/components/` (quais componentes existem)
- Arquivos em `src/store/` (quais stores existem)
- Arquivos em `src/hooks/` (quais hooks existem)

Produza um relatório em formato tabela:

| Item | Status | Observação |
|------|--------|------------|

Categorias para verificar:
- Tipos em `src/types/index.ts` (quais existem, quais estão faltando para features premium)
- Stores (existem? têm os métodos necessários?)
- Hooks (existem? o que retornam?)
- Componentes atoms/molecules/organisms (quais existem?)
- Páginas (implementadas ou shell vazio?)
- Utilitários (formatCurrency, formatDate existem?)

Ao final, liste em ordem de prioridade o que deve ser implementado primeiro para desbloquear o sprint atual.
