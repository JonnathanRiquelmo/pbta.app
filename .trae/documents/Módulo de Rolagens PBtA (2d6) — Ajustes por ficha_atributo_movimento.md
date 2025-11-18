## Escopo Ajustado
- Toda rolagem é associada obrigatoriamente a uma ficha (`PlayerSheet` ou `NpcSheet`).
- Rolagem pode somar um atributo específico da ficha (ex.: Força, Agilidade etc.).
- Rolagem pode somar o modificador de um movimento; o movimento deve estar ativo na ficha selecionada (listado em `sheet.moves`) e ativo na campanha (`Move.active === true`).

## Dados e Persistência
- Tipo `Roll` (`src/rolls/types.ts`):
  - `id`, `sessionId`, `dice: number[]`, `usedDice: number[]`, `baseSum: number`
  - `attributeRef?: keyof Attributes`, `attributeModifier?: -1|0|1|2|3`
  - `moveRef?: string`, `moveModifier?: -1|0|1|2|3`
  - `totalModifier: number` (soma de `attributeModifier` + `moveModifier`)
  - `total: number`, `outcome: 'success'|'partial'|'fail'`
  - `who: { kind: 'player'|'npc'; sheetId: string; name: string }`
  - `createdAt: number`, `createdBy: string`
- Repositório local `createLocalRollRepo()` (`src/rolls/localRollRepo.ts`):
  - `STORAGE_KEY = 'pbta_session_rolls'`
  - Root: `Record<sessionId, Record<rollId, Roll>>`
  - Métodos: `listBySession(sessionId)`, `create(sessionId, createdBy, data)`, `remove(sessionId, rollId)`
  - Ordenação por `createdAt` desc

## Lógica de Rolagem
- Serviço `performRoll` (`src/rolls/service.ts`):
  - Entrada: `{ mode: 'normal'|'advantage'|'disadvantage'; attributeModifier?: -1|0|1|2|3; moveModifier?: -1|0|1|2|3 }`
  - Tenta usar função server-side (se configurada), senão usa client-side com `crypto.getRandomValues`
  - Client-side:
    - Normal: 2d6; `usedDice = dice`
    - Vantagem: 3d6; descarta o menor; `usedDice = 2 maiores`
    - Desvantagem: 3d6; descarta o maior; `usedDice = 2 menores`
  - `baseSum = sum(usedDice)`; `totalModifier = (attributeModifier || 0) + (moveModifier || 0)`; `total = baseSum + totalModifier`
  - `outcome`: `total >= 10 → 'success'`; `7..9 → 'partial'`; `<= 6 → 'fail'`
  - Funções puras: `computeOutcome(total)` e `pickUsedDice(mode, dice)`

## Integração no Store
- Estender `useAppStore` (`src/shared/store/appStore.ts:18-57`, `180-203`) com ações:
  - `listRolls(sessionId): Roll[]` – sem restrição de papel; usa `rollRepo.listBySession`
  - `createRoll(sessionId, data): { ok: true; roll } | { ok: false; message }` – requer usuário; valida ficha e movimento; usa `performRoll` e persiste via `rollRepo.create`
  - `deleteRoll(sessionId, rollId): { ok: true } | { ok: false; message }` – somente mestre
- Instanciar `rollRepo` junto com outros repos (`src/shared/store/appStore.ts:59-64`)
- Validações em `createRoll`:
  - Ficha: obrigatória; para jogador, usa `getMyPlayerSheet(campaignId)` (`src/shared/store/appStore.ts:115-119`); para mestre, aceita `NpcSheet` ou `PlayerSheet` selecionada
  - Atributo: se informado, deve existir em `sheet.attributes`
  - Movimento: se informado, deve existir em `sheet.moves` e estar `active` na campanha via `moveRepo.listByCampaign(campaignId)` e lookup por `name`

## UI na Página da Sessão
- Atualizar `src/sessions/Route.tsx:57-88` para incluir “Rolagens PBtA” abaixo dos detalhes:
  - Seleção de “Quem”: obrigatória
    - Jogador: apenas sua ficha (`getMyPlayerSheet(campaignId)`)
    - Mestre: lista todas fichas e NPCs
      - NPCs: `listNpcSheets(campaignId)` (`src/shared/store/appStore.ts:139-141`)
      - Fichas de jogador: leitura do `localStorage` `pbta_characters` por campanha (somente para escolha)
  - Atributo opcional: `select` com chaves de `Attributes` da ficha; mostra valor atual
  - Movimento opcional: `select` com `sheet.moves`; exibe somente movimentos que também estão `active` na campanha (via `listCampaignMoves(campaignId)` (`src/shared/store/appStore.ts:135-138`) e lookup para obter `modifier`)
  - Modo: `Normal | Vantagem | Desvantagem`
  - Botão “Rolar”: chama `createRoll`; limpa formulário; feedback
  - Histórico: `listRolls(sessionId)` com `who`, `attributeRef`+valor, `moveRef`+modifier, `dice/usedDice`, `totalModifier`, `total`, `outcome`
  - Exclusão: botão “Deletar” só para mestre, chamando `deleteRoll`

## Rotas
- Manter `src/rolls/Route.tsx` como placeholder; histórico fica dentro da sessão

## Validação e Regras
- `attributeModifier` e `moveModifier` ∈ `[-1,0,1,2,3]`
- Movimento deve estar presente na ficha (`sheet.moves`) e ativo na campanha (`Move.active`)
- Autorização: jogadores criam; mestres criam e deletam

## Testes e Verificação
- Validar funções puras `computeOutcome` e `pickUsedDice`
- Em dev:
  - Três modos de rolagem; diferentes atributos e movimentos
  - Persistência após recarregar e regras de deleção por papel

## Migração futura para Cloud Function
- `performRoll` checa `import.meta.env.VITE_ROLLS_FN_URL` ou Firebase e retorna shape de `Roll`

## Entregáveis
- Novos arquivos: `src/rolls/types.ts`, `src/rolls/rollRepo.ts`, `src/rolls/localRollRepo.ts`, `src/rolls/service.ts`
- Alterações: `src/shared/store/appStore.ts` (ações e instância `rollRepo`), `src/sessions/Route.tsx` (UI e histórico)
- Leitura de fichas de jogador via `localStorage` para seleção do mestre, sem alterar o módulo de personagens