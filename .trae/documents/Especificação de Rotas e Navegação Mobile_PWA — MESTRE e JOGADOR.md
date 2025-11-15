# Especificação de Rotas e Navegação (Mobile/PWA)

## Contexto e Tecnologias
- Roteamento: `react-router-dom@6` com `createHashRouter` (`src/router.tsx:80`), montado via `RouterProvider` (`src/main.tsx:57`).
- Autenticação e papel: `AuthGuard` (`src/components/auth/AuthGuard.tsx:4-10`) e `ModeGuard` (`src/components/auth/ModeGuard.tsx:4-8`); papel definido por `ModeContext.isMaster()` (`src/contexts/ModeContext.tsx:21-26`).
- PWA/Offline: Service Worker registrado (`src/main.tsx:16-24`), redirecionamento automático para `#/offline` quando sem rede (`src/main.tsx:26-34`), banner de offline (`src/main.tsx:36-44`).
- Design System disponível: `Button`, `Input`, `Card`, `Spinner`, `Modal`, `Tabs`, `Toast`, `Badge`, `Avatar` (`src/components/common/index.ts:1-10`).

## Mapa de Rotas
- Públicas (`src/router.tsx:34-40`):
  - `'/'` (Home), `'/login'` (Login), `'/offline'` (Offline), `'/public/character/:publicShareId'`, `'/public/npc/:publicShareId'`.
- Autenticadas (Jogador) (`src/router.tsx:42-55`):
  - `'/dashboard'`, `'/profile'`, `'/roller'`, `'/sheets'`, `'/sheets/new'`, `'/sheets/:id'`, `'/sheets/:id/view'`, `'/campaigns'` (placeholder), `'/campaigns/:id'`, `'/campaigns/:id/moves'`, `'/campaigns/:id/sessions'` (placeholder), `'/campaigns/:id/sessions/:sessionId'`, `'/notes'`.
- Mestre (`/master/*` via `ModeGuard`) (`src/router.tsx:56-76`):
  - `'/master'` (home), `'/master/campaigns'`, `'/master/campaigns/new'`, `'/master/campaigns/:id'`, `'/master/campaigns/:id/plot'`, `'/master/campaigns/:id/characters'` (placeholder), `'/master/pdms'`, `'/master/pdms/new'`, `'/master/pdms/:id'`, `'/master/campaigns/:id/moves'`, `'/master/campaigns/:id/sessions'`, `'/master/campaigns/:id/sessions/new'`, `'/master/campaigns/:id/sessions/:sessionId'`, `'/master/rolls'`, `'/master/invites'` (placeholder), `'/master/settings'` (placeholder).
- Fallback: `'*'` → `'/'` (`src/router.tsx:83`).

## Acesso por Papel
- Pós-login: se `isMaster()` navegar para `'/master'`, senão `'/dashboard'` (`src/pages/Login.tsx:14-19`, `src/components/auth/GoogleLoginButton.tsx:11-15`, `src/components/auth/EmailLoginForm.tsx:16-23,30-37`).
- Condicionais de UI:
  - `CampaignDetail`: botões de mestre (ex.: "Editar Plot") só com `isMaster()` (`src/components/campaigns/CampaignDetail.tsx:5,65`).
  - `PdmEditor`: campo "Privado ao Mestre" apenas quando mestre (`src/components/pdms/PdmEditor.tsx:76,127`).

## Fluxo de Navegação — JOGADOR
1. Entrada: `'/'` → `'/login'` → autentica → `'/dashboard'`.
2. Dashboard: acessos para Fichas (`'/sheets'`), Campanhas (`'/campaigns'`), Rolagens (`'/roller'`), Notas (`'/notes'`).
3. Fichas: listar (`'/sheets'`) → criar (`'/sheets/new'`) → editar (`'/sheets/:id'`) → pré-visualizar (`'/sheets/:id/view'`) → compartilhar público (`'/public/character/:publicShareId'`).
4. Campanhas: listar (`'/campaigns'`) → detalhes (`'/campaigns/:id'`) → moves do personagem (`'/campaigns/:id/moves'`).
5. Sessões: ver sessão (`'/campaigns/:id/sessions/:sessionId'`) — acessada também por ação iniciada pelo mestre.
6. Rolagens/Perfil: rolar (`'/roller'`) e histórico (`'/profile'`).
7. Offline: redirecionamento automático para `'/offline'` quando sem rede.

