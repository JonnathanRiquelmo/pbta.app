# Mestre — PDMs Lista

- Rota: `/master/pdms`
- Acesso: Mestre
- Propósito
  - Gerenciar PDMs privados do mestre
- Layout
  - Lista e ações `novo`, `editar`, `compartilhar`
- Componentes
  - `PdmList`, `Button`, `Card`
- Dados (Firestore)
  - `characters` com `isNPC == true` e `isPrivateToMaster == true`
- Analytics & Performance
  - `page_view_master_pdms`