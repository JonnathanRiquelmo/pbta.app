## Objetivo
- Configurar roteamento com `react-router-dom@6` e aplicar `AuthGuard`/`ModeGuard` conforme Rotas.md.
- Garantir navegação local sem 404 e proteger rotas `master/*`.

## Contexto Atual
- `vite.config.ts:6` já define `base: '/pbta.app/'` para GitHub Pages.
- Não há rotas no app atual (`src/App.tsx:1-8`, `src/main.tsx:1-12`).
- Firebase está configurado (`firebase/config.ts:6-24`).

## Pacote
- Adicionar `react-router-dom@^6` em `dependencies` do `package.json`.

## Arquivos e Alterações
- `src/main.tsx`: trocar renderização de `<App />` por `<RouterProvider router={router} />` importando `router`.
- `src/router.tsx`: criar roteador com `createHashRouter` (compatível com Pages) e todas as rotas do documento.
- `src/components/auth/AuthGuard.tsx`: criar guard simples que exige usuário autenticado (`auth.currentUser`) e redireciona para `/login`.
- `src/components/auth/ModeGuard.tsx`: criar guard que exige modo MASTER; valida por e-mail `jonnathan.riquelmo@gmail.com` e, se disponível, pela coleção `masters` (fallback para e-mail).
- `src/pages/` (mínimos para aceitar navegação): `Home.tsx`, `Login.tsx`, `Offline.tsx`, `Dashboard.tsx`, `Profile.tsx`, `Roller.tsx`.
- Demais rotas: usar um `PageStub` único para rotas de Player/Master/Public, exibindo título e parâmetros (minimiza número de arquivos mantendo navegação).

## Definição de Rotas (HashRouter)
- Públicas: `/`, `/login`, `/offline`, `/public/character/:publicShareId`, `/public/npc/:publicShareId`.
- Autenticadas (via `AuthGuard`): `/dashboard`, `/profile`, `/roller`, `/sheets`, `/sheets/new`, `/sheets/:id`, `/sheets/:id/view`, `/campaigns`, `/campaigns/:id`, `/campaigns/:id/moves`, `/campaigns/:id/sessions`, `/campaigns/:id/sessions/:sessionId`, `/notes`.
- Mestre (via `AuthGuard` + `ModeGuard`): `/master`, `/master/campaigns`, `/master/campaigns/new`, `/master/campaigns/:id`, `/master/campaigns/:id/plot`, `/master/campaigns/:id/characters`, `/master/pdms`, `/master/pdms/new`, `/master/pdms/:id`, `/master/campaigns/:id/moves`, `/master/campaigns/:id/sessions`, `/master/campaigns/:id/sessions/new`, `/master/campaigns/:id/sessions/:sessionId`, `/master/rolls`, `/master/invites`, `/master/settings`.
- Fallback: `*` redireciona para `/` para evitar 404 em dev.

## Guards
- `AuthGuard`: se não autenticado, `<Navigate to="/login" replace />`; se carregando, exibe loading.
- `ModeGuard`: permite acesso apenas se `user.email` é MASTER (e/ou está em `masters`); caso contrário, `<Navigate to="/dashboard" replace />`.

## Hash vs Base
- Manter `HashRouter` para evitar 404 no GitHub Pages, respeitando `base` já configurada.
- Em ambientes sem Pages, podemos alternar para `BrowserRouter` sem alterar rotas.

## Verificação
- Rodar em dev e acessar manualmente todas as rotas para confirmar renderização sem 404.
- Validar `AuthGuard`: tentar acessar `/dashboard` sem login deve redirecionar para `/login`.
- Validar `ModeGuard`: acessar qualquer `master/*` sem ser MASTER deve redirecionar para `/dashboard`.

## Entregáveis
- Pacote `react-router-dom` instalado.
- Arquivos do roteador e guards criados.
- Navegação funcional com placeholders e proteção nas rotas de Mestre.

## Observações
- Componentes específicos (dashboards, editors) serão implementados em fases futuras; nesta fase usamos stubs para validar a malha de rotas.
- Sem alterações em `vite.config.ts` por enquanto; `base` atual é compatível com Pages.
