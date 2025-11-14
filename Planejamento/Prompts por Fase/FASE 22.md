Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 22 — Public NPC: implementar visualização pública de NPCs.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 22.md
- Referências: Definição de Páginas/Public - NPC.md; Rotas.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-22-public-npc`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Implementar página pública de NPC com `:publicShareId`
- Restringir dados sensíveis; apenas visualização

Critérios de Aceite
- Link público abre visualização sem login

Saídas Esperadas
- PR com página e regras de dados

Restrições
- Sanitizar e limitar campos públicos

Avanço
- Preparar plano da FASE 23 (sem executar)