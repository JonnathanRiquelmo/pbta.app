# FASE 15 — Rolador 2d6 e Perfil

**Objetivo**
- Implementar rolagens PBTA 2d6 com histórico e perfil do usuário.

**Tarefas**
- `utils/pbta.ts` com `rollPBTA` e `rolls.service.ts` com `saveRoll`.
- `DiceRoller.tsx`, `RollHistory.tsx`, `Profile` com histórico próprio.

**Referências**
- `Planejamento/Estrutura de Componentes React.md:39-46`
- `Planejamento/Testes Unitários.md:7-48`
- `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:187-198,293-300`
- `Planejamento/Rotas.md:21,56-57,72-73`
- `Planejamento/Definição de Páginas/Roller.md`
- `Planejamento/Definição de Páginas/Profile.md`

**Critérios de Aceite**
- Jogador realiza rolagens e vê apenas as próprias no perfil.
- Mestre vê todas em `/master/rolls`.
