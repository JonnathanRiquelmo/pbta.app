## Escopo

* Implementar apenas o módulo de PDM/NPC para o mestre.

* Criar múltiplas fichas `type: "npc"` com mesmos campos de `PlayerSheet`, mas `equipment` e `notes` opcionais.

* Atribuir automaticamente todos os movimentos ativos da campanha na criação do NPC.

* Exibir NPCs na visão da campanha (aba Fichas) acessível ao mestre; jogadores não editam NPCs.

* Se a lista de movimentos não existir, usar stub/mock e sinalizar integração futura.

## Base Atual

* Ficha do jogador: `src/characters/types.ts:11` (`PlayerSheet`), `src/characters/characterRepo.ts:3` contratos, `src/characters/localCharacterRepo.ts` persistência local.

* Store: `src/shared/store/appStore.ts:28` interface e `listCampaignMoves` stub em `src/shared/store/appStore.ts:104`.

* Campanha UI: `src/campaigns/Route.tsx:12` mostra jogadores; não há aba Fichas.

* Permissões: `src/auth/guards.tsx:11` (`RequireRole`).

## Modelo e Persistência

* Criar `src/npc/types.ts` com `NpcSheet` espelhando `PlayerSheet`, porém:

  * `type: "npc"` (campo interno, não exposto no formulário).

  * `equipment?: string`, `notes?: string` (opcionais).

  * `userId` substituído por `createdBy` (id do mestre) para rastreio.

* Persistência local em `src/npc/localNpcRepo.ts` seguindo o padrão de `localCharacterRepo`:

  * Chave de storage `pbta_npcs`.

  * Estrutura por `campaignId`: `Record<string, NpcSheet>` com `id` único (`npc-<timestamp>`).

  * Validação: soma absoluta dos atributos igual a 3 (mesma regra de `localCharacterRepo.ts:30-33` e `63-65`).

  * Métodos: `listByCampaign(campaignId)`, `createMany(campaignId, createdBy, inputs[])`, `update(campaignId, id, patch)`.

## Contratos (Repo)

* Criar `src/npc/npcRepo.ts` com tipos:

  * `CreateNpcSheetInput` (mesmos campos obrigatórios de `CreatePlayerSheetInput` exceto `equipment`/`notes` opcionais; sem `moves`).

  * `UpdateNpcSheetPatch` (parcial, mas não permite editar `moves` diretamente pelo jogador).

  * `NpcRepo` com `listByCampaign`, `createMany`, `update`.

## Orquestração (Store)

* Estender `src/shared/store/appStore.ts`:

  * Injetar `createLocalNpcRepo()` e novas ações:

    * `listNpcSheets(campaignId: string): NpcSheet[]`.

    * `createNpcSheets(campaignId: string, inputs: CreateNpcSheetInput[]): { ok: true; created: NpcSheet[] } | { ok: false; message: string }`.

    * `updateNpcSheet(campaignId: string, id: string, patch: UpdateNpcSheetPatch): { ok: true; sheet: NpcSheet } | { ok: false; message: string }`.

  * Regra de permissão: exigir `user.role === 'master'` nas ações de criar/atualizar NPC.

  * Atribuição automática de movimentos:

    * Dentro de `createNpcSheets`, obter `moves = listCampaignMoves(campaignId)` (`src/shared/store/appStore.ts:104`).

    * Se vazio/indefinido, usar mock `['Movimento 1', 'Movimento 2', 'Movimento 3']` (compatível com stub atual).

    * Preencher `sheet.moves = moves` na criação.

## UI (Mestre)

* Atualizar `src/campaigns/Route.tsx` para uma aba "Fichas" visível somente ao mestre:

  * Estrutura de tabs simples: "Jogadores" (já existe em `src/campaigns/Route.tsx:12-29`) e "Fichas".

  * Conteúdo "Fichas":

    * Lista de NPCs da campanha (`listNpcSheets(id)`).

    * Formulário "Criar NPCs" com capacidade de adicionar múltiplas entradas antes de confirmar (campos: `name`, `background`, `attributes`; `equipment`/`notes` opcionais). Movimentos não editáveis (somente exibidos após criação).

    * Ação dispara `createNpcSheets`.

  * Proteger rota/aba com `RequireRole` para `master` (`src/auth/guards.tsx:11-15`).

## UI (Jogador)

* Jogador não vê/edita NPCs:

  * Não expor ações de NPC na store para rotas do jogador.

  * Não renderizar aba "Fichas" no player dashboard.

## Integração de Movimentos

* Usar `listCampaignMoves(campaignId)` como fonte única.

* Caso futura integração mude para coleção real, substituir stub mantendo a mesma interface.

## Verificação

* Fluxo manual:

  * Logar como mestre.

  * Criar campanha.

  * Abrir campanha → aba "Fichas".

  * Criar 2-3 NPCs; verificar validação de atributos (=3), IDs gerados, timestamps e que `moves` foram atribuídos automaticamente.

  * Relogar como jogador; confirmar que a aba "Fichas" não aparece e que não há UI de edição.

* Persistência: confirmar conteúdo de `localStorage.pbta_npcs` por campanha.

## Arquivos a adicionar/alterar

* Adicionar: `src/npc/types.ts`, `src/npc/npcRepo.ts`, `src/npc/localNpcRepo.ts`.

* Alterar: `src/shared/store/appStore.ts` (novas ações de NPC e injeção de repo), `src/campaigns/Route.tsx` (UI de aba Fichas com CRUD de NPC restringido ao mestre).

## Critérios de Aceite

* Mestre consegue criar múltiplas fichas NPC de uma vez.

* Cada NPC recebe todos os movimentos da campanha imediatamente na criação.

* NPCs aparecem na aba Fichas da campanha quando logado como mestre.

* Jogadores não possuem acesso a criar/editar NPCs.

* Funciona mesmo com lista de movimentos mock (sem backend).

