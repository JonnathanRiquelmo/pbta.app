# Tracking de Revisão de Testes E2E

Este documento rastreia a correção dos testes E2E falhos identificados na execução de 04/12/2025.

## Resumo da Execução
- **Total de Testes:** 176
- **Passaram:** 141
- **Falharam:** 35
- **Status Geral:** ⚠️ Atenção Requerida em Integrações Críticas

---

## 1. Integração Dice Roller e NPCs (Crítico)
*Problemas de sincronização entre criação de NPC e disponibilidade no Dice Roller.*

- [x] **rolls-disadvantage.spec.ts**
    - *Erro:* Cálculo incorreto (esperado 9, recebeu 7). Modificador +2 do NPC não aplicado.
    - *Causa:* Mock de `crypto.getRandomValues` causando colisão de IDs no Firestore (ALREADY_EXISTS). Teste não selecionava atributo. Regras de segurança bloqueavam atributos negativos (Math.abs faltante).
    - *Correção:* Ajustado mock de crypto, atualizado regras de segurança, corrigido seleção de atributo no teste.
    - *Status:* ✅ Corrigido

- [ ] **passo-18-teste-integracao-diceroller-npcs.spec.ts**
    - *Erro:* "NPC não encontrado no seletor".
    - *Status:* Pendente

- [ ] **npcs-dice-roller-integration-v2.spec.ts**
    - *Erro:* Timeout / NPC não aparece.
    - *Status:* Pendente

- [ ] **npcs-dice-roller-integration-final.spec.ts**
    - *Erro:* Timeout.
    - *Status:* Pendente

- [ ] **passo-18-dice-roller-integration.spec.ts**
    - *Erro:* Timeout em `locator.selectOption`.
    - *Status:* Pendente

- [ ] **passo-18-teste-integracao-diceroller-npcs-completo.spec.ts**
    - *Erro:* Timeout.
    - *Status:* Pendente

## 2. Validações de Formulário (Timeouts)
*Timeouts ao tentar preencher campos em modais.*

- [ ] **npcs-form-validations.spec.ts**
    - *Cenário:* Validação de soma de atributos
    - *Status:* Pendente
    - *Cenário:* Validação de valores negativos
    - *Status:* Pendente
    - *Cenário:* Validação de campos obrigatórios
    - *Status:* Pendente
    - *Cenário:* Validação de limites de atributos
    - *Status:* Pendente
    - *Cenário:* Validação em tempo real
    - *Status:* Pendente

## 3. Atualizações em Tempo Real / Login
*Timeouts em operações básicas de autenticação.*

- [ ] **session-realtime-updates.spec.ts**
    - *Erro:* Timeout no Login.
    - *Status:* Pendente

## 4. Outros Erros
- [ ] **character-block-invalid-sum.spec.ts**
    - *Erro:* Falha na verificação de bloqueio.
    - *Status:* Pendente
- [ ] **move-selection-persistence.spec.ts**
    - *Erro:* Persistência de seleção.
    - *Status:* Pendente

---
## Histórico de Correções

| Data | Arquivo | Correção Aplicada | Resultado |
|------|---------|-------------------|-----------|
|      |         |                   |           |