## Fluxo de Navegação — MESTRE
1. Entrada: `'/'` → `'/login'` → autentica → `'/master'`.
2. Campanhas: listar (`'/master/campaigns'`) → criar (`'/master/campaigns/new'`) → detalhes (`'/master/campaigns/:id'`) → editar plot (`'/master/campaigns/:id/plot'`).
3. PDMs: listar (`'/master/pdms'`) → criar (`'/master/pdms/new'`) → editar (`'/master/pdms/:id'`).
4. Moves: gerenciar (`'/master/campaigns/:id/moves'`).
5. Sessões: listar (`'/master/campaigns/:id/sessions'`) → criar (`'/master/campaigns/:id/sessions/new'`) → editar (`'/master/campaigns/:id/sessions/:sessionId'`) → "Ver como jogador" (navega para `'/campaigns/:id/sessions/:sessionId'`).
6. Rolagens: monitor (`'/master/rolls'`).
7. Offline: igual ao jogador.

## Padrões de Navegação Mobile (PWA-first)
- Cabeçalho fixo por página com título e botão de voltar.
- CTAs primários visíveis e acessíveis com `Button fullWidth` no topo ou rodapé (sticky) em telas de listas e edição.
- Ações secundárias com `Button variant="secondary"` ou `ghost` para reduzir ruído.
- Navegação persistente entre áreas principais via barra inferior (bottom navigation) baseada no `Tabs`, com itens de alto nível por papel.
- Respeitar áreas seguras (safe-area insets) em iOS/Android, manter botões fora do teclado virtual em formulários.
- Gestos/back nativo: o botão "Voltar" deve espelhar `history.back()` e rotas parent lógicas.

## Botões de Acesso e de Voltar (Design System)
- Componente: `Button` (`src/components/common/button/Button.tsx:16-52`).
- Padrões de uso:
  - Primário: `variant="primary"`, `size="lg"`, `fullWidth` para ações principais (ex.: "Criar campanha", "Criar ficha", "Salvar").
  - Secundário: `variant="secondary"` para ações complementares (ex.: "Compartilhar", "Editar").
  - Voltar: `variant="ghost"`, `size="sm"`, `iconLeft` (seta) e ação `useNavigate(-1)`; quando necessário, voltar explícito para rota pai.
- Grupos de botões: combinar com `Card` (headers/footers) para manter consistência e densidade de toque.
- Navegação inferior (tabs): `Tabs` como barra fixa inferior; `onChange(id)` dispara `navigate(path)` para cada item.

## PWA e Offline
- Banner de offline já presente; manter ações desabilitadas quando necessário e fornecer feedback via `Toast`.
- Precarregamento de telas críticas (Dashboard, Fichas, Campanhas) e fallback de leitura local (quando aplicável).
- Fluxo de instalação PWA: adicionar instruções e CTA "Instalar" (posterior), respeitando eventos `beforeinstallprompt`.

## Plano de Ação
### Fase 1 — Cabeçalhos e Voltar (Mobile)
- Adotar cabeçalho padrão com título e botão "Voltar" em: Fichas (lista, form, editor, view), Campanhas (detalhe, moves), PDMs (lista, form, editor), Sessões (lista, editor, viewer), Roller, Profile, Notes.
- Implementar comportamento `navigate(-1)` e fallback para rota pai quando a origem não existir.

### Fase 2 — CTAs Primários por Tela
- Dashboard (Jogador): botões `fullWidth` para Fichas, Campanhas, Rolagens, Notas.
- `'/sheets'`: "Criar ficha" fixo inferior; itens clicáveis com ações inline.
- `'/campaigns/:id'`: Jogador — "Moves" e "Sessões"; Mestre — "Editar Plot", "Sessões", "Moves", "Ver como jogador".
- `'/master/pdms'`: "Novo PDM"; `'/master/campaigns'`: "Nova campanha".
- Editores (ficha, PDM, sessão, plot): "Salvar" como CTA primário sempre visível.

### Fase 3 — Barra de Navegação Inferior (por Papel)
- Jogador: Tabs com itens Dashboard, Fichas, Campanhas, Rolagens, Notas.
- Mestre: Tabs com itens Campanhas, PDMs, Sessões, Rolls.
- Criar wrapper de layout que posiciona `Tabs` fixa no rodapé e navega via `onChange`.

### Fase 4 — PWA & Resiliência Offline
- Garantir que telas prioritárias carreguem com cache; desabilitar CTAs quando offline e exibir `Toast` explicativo.
- Preparar UI para prompt de instalação com `Modal` e CTA baseado em evento `beforeinstallprompt`.

### Fase 5 — QA/UX e Métricas
- Testes de navegação (gestos/back), áreas de toque, responsividade.
- Instrumentar transições com analytics (`initAnalytics`) e medir uso dos CTAs.

## Entregáveis
- Cabeçalhos unificados com “Voltar”.
- CTAs mobile-first por tela (design system).
- Barra inferior por papel (Jogador/Mestre).
- Ajustes PWA e mensagens offline.

Confirma o plano para iniciarmos a implementação nas fases descritas?