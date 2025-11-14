# Fichas — Lista

- Rota: `/sheets`
- Acesso: Autenticado (Jogador)
- Propósito
  - Listar fichas do usuário com filtros
- Layout
  - Toolbar de busca/filtro; grid/lista de `SheetCard`; botão “Nova ficha”
- Componentes
  - `Input`, `Card`, `SheetCard`, `Button`, `EmptyState`
- Dados (Firestore)
  - `characters` por `ownerUid == user.uid` e `isNPC == false`
- Ações
  - Abrir editor; criar nova ficha; duplicar
- Offline
  - Exibir cache; bloquear criação
- Analytics & Performance
  - `page_view_sheets`; trace `load_sheets_user`