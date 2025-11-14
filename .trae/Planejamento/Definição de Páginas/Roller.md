# Rolador — pbta.app

- Rota: `/roller`
- Acesso: Autenticado
- Propósito
  - Rolar 2d6 PBTA, aplicar modificadores e salvar histórico
- Layout
  - Display dos dados; botão “Rolar 2d6”; resultado com interpretação
- Componentes
  - `DiceRoller`, `Card`, `Button`, `Badge`
- Dados (Firestore)
  - Salvar em `rolls` com `campaignId`, `characterId`, `rollerUid`
- Ações
  - `rollPBTA`, `saveRoll`
- Offline
  - Permitir rolagem local; fila de sincronização quando online
- Analytics & Performance
  - `page_view_roller`, `roll_created`; trace `roll_action`
- Testes
  - Interpretações corretas; persistência em sucesso