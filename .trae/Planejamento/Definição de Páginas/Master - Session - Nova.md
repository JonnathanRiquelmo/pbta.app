# Mestre — Nova Sessão

- Rota: `/master/campaigns/:id/sessions/new`
- Acesso: Mestre
- Propósito
  - Criar sessão da campanha
- Layout
  - Form com `date`, `summary`, `gmNotes`, `publicNotes`
- Componentes
  - `SessionEditor`, `Card`, `Button`
- Dados (Firestore)
  - Criação em `sessions`
- Analytics & Performance
  - `page_view_master_session_new`, `session_created`