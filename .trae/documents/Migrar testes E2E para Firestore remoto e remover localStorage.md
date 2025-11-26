## Objetivos

* Fazer todos os testes E2E passarem usando Firestore remoto.

* Remover dependências de `localStorage` de app e testes.

* Corrigir timeouts causados por assincronismo do Firestore e seletores defasados.

## Diagnóstico resumido

* Repositórios Firestore existem só para `campaigns`, `sessions` e `rolls`; personagens/NPCs/moves usam `localStorage`.

  * `src/shared/store/appStore.ts:77-84` alterna entre Firestore e repositórios locais; persiste o usuário em `localStorage` (`pbta_user` em `src/shared/store/appStore.ts:85-106`).

  * Páginas leem `localStorage` diretamente: `src/sessions/Route.tsx:227`, `src/shared/pages/DashboardPlayer.tsx:33`.

* Papel do usuário está divergente e hardcoded em dois lugares:

  * `src/auth/AuthContext.tsx:32` usa gmail para definir `role`.

  * `src/auth/firebase.ts:9-16` já mapeia corretamente `master.teste@pbta.dev` como mestre.

* Testes E2E manipulam/consultam `localStorage` para configurar/descobrir IDs:

  * Exemplos: `tests/e2e/sessions-create-validate.spec.ts:16-19`, `tests/e2e/npcs-create-validate.spec.ts:49-54`, `tests/e2e/roll-delete-permissions.spec.ts:12-16`.

* Seletores e textos mudaram (ex.: Session View agora exibe "RollHistory" com `.dice` e `.roll-mode` em `src/rolls/RollHistory.tsx:39-53`).

## Mudanças de código (Firestone-only)

1. Unificar uso de Firestore no store

* Em `src/shared/store/appStore.ts`:

  * Remover fallback para repositórios locais e o uso de `localStorage` para `user`.

  * Usar sempre `createFirestoreRepos(getDb())`, `createFirestoreSessionRepo(getDb())` e `createFirestoreRollRepo()`.

  * Adicionar repositórios Firestore novos para `characters`, `npcs`, `moves` com as mesmas interfaces usadas hoje (Create/Update/List):

    * Arquivos novos: `src/characters/firestoreCharacterRepo.ts`, `src/npc/firestoreNpcRepo.ts`, `src/moves/firestoreMoveRepo.ts` (CRUD + caches + `onSnapshot` quando aplicável).

  * Substituir listeners baseados em `storage` por `onSnapshot` (já ocorre para rolls/sessions).

1. Corrigir páginas que leem `localStorage`

* `src/sessions/Route.tsx:227`: remover leitura de `pbta_characters`; usar `useAppStore(s => s.listNpcSheets)` e `getMyPlayerSheet` existentes.

* `src/shared/pages/DashboardPlayer.tsx:31-47`: remover `loadCampaignsRoot()`; implementar `listCampaignsByPlayer(userId)` no repo de campanhas (query `where('players', 'array-contains', { userId })`) e expor via store `listAcceptedCampaigns()`.

1. Convites remotos

* `src/campaigns/firestoreCampaignRepo.ts`:

  * `validateInvite(token)`: trocar validação por cache por um `query(collection('invites'), where('token','==',token))` retornando o invite e checando `expiresAt/usesLimit`.

  * `acceptInvite(token, player)`: manter comportamento e incrementar `usesCount` (já existe), garantir que player entra em `players` da campanha.

1. Papel do usuário consistente

* `src/auth/AuthContext.tsx`: parar de hardcode gmail; reaproveitar mapeamento de `src/auth/firebase.ts:5-18` (extrair `mapUser` para módulo compartilhado ou importar) para que:

  * `master.teste@pbta.dev` → `role: 'master'`

  * `player.teste@pbta.dev` → `role: 'player'`

* Substituir `upsertUser` em memória por coleção `users` no Firestore (criar `src/auth/firestoreUserRepo.ts` com `get/set` simples). Opcional se o papel já for inferido por email.

## Ajustes nos testes E2E

1. Remover uso de `localStorage` em todos os testes

* Obter `campaignId` pela UI: após criar campanha, capturar o texto `#{id}` em `DashboardMaster` (`src/shared/pages/DashboardMaster.tsx:55`) e navegar com ele.

* Convites: usar botão "Gerar convite" e extrair o token do texto "Último convite: ...".

1. Atualizar seletores e expectativas

* Session View: usar `.session-view`, `DiceRoller` e `RollHistory` em vez de textos obsoletos.

* Mensagens: validar existência de `.error`/`saved`/`deleted` conforme páginas atuais (`src/sessions/CampaignSessionsRoute.tsx:173-175`).

* Login inválido: esperar `.error` visível em `Login` em vez de texto exato.

1. Determinismo para rolagens (vantagem/desvantagem)

* Em testes de rolls, antes de carregar a página, usar `page.addInitScript` para sobrescrever `crypto.getRandomValues` e gerar valores determinísticos (ex.: `[1,2,3]`).

* Validar `usedDice` lendo `.dice` de `RollHistory` e comparando com top/bottom 2 do array conhecido.

1. Google Login E2E

* Substituir teste de popup Google por fluxo email para evitar flakiness em headless: usar os botões "Dev Tools (Production)" (`src/auth/Login.tsx:75-83`) ou preenchimento de email/senha como já feito nos testes que passam.

1. Realtime

* `session-realtime-updates.spec.ts`: abrir duas contexts (mestre e jogador); garantir que o jogador vê atualizações após `onSnapshot` disparar. Adicionar `await page.waitForFunction(() => document.querySelectorAll('.list-item').length >= N)` para evitar timeouts.

## Verificações e validações

* Rodar E2E após ajustes até todos os testes passarem; priorizar categorias com timeout no relatório.

* Validar manualmente convites e campanhas entre dois usuários testes.

* DevTools: usar a UI nova para rolagens, exclusões e ver refletido no histórico em tempo real.

## Observações

* `.env` já aponta para a instância remota e emuladores estão desativados (`.env:8-10`).

* Não haverá mais persistência em `localStorage`; toda persistência será Firestore.

## Entregáveis

* Repos Firestore para `characters`, `npcs`, `moves` e ajustes no store.

* Correção de `AuthContext` para papel consistente com emails de teste.

* Testes E2E reescritos sem `localStorage`, com seletores atualizados e determinismo para rolagens.

* Passar 100% dos testes listados no relatório ou indicar substituição do teste de Google Login por email com justificativa técnica (popup OAuth em headless).

