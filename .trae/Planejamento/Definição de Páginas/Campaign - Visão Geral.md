# Campanha — Visão Geral

- Rota: `/campaigns/:id`
- Acesso: Autenticado (Jogador)
- Propósito
  - Exibir resumo, plot (leitura), sessões públicas
- Layout
  - Tabs `Resumo`, `Plot`, `Sessões`
- Componentes
  - `PlotViewer`, `SessionList`, `Card`, `Tabs`
- Dados (Firestore)
  - `campaigns/:id`, `sessions` públicos
- Offline
  - Cache de último estado
- Analytics & Performance
  - `page_view_campaign`