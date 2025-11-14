Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE XX — Backlog: selecionar e implementar itens de backlog priorizados.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE XX.md
- Referências: Documentos de Planejamento correlatos ao item escolhido
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-xx-backlog`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e contexto do item de backlog
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Selecionar item de backlog e detalhar objetivo/tarefas/aceite
- Implementar e validar sem quebrar o restante

Critérios de Aceite
- Item entregue conforme descrição; sem regressões

Saídas Esperadas
- PR com escopo, referências e evidências de validação

Restrições
- Evitar mudanças acopladas; manter isolamento e rastreabilidade
