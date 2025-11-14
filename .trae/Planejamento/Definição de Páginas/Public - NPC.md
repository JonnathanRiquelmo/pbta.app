# Público — NPC

- Rota: `/public/npc/:publicShareId`
- Acesso: Público
- Propósito
  - Exibir PDM compartilhável
- Layout
  - Cartão com atributos e moves; sem edição
- Componentes
  - `PublicNpcView`, `Card`, `Badge`
- Dados (Firestore)
  - Via `publicShareId`
- Offline
  - Cache do conteúdo
- Analytics & Performance
  - `page_view_public_npc`