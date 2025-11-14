# Fichas — Nova

- Rota: `/sheets/new`
- Acesso: Autenticado (Jogador)
- Propósito
  - Criar nova ficha PBTA
- Layout
  - Form com campos de `name`, `playbook`, `stats`, `moves`
- Componentes
  - `SheetForm`, `Card`, `Button`, `Tabs`, `Toast`
- Dados (Firestore)
  - Criação em `characters`
- Ações
  - Validar e salvar; feedback
- Offline
  - Bloquear envio; permitir rascunho local
- Analytics & Performance
  - `page_view_sheet_new`, `sheet_created`; trace `create_sheet`