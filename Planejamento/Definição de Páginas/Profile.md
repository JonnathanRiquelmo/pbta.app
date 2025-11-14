# Perfil — pbta.app

- Rota: `/profile`
- Acesso: Autenticado (Jogador)
- Propósito
  - Mostrar dados do usuário e histórico de rolagens próprias
- Layout
  - Card de perfil; lista paginada de `rolls`; filtros por campanha
- Componentes
  - `Avatar`, `Card`, `List`, `Badge`, `Tabs`
- Dados (Firestore)
  - `rolls` por `rollerUid == user.uid`
- Ações
  - Filtrar por campanha; abrir detalhes
- Offline
  - Cache de última página; bloquear novas consultas
- Analytics & Performance
  - `page_view_profile`; trace `load_rolls_user`
- Testes
  - Lista só mostra rolagens do usuário