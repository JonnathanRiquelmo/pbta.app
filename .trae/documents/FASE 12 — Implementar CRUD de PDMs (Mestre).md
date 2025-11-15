## Branch
- Criar a branch de trabalho: `feature/fase-12-pdms` (padrão em .trae/Planejamento/Gitflow/Guia de Gitflow.md:95-122).

## Modelo de Dados
- Reutilizar a coleção `characters` do Firestore com o sinalizador `isNPC: true` para PDMs.
- Campos: `name`, `ownerUid`, `isNPC`, `isPrivateToMaster`, `campaignId?`, `publicShareId?`.
- Hooks já existentes: `src/hooks/usePdms.ts` (consulta com `isNPC === true`).

## Serviços
- Estender `src/services/characters.service.ts` para suportar PDMs:
  - `createPdm(input, ownerUid)`: cria documento em `characters` com `isNPC: true`, `isPrivateToMaster` e opcionais.
  - `updatePdm(id, partial, currentUid)`: atualiza campos de PDM com validação de propriedade.
  - `deletePdm(id, currentUid)`: remove PDM com validação.
  - Reutilizar `generatePublicShareId` para gerar `publicShareId` (já existe em src/services/characters.service.ts:134-152).
- Implementar suporte ao modo bypass (localStorage `bypass:characters`), espelhando padrões de personagem (src/services/characters.service.ts:27-46, 61-76, 79-95).

## Componentes UI
- Criar pasta `src/components/pdms/` com:
  - `PdmList.tsx`: lista PDMs do Mestre usando `usePdms()`, busca por nome, navegação para novo/editar, ação de excluir.
  - `PdmForm.tsx`: formulário de criação (Nome, checkbox "Privado ao Mestre") com `createPdm()` e navegação para editor.
  - `PdmEditor.tsx`: editor de PDM (Nome, toggle Privado, botão "Gerar link público" usando `generatePublicShareId`), validação de proprietário e bloqueio de edição para não-owner (seguindo o padrão de `SheetEditor`, src/components/sheets/SheetEditor.tsx).
  - `PdmPublicView.tsx`: página pública para `/public/npc/:publicShareId`, semelhante a `PublicCharacterView` mas filtrando `isNPC === true`.
- Usar o design system existente (`Card`, `Button`, `Input`, `EmptyState`, `Spinner`, `Badge`, `ToastProvider` em `src/components/common/index.ts`).

## Rotas
- Substituir stubs por componentes reais em `src/router.tsx`:
  - Em baseRoutes, trocar `PageStub` por `PdmPublicView` em `/public/npc/:publicShareId` (src/router.tsx:27-29).
  - Em `/master/pdms`, `/master/pdms/new`, `/master/pdms/:id` trocar `PageStub` por `PdmList`, `PdmForm`, `PdmEditor` (src/router.tsx:55-57).
- Manter proteção de modo com `ModeGuard` (src/components/auth/ModeGuard.tsx:4-7) e autenticação com `AuthGuard`.

## Segurança e Acesso
- Só o `ownerUid` pode editar/gerar link (mesma validação de `SheetEditor`, src/components/sheets/SheetEditor.tsx:66-79, 82-97).
- `isPrivateToMaster`: controla visibilidade em listagens do Mestre; para público, exibir apenas via `publicShareId` válido.

## Validação
- Dev com bypass (`VITE_TEST_BYPASS_AUTH=true`):
  - Definir `localStorage.testUserRole = 'master'` para ver rotas do Mestre (src/contexts/AuthContext.tsx:31-35; src/contexts/ModeContext.tsx:21-27).
  - Fluxo: criar PDM → aparecer em `/master/pdms` → editar/toggle privado → gerar link → acessar `/public/npc/:token`.
- Sem bypass: verificar snapshot/consulta Firestore e guarda de proprietário.

## Entregáveis
- Novos componentes: `PdmList.tsx`, `PdmForm.tsx`, `PdmEditor.tsx`, `PdmPublicView.tsx`.
- Novas funções de serviço: `createPdm`, `updatePdm`, `deletePdm` em `characters.service.ts`.
- Atualização de rotas em `src/router.tsx`.

## Passos de Execução
1) Criar branch `feature/fase-12-pdms`.
2) Implementar funções de serviço em `characters.service.ts`.
3) Adicionar componentes em `src/components/pdms/`.
4) Atualizar importações e rotas em `src/router.tsx`.
5) Testar no modo bypass e em ambiente autenticado.

Deseja que eu prossiga com a criação da branch e implementação agora?