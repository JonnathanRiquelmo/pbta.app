# FASE 18 — Monitoramento e Analytics

**Objetivo**
- Instrumentar eventos e traces de performance em operações críticas.

**Tarefas**
- Integrar `utils/analytics.ts` e `utils/performance.ts`.
- Registrar eventos: criação de ficha, sessão e rolagem.
- Usar `traceOperation` em login e salvamentos.

**Referências**
- `.trae/Planejamento/Monitoramento e Analytics.md:7-22,27-36,38-43`

**Critérios de Aceite**
- Eventos e traces registrados apenas após `initializeApp`.
