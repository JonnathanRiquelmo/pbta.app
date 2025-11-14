# Mestre — Sessões

- Rota: `/master/campaigns/:id/sessions`
- Acesso: Mestre
- Propósito
  - Gerenciar sessões: data, resumos, notas privadas
- Layout
  - Lista; ações `nova`, `editar`
- Componentes
  - `SessionList`, `Button`, `Card`
- Dados (Firestore)
  - `sessions` por `campaignId`
- Analytics & Performance
  - `page_view_master_sessions`