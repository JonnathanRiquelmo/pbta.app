## Escopo
- Implementar SOMENTE campanhas e convites conforme `\.prompts/04-campanhas-convites.txt`.
- Não alterar login ou outros módulos.
- `generateInvite` e `validateInvite` no cliente, com caminho preparado para migração futura.

## Contexto do Código
- Router e layout: `src/routes/index.tsx` e `src/App.tsx`.
- Store global: `src/shared/store/appStore.ts`.
- Dashboards: Mestre `src/shared/pages/DashboardMaster.tsx`, Jogador `src/shared/pages/DashboardPlayer.tsx`.
- Rota de campanha: `src/campaigns/Route.tsx`.

## Modelos de Dados
- Campaign: `{ id, name, plot, ownerId, createdAt }`.
- Invite: `{ token, createdBy, createdAt, expiresAt?, usesLimit?, usedBy: [] }` em `campaigns/{campaignId}/invites/{inviteId}`.
- Player entry: `campaigns/{campaignId}.players += { userId, displayName, status: "accepted", joinedAt }`.

## Armazenamento (Abstração)
- Criar `InviteRepo` e `CampaignRepo` com 2 implementações:
  - Local (fallback): `localStorage` com namespace `pbta_campaigns`.
  - Firebase (quando disponível): Firestore (stub por enquanto, detectado via `VITE_FIREBASE_API_KEY`).
- Seleção em tempo de execução: se Firebase não configurado, usar Local.

## Funcionalidades
- `generateInvite(campaignId, options)`: gera `UUID v4` como `token`, salva invite, retorna link `/?invite={token}` e oferece copiar.
- `validateInvite(token)`: retorna campanha relacionada e estado; valida inválido/expirado/limite de uso; calcula usos restantes.
- `acceptInvite(token, user)`: adiciona player na campanha e atualiza `usedBy` com `{ userId, joinedAt }`; evita duplicatas.

## UI e Fluxos
- Mestre:
  - Criar campanha (form simples) com `name`, `plot`; `ownerId` e `createdAt` automáticos.
  - Listar campanhas do mestre e botão "Gerar convite" por campanha (copia link).
  - Tela/route de campanha mostra lista de players aceitos.
- Jogador:
  - Campo de "Token de convite" na `DashboardPlayer` aceita token e chama `validateInvite`/`acceptInvite`.
  - Interceptar query `/?invite={token}`: ao montar app, se presente, abrir página de aceite com feedback.

## Integrações no Código
- Router: interceptar `invite` na query em `src/main.tsx` ou `src/App.tsx`; adicionar `InviteAcceptPage`.
- Store: ampliar `appStore` com ações: `createCampaign`, `listCampaigns`, `generateInvite`, `validateInvite`, `acceptInvite`, `listPlayers`.
- Atualizar `DashboardMaster.tsx` e `DashboardPlayer.tsx` para usar novas ações.
- `Route.tsx` da campanha: carregar campanha por `:id` e renderizar players.

## Migração para Cloud Functions
- Mover `generateInvite` e `acceptInvite` para Functions com transações Firestore.
- Enforçar `usesLimit`/`expiresAt` server-side e regras de segurança.
- Armazenar hash do `token` em vez do token puro no servidor (melhorar segurança), mantendo o token original apenas no link.

## Validações e Mensagens
- Erros: token inválido, expirado, limite atingido.
- Sucesso: aceite realizado com data/hora; fornecer navegação para campanha.

## Testes
- Unitários para `validateInvite`: inválido/expirado/limite/duplicata.
- Unitários para `acceptInvite`: atualiza `usedBy` e lista de players.
- Testes de integração leves em UI (render e ações básicas).

## Arquivos Previstos
- Novos: `src/campaigns/types.ts`, `src/campaigns/inviteRepo.ts`, `src/campaigns/localInviteRepo.ts`, `src/campaigns/firebaseInviteRepo.ts` (stub), `src/campaigns/CampaignForm.tsx`, `src/campaigns/InviteAcceptPage.tsx`.
- Atualizações: `src/shared/store/appStore.ts`, `src/shared/pages/DashboardMaster.tsx`, `src/shared/pages/DashboardPlayer.tsx`, `src/campaigns/Route.tsx`, `src/routes/index.tsx`.

## Observações de Segurança
- LocalStorage não é seguro; tokens podem ser acessados pelo cliente.
- Sem validação server-side, o controle de uso é "best effort". Devemos migrar para Functions o quanto antes.

## Resultado Esperado
- Mestre cria campanha, gera e copia link de convite.
- Jogador aceita token por input ou query, é adicionado aos players e invite é marcado em `usedBy`.
- Mestre visualiza lista de players aceitos por campanha.
