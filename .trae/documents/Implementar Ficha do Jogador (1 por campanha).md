## Contexto do Projeto
- Stack: React + Vite, React Router, Zustand, repositório local via `localStorage`.
- Rotas relevantes: `src/routes/index.tsx` possui `'/characters/:id'` → `src/characters/Route.tsx` (placeholder atual).
- Store global: `src/shared/store/appStore.ts` (usuário, campanha atual, ações de convites/campanhas).

## Objetivo
- Criar o módulo de Ficha do Jogador, 1 por campanha, com validação de atributos e integração de “moves” habilitados na campanha.

## Modelagem
- Tipo `PlayerSheet`:
  - `id`, `campaignId`, `userId` (chave única por campanha+usuário)
  - `name`, `background`
  - `attributes`: `{forca, agilidade, sabedoria, carisma, intuicao}` cada em `[-1, 3]`
  - Regra: soma absoluta dos atributos = `3`
  - `equipment` (texto/textarea), `notes` (textarea)
  - `moves: string[]`
  - `createdAt`, `updatedAt`

## Repositório Local
- Criar `src/characters/characterRepo.ts` (contrato) e `src/characters/localCharacterRepo.ts` (implementação):
  - `getByCampaignAndUser(campaignId, userId)`
  - `create(campaignId, userId, sheet)` (bloquear se já existir)
  - `update(campaignId, userId, patch)`
  - `validateServerSide(sheet)` (hook preparado, retorna sucesso por ora)
- Persistência em `localStorage`, seguindo padrão já usado em `src/campaigns/localInviteRepo.ts`.

## Store (Zustand)
- Estender `src/shared/store/appStore.ts` com ações:
  - `getMyPlayerSheet(campaignId)`
  - `createMyPlayerSheet(campaignId, data)` com validação de soma=3 e bloqueio se já existir
  - `updateMyPlayerSheet(campaignId, patch)` com mesma validação
  - `listCampaignMoves(campaignId)` (stub que lê os movimentos habilitados da campanha; se ainda não existir no modelo de campanha, retornar uma lista fixa temporária via stub)
- Cache opcional em memória: `playerSheetCache[campaignId:userId]`.

## UI (Editor da Ficha)
- Evoluir `src/characters/Route.tsx` para editor completo:
  - Determinar `campaignId` (usar `:id` da rota como `campaignId`) e `user` da store.
  - Carregar ficha existente; se houver, entrar em modo edição; caso contrário, criação.
  - Inputs:
    - `name` e `background` (obrigatórios)
    - `equipment` e `notes` (textareas)
    - Atributos com radios para cada campo: valores de `-1` a `+3`
    - Indicador de soma restante: `3 - (|forca|+|agilidade|+|sabedoria|+|carisma|+|intuicao|)`
  - Lista de “moves” habilitados da campanha (checkboxes baseados em `listCampaignMoves(campaignId)`)
  - Validações do cliente:
    - Bloquear criação se já existir ficha para `campaignId+userId`
    - Impedir salvar se soma absoluta ≠ `3`
    - Chamar `validateServerSide(sheet)` antes de persistir (hook preparado)
  - UX consistente: classes `.card`, `.error`, `button`, `input` de `src/shared/theme.css`

## Regras e Acesso
- Restringir a edição à própria ficha do usuário autenticado (usar `user.id` da store).
- Não implementar NPC.

## Rotas e Navegação
- Usar a rota existente `'/characters/:id'` interpretando `:id` como `campaignId`.
- (Opcional, fora do escopo imediato) adicionar link “Minha Ficha” na página da campanha para facilitar navegação.

## Verificação
- Testar fluxo completo no preview:
  - Sem ficha: criar com atributos válidos (soma=3), salvar e reabrir para edição.
  - Tentar criar novamente: bloqueio por já existir.
  - Tentar salvar com soma inválida: bloqueado com mensagem.
  - Selecionar/deselecionar “moves” e persistência.

## Entregáveis
- Novos arquivos: `src/characters/types.ts`, `src/characters/characterRepo.ts`, `src/characters/localCharacterRepo.ts`.
- Atualizações: `src/shared/store/appStore.ts`, `src/characters/Route.tsx`.
- Sem alterações em NPCs; nenhuma dependência externa nova.

## Observações
- Caso futuramente os “moves” da campanha sejam formalizados no modelo de `Campaign`, trocar o stub `listCampaignMoves` por integração real.
- O hook `validateServerSide` ficará pronto para conectar a uma API quando existir backend.