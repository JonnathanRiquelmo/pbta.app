# Mestre — Monitor de Rolagens

- Rota: `/master/rolls`
- Acesso: Mestre
- Propósito
  - Ver rolagens de todos os jogadores
- Layout
  - Tabela com filtros por campanha, personagem, data
- Componentes
  - `RollsMonitor`, `Table`, `Badge`
- Dados (Firestore)
  - `rolls` por `campaignId`
- Analytics & Performance
  - `page_view_master_rolls`