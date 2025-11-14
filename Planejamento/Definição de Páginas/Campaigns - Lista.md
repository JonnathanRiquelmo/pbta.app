# Campanhas — Lista

- Rota: `/campaigns`
- Acesso: Autenticado (Jogador)
- Propósito
  - Listar campanhas do usuário
- Layout
  - Cards com nome, descrição, status; filtros
- Componentes
  - `Card`, `Input`, `Tabs`, `EmptyState`
- Dados (Firestore)
  - `campaigns` por inclusão em `players`
- Ações
  - Abrir campanha; sair
- Offline
  - Mostrar cache
- Analytics & Performance
  - `page_view_campaigns`