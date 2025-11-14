# Mestre — Nova Campanha

- Rota: `/master/campaigns/new`
- Acesso: Mestre
- Propósito
  - Criar campanha com `ruleSet`
- Layout
  - Form com `name`, `description`, `ruleSet`
- Componentes
  - `CampaignForm`, `Card`, `Button`
- Dados (Firestore)
  - Criação em `campaigns`
- Analytics & Performance
  - `page_view_master_campaign_new`, `campaign_created`