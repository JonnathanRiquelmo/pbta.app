Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 17 — PWA e Offline: implementar service worker, rotas offline e estratégias de cache.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 17.md
- Referências: Implementação PWA e Offline.md; Rotas.md (rota `/offline`)
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-17-pwa-offline`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Implementar `sw.ts` com Workbox (precache, routes, strategies)
- Rota `/offline` e handlers de falha de rede

Critérios de Aceite
- App funciona parcialmente offline e rota `/offline` disponível

Saídas Esperadas
- PR com `sw.ts` e integração no build

Restrições
- Evitar cache agressivo que quebre atualizações

Avanço
- Preparar plano da FASE 18 (sem executar)
