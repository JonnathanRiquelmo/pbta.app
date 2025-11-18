## Escopo

* Implementar somente rolagens PBtA (2d6) com modos: normal, vantagem, desvantagem.

* Persistir por sessão em `sessions/{sessionId}/rolls/{rollId}` com `localStorage`.

* Interface na página da sessão: selecionar personagem/NPC, movimento opcional (modifier -1..3), botão “Rolar”, histórico cronológico, e exclusão somente pelo mestre.

* Preparar função isolada para migração futura a Cloud Function; usar client-side quando não houver servidor.

  <br />

## Dados e Persistência

* Tipo `Roll` (`src/rolls/types.ts`):

  * `id`, `sessionId`, `dice: number[]`, `usedDice: number[]`, `baseSum: number`, `modifier: -1|0|1|2|3`, `total: number`, `outcome: 'success'|'partial'|'fail'`, `who: { kind: 'player'|'npc'; id: string; name: string }`, `movementRef?: string`, `createdAt: number`, `createdBy: string`.

* Repositório local `createLocalRollRepo()` (`src/rolls/localRollRepo.ts`):

  * `STORAGE_KEY = 'pbta_session_rolls'`.

  * Root: `Record<sessionId, Record<rollId, Roll>>`.

  * Métodos: `listBySession(sessionId)`, `create(sessionId, createdBy, data)`, `remove(sessionId, rollId)`.

  * Ordenação por `createdAt` desc.

* Contrato `RollRepo` (`src/rolls/rollRepo.ts`): interfaces dos métodos acima.

## Lógica de Rolagem

* Serviço `performRoll` (`src/rolls/service.ts`):

  * Entrada: `{ mode: 'normal'|'advantage'|'disadvantage'; modifier: -1|0|1|2|3 }`.

  * Tenta usar função server-side (Cloud Function) se configurada; caso contrário, usa client-side e retorna imediatamente.

  * Client-side: usa `crypto.getRandomValues` para gerar 2d6 ou 3d6.

    * Normal: 2d6; `usedDice = dice`.

    * Vantagem: 3d6; descarta o menor; `usedDice = 2 maiores`.

    * Desvantagem: 3d6; descarta o maior; `usedDice = 2 menores`.

  * `baseSum = sum(usedDice)`; `total = baseSum + modifier`.

  * `outcome`: `total >= 10 → 'success'`; `7..9 → 'partial'`; `<= 6 → 'fail'`.

  * Função pura `computeOutcome(total)` para testes.

## Integração no Store

* Estender `useAppStore` (`src/shared/store/appStore.ts:18-57`, `180-203`) com ações:

  * `listRolls(sessionId): Roll[]` – sem restrição de papel; usa `rollRepo.listBySession`.

  * `createRoll(sessionId, data): { ok: true; roll } | { ok: false; message }` – requer usuário autenticado; usa `performRoll` e persiste via `rollRepo.create`.

  * `deleteRoll(sessionId, rollId): { ok: true } | { ok: false; message }` – somente mestre.

* Instanciar `rollRepo` similar a `sessionRepo` (ver `src/shared/store/appStore.ts:59-64`).

## UI na Página da Sessão

* Atualizar `src/sessions/Route.tsx:57-88` para incluir seção “Rolagens PBtA” abaixo dos detalhes:

  * Seleção de “Quem”:

    * Jogador: carrega apenas sua ficha com `getMyPlayerSheet(campaignId)` (`src/shared/store/appStore.ts:115-119`).

    * Mestre: lista todas fichas e NPCs:

      * NPCs por `listNpcSheets(campaignId)` (`src/shared/store/appStore.ts:139-141`).

      * Fichas de jogador: leitura direta do `localStorage` `pbta_characters` por campanha (somente para escolha), sem alterar o módulo de personagens.

  * Movimento opcional: campo texto para nome e campo numérico de `modifier` (-1..3); para mestres, pode também sugerir nomes via `listCampaignMoves(campaignId)` (`src/shared/store/appStore.ts:135-138`).

  * Modo: select com `Normal`, `Vantagem`, `Desvantagem`.

  * Botão “Rolar”: chama `createRoll`, limpa o formulário, exibe feedback.

  * Histórico: lista cronológica decrescente (`listRolls(sessionId)`), mostrando `who`, `movementRef`, dados (`dice`, `usedDice`), `modifier`, `total`, `outcome`.

  * Exclusão: botão “Deletar” visível apenas para mestre, chamando `deleteRoll`.

## Rotas

* Manter `src/rolls/Route.tsx` como opcional/placeholder; foco é histórico dentro da sessão conforme requisito.

## Validação e Regras

* Validações de entrada:

  * `modifier` deve estar em `[-1,0,1,2,3]` (mesmo util de moves).

  * `who` obrigatório; `movementRef` opcional.

* Autorização:

  * Jogadores podem criar rolagens; não podem deletar.

  * Mestres podem criar e deletar.

## Testes e Verificação

* Funções puras: `computeOutcome(total)` e `pickUsedDice(mode, dice)` para testes unitários simples (sem framework formal, validação manual via script ou console).

* Após aprovação, validar em dev server com:

  * Realizar rolagens nos três modos, diferentes `modifier`.

  * Verificar persistência ao recarregar página e regras de deleção por papel.

## Migração futura para Cloud Function

* `performRoll` checa configuração (ex.: `import.meta.env.VITE_ROLLS_FN_URL` ou integração Firebase); se existir, faz `fetch`/`httpsCallable` e salva resposta; caso contrário, fallback client-side.

* Estrutura do retorno esperado do servidor igual ao shape local de `Roll` (componente determinístico do lado do servidor).

## Entregáveis

* Novos arquivos: `src/rolls/types.ts`, `src/rolls/rollRepo.ts`, `src/rolls/localRollRepo.ts`, `src/rolls/service.ts`.

* Alterações: `src/shared/store/appStore.ts` (ações e instância `rollRepo`), `src/sessions/Route.tsx` (UI e histórico).

* Nenhuma modificação em módulos externos além de leituras necessárias para listar fichas.

Confirma prosseguir com esta implementação?
