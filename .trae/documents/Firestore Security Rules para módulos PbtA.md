## Escopo
- Implementar SOMENTE regras de segurança Firestore para: `campaigns`, `characters`, `npcs`, `moves`, `sessions`, `rolls`, `invites`.
- Garantir autenticação, autorização por papel (mestre/jogador) e validações de dados exigidas.
- Projeto alvo: `pbta-app`.

## Assunções de Esquema
- `campaigns/{campaignId}`: `ownerId: string`, `players: { userId: string }[]`.
- `characters/{characterId}`: `campaignId`, `type: 'player'|'npc'`, `userId?` (para player), `createdBy` (para npc pelo mestre), `attributes: { a1..a5 }` com valores inteiros [-1..3].
- `npcs/{npcId}`: mesmo padrão de ficha com `createdBy` e `campaignId`.
- `moves/{moveId}`: `campaignId`, `modifier: -1..3`, `active: boolean`.
- `sessions/{sessionId}`: `campaignId`, `createdBy` (mestre).
- `rolls/{rollId}`: `campaignId`, `sessionId`, `who: { kind: 'player'|'npc'; sheetId }`, `isPDM?: boolean`, campos numéricos derivados.
- `invites/{inviteId}`: `campaignId`, `createdBy`, `token`, `expiresAt?`, `usesLimit?`, `usedBy: { userId, joinedAt }[]`.

## Identidade e Papéis
- Autenticado: `request.auth != null` obrigatório para qualquer leitura/escrita.
- Mestre: `request.auth.uid == campaign.ownerId`.
- Jogador: `request.auth.uid` presente em `campaign.players[].userId`.

## Funções Auxiliares (nas regras)
- `isAuthed()`, `getCampaign(campaignId)`, `isOwner(campaignId)`, `isPlayer(campaignId)`.
- `validAttr(v)`: inteiro e `-1 <= v <= 3`.
- `validAttrs(attrs)`: todos válidos e soma dos valores `== 3`.
- `validMoveModifier(m)`: `-1 <= m <= 3`.
- `belongsToUser(sheetId, uid)`: doc de `characters/{sheetId}` tem `userId == uid`.

## Regras por Coleção
- `campaigns`
  - Read: mestre ou jogador da campanha.
  - Create: permitido se `request.resource.data.ownerId == request.auth.uid`.
  - Update/Delete: somente mestre.
- `characters`
  - Player (`type == 'player'`):
    - Create/Update: `isPlayer(campaignId)` e `request.auth.uid == request.resource.data.userId` e `validAttrs(attributes)`.
    - Delete: mestre.
    - Limite 1 por campanha: adotar convenção de `characterId == campaignId + '_' + request.auth.uid`; regra valida o id para reforçar unicidade.
  - NPC (`type == 'npc'`):
    - Create/Update/Delete: somente mestre, `validAttrs(attributes)`.
  - Read: mestre e jogadores da campanha.
- `npcs`
  - Espelha regras de NPC acima (se coleção separada).
- `moves`
  - Read: mestre e jogadores.
  - Create/Update/Delete: somente mestre; `validMoveModifier(modifier)`.
- `sessions`
  - Read: mestre e jogadores.
  - Create/Update/Delete: somente mestre.
- `rolls`
  - Read: mestre e jogadores.
  - Create:
    - Se `isPDM == true`: somente mestre.
    - Caso contrário: `isPlayer(campaignId)` E
      - `who.kind == 'player'` exige `belongsToUser(who.sheetId, request.auth.uid)`.
  - Delete: somente mestre.
- `invites`
  - Read: mestre; jogadores podem ler apenas convites de campanhas onde já são jogadores (opcional).
  - Update para uso do token (aceitar convite):
    - `isAuthed()` e não duplicar uso: `request.resource.data.usedBy.size() == resource.data.usedBy.size() + 1`, novo item com `userId == request.auth.uid` e ainda não presente.
    - Em paralelo, atualização de `campaigns/{campaignId}` deve acrescentar `players` com o mesmo usuário e não duplicar (regra no doc da campanha valida o incremento e unicidade de `userId`).

## Validações de Dados
- Atributos: todos inteiros em [-1,3]; soma exatamente 3.
- Moves: `modifier` em [-1,3]; `name` não vazio (string `size() > 0`).
- Sessions: `name` não vazio; `date` número positivo.
- Rolls: números são coerentes (`total == baseSum + totalModifier` opcional); `who.kind` válido.

## Estrutura de Regras (arquivo `firestore.rules`)
- `rules_version = '2'`.
- `service cloud.firestore { match /databases/{db}/documents { ... } }`.
- Definir funções auxiliares e `match` para cada coleção conforme acima.

## Verificação
- Usar Firebase Emulator para testar cenários:
  - Jogador: criar ficha própria; impedir segunda ficha; rolar apenas para sua ficha; ler tudo.
  - Mestre: criar/editar/deletar campanha, moves, sessions, npcs; deletar rolls; criar rolls com `isPDM`.
  - Convite: uso incrementa `usedBy` sem duplicar; adiciona jogador na campanha sem duplicar.
- Casos inválidos: atributos fora de faixa ou soma diferente de 3; `modifier` fora de [-1,3]; tentativa de escrever por não-membro.

## Implantação
- Configurar o arquivo `firestore.rules` no projeto.
- Validar com `firebase emulators:start` e `firebase deploy --only firestore:rules` apontando para `pbta-app`.

## Entregáveis
- Arquivo `firestore.rules` completo com funções auxiliares e `match` por coleção, sem comentários.
- Opcional: `firestore.indexes.json` caso consultas compostas sejam necessárias no futuro (não requerido para regras).