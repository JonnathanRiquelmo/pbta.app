# Fase 0 - Findings da Análise

## Resumo da Análise

Análise completa realizada em 29/11/2025 dos componentes do sistema de movimentos conforme especificado no `PLANO_MOVIMENTOS.md`.

## 1. Store de Movimentos (appStore.ts)

### Métodos relacionados a moves encontrados:
- `listCampaignMoves(campaignId)`: Retorna nomes dos movimentos ativos
- `listMoves(campaignId)`: Retorna todos os movimentos (apenas mestre)  
- `createMove/updateMove/deleteMove`: CRUD de movimentos
- `createRoll`: Valida movimentos nas rolagens
- `createNpcSheets`: Usa fallback estático quando não há movimentos

### Problemas identificados:
- ✅ **Fallback estático em `createNpcSheets`**: Linhas 136-137 usam `['Movimento 1','Movimento 2','Movimento 3']` quando não há movimentos
- ✅ **Falta assinatura em tempo real**: Não há métodos `subscribeMoves` ou `initMovesSubscription`
- ✅ **Validação rígida em `createRoll`**: Requer `move_not_in_sheet` para jogadores e `move_not_active` para todos

## 2. Repositório Firestore (firestoreMoveRepo.ts)

### Estrutura atual:
- Cache local `cacheByCampaign: Map<string, Move[]>`
- Métodos CRUD: `listByCampaign`, `create`, `update`, `remove`
- Validações: `invalid_name`, `invalid_modifier`, `not_found`

### Problemas críticos:
- ✅ **Falta assinatura Firestore**: Não há método `subscribe(campaignId, cb)` com `onSnapshot`
- ✅ **Cache sem sincronização**: Cache local não é populado inicialmente do Firestore
- ✅ **Atualização unidirecional**: Só atualiza local após operações, não recebe updates do Firestore

## 3. UI de Movimentos (Route.tsx)

### Funcionalidades:
- Formulário de criação com nome, descrição, modificador, ativo
- Lista editável com salvar/deletar
- Estados de erro e sucesso

### Problemas:
- ✅ **Atualização manual**: Chama `listMoves` após cada operação
- ✅ **Sem tempo real**: Não se atualiza automaticamente quando outros usuários modificam
- ✅ **Falta loading states**: Não indica quando dados estão sendo carregados
- ✅ **Possível race condition**: Múltiplas operações simultâneas podem causar inconsistências

## 4. Ficha do Jogador (CharacterSheet.tsx)

### Funcionalidades:
- Formulário completo: nome, background, atributos, equipamentos, notas
- Seleção múltipla de movimentos via checkboxes
- Validação de atributos (soma = 3)
- Assinatura Firestore para personagens (mas não para movimentos)

### Problemas:
- ✅ **Assinatura duplicada**: Tem `onSnapshot` para personagens mas não para movimentos
- ✅ **Dependência síncrona**: Usa `listCampaignMoves` que não reflete mudanças em tempo real
- ✅ **Falta validação ativos**: Não verifica se movimentos ainda estão ativos ao salvar
- ✅ **Possível dessincronização**: Movimentos desativados ainda aparecem como selecionados

## 5. Dice Roller (DiceRoller.tsx)

### Funcionalidades:
- Seleção de quem rola (jogador/NPC)
- Filtro de atributos e movimentos disponíveis
- Modos: normal, vantagem, desvantagem
- Integração com validações do store

### Pontos positivos:
- ✅ **Lógica NPC correta**: NPCs têm acesso a todos os movimentos ativos da campanha
- ✅ **Filtro jogador correto**: Jogadores só veem movimentos em sua ficha E ativos

### Problemas:
- ✅ **Sem tempo real**: `listCampaignMoves` é síncrono, não reflete atualizações
- ✅ **Possível inconsistência**: Lista pode estar desatualizada se movimentos forem desativados
- ✅ **Falta feedback loading**: Não indica quando movimentos estão sendo carregados

## 6. Critérios de Aceite - Análise de Conformidade

### ✅ Já implementados:
- Dice Roller aplica modificadores corretamente via `performRoll`
- NPC pode usar qualquer movimento ativo da campanha
- Validação `move_not_active` já existe no store

### ❌ Necessitam implementação:
- Mestre precisa conseguir criar/editar/ativar/desativar/deletar movimentos
- Jogador precisa ver lista de movimentos ativos na campanha em tempo real
- Dice Roller precisa refletir mudanças de movimentos em tempo real
- Histórico de rolagens precisa atualizar em tempo real (já existe `subscribeRolls`)
- Sistema precisa ser 100% Firestore sem localStorage

## 7. Dependências e Blockers

### Blockers para Fase 1:
1. **Assinatura Firestore**: Requer `subscribe` no repo e store antes de UI
2. **Remoção fallback**: Requer movimentos funcionais antes de remover fallback
3. **Validação servidor**: Requer validação no backend antes de confiar apenas no frontend

### Requisitos técnicos:
- Implementar `onSnapshot` em `firestoreMoveRepo.ts`
- Adicionar métodos de assinatura em `appStore.ts`
- Atualizar componentes para usar dados assinados
- Remover todo fallback para localStorage/localState

## 8. Próximos Passos Priorizados

1. **Fase 2 primeiro**: Implementar assinatura Firestore antes de expor UI
2. **Validação servidor**: Garantir validações no Firestore security rules
3. **Testes E2E**: Criar testes para fluxos críticos antes de deploy
4. **Performance**: Implementar debounce para assinaturas frequentes

---

**Status**: ✅ Análise completa  
**Data**: 29/11/2025  
**Próxima ação**: Aguardar instruções para implementação da Fase 2