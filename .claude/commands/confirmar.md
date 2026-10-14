Confirme e publique as mudanças pendentes do Cashly (commit + push), usando a mensagem de commit sugerida.

O comando `/confirmar` é a aprovação explícita do usuário para commit e push. Siga estes passos na ordem e pare sempre que uma condição falhar.

## 1. Verificar o estado

Rode `git status --short` e `git branch --show-current`.

- Se não houver mudanças, informe "nada para confirmar" e pare.
- Se a branch atual for `main`, pare e pergunte ao usuário. Não publique direto na `main`.

## 2. Filtrar arquivos sensíveis

Nunca adicione ao commit: `.env*` (exceto `.env.example`), chaves, tokens, senhas, certificados (`*.pem`, `*.key`, `*.p12`) ou credenciais do Firebase.

Se algum desses aparecer em `git status`, pare, mostre o nome do arquivo e peça confirmação. Não leia o conteúdo.

## 3. Montar a mensagem de commit

- Se o usuário passou um texto depois de `/confirmar`, use-o como mensagem.
- Caso contrário, sugira uma mensagem no formato `tipo(escopo): descrição` (convenção do `claude.md`). Escopos válidos: `transactions`, `categories`, `dashboard`, `goals`, `reports`, `auth`, `ui`, `hooks`, `store`, `utils`, `brand`, `design-system`, `docs`, `landing`, `api`, `mobile`, `infra`.
- Para mudanças só em documentação, use `docs(escopo): ...`.

Adicione ao final da mensagem a linha:

```
Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>
```

## 4. Commit

- Adicione só os arquivos listados pelo `git status` que fazem parte da mudança, usando `git add <arquivo>`. Não use `git add -A` nem `git add .`.
- Faça o commit com a mensagem montada no passo 3.

## 5. Push

- Rode `git push origin <branch-atual>`.
- Não use `--force`, `--force-with-lease`, `--no-verify` nem reescrita de histórico.
- Se o push falhar, mostre a mensagem de erro completa e não tente corrigir sozinho.

## 6. Resultado

Informe, em poucas linhas:
- hash do commit e mensagem usada;
- branch e resultado do push;
- arquivos que ficaram de fora (se houver), com o motivo.
