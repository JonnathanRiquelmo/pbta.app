# Ficha — Visualização Pública

- Rota: `/sheets/:id/view`
- Acesso: Autenticado (leitura) / Público via `publicShareId`
- Propósito
  - Exibir ficha em modo somente leitura, design limpo
- Layout
  - Cabeçalho com nome/playbook; blocos de atributos e moves
- Componentes
  - `Card`, `Badge`, `List`
- Dados (Firestore)
  - `characters/:id` ou via `publicShareId`
- Offline
  - Cache do conteúdo
- Analytics & Performance
  - `page_view_sheet_view`