# Mestre — Convites

- Rota: `/master/invites`
- Acesso: Mestre
- Propósito
  - Convidar/remover jogadores
- Layout
  - Form de envio; lista de convidados
- Componentes
  - `InvitesManager`, `Input`, `Button`
- Dados (Firestore)
  - Atualizações em `campaigns.players`
- Analytics & Performance
  - `page_view_master_invites`, `invite_sent`