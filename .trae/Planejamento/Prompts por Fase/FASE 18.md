Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 18 — Monitoramento e Analytics: instrumentar eventos e métricas de uso/performance.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 18.md
- Referências: Monitoramento e Analytics.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-18-analytics`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; apagar branch

Tarefas Obrigatórias
- Definir eventos-chave (login, CRUDs, rolagens, navegação)
- Instrumentar coleta de métricas e dashboards básicos

Critérios de Aceite
- Eventos e métricas registradas sem impactar performance

Saídas Esperadas
- PR com módulo de analytics e documentação sucinta no PR

Restrições
- Privacidade do usuário e respeito às políticas

Avanço
- Preparar plano da FASE 19 (sem executar)
