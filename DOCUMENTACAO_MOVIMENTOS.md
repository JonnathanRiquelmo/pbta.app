# Documentação do Módulo de Movimentos (PbtA)

## Visão Geral
O módulo de Movimentos implementa a funcionalidade core de jogos "Powered by the Apocalypse" (PbtA), permitindo que o Mestre (GM) crie e gerencie movimentos personalizados para a campanha, e que os Jogadores os utilizem em suas rolagens.

## Funcionalidades Principais

### 1. Gestão de Movimentos (Mestre)
- **Criação**: Mestre pode criar movimentos com Nome, Descrição, Modificador (-1 a +3) e Estado (Ativo/Inativo).
- **Edição**: Mestre pode editar qualquer campo de um movimento existente.
- **Exclusão**: Mestre pode remover movimentos.
- **Listagem**: Movimentos são listados por ordem de criação (mais recentes primeiro).
- **Ativação/Desativação**: Movimentos podem ser desativados sem serem excluídos, ocultando-os da seleção dos jogadores.

### 2. Uso pelos Jogadores
- **Seleção na Ficha**: Jogadores selecionam quais movimentos ativos da campanha seu personagem possui.
- **Visualização**: Apenas movimentos marcados como "Ativos" pelo mestre são visíveis para seleção.
- **Sincronização**: Se um movimento selecionado for desativado pelo mestre, ele é automaticamente removido da seleção do jogador com um aviso visual.
- **Validação**: O sistema impede salvar a ficha se houver movimentos inválidos ou inativos selecionados.

### 3. Uso por NPCs (Mestre)
- **Acesso Total**: NPCs criados pelo mestre têm acesso a **todos** os movimentos ativos da campanha automaticamente.
- **Consistência**: Se um movimento for desativado, ele deixa de estar disponível para rolagens de NPC imediatamente.

### 4. Rolagens (Dice Roller)
- **Integração**: O rolador de dados permite selecionar um movimento.
- **Modificadores**: Ao selecionar um movimento, seu modificador (ex: +1, -1) é somado automaticamente ao atributo selecionado e ao resultado dos dados.
- **Histórico**: O nome do movimento utilizado fica registrado no histórico de rolagens.

## Arquitetura Técnica

### Repositório e Dados (`src/moves/firestoreMoveRepo.ts`)
- **Coleção**: `moves` no Firestore.
- **Campos**:
  - `campaignId`: ID da campanha vinculada.
  - `name`: Nome do movimento.
  - `description`: Texto descritivo.
  - `modifier`: Inteiro entre -1 e +3.
  - `active`: Booleano.
  - `createdAt` / `updatedAt`: Timestamps.
- **Real-time**: Utiliza `onSnapshot` para manter a lista de movimentos sempre atualizada em todos os clientes conectados.

### Store (`src/shared/store/appStore.ts`)
- **Gerenciamento de Estado**:
  - `movesCache`: Map<campaignId, Move[]> - Cache em memória dos movimentos.
  - `subscribeMoves(campaignId)`: Inicia a escuta em tempo real.
  - `initMovesSubscription(campaignId)`: Helper para componentes iniciarem a assinatura.
  - `cleanupSubscriptions()`: Remove todos os listeners ao sair ou desmontar.

### Componentes Chave
- **`src/moves/Route.tsx`**: Tela de gestão de movimentos (acesso exclusivo Mestre).
- **`src/characters/CharacterSheet.tsx`**: Lógica de seleção e validação de movimentos na ficha do jogador.
- **`src/rolls/DiceRoller.tsx`**: Componente de rolagem que consome a lista de movimentos ativos.

## Fluxos de Erro e Validação
- **UI**: Mensagens de erro padronizadas via `getErrorMessage` (`src/shared/utils/errorMessages.ts`).
- **Validação**:
  - Nome obrigatório.
  - Modificador dentro do range permitido.
  - Validação server-side ao salvar ficha (impede injeção de movimentos inativos).

## Testes
- **E2E**:
  - `tests/e2e/moves-navigation-access.spec.ts`: Controle de acesso (Mestre vs Jogador).
  - `tests/e2e/moves-navigation-lifecycle.spec.ts`: Persistência e SPA navigation.
  - `tests/e2e/moves-errors.spec.ts`: Validação de erros e feedback.
  - `tests/e2e/moves-subscribe-realtime.spec.ts`: Atualização em tempo real.
- **Unitários**:
  - `tests/unit/firestoreMoveRepo.subscribe.test.ts`: Lógica de assinatura do repositório.
  - `tests/unit/cleanupSubscriptions.test.ts`: Gestão de memória e listeners.

---
*Documentação atualizada em: 2025-12-01*
