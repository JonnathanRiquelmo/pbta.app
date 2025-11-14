# Campanha — Moves do Jogador

- Rota: `/campaigns/:id/moves`
- Acesso: Autenticado (Jogador)
- Propósito
  - Mostrar moves atribuídos ao jogador
- Layout
  - Lista com `MoveCard` e filtros por gatilho
- Componentes
  - `MoveCard`, `List`, `Tabs`
- Dados (Firestore)
  - `moves` por `campaignId`; seleção por jogador
- Analytics & Performance
  - `page_view_campaign_moves`