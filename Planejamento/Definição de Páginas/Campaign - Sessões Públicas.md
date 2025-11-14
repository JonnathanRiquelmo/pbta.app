# Campanha — Sessões Públicas

- Rota: `/campaigns/:id/sessions`
- Acesso: Autenticado (Jogador)
- Propósito
  - Listar sessões públicas
- Layout
  - Lista com data, título; busca
- Componentes
  - `SessionList`, `Input`, `Card`
- Dados (Firestore)
  - `sessions` por `campaignId` e `publicNotes`
- Analytics & Performance
  - `page_view_campaign_sessions`