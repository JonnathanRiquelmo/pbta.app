# FASE 04 — Autenticação Google e Modo

**Objetivo**
- Implementar login Google e detecção de modo PLAYER/MASTER.

**Tarefas**
- Implementar `GoogleLoginButton.tsx` e fluxo `signInWithPopup`.
- Criar `AuthContext` e `ModeContext` para estado global.
- Implementar função `isMaster` com e-mail fixo e coleção `masters`.

**Referências**
- `Planejamento/Estrutura de Componentes React.md:17-23,69-72,74-81`
- `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:233-238` (detecção de modo)
- `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:104-111,118-125` (mestre inicial e coleção)
- `Planejamento/Arquitetura do Servidor.md:38-47`

**Critérios de Aceite**
- Usuário loga e é redirecionado para o dashboard correspondente ao modo.
- `isMaster` retorna verdadeiro para o e-mail inicial e falso para demais.
