## Visão Geral
- Implementar SOMENTE testes cobrindo os cenários do arquivo `\.prompts\12-testes-e2e.txt`.
- Escolhas:
  - E2E com Playwright.
  - Unit com Vitest + React Testing Library (JS DOM).
- Sem alterações na aplicação; usar os stubs de autenticação e persistência local existentes.

## E2E (Playwright)
- Configuração:
  - `playwright.config.ts` com `webServer: { command: 'npm run dev', port: 5173 }` e `use: { baseURL: 'http://localhost:5173' }`.
  - Limpar `localStorage`/`sessionStorage` em `beforeEach` para isolar casos.
- Testes:
  1) Login Google (stub) e redirecionamento por role
     - Caminho: `/login`.
     - Ação: clicar `Entrar com Google` (`src/auth/Login.tsx:60`).
     - Verificação: URL termina em `/dashboard/player` (role padrão do stub; `src/auth/stubAuth.ts:8-15`, redireção `src/auth/Login.tsx:26`).
  2) Login email/senha
     - Caso mestre: `master.teste@pbta.dev` / `Test1234!` → `/dashboard/master` (`src/auth/stubAuth.ts:20-27`, redireção `src/auth/Login.tsx:26`).
     - Caso jogador: `player.teste@pbta.dev` / `Test1234!` → `/dashboard/player` (`src/auth/stubAuth.ts:29-36`).
     - Inválido: qualquer outro → mensagem `credenciais de teste inválidas` (`src/auth/stubAuth.ts:38`), renderizada em `<p class="error">` (`src/auth/Login.tsx:66`).
  3) Mestre cria campanha, gera token; jogador aceita; aparece em players como accepted
     - Mestre (`/dashboard/master`): preencher `Nome` e `Plot` e clicar `Criar` (`src/shared/pages/DashboardMaster.tsx:37-43`).
     - Gerar convite: clicar `Gerar convite` e capturar token do texto `Último convite` (`src/shared/pages/DashboardMaster.tsx:57-59` e `45-46`).
     - Jogador (`/dashboard/player`): colar token e clicar `Usar token` (`src/shared/pages/DashboardPlayer.tsx:35-38`).
     - Verificar em `/campaigns/:id`: lista “Jogadores” mostra o novo jogador (`src/campaigns/Route.tsx:47-61`).
     - Observação: obter `:id` da campanha via `localStorage.getItem('pbta_campaigns')` (Playwright `page.evaluate`).
  4) Jogador tenta criar ficha com soma != 3 → bloqueado
     - Navegar para `/characters/:campaignId` diretamente.
     - Preencher `Nome` e `Antecedentes`, marcar radio de atributos somando 2 (restante = 1).
     - Verificar `Soma restante: 1` e botão `Criar Ficha` desabilitado (`src/characters/Route.tsx:125`, `195`, lógica em `59`).
  5) Rolagem vantagem (descarta menor) → `usedDice` corretos; outcome calculado
     - Mestre cria NPC em `/campaigns/:id` com soma de atributos = 3 (UI “Criar NPCs”; `src/campaigns/Route.tsx:80-101`).
     - Criar sessão em `/campaigns/:id/sessions` e abrir (`src/sessions/CampaignSessionsRoute.tsx:128-139`).
     - Na sessão: selecionar `Quem` como `NPC: <nome>`, `Modo` = `Vantagem` (`src/sessions/Route.tsx:155-161`) e clicar `Rolar` (`src/sessions/Route.tsx:185`).
     - Verificar texto `Dados: [...] → usados: [...]` e afirmar que `usedDice` são os dois maiores de `dice` (`src/rolls/service.ts:11-17`).
     - Verificar `Total: baseSum + totalModifier = total → outcome` coerente com `computeOutcome` (`src/rolls/service.ts:5-9`).
  6) Mestre exclui rolagem; jogador não consegue excluir
     - Mestre: após rolar, botão `Deletar` visível e funcional (`src/sessions/Route.tsx:199-206`).
     - Jogador: abrir mesma sessão, `Deletar` não renderiza (condição por `isMaster`; `src/sessions/Route.tsx:57`, `199`).

## Unit (Vitest/RTL)
- Configuração:
  - `vitest.config.ts` com `environment: 'jsdom'` e `globals: true`.
  - Instalar `@testing-library/react` e `@testing-library/user-event`.
- Testes:
  1) Função de rolagem com modos e modifier (`src/rolls/service.ts:25-38`)
     - `pickUsedDice('advantage', [1,5,3])` → `[5,3]`; `disadvantage` → `[1,3]`; `normal` usa os dois primeiros (`11-17`).
     - `computeOutcome(10)='success'`, `7='partial'`, `6='fail'` (`5-9`).
     - `performRoll(...)`: mockar `crypto.getRandomValues` para dados determinísticos e validar `dice`, `usedDice`, `baseSum`, `totalModifier` e `outcome`.
  2) Validador de atributos (soma = 3)
     - Front-end repo: `createLocalCharacterRepo().create(...)` retorna `{ ok:false, message:'invalid_attributes_sum' }` quando soma ≠ 3; ok quando soma = 3 (`src/characters/localCharacterRepo.ts:63-65`, `82-84`).
  3) RTL: `CharacterRoute` desabilita envio quando restante ≠ 0
     - Render em JS DOM, setar campos, selecionar atributos somando 2, esperar `Soma restante: 1` e botão `Criar Ficha` desabilitado (`src/characters/Route.tsx:59`, `125`, `195`).

## Estrutura de Arquivos
- E2E: `tests/e2e/*.spec.ts`
  - `login-google.spec.ts`, `login-email.spec.ts`, `invite-acceptance.spec.ts`, `character-block-invalid-sum.spec.ts`, `roll-advantage.spec.ts`, `roll-delete-permissions.spec.ts`.
- Unit: `src/**/__tests__/*.(test|spec).ts`
  - `src/rolls/__tests__/service.spec.ts`.
  - `src/characters/__tests__/localCharacterRepo.spec.ts`.
  - `src/characters/__tests__/CharacterRoute.rtl.spec.tsx`.

## Execução
- Unit: `npx vitest run` ou `npm run test` se script definido.
- E2E: `npx playwright test` (inicia `vite` via `webServer` e executa os specs).

## Considerações Técnicas
- Ambiente de teste usa stubs por padrão, pois `VITE_FIREBASE_API_KEY` não está definido (`src/auth/firebase.ts` trata como stub; erros de Firebase real: `"Firebase não configurado nesta base"`).
- Persistência usa `localStorage`; os testes devem limpar chaves: `pbta_campaigns`, `pbta_characters`, etc.
- Seletores preferenciais por texto/label para estabilidade; evitar `nth-child`.

Deseja que eu proceda criando a configuração e os arquivos de teste conforme acima?