# FASE 19 — Segurança e ACL na Aplicação

**Objetivo**
- Aplicar validações de acesso finas (ownership e modo) na camada de aplicação.

**Tarefas**
- Implementar `validateSheetUpdate` e validar ações por `isMaster`.
- Desabilitar UI e ocultar ações não permitidas por modo.

**Referências**
- `Planejamento/Testes Unitários.md:50-70,72-90`
- `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:52-68,91-99,126-138`
- `Planejamento/Arquitetura do Servidor.md:66-70`

**Critérios de Aceite**
- Tentativas de acesso indevido são bloqueadas e testadas.
