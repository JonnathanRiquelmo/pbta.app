## Requisitos
- Campos: `name`, `date`, `masterNotes`, `summary`, `createdAt`.
- Funcionalidades: mestre cria/edita; jogadores leem.
- Páginas: listagem em `'/campaigns/:id/sessions'` e detalhe em `'/sessions/:id'` com notas e resumo.
- Não implementar rolagens.

## Modelos e Tipos
- Criar `src/sessions/types.ts` com:
  - `Session`: `id`, `campaignId`, `name`, `date`, `masterNotes`, `summary`, `createdAt`, `createdBy`.
  - `CreateSessionInput` e `UpdateSessionPatch` (parcial, sem `id/campaignId/createdAt`).

## Persistência Local
- Criar `src/sessions/sessionRepo.ts` (interface):
  - `listByCampaign(campaignId)`, `getById(id)`, `create(campaignId, input)`, `update(campaignId, id, patch)`, `remove(campaignId, id)`.
- Criar `src/sessions/localSessionRepo.ts` com `localStorage` (chave `pbta_sessions`):
  - Ordenar listagem por `date` desc (fallback `createdAt`).
  - Validar `name` e `date` obrigatórios; preencher `createdAt` e `createdBy`.

## Store (Zustand)
- Injetar repo em `src/shared/store/appStore.ts` e adicionar ações:
  - `listSessions(campaignId): Session[]`.
  - `getSession(id): Session | undefined`.
  - `createSession(campaignId, input)`.
  - `updateSession(campaignId, id, patch)`.
  - `deleteSession(campaignId, id)`.
- Restringir criação/edição/remoção ao `role === 'master'`; leitura liberada.
- Reutilizar padrão de retorno `{ ok: boolean; message?: string }`.

## Rotas
- Garantir alias `@sessions` (já configurado) e integrar no router:
  - `'/campaigns/:id/sessions'` → `@sessions/CampaignSessionsRoute` protegido por `RequireRole('master')` para editar; visualização liberada.
  - `'/sessions/:id'` → `@sessions/Route` (detalhe) com edição condicional ao `role`.

## UI: Listagem de Sessões
- Criar `src/sessions/CampaignSessionsRoute.tsx` seguindo padrão de `moves`:
  - Carregar `campaignId` via `useParams` e `currentCampaign` via store.
  - Listar `listSessions(campaignId)` com ordenação.
  - Formulário inline para criar/editar (`name`, `date`, `masterNotes`, `summary`).
  - Ações: `onCreate`, `onSave`, `onDelete` com feedback de sucesso/erro; atualizar lista após cada ação.
  - Controles de edição visíveis apenas ao mestre; jogadores veem somente leitura.

## UI: Página da Sessão
- Atualizar `src/sessions/Route.tsx` para carregar `id` e exibir:
  - Cabeçalho com `name` e `date`.
  - Seções: `Resumo` (exibe `summary`) e `Notas do Mestre` (exibe `masterNotes`).
  - Botões/inputs de edição apenas para mestre; persistir via store.

## Validações e Ordenação
- `name` e `date` obrigatórios; `summary` e `masterNotes` opcionais.
- Ordenar por `date` desc; quando ausente, usar `createdAt`.
- Tratar erros do repo/store com mensagens curtas na UI.

## Segurança e Acesso
- Guardar criação/edição/remoção com `RequireRole` e checagens na store.
- Leitura sem restrição nas rotas de listagem e detalhe.

## Arquivos
- Novo: `src/sessions/types.ts`, `src/sessions/sessionRepo.ts`, `src/sessions/localSessionRepo.ts`, `src/sessions/CampaignSessionsRoute.tsx`.
- Alterar: `src/sessions/Route.tsx` (detalhe), `src/shared/store/appStore.ts` (ações), `src/routes/index.tsx` (integração de rotas).

## Verificação
- Manual: criar sessão como mestre, editar campos, listar por campanha, abrir detalhe e confirmar leitura por usuário com `role` jogador.
- Persistência: recarregar página e confirmar `localStorage` preserva sessões.
- UX: mensagens de erro/sucesso e botões desabilitados para jogadores.