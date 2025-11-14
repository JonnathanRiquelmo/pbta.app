# Mestre — Editor de PDM

- Rota: `/master/pdms/:id`
- Acesso: Mestre
- Propósito
  - Editar PDM; gerar link público
- Layout
  - Editor com ações `salvar`, `compartilhar`, `privacidade`
- Componentes
  - `PdmEditor`, `Button`, `Toast`
- Dados (Firestore)
  - `characters/:id`
- Analytics & Performance
  - `page_view_master_pdm_edit`, `pdm_updated`