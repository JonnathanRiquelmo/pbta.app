Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 13 — Moves: implementar gestão de movimentos PBTA (definição e uso em campanhas).

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 13.md
- Referências: Definição de Páginas/Master - Moves.md; Campaign - Moves do Jogador.md; Documento de Requisitos; Rotas.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-13-moves`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Implementar criação/edição de moves pelo Mestre
- Expor moves aos jogadores conforme campanha

Critérios de Aceite
- Moves configuráveis e utilizáveis nas páginas do jogador

Saídas Esperadas
- PR com componentes e serviços de moves

Restrições
- Garantir compatibilidade com rule sets definidos

Avanço
- Preparar plano da FASE 14 (sem executar)
