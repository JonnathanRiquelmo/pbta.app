Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 10 — Sheets CRUD: implementar criação, listagem, edição e exclusão de fichas.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 10.md
- Referências: Definição de Páginas/Sheets - Lista.md; Sheets - Nova.md; Sheet - Editor.md; Sheet - Visualização Pública.md; Rotas.md; Documento de Requisitos
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-10-sheets-crud`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Implementar `SheetList`, `SheetForm`, `SheetEditor`, `SheetCard`
- Serviços e regras: ownership do usuário e validações

Critérios de Aceite
- CRUD funcional com validação de ownership e navegação correta

Saídas Esperadas
- PR com páginas e serviços de fichas

Restrições
- Garantir que usuários só editem suas próprias fichas

Avanço
- Preparar plano da FASE 11 (sem executar)