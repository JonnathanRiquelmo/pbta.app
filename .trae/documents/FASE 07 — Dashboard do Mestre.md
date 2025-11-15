## Visão Geral
- Implementar `MasterDashboard` com visão administrativa (cards, atalhos e contagens) restrita ao modo MASTER.
- Integrar ao roteamento existente (bloco `/master`) e reutilizar componentes comuns de UI.

## Arquitetura e Páginas
- Rotas atuais do MASTER confirmadas em `src/router.tsx:35-55` (filho vazio aponta para "Master Home").
- Guardas de acesso: `ModeGuard` em `src/components/auth/ModeGuard.tsx:4-8`; derivação do modo em `src/contexts/ModeContext.tsx:18-30`.
- Dashboard do Jogador existente em `src/components/dashboard/PlayerDashboard.tsx:8-77` serve como referência de padrão visual/comportamento.

## Componentes
- Criar `src/components/dashboard/MasterDashboard.tsx` usando `Card`, `Badge`, `EmptyState`, `Button` de `src/components/common/index.ts:1-10`.
- Layout em grid responsivo (mesmo padrão de `PlayerDashboard`).
- Cards e ações:
  - Campanhas: contagem de campanhas do mestre; ações `"Ver campanhas" -> /master/campaigns`, `"Criar campanha" -> /master/campaigns/new`.
  - PDMs: contagem de NPCs do mestre; ações `"Ver PDMs" -> /master/pdms`, `"Criar PDM" -> /master/pdms/new`.
  - Sessões: contagem agregada por campanhas; ações `"Gerenciar sessões" -> /master/campaigns`.
  - Moves: contagem por campanha (se disponível) ou placeholder 0; ações `"Ver/Criar moves" -> /master/campaigns`.
  - Rolagens: contagem de todas as rolagens; ações `"Ver painel" -> /master/rolls`.

## Hooks de Dados
- Reutilizar padrão de hooks com Firestore (vide `useCampaigns.ts`, `useCharacters.ts`, `useRolls.ts`).
- Implementar:
  - `useOwnedCampaigns.ts`: `query(collection(db, 'campaigns'), where('ownerUid','==', uid))`; retorna `{items,count,loading,error}`.
  - `usePdms.ts`: `query(collection(db, 'characters'), where('ownerUid','==', uid), where('isNPC','==', true))`; retorna `{items,count,loading,error}`.
  - `useSessionsForMaster.ts`: escutar campanhas de `useOwnedCampaigns` e somar `sessions?.length ?? 0` de cada doc; retorna `{count,loading,error}`. Sem `collectionGroup` por ora.
  - `useMovesForMaster.ts` (placeholder): retorna `{count: 0, loading: false, error: null}` até a coleção existir.
  - `useRollsAll.ts`: `onSnapshot(collection(db,'rolls'))` sem filtros; retorna `{items,count,loading,error}`.
- Justificativa: casas já existentes no código `campaigns`, `characters`, `rolls` (ver `src/hooks/*`) e requisitos de entidades (`.trae/Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:149-168`).

## Integração nas Rotas
- Substituir o placeholder da home do mestre por `MasterDashboard`:
  - Adicionar import: `import MasterDashboard from './components/dashboard/MasterDashboard'` em `src/router.tsx:1-11`.
  - Trocar o elemento filho vazio: de `element: <PageStub title="Master Home" />` em `src/router.tsx:38-39` para `element: <MasterDashboard />`.
- Demais rotas de destino já existem como `PageStub` (ok para navegação agora).

## UI/UX e Estados
- Badge mostra `count` ou `...` enquanto `loading`.
- Exibir `EmptyState` quando `count===0` e sem erro.
- Exibir mensagem de erro simples se `error`.
- Botões usam `useNavigate()` para ir às rotas definidas.

## Critérios de Aceite
- Acesso ao dashboard `/master` restrito ao mestre (`ModeGuard`), confirmável em `src/components/auth/ModeGuard.tsx:4-8`.
- Contagens funcionam:
  - Campanhas do mestre: via `ownerUid`.
  - PDMs do mestre: via `isNPC` e `ownerUid`.
  - Sessões: soma de arrays em campanhas.
  - Moves: placeholder até coleção ser criada.
  - Rolagens: total de `rolls`.
- Navegação dos botões leva às rotas correspondentes definidas em `src/router.tsx:39-53`.

## Testes/Verificação
- Login com mestre: redireciona para `/master` (ver `src/pages/Login.tsx:13-17`).
- Renderização de cards e contagens com dados mocked no emulador do Firestore (`firebase/config.ts:20-23`).
- Navegação de cada ação confere a rota sem erro (PageStub visível).

## Próximos Passos (futuros)
- Evoluir `useMovesForMaster` para consultar `collectionGroup('moves')` quando existir.
- Migrar `ModeContext` para ler coleção `masters` além do e-mail fixo (ver requisitos em `.trae/Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:118-125`).