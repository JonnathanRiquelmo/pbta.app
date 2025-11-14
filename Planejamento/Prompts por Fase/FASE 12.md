Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 12 — PDMs: implementar CRUD de Personagens do Mestre (privativos).

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 12.md
- Referências: Definição de Páginas/Master - PDMs - Lista.md; Master - PDM - Nova.md; Rotas.md; Documento de Requisitos
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-12-pdms`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Implementar listagem, criação e edição de PDMs
- Garantir privacidade: visíveis apenas ao Mestre

Critérios de Aceite
- CRUD funcional com restrição ao modo MASTER

Saídas Esperadas
- PR com páginas de PDMs e regras de acesso

Restrições
- Manter ACL adequada e performance nas consultas

Avanço
- Preparar plano da FASE 13 (sem executar)