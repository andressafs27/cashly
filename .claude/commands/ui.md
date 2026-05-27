Leia `docs/claude/recipes.md` do projeto Cashly.

Padrão solicitado: $ARGUMENTS

Encontre o recipe correspondente a "$ARGUMENTS" em `docs/claude/recipes.md` e:

1. Mostre o código do recipe adaptado ao contexto do projeto
2. Indique onde criar o arquivo (caminho exato seguindo a estrutura atoms/molecules/organisms)
3. Indique quais imports são necessários
4. Verifique se as bibliotecas necessárias já estão instaladas

Se "$ARGUMENTS" não encontrar um match exato, liste os recipes disponíveis e pergunte qual o usuário quer.

Possíveis valores para $ARGUMENTS:
- formulario | form
- toast | desfazer
- grafico-pizza | pie-chart
- grafico-linha | line-chart
- barra-progresso | progress-bar
- empty-state
- score | health-score
- quick-add
- moeda | formatCurrency
- data | formatDate
- filtro-mes | month-filter
