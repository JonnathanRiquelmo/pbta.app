# Público — Ficha

- Rota: `/public/character/:publicShareId`
- Acesso: Público
- Propósito
  - Exibir ficha em modo leitura sem login
- Layout
  - Design limpo; sem elementos de edição
- Componentes
  - `PublicCharacterView`, `Card`, `Badge`
- Dados (Firestore)
  - Via `publicShareId`
- Offline
  - Cache do conteúdo
- Analytics & Performance
  - `page_view_public_character`