# Ficha — Editor

- Rota: `/sheets/:id`
- Acesso: Autenticado (proprietário)
- Propósito
  - Editar ficha existente
- Layout
  - Tabs para `Atributos`, `Moves`, `Inventário`, `Bio`, `Campos custom`
- Componentes
  - `SheetEditor`, `Input`, `Tabs`, `Button`, `Toast`
- Dados (Firestore)
  - `characters/:id` (ownership check)
- Ações
  - Salvar alterações; compartilhar público
- Offline
  - Modo rascunho; sincronização posterior
- Analytics & Performance
  - `page_view_sheet_edit`, `sheet_updated`; trace `update_sheet`