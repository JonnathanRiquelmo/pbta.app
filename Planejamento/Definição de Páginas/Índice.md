# Índice de Páginas — pbta.app

## Design System

- Guia geral: [Design System](./Design%20System.md)
- Aplica-se a todas as páginas (PLAYER, MASTER e públicas)

## Páginas Comuns

- Home — `/` — Público — [Home](./Home.md)
- Login — `/login` — Público — [Login](./Login.md)
- Dashboard — `/dashboard` — Autenticado — [Dashboard](./Dashboard.md)
- Perfil — `/profile` — Autenticado — [Profile](./Profile.md)
- Rolador — `/roller` — Autenticado — [Roller](./Roller.md)
- Offline — `/offline` — Público — [Offline](./Offline.md)

## Páginas do Jogador (PLAYER)

- Fichas (Lista) — `/sheets` — [Sheets - Lista](./Sheets%20-%20Lista.md)
- Nova Ficha — `/sheets/new` — [Sheets - Nova](./Sheets%20-%20Nova.md)
- Editor de Ficha — `/sheets/:id` — [Sheet - Editor](./Sheet%20-%20Editor.md)
- Ficha (Visualização Pública) — `/sheets/:id/view` — [Sheet - Visualização Pública](./Sheet%20-%20Visualiza%C3%A7%C3%A3o%20P%C3%BAblica.md)
- Campanhas (Lista) — `/campaigns` — [Campaigns - Lista](./Campaigns%20-%20Lista.md)
- Campanha (Visão Geral) — `/campaigns/:id` — [Campaign - Visão Geral](./Campaign%20-%20Vis%C3%A3o%20Geral.md)
- Campanha (Moves do Jogador) — `/campaigns/:id/moves` — [Campaign - Moves do Jogador](./Campaign%20-%20Moves%20do%20Jogador.md)
- Campanha (Sessões Públicas) — `/campaigns/:id/sessions` — [Campaign - Sessões Públicas](./Campaign%20-%20Sess%C3%B5es%20P%C3%BAblicas.md)
- Sessão (Visualizar) — `/campaigns/:id/sessions/:sessionId` — [Session - Visualizar](./Session%20-%20Visualizar.md)
- Notas Pessoais — `/notes` — [Notes - Pessoais](./Notes%20-%20Pessoais.md)

## Páginas do Mestre (MASTER)

- Dashboard — `/master` — [Master - Dashboard](./Master%20-%20Dashboard.md)
- Campanhas (Lista) — `/master/campaigns` — [Master - Campaigns - Lista](./Master%20-%20Campaigns%20-%20Lista.md)
- Nova Campanha — `/master/campaigns/new` — [Master - Campaign - Nova](./Master%20-%20Campaign%20-%20Nova.md)
- Gerenciar Campanha — `/master/campaigns/:id` — [Master - Campaign - Gerenciar](./Master%20-%20Campaign%20-%20Gerenciar.md)
- Editor de Plot — `/master/campaigns/:id/plot` — [Master - Plot - Editor](./Master%20-%20Plot%20-%20Editor.md)
- Fichas dos Jogadores — `/master/campaigns/:id/characters` — [Master - Characters - Jogadores](./Master%20-%20Characters%20-%20Jogadores.md)
- PDMs (Lista) — `/master/pdms` — [Master - PDMs - Lista](./Master%20-%20PDMs%20-%20Lista.md)
- Novo PDM — `/master/pdms/new` — [Master - PDM - Nova](./Master%20-%20PDM%20-%20Nova.md)
- Editor de PDM — `/master/pdms/:id` — [Master - PDM - Editor](./Master%20-%20PDM%20-%20Editor.md)
- Moves — `/master/campaigns/:id/moves` — [Master - Moves](./Master%20-%20Moves.md)
- Sessões — `/master/campaigns/:id/sessions` — [Master - Sessions](./Master%20-%20Sessions.md)
- Nova Sessão — `/master/campaigns/:id/sessions/new` — [Master - Session - Nova](./Master%20-%20Session%20-%20Nova.md)
- Editor de Sessão — `/master/campaigns/:id/sessions/:sessionId` — [Master - Session - Editor](./Master%20-%20Session%20-%20Editor.md)
- Monitor de Rolagens — `/master/rolls` — [Master - Rolls - Monitor](./Master%20-%20Rolls%20-%20Monitor.md)
- Convites — `/master/invites` — [Master - Convites](./Master%20-%20Convites.md)
- Settings — `/master/settings` — [Master - Settings](./Master%20-%20Settings.md)

## Páginas Públicas

- Ficha Pública — `/public/character/:publicShareId` — [Public - Ficha](./Public%20-%20Ficha.md)
- NPC Público — `/public/npc/:publicShareId` — [Public - NPC](./Public%20-%20NPC.md)

## Observações

- Segue as rotas definidas em `Planejamento/Rotas.md`.
- Aplicar o Design System em todos os componentes.
- Considerar estados offline e eventos de Analytics conforme `Implementação PWA e Offline.md` e `Monitoramento e Analytics.md`.