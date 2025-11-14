# Mestre — Editor de Plot

- Rota: `/master/campaigns/:id/plot`
- Acesso: Mestre
- Propósito
  - Editar plot da campanha (lido por todos)
- Layout
  - Editor markdown com preview seguro
- Componentes
  - `PlotEditor`, `Button`, `Toast`
- Dados (Firestore)
  - Campo `plot` em `campaigns/:id`
- Offline
  - Rascunho local; sincronização
- Analytics & Performance
  - `page_view_master_plot`, `plot_updated`