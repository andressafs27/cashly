# Cashly 2.0 — Tarefas pendentes

> Atualizado em 14/10/2026. Base: cards #029 a #045 do PDF "Cashly Cards V2" e o estado real dos repositórios.
> Legenda: ✅ feito · 🟡 parcial · ⬜ pendente · 👤 depende de você · 🔒 bloqueado (motivo entre parênteses)

## Repositórios

| Repo | Branch | Estado |
|---|---|---|
| `cashly` (app web + docs) | `develop` | Sem commits pendentes do app. Pendentes sem commit: `docs/legal/`, `docs/infra/`, `docs/screenshots/banner.png`, `docs/design-system/logo/` (referência e rascunho) |
| `cashly-api` | `master` | Código pronto e commitado. `src/generated/` fica fora do git |
| `cashly-landing` | `master` | Seções, animações e og-image commitados |
| `cashly-mobile` | `master` | Scaffold Expo + Expo Router + deps. **Nada commitado ainda** |

---

## Sprint 8 — Identidade visual e logo

- ✅ **#029** Direção criativa aprovada (`docs/design-system/brand-direction.md`)
- 🟡 **#029** Moodboard com 10 a 15 referências em `docs/design-system/moodboard/` 👤
- ⬜ **#029** Validar a direção com pelo menos 2 pessoas do público 👤
- 🟡 **#030** Conceito A escolhido. Exports prontos (SVG, PNG 1x/2x/3x, favicon, ICO, Apple Touch Icon, escura, monocromática, horizontal final, guia de uso)
- ⬜ **#030** Refinar o conceito A no Figma 👤
- ⬜ **#030** Testar sobre foto (não há foto de teste) 👤
- ✅ **#030** Legibilidade em 16px com a versão simplificada
- ⬜ **#030** Commit dos arquivos de logo (`docs/design-system/logo/`), exceto rascunho e referência
- 🟡 **#031** Logo aplicado no app (barra lateral, login, `src/assets/logo.svg`), favicon, `theme-color` e `index.html`. Commitado
- ⬜ **#031** `manifest.json`: o `claude.md` diz "sem PWA". Precisa decidir se muda a regra 👤
- ⬜ **#031** Banner do README: gerado em `docs/screenshots/banner.png`, sem commit
- ⬜ **#031** Screenshots do README (precisam de prints atuais do app) 👤
- ⬜ **#031** Revisar splash/loading screen (não encontrei tela de loading própria no projeto) 👤
- ✅ **#031** Tokens de cor: paleta não mudou, nada a atualizar

## Sprint 9 — Landing page

- ✅ **#032** Copy da landing (rascunho em `docs/wireframes/landing-page/copy.md`)
- ⬜ **#032** Revisar o copy e responder os pontos ⏳ (depoimentos, prova social, redes sociais) 👤
- ⬜ **#032** Wireframes lo-fi e hi-fi no Figma, versões mobile (375px) e desktop (1280px) 👤
- ⬜ **#032** Validar os wireframes com 2 pessoas 👤
- ⬜ **#032** Exportar frames para `docs/wireframes/landing-page/` 👤
- 🟡 **#033** Hero, Features, Como funciona, CTA final e Footer. Commitado
- ✅ **#033** Animação de entrada nas seções (Intersection Observer, respeita reduzir movimento)
- ✅ **#033** SEO básico: title, description, Open Graph e og-image 1200×630
- ⬜ **#033** Seção de screenshots (precisa de prints) 👤
- ⬜ **#033** Seção de depoimentos (só com dados reais) 👤
- ⬜ **#033** Prova social no CTA final (só com número real) 👤
- ⬜ **#033** Links de Privacidade e Termos no footer (aguardam as páginas, ver #044)
- ⬜ **#033** Analytics: Cloudflare Web Analytics (sem cookies), ver #044
- ⬜ **#033** Lighthouse > 90 em Performance e SEO (precisa rodar)
- ⬜ **#033** Conferir meta tags ao compartilhar no WhatsApp e LinkedIn
- ⬜ **#033** Conferir layout em 375px e 1280px no navegador 👤 (não verifiquei visualmente)
- ⬜ **#033** Framer Motion (opcional, não necessário hoje)
- ✅ **#034** Deploy da landing na Vercel: `https://cashly-landing.vercel.app/` (feito por você)
- ⬜ **#034** Redirect `/app` → aplicação (`vercel.json`)
- ⬜ **#034** Testes em iPhone, Android e desktop 👤
- ⬜ **#034** PageSpeed Insights > 85 no mobile

## Sprint 10 — Backend, API e Cloudflare Tunnel

- ✅ **#035** Setup Node + Express + TypeScript + Prisma, schema com as 5 entidades do card e Budget/RecurringTransaction
- ✅ **#035** Rotas de categorias, transações, metas, relatórios e notificações
- ✅ **#035** Middlewares: autenticação Firebase, validação Zod, erro padronizado
- ✅ **#035** Swagger em `/api-docs`, rate limit, logs com Pino
- ✅ **#035** 16 testes unitários e de rota passando
- ✅ **#035** Auth só com Firebase. As rotas `/auth/register`, `/auth/login` e o JWT próprio saíram do escopo (decisão de 14/10/2026)
- 🔒 **#035** Subir o PostgreSQL com Docker e aplicar a migration inicial (Docker Desktop fechado) 👤
- 🔒 **#035** Testar os CRUDs e o relatório com banco (depende da migration)
- ⬜ **#035** Testar as rotas no Postman ou Insomnia
- ⬜ **#035** Logs estruturados em produção
- ⬜ **#036** Instalar Ubuntu Server 22.04 LTS 👤
- ⬜ **#036** Usuário sudo, Node 20 via nvm, PostgreSQL 15, PM2, Nginx, UFW 👤
- ⬜ **#036** Backup diário do PostgreSQL (cron) 👤
- ⬜ **#036** `docs/infra/ubuntu-server-setup.md` 👤
- ⬜ **#037** Conta Cloudflare e `cloudflared` no servidor 👤 (depende do #036)
- ⬜ **#037** Tunnel `cashly-api` com serviço systemd 👤
- ⬜ **#037** `docs/infra/cloudflare-tunnel.md` 👤
- 🟡 **#038** `src/services/api.ts` com axios, token do Firebase e retry em 401. Commitado, com testes
- ✅ **#038** `.env.example` e `.env.development` local (o `.env.development` fica fora do git)
- ⬜ **#038** `.env.production` com a URL do tunnel (depende do #037)
- ⬜ **#038** Migrar as stores (transações, categorias, metas) para a API, com fallback para localStorage (depende da API rodando)
- ⬜ **#038** Adicionar `VITE_API_URL` nas variáveis da Vercel
- ⬜ **#038** Testar com API local e com o tunnel

## Sprint 11 — App mobile

- ✅ **#039** Repo `cashly-mobile` criado (privado) e Expo com TypeScript
- ✅ **#039** Expo Router configurado (`src/app/`), scheme `cashly`, `expo-doctor` passa (21/21)
- ✅ **#039** Deps instaladas: expo-router, zustand, axios, date-fns, zod, react-dom@19.2.3 (fixado para resolver conflito de peer)
- ⬜ **#039** Commit do scaffold
- ⬜ **#039** Escolher NativeWind ou React Native Paper 👤
- ⬜ **#039** Pacote de tipos compartilhados com o web (monorepo ou pacote npm)
- ⬜ **#039** `expo-constants` para variáveis de ambiente
- ⬜ **#039** Rodar no emulador e no Expo Go (precisa de você para o dispositivo) 👤
- ⬜ **#040** Login com Google (expo-auth-session + Firebase)
- ⬜ **#040** Dashboard com cards de resumo e gráficos
- ⬜ **#040** Lista de lançamentos com pull-to-refresh
- ⬜ **#040** Formulário de lançamento em bottom sheet
- ⬜ **#040** Categorias
- ⬜ **#040** Metas com barra de progresso
- ⬜ **#040** Bottom tabs e header com logo e notificações
- ⬜ **#040** Dark mode seguindo o sistema
- ⬜ **#040** Splash screen e ícone do app com o novo logo
- ⬜ **#040** Dados sincronizados com a API (depende do #038 e do #035 rodando)
- ⬜ **#041** `eas.json` com profiles development, preview e production
- ⬜ **#041** Conta Google Play (US$ 25) 👤
- ⬜ **#041** Conta Apple Developer (US$ 99/ano) 👤
- ⬜ **#041** Ficha na Play Console e na App Store Connect (descrição, screenshots, categoria) 👤
- ⬜ **#041** Builds Android e iOS com EAS
- ⬜ **#041** Envio para revisão das duas lojas
- ⬜ **#041** Política de privacidade pública (depende do #044)

## Sprint 12 — Domínio e infraestrutura final

- ⬜ **#042** Registrar `cashly.com.br` no Registro.br (R$ 40/ano) 👤
- ⬜ **#042** Adicionar o domínio na Cloudflare e apontar os nameservers 👤
- ⬜ **#042** Full SSL na Cloudflare 👤
- ⬜ **#043** Registros DNS: `www` → landing, `app` → app, `api` → tunnel (depende de #042 e #037)
- ⬜ **#043** Domínios customizados na Vercel (landing e app)
- ⬜ **#043** Atualizar `VITE_API_URL` para `https://api.cashly.com.br`
- ⬜ **#043** Atualizar CORS da API para `cashly.com.br` e `app.cashly.com.br`
- ⬜ **#043** Domínios autorizados no Firebase Auth
- ⬜ **#044** Email `contato@cashly.com.br` via Cloudflare Email Routing 👤
- 🟡 **#044** Rascunhos de `privacidade.md` e `termos.md` (em `docs/legal/`, sem commit). Precisam de revisão e das respostas ⏳ 👤
- ⬜ **#044** Páginas `/privacy` e `/terms` na landing, com links no footer
- ⬜ **#044** Cloudflare Web Analytics
- ⬜ **#044** Atualizar as fichas das lojas com a URL da política 👤
- 🟡 **#045** Rascunho de `docs/infra/architecture-v2.md` (sem commit)
- ⬜ **#045** Procedimentos de deploy (`deploy.sh`) e backup/restauração, depois do #036
- ⬜ **#045** Atualizar o README com os novos links e badges
- ⬜ **#045** CHANGELOG com as entradas da v2
- ⬜ **#045** Monitoramento com UptimeRobot 👤
- ⬜ **#045** Post no LinkedIn 👤

---

## Fora do escopo da v2 (v1 pendente)

Você pediu para seguir só a v2. Isto fica para depois:

- ⬜ Remover o seed de dados fictícios do Dashboard (decidido: remover)
- ⬜ S3 premium: orçamento por categoria e recorrentes (sem store nem tipos ainda)
- ⬜ Página Settings (é só um shell)
- ⬜ S4 premium: score de saúde, insights automáticos e onboarding
- ⬜ S5 premium: calendário financeiro
- ⬜ S6: conferir o export PDF
- ⬜ S7: testes de `useInsights` e `useFinancialScore`, a11y, CI/CD

## Decisões tomadas que mudam o card

- **Auth:** só Firebase. O card pedia `/auth/*` e JWT próprio, que saíram do escopo.
- **Dados:** API com PostgreSQL. O `claude.md` foi atualizado.
- **Landing:** repositório separado.
- **Vulnerabilidades:** Prisma fixado em 6.12.0 para zerar o `npm audit` da API.
- **Vulnerabilidades do `cashly`:** há alertas antigos no `npm audit` (não causados pelo axios). Corrigir exige `npm audit fix --force`, com risco de quebra. Não foi feito.
