## Branch
- Criar a branch de trabalho `feature/fase-13-moves` conforme o guia de Gitflow.

## Modelo de Dados
- Entidade `Move` (Firestore/Bypass): `id`, `campaignId`, `name`, `description`, `trigger`, `rollFormula`, `results` (textos para 10+, 7–9, 6-).
- Exibição para Jogador: filtrar por moves atribuídos ao personagem do jogador na campanha (IDs em `characters.moves`).

## Serviços
- `src/services/moves.service.ts`
  - `createMove(input: MoveInput): Promise<string>`
  - `updateMove(id: string, partial: Partial<MoveInput>): Promise<void>`
  - `deleteMove(id: string): Promise<void>`
  - Suporte a bypass (`localStorage` em `bypass:moves`) e Firestore (`collection('moves')`).

## Hooks
- `src/hooks/useMovesForCampaign.ts`
  - Lista moves por `campaignId`, com estados `items`, `count`, `loading`, `error`.
  - Suporte a bypass e Firestore (`where('campaignId','==', id)`).
- Utilizar `src/hooks/useCharacters.ts` para localizar o personagem do jogador na campanha e obter `moves` atribuídos.

## Componentes
- `src/components/moves/MoveCard.tsx`
  - Exibe `name`, `trigger`, `description`, `results` em cartão.
- `src/components/moves/MovesEditor.tsx`
  - Formulário de criação/edição com validações simples; usa `createMove`/`updateMove`.
- `src/components/moves/MasterMoves.tsx`
  - Página da rota do Mestre; lista (`MovesList`) com busca/ordenar; abre `MovesEditor` para criar/editar; permite excluir via `deleteMove`.
- `src/components/moves/CampaignMoves.tsx`
  - Página da rota do Jogador; lista somente leitura com `MoveCard`; filtra por gatilho via `Tabs` e restringe a moves atribuídos ao personagem do jogador.

## Rotas
- Substituir stubs em `src/router.tsx`:
  - `/campaigns/:id/moves` → `CampaignMoves` (src/router.tsx:45)
  - `/master/campaigns/:id/moves` → `MasterMoves` (src/router.tsx:62)

## Analytics
- Disparar eventos simples via `console.log` (placeholder): `page_view_master_moves`, `move_created`, `move_updated`, `page_view_campaign_moves`.

## UI/UX e Padrões
- Reutilizar `Card`, `Button`, `Input`, `Tabs`, `Spinner`, `EmptyState`, `ToastProvider`.
- Estilo e composição idênticos aos componentes existentes (ex.: `PdmList.tsx`, `PlotEditor.tsx`).

## Validação
- Rodar em modo bypass (`VITE_TEST_BYPASS_AUTH=true`) para CRUD local sem Firestore.
- Fluxos:
  - Mestre: criar/editar/excluir em `/master/campaigns/:id/moves` e verificar listagem e toasts.
  - Jogador: confirmar exibição apenas dos moves atribuídos em `/campaigns/:id/moves`.

## Entregáveis
- Novos arquivos: serviços, hook e componentes mencionados.
- Atualização das rotas em `src/router.tsx` com importações adequadas.
- Nenhum commit até aprovação; tudo implementado na branch `feature/fase-13-moves`. 