Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 15 — Roller e Perfil: implementar rolador 2d6 com histórico e página de perfil.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 15.md
- Referências: Definição de Páginas/Roller.md; Profile.md; Master - Rolls - Monitor.md; Documento de Requisitos; Rotas.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-15-roller-profile`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Implementar rolador PBTA 2d6 com interpretação de resultados e histórico
- Criar página de perfil com rolagens pessoais

Critérios de Aceite
- Rolador funciona e histórico persiste
- Perfil exibe dados do usuário

Saídas Esperadas
- PR com páginas `roller` e `profile`

Restrições
- Garantir UX clara e acessível

Avanço
- Preparar plano da FASE 16 (sem executar)