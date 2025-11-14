Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 07 — Dashboard do Mestre: implementar `MasterDashboard` com visão administrativa de campanhas, PDMs, sessões, moves e rolagens.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 07.md
- Referências: Estrutura de Componentes React.md; Documento de Requisitos; Rotas.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-07-master-dashboard`
- Commits semânticos
- Validação local: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e links
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Criar cards de campanhas, PDMs, sessões, moves e rolagens
- Atalhos para CRUDs e monitor

Critérios de Aceite
- Navegação e contagens funcionam para modo MASTER

Saídas Esperadas
- PR com componente e integrações

Restrições
- Aplicar guards de modo MASTER onde necessário

Avanço
- Preparar plano da FASE 08 (sem executar)