## Estado Atual
- Fichas usam `moves: string[]` em `src/characters/types.ts` e `src/npc/types.ts`.
- A lista vem de `listCampaignMoves(campaignId)` com valores mock (`src/shared/store/appStore.ts:118-121`).
- Há um placeholder de rota para movimentos (`src/moves/Route.tsx:1-3`) não registrado no router (`src/routes/index.tsx`).

## Objetivo
- Implementar SOMENTE o CRUD de movimentos, com campos: `name`, `description`, `modifier (-1..3)`, `active: boolean`, `createdAt`.
- Mestre cria/edita/deleta; jogador apenas lê/seleciona na ficha.
- Alterações refletem nas fichas com consistência eventual (lista atualizada; ao salvar ficha, seleção se ajusta).
- Não alterar contratos dos módulos existentes (fichas continuam com `string[]`).

## Modelo de Dados
- `Move`: `{ id: string; campaignId: string; name: string; description: string; modifier: -1|0|1|2|3; active: boolean; createdAt: number; updatedAt: number }`.
- Escopo por campanha via `campaignId`.

## Persistência
- `localStorage` em `pbta_moves`, seguindo padrão dos repositórios locais:
  - Estrutura: `Record<campaignId, Record<moveId, Move>>`.
  - Funções utilitárias `load/save/upsertCampaign` similares às de personagens/NPCs.

## Repositório
- `src/moves/moveRepo.ts`: interface do repositório.
- `src/moves/localMoveRepo.ts`: implementação local com métodos:
  - `listByCampaign(campaignId): Move[]` (ordenado por `createdAt` desc).
  - `create(campaignId, data): { ok: true; move: Move } | { ok: false; message }` (valida `name` e `modifier ∈ [-1..3]`).
  - `update(campaignId, id, patch): { ok: true; move } | { ok: false; message }`.
  - `remove(campaignId, id): { ok: true } | { ok: false; message }`.

## Store
- Substituir `listCampaignMoves(campaignId)` para ler os movimentos ativos do repositório e retornar `string[]` de nomes, mantendo assinatura atual (`src/shared/store/appStore.ts:118-121`).
- Adicionar ações internas para o Mestre operar o CRUD de movimentos, sem alterar as APIs usadas por fichas/NPCs:
  - `listMoves(campaignId): Move[]` (admin/UI).
  - `createMove(campaignId, data)`.
  - `updateMove(campaignId, id, patch)`.
  - `deleteMove(campaignId, id)`.
  - Todas protegidas por `role === 'master'`.

## Rotas e UI
- Registrar rota protegida: `'/campaigns/:id/moves'` em `src/routes/index.tsx` usando `RequireRole role="master"`.
- Implementar `src/moves/Route.tsx`:
  - Lista de movimentos com filtro `active` e contador.
  - Formulário de criação/edição com validação (`name` obrigatório, `modifier ∈ [-1..3]`).
  - Ações: ativar/desativar, salvar edição, deletar.
  - Feedback visual de sucesso/erro.

## Consistência Eventual
- `listCampaignMoves` retorna somente nomes de movimentos `active === true`.
- Renomear/desativar remove o nome antigo da lista; na ficha do jogador (`src/characters/Route.tsx:171-179`), itens não listados deixam de aparecer; ao salvar, a seleção se ajusta para os movimentos atualmente exibidos.
- NPCs criados passam a receber a lista atual de nomes (`src/shared/store/appStore.ts:129-132`).

## Testes/Validação
- Validações de domínio no repositório: `modifier` dentro do intervalo, `name` não-vazio.
- Fluxos manuais:
  - Mestre cria/edita/desativa/deleta; verificar lista atualizada na ficha do jogador.
  - Jogador seleciona e salva; verificar que movimentos indisponíveis não são enviados.

## Arquivos a Criar/Editar
- Criar: `src/moves/types.ts`, `src/moves/moveRepo.ts`, `src/moves/localMoveRepo.ts`.
- Editar: `src/moves/Route.tsx` (implementar UI), `src/shared/store/appStore.ts` (trocar fonte da lista e adicionar ações CRUD), `src/routes/index.tsx` (registrar rota de movimentos).

## Não-alterações
- Não mudar tipos/contratos de `PlayerSheet` e `NpcSheet` (continuam `moves: string[]`).
- Não alterar lógica de ficha/npcs além de consumir `listCampaignMoves` já existente.

Confirma proceder com essa implementação?