Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 09 — Gerenciar Campanha e Editor de Plot: visão geral da campanha e editor de plot com sanitização.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 09.md
- Referências: Estrutura de Componentes React.md; Descrição das Tecnologias.md (Markdown); Documento de Requisitos; Rotas.md; Definição de Páginas/Master - Campaign - Gerenciar.md; Master - Plot - Editor.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-09-campaign-detail-plot`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Implementar `CampaignDetail.tsx` e `PlotEditor.tsx`
- Usar `marked` + `DOMPurify` para sanitização e renderização segura
- Regras: somente Mestre edita; jogadores leem

Critérios de Aceite
- Plot renderiza seguro e edição é restrita ao Mestre

Saídas Esperadas
- PR com componentes e sanitização demonstrada

Restrições
- Garantir segurança XSS na renderização de Markdown

Avanço
- Preparar plano da FASE 10 (sem executar)
