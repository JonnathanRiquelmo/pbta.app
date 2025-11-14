# Mestre — Editor de Sessão

- Rota: `/master/campaigns/:id/sessions/:sessionId`
- Acesso: Mestre
- Propósito
  - Editar sessão existente
- Layout
  - Editor com abas para notas privadas e públicas
- Componentes
  - `SessionEditor`, `Tabs`, `Button`
- Dados (Firestore)
  - `sessions/:sessionId`
- Analytics & Performance
  - `page_view_master_session_edit`, `session_updated`