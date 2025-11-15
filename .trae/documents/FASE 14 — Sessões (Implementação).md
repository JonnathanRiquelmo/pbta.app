## Branch
- Criar a branch `feature/fase-14-sessions` conforme o guia de Gitflow.

## Modelo de Dados (Firestore)
- Coleção `sessions` com campos: `campaignId`, `date` (ISO), `summary`, `gmNotes`, `publicNotes`, `title?`, `creationDate`.
- Indexar por `campaignId` para listagem eficiente.

## Serviços
- `src/services/sessions.service.ts` com:
  - `createSession({ campaignId, date, summary, gmNotes, publicNotes, title? }) => id`.
  - `updateSession(id, partial)`.
  - `deleteSession(id)`.
- Suporte ao modo bypass (`VITE_TEST_BYPASS_AUTH === 'true'`) usando `localStorage` (`bypass:sessions`) no mesmo padrão de `moves.service.ts`.

## Hooks
- `src/hooks/useSessionsForCampaign.ts`: lista sessões filtradas por `campaignId`, com bypass e stream via `onSnapshot`.
- `src/hooks/useSessionById.ts`: obtém uma sessão específica por `id`.
- Reusar `src/hooks/useSessionsForMaster.ts` para contagem no dashboard; opcionalmente migrar para usar `sessions` (em vez de `campaign.sessions`).

## Componentes
- `src/components/sessions/SessionList.tsx` (Mestre):
  - Lista com busca por `title`/data; ações “Nova sessão”, “Editar”, “Excluir”.
  - Usa `Card`, `Button`, `Input`, `EmptyState`, `Spinner` e `useSessionsForCampaign`.
  - Navega para `/master/campaigns/:id/sessions/new` e `/master/campaigns/:id/sessions/:sessionId`.
- `src/components/sessions/SessionEditor.tsx` (Mestre):
  - Form com `date`, `summary` e abas `gmNotes` (privado) e `publicNotes` (público) usando `Tabs`.
  - Cria/atualiza via `sessions.service` e mostra `Toast`; bloqueia ações offline com `useNetworkStatus`.
- `src/components/sessions/SessionViewer.tsx` (Jogador):
  - Exibe `date`, `summary` e `publicNotes`; oculta `gmNotes`.
  - Usa `useSessionById`, `Card`, `Spinner`, `EmptyState`.

## Rotas
- Substituir `PageStub` em `src/router.tsx` por componentes reais:
  - Jogador: `/campaigns/:id/sessions` (lista pública futura; inicialmente pode redirecionar para detalhes ou listar públicas) e `/campaigns/:id/sessions/:sessionId` → `SessionViewer`.
  - Mestre: `/master/campaigns/:id/sessions` → `SessionList`, `/master/campaigns/:id/sessions/new` → `SessionEditor`, `/master/campaigns/:id/sessions/:sessionId` → `SessionEditor`.
- Manter proteção de mestre via `ModeGuard` já presente.

## Permissões
- Edição/criação/exclusão apenas nas rotas `master/*` (guardadas por `ModeGuard`).
- Visualização de conteúdo público nas rotas de jogador; `gmNotes` nunca renderizado fora do contexto de mestre.

## Offline
- Usar `useNetworkStatus` para desabilitar ações de escrita quando offline.
- Opcional: cachear `SessionViewer` para leitura quando offline (seguindo plano de PWA).

## Testes e Verificação
- Testar hooks no modo bypass: criar, listar e atualizar sessões.
- Verificar rotas no dev server: navegação Mestre (lista/novo/editar) e Jogador (visualizar).
- Garantir que `gmNotes` não aparece no viewer e que ações de mestre estão protegidas.

## Telemetria (opcional)
- Emitir eventos simples de page view (`page_view_master_sessions`, `page_view_master_session_new`, `page_view_master_session_edit`, `page_view_session`) se já houver utilitário de analytics.

## Entregáveis
- Serviços de sessões, hooks de leitura, três componentes React prontos, rotas atualizadas, modo bypass funcional e verificação básica em runtime.