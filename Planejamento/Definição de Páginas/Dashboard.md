# Dashboard — pbta.app

- Rota: `/dashboard`
- Acesso: Autenticado
- Propósito
  - Visão geral adaptada ao modo do usuário
- Layout
  - Header com modo; grid de cards (Campanhas, Fichas, Sessões, Moves, Rolagens)
- Componentes
  - `Card`, `Tabs`, `Badge`, `List`, `EmptyState`
- Dados (Firestore)
  - `campaigns` do usuário; `characters` do usuário; últimos `rolls`
- Ações
  - Navegar para páginas de detalhe
- Offline
  - Cards com skeleton e banner offline; bloqueio de criação
- Analytics & Performance
  - `page_view_dashboard`; trace `load_dashboard`
- Testes
  - Renderização por modo; contagens corretas