Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 21 — Deploy via GitHub Actions: publicar no GitHub Pages e configurar workflow.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 21.md
- Referências: Deploy e CI-CD.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-21-deploy-actions`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e screenshot/URL publicada
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Adicionar workflow `deploy.yml` (Pages) e ajustar `vite.config.ts` `base: '/pbta.app/'`
- Habilitar Pages e confirmar URL publicada

Critérios de Aceite
- Deploy automático no push para `main`; site acessível sem 404

Saídas Esperadas
- PR com workflow, `vite.config.ts` e URL da página

Restrições
- Manter CI também validando PRs (lint/test/build)

Avanço
- Preparar plano da FASE 22 (sem executar)