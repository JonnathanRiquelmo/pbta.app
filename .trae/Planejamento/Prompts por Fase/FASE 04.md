Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 04 — Autenticação Google e Modo: implementar login Google, `AuthContext`, `ModeContext` e função `isMaster` (e-mail fixo + coleção `masters`).

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 04.md
- Referências: Documento de Requisitos; Estrutura de Componentes React.md; Arquitetura do Servidor.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-04-auth-mode`
- Commits semânticos
- Validação local: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e links às referências
- Merge: “Squash and merge”; remover branch

Tarefas Obrigatórias
- Implementar `GoogleLoginButton.tsx` com `signInWithPopup`
- Criar `AuthContext` e `ModeContext` com estado global
- Implementar `isMaster` com verificação por e-mail inicial e coleção `masters`
- Redirecionar pós-login para o dashboard do modo correspondente

Critérios de Aceite
- Usuário loga e é redirecionado corretamente (PLAYER/MASTER)
- `isMaster` retorna verdadeiro para e-mail inicial e falso para demais

Saídas Esperadas
- PR com componentes/contexts e fluxo de login
- Instruções de teste do login e detecção de modo

Restrições
- Respeitar segurança e não vazar informações sensíveis

Avanço
- Preparar plano da FASE 05 (sem executar)
