Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 19 — ACL e Segurança: reforçar regras de acesso e segurança na aplicação e Firestore.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 19.md
- Referências: Documento de Requisitos; Configuração Firebase.md (regras); Arquitetura do Servidor.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-19-acl-security`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Implementar/ajustar ACL por modo (PLAYER/MASTER) e ownership
- Revisar e ajustar regras do Firestore e validações no cliente

Critérios de Aceite
- Acesso adequado garantido; operações indevidas bloqueadas

Saídas Esperadas
- PR com regras e validações revisadas

Restrições
- Minimizar exposição de dados; logs não sensíveis

Avanço
- Preparar plano da FASE 20 (sem executar)
