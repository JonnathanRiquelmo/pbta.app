Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar uma FASE 0x — Template de micro-fase: aplicar alterações pontuais seguindo o padrão de governança.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 0x.md
- Referências: Gitflow/Guia de Gitflow.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-0x-template`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e escopo claro
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Descrever objetivo, tarefas mínimas e critérios de aceite específicos
- Implementar mudanças e validar localmente

Critérios de Aceite
- Alterações atendem ao objetivo e não quebram build/tests

Saídas Esperadas
- PR com descrição enxuta e referências

Restrições
- Evitar escopo amplo; foco pontual