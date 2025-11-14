## Objetivo
- Implementar `PlayerDashboard` com resumo de campanhas, fichas e rolagens, visível em `'/dashboard'` para usuário autenticado.

## Contexto Atual
- Roteamento: `src/router.tsx:21` rende `Dashboard` em `'/dashboard'` sob `AuthGuard`.
- Página: `src/pages/Dashboard.tsx:1-7` é um stub simples.
- UI: `Card` e derivados disponíveis em `src/components/common/card/Card.tsx`.
- Auth: `useAuth` via `src/contexts/AuthContext.tsx` com `user.uid` e `user.email`.
- Firestore: inicializado em `firebase/config.ts`, persistência offline habilitada em `firebase/firestore.ts`.
- Hooks de dados (campanhas/personagens/rolagens) ainda não existem.

## Entidades e Filtros
- Campaigns: contar campanhas onde `players` contém `user.uid` (visão jogador).
- Characters: contar personagens com `ownerUid == user.uid` e `isNPC == false`.
- Rolls: contar rolagens com `rollerUid == user.uid`.

## Implementação
- Criar hooks reativos com Firestore:
  - `src/hooks/useCampaigns.ts`: `useCampaignsForUser(uid)` retorna `{ items, count, loading, error }` usando `query(collection(db,'campaigns'), where('players','array-contains', uid))` e `onSnapshot`.
  - `src/hooks/useCharacters.ts`: `useCharactersForUser(uid)` com `where('ownerUid','==',uid)` e `where('isNPC','==',false)`.
  - `src/hooks/useRolls.ts`: `useRollsForUser(uid)` com `where('rollerUid','==',uid)`.
  - Exportar no `src/hooks/index.ts`.
- Criar `PlayerDashboard`:
  - Local: `src/components/dashboard/PlayerDashboard.tsx`.
  - Usa `useAuth()` para obter `user` e chama hooks acima.
  - Renderiza 3 cards:
    - Campanhas: título, contagem, ações “Ver campanhas” (`'/campaigns'`).
    - Fichas: contagem, ação “Ver fichas” (`'/sheets'`) e “Criar ficha” (`'/sheets/new'`).
    - Rolagens: contagem, ações “Rolar dados” (`'/roller'`) e “Ver histórico” (`'/profile'`).
  - Tratamento: estados `loading`, `erro`, e `EmptyState` para zero itens.
  - Layout: grid simples com espaçamentos de `tokens.css` e `Card` existente.
- Integrar na página:
  - Atualizar `src/pages/Dashboard.tsx` para renderizar `<PlayerDashboard />`.

## Navegação
- Usar `useNavigate` do `react-router-dom` v6 para atalhos.
- Garantir que as rotas de destino já existem (todas mapeadas para `PageStub` ou páginas reais, conforme `src/router.tsx`).

## Critérios de Aceite
- Cards exibem contagens baseadas no usuário autenticado (`useAuth`).
- Atalhos navegam para `'/campaigns'`, `'/sheets'`, `'/sheets/new'`, `'/roller'`, `'/profile'` sem erros.

## Verificação
- Logar com Google; confirmar que `'/dashboard'` mostra contagens sem erro.
- Simular ausência de dados e verificar `EmptyState`.
- Confirmar atualização em tempo real (inserir documentos e observar contagens mudarem via `onSnapshot`).

## Arquivos a Adicionar/Alterar
- Adicionar: `src/hooks/useCampaigns.ts`, `src/hooks/useCharacters.ts`, `src/hooks/useRolls.ts`.
- Atualizar: `src/hooks/index.ts` para exportar novos hooks.
- Adicionar: `src/components/dashboard/PlayerDashboard.tsx` (e opcionalmente `player-dashboard.css`).
- Atualizar: `src/pages/Dashboard.tsx` para importar e renderizar `PlayerDashboard`.

## Observações
- Sem expor segredos; usar `db` de `firebase/config.ts`.
- Seguir padrões de estilo existentes (CSS modular simples, `Card`).
- Compatível com persistência offline via Firestore.