Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 20 — Testes e Qualidade: adicionar testes unitários e garantir qualidade (lint, coverage, padrões).

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 20.md
- Referências: Testes Unitários.md; Descrição das Tecnologias.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-20-tests-quality`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Adicionar testes com Vitest + React Testing Library
- Configurar padrões de qualidade e coverage mínima

Critérios de Aceite
- Testes passam em `test:ci`; cobertura mínima atendida

Saídas Esperadas
- PR com testes principais e ajustes de qualidade

Restrições
- Evitar testes frágeis; focar em unidades críticas

Avanço
- Preparar plano da FASE 21 (sem executar)