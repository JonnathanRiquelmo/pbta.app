# Mestre — Campanhas Lista

- Rota: `/master/campaigns`
- Acesso: Mestre
- Propósito
  - Listar e gerenciar campanhas
- Layout
  - Lista com ações `editar`, `abrir`, `excluir`
- Componentes
  - `Card`, `Button`, `Input`
- Dados (Firestore)
  - `campaigns` por `ownerUid == master.uid`
- Analytics & Performance
  - `page_view_master_campaigns`