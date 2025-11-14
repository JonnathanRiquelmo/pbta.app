Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 11 — Visualização Pública da Ficha: publicar visualização de ficha via link público.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 11.md
- Referências: Definição de Páginas/Sheet - Visualização Pública.md; Public - Ficha.md; Rotas.md; Documento de Requisitos
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-11-sheet-public`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Implementar `SheetPublicView` com `:publicShareId`
- Restringir dados sensíveis; apenas visualização

Critérios de Aceite
- Link público abre visualização sem necessidade de login

Saídas Esperadas
- PR com página pública e regras de dados

Restrições
- Sanitizar e limitar campos públicos

Avanço
- Preparar plano da FASE 12 (sem executar)
