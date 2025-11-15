## Objetivo

* Implementar listagem e criação de campanhas para o Mestre, persistindo no Firestore e exibindo na lista.

## Contexto Atual

* Rotas de campanhas do Mestre estão como placeholders em `src/router.tsx:39-41`.

* Hook existente `useCampaigns.ts` filtra por participação (`players`). Para Mestre, precisamos filtrar por `ownerUid`.

* Firestore e Auth já configurados (`firebase/config.ts`, `src/contexts/AuthContext.tsx:47`, `src/components/auth/ModeGuard.tsx:4-7`).

## Novos Arquivos

* `src/components/campaigns/CampaignList.tsx`

  * Lista campanhas do Mestre (`ownerUid == user.uid`).

  * Ações: abrir (`/master/campaigns/:id`), editar (`/master/campaigns/:id`), excluir (remoção do doc).

  * Usa `Card`, `Button`, `EmptyState`, `Spinner` de `src/components/common/index.ts`.

* `src/components/campaigns/CampaignForm.tsx`

  * Form para criar campanha com `name`, `description`, `ruleSet` (e `players` inicial vazio).

  * Valida campos obrigatórios, salva via serviço e redireciona para a lista.

  * Feedback com `useToast`.

* `src/services/campaign.service.ts`

  * `createCampaign({ name, description, ruleSet, players }, ownerUid)` → `addDoc('campaigns')` com `creationDate` e `ownerUid`.

  * `listCampaignsByOwner(ownerUid)` → consulta `where('ownerUid','==',ownerUid)`.

  * `updateCampaign(id, partial)` e `deleteCampaign(id)`.

* `src/hooks/useMasterCampaigns.ts`

  * Hook no padrão do projeto (como `useCampaigns.ts`) que retorna `{ items, count, loading, error }` consultando `campaigns` por `ownerUid`.

## Alterações em Arquivos Existentes

* `src/router.tsx`

  * Substituir placeholders das rotas do Mestre:

    * `'/master/campaigns'` → `<CampaignList />` (em `src/router.tsx:39`).

    * `'/master/campaigns/new'` → `<CampaignForm />` (em `src/router.tsx:40`).

* `src/hooks/index.ts`

  * Exportar `useMasterCampaigns` para uso em `CampaignList`.

## Modelo de Dados (Firestore)

* Coleção `campaigns` com campos:

  * `id`, `ownerUid`, `name`, `description`, `creationDate`, `ruleSet`, `players: string[]`.

* Referência de requisitos: `.trae/Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:149-160`.

## UI/UX

* Lista em grade com cards, exibindo `name`, `ruleSet`, contagem de `players` e ações.

* Form simples com inputs (`name`, `ruleSet`) e textarea (`description`).

* Mensagens de sucesso/erro via `Toast`.

## Verificação

* Fluxo:

  * Acessar `/master/campaigns/new` (guardado por `ModeGuard`).

  * Criar campanha; verificar documento em Firestore (emulador/dev) e redirecionamento para `/master/campaigns`.

  * Confirmar que aparece na lista filtrada por `ownerUid`.

* Critério de aceite: criação persiste e aparece na lista (`FASE 08.md`).

## Observações

* `players` permanecerá vazio na criação; convites/jogadores serão tratados em fases futuras.

* Mantém padrão de hooks reativos com `onSnapshot` (tempo real) como em `src/hooks/useCampaigns.ts:38-57`.

