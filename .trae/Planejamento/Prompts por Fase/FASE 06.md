Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 06 — Dashboard do Jogador: implementar `PlayerDashboard` com resumo de campanhas, fichas e rolagens.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 06.md
- Referências: Estrutura de Componentes React.md; Documento de Requisitos; Rotas.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-06-player-dashboard`
- Commits semânticos
- Validação local: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e links
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Criar cards com contagens e atalhos
- Integrar `useCampaigns`, `useCharacters`, `useRolls`

Critérios de Aceite
- Cards exibem dados do usuário autenticado
- Navegação para páginas de lista/edição funciona

Saídas Esperadas
- PR com componente e hooks integrados

Restrições
- Manter performance adequada e UX consistente

Avanço
- Preparar plano da FASE 07 (sem executar)
