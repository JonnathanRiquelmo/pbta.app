# Notas — Pessoais

- Rota: `/notes`
- Acesso: Autenticado (Jogador)
- Propósito
  - Criar e gerenciar notas pessoais
- Layout
  - Editor simples; lista de notas por tipo
- Componentes
  - `Input`, `Card`, `List`, `Button`
- Dados (Firestore)
  - `notes` por `authorUid == user.uid`
- Offline
  - Rascunho local; sincronização
- Analytics & Performance
  - `page_view_notes`, `note_created`