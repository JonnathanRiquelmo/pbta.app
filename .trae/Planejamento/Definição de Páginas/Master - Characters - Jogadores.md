# Mestre — Fichas dos Jogadores

- Rota: `/master/campaigns/:id/characters`
- Acesso: Mestre
- Propósito
  - Ver e editar fichas de todos os jogadores
- Layout
  - Lista com filtros; editor em modal
- Componentes
  - `SheetCard`, `Modal`, `SheetEditor`
- Dados (Firestore)
  - `characters` por `campaignId`
- Analytics & Performance
  - `page_view_master_characters`