# Cashly 2.0 — Pendências

> Atualizado em 14/10/2026. Lista do que falta para avançar na v2, com quem é responsável.

## Responsável: Andressa

| Item | Card / referência | Observação |
|---|---|---|
| Moodboard com 10 a 15 referências de logos de apps financeiros | #029 | Salvar em `docs/design-system/moodboard/` |
| Validar a direção de marca com pelo menos 2 pessoas do público | #029 | Público: João (analista) e Ana (estudante) |
| Desenhar os conceitos de logo no Figma (mínimo 3) | #030 | Estilo combinado, símbolo de organização/camadas |
| Exportar o logo (SVG, PNG 1x/2x/3x) e criar o guia de uso | #030 | Testar em 16px, 32px e 64px |
| Preencher o documento de descoberta (Bloco 1) | Seções 1, 2, 4, 5 e 6 | Depende de uso da v1 e de atritos observados |

## Responsável: Claude (depois que o item de Andressa estiver pronto)

| Item | Card | Depende de |
|---|---|---|
| Checklist de entrega do logo em `docs/design-system/logo/` | #030 | Nada (pode ser feito já, se quiser) |
| Aplicar a identidade no app (logo, favicon, tokens de cor) | #031 | Logo final |
| Wireframes da landing page (apoio ao Figma) | #032 | Logo final e copy |
| Atualizar `tokens.md` com a paleta aprovada | #031 | Paleta aprovada (já decidida) |

## Decisões em aberto

- **Integração com Figma:** só é necessária se a escolha for o Claude criar os conceitos. Hoje a decisão é desenhar manualmente.
- **Backend (#035, #038):** decisão revertida em 14/10/2026: API com PostgreSQL. `claude.md` atualizado. Repositório `cashly-api` privado (a criar). Schema inclui os 5 do card mais Budget e RecurringTransaction.

## Fora do escopo agora (v1)

- Remover o seed de dados fictícios do Dashboard (decidido: remover). Fica para depois, porque você pediu para seguir só a v2.
- Pendências da v1 (S3 premium, Settings, S4–S7). Voltam quando a v2 estiver fechada ou quando você pedir.

## Já concluído

- Direção criativa da marca aprovada em 13/10/2026 ([brand-direction.md](brand-direction.md)).
