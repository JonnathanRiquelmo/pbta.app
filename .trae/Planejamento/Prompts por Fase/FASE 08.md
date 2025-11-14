Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 08 — Campanhas (Mestre) — Lista e Nova: implementar listagem e criação de campanhas.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\.trae\Planejamento
- Fase: .trae/Planejamento/Fase de Implementação/FASE 08.md
- Referências: Estrutura de Componentes React.md; Documento de Requisitos; Rotas.md; Definição de Páginas/Master - Campaigns - Lista.md; Master - Campaign - Nova.md
- Não usar SOLO Builder

Gitflow
- Branch: `feature/fase-08-campaigns`
- Commits semânticos
- Validação: `npm run lint`, `npm run test:ci`, `npm run build`
- PR com checklist e links
- Merge: “Squash and merge”; deletar branch

Tarefas Obrigatórias
- Criar `CampaignList.tsx` e `CampaignForm.tsx` com `campaign.service`
- Campos: `name`, `description`, `ruleSet`, `players`

Critérios de Aceite
- Criar campanha persiste no Firestore e aparece na lista

Saídas Esperadas
- PR com páginas e serviço de campanhas

Restrições
- Restringir criação/edição ao Mestre

Avanço
- Preparar plano da FASE 09 (sem executar)
