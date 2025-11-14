Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 16 — Notas Pessoais: implementar notas privadas do usuário com CRUD simples.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 16.md
- Referências: Definição de Páginas/Notes - Pessoais.md; Documento de Requisitos; Rotas.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-16-notes`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Implementar listagem/criação/edição/remoção de notas pessoais
- Garantir que apenas o dono tenha acesso

Critérios de Aceite
- CRUD de notas funcional e privado

Saídas Esperadas
- PR com páginas e serviços de notas

Restrições
- Respeitar ACL e UX simples

Avanço
- Preparar plano da FASE 17 (sem executar)