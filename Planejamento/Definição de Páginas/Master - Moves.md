# Mestre — Moves

- Rota: `/master/campaigns/:id/moves`
- Acesso: Mestre
- Propósito
  - CRUD de moves PBTA
- Layout
  - Lista; editor detalhado com `trigger`, fórmula e resultados
- Componentes
  - `MovesList`, `MovesEditor`, `Button`
- Dados (Firestore)
  - `moves` por `campaignId`
- Analytics & Performance
  - `page_view_master_moves`, `move_created`, `move_updated`