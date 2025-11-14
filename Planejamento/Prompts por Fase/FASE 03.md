Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 03 — Router e Estrutura de Rotas: configurar `react-router-dom@6` com rotas comuns, jogador, mestre e públicas, incluindo guards.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 03.md
- Referências: Rotas.md; Estrutura de Componentes React.md; Deploy e CI-CD.md (base/hash)
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-03-router`
- Commits semânticos
- Validação local: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist de critérios de aceite e links
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Instalar e configurar `react-router-dom@6`
- Definir rotas conforme documentação (comuns, PLAYER, MASTER, públicas)
- Implementar `AuthGuard` e `ModeGuard` nas rotas restritas
- Habilitar modo hash ou `base` conforme deploy (Pages)

Critérios de Aceite
- Navegação entre todas as rotas sem 404 localmente
- Guards aplicados nas rotas de Mestre

Saídas Esperadas
- PR com mapa de rotas, componentes e guards
- Instruções no PR para validação de navegação

Restrições
- Manter estrutura limpa e coesa com a hierarquia de componentes

Avanço
- Preparar plano da FASE 04 (sem executar)