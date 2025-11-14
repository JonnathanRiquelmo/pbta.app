# Sessão — Visualizar

- Rota: `/campaigns/:id/sessions/:sessionId`
- Acesso: Autenticado (Jogador)
- Propósito
  - Visualizar resumo e notas públicas
- Layout
  - Header da sessão; bloco `Resumo`; bloco `Notas públicas`
- Componentes
  - `SessionViewer`, `Card`, `List`
- Dados (Firestore)
  - `sessions/:sessionId`
- Offline
  - Cache de conteúdo
- Analytics & Performance
  - `page_view_session`