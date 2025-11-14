Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 05 — Design System e Componentes Comuns: implementar tokens visuais e componentes reutilizáveis, mobile-first e acessíveis.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 05.md
- Referências: Definição de Páginas/Design System.md; Implementação PWA e Offline.md; Descrição das Tecnologias.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-05-design-system`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e links
- Merge: “Squash and merge”; apagar branch

Tarefas Obrigatórias
- Criar `Button`, `Input`, `Card`, `Loading`, `Modal`, `Tabs`, `Badge`, `Toast`, `Avatar`, `EmptyState`
- Configurar tipografia, cores, espaçamentos, radius e sombras
- Aplicar diretrizes de acessibilidade e comportamento offline-aware

Critérios de Aceite
- Componentes com estados `loading/disabled/error`
- Contraste AA e áreas de toque ≥42px

Saídas Esperadas
- PR com biblioteca de componentes e documentação sucinta no PR

Restrições
- Manter consistência visual e acessibilidade

Avanço
- Preparar plano da FASE 06 (sem executar)