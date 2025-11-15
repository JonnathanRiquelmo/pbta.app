## Objetivo
Implementar visão geral da campanha (leitura para jogadores e gestão para mestre) e editor de Plot com renderização segura via Markdown + sanitização.

## Branch
- Criar branch: `feature/fase-09-campaign-detail-plot` (mapa em `.trae/Planejamento/Gitflow/Guia de Gitflow.md:95-122`).

## Dependências
- Instalar: `marked` e `dompurify`.
- Comandos: `git checkout -b feature/fase-09-campaign-detail-plot` e `npm i marked dompurify`.

## Hooks e Serviços
- Novo hook `src/hooks/useCampaignById.ts`:
  - Busca em tempo real por `id` com `onSnapshot(doc(db,'campaigns',id))`.
  - Retorna `{ campaign, loading, error }` seguindo padrão dos hooks atuais.
- Novo serviço em `src/services/campaign.service.ts`:
  - `updateCampaignPlot(id: string, plot: string): Promise<void>` para atualizar o campo `plot` (com `trim()` e limite de tamanho razoável).
  - Sem alterar a assinatura de `updateCampaign`; manter compatibilidade.

## Componentes
- `src/components/campaigns/CampaignDetail.tsx`:
  - Usa `useParams()` + `useCampaignById(id)`.
  - Renderiza: nome, descrição, rule set, contagem de jogadores.
  - Renderiza `plot` em modo leitura para todos (sanitizado), sem edição para jogadores.
  - Se `isMaster()` for verdadeiro, mostra ações de gestão e botão “Editar Plot” (link para `/master/campaigns/:id/plot`).
  - Segue design system (Card, Button, Badge, etc.) já usado em `CampaignForm.tsx`.
- `src/components/campaigns/PlotEditor.tsx`:
  - Usa `useParams()` + `useCampaignById(id)`.
  - Textarea para Markdown; preview lado a lado.
  - Renderização: `marked.parse(markdown)` e `DOMPurify.sanitize(html)`; exibe via `dangerouslySetInnerHTML` apenas o HTML sanitizado.
  - Botões: Salvar (chama `updateCampaignPlot`) e Voltar.
  - Restrito ao Mestre pela rota sob `ModeGuard`.

## Rotas (substituir PageStub)
- Atualizar `src/router.tsx`:
  - `'/campaigns/:id'` → `CampaignDetail` (leitura para jogador) `src/router.tsx:31`.
  - `'/master/campaigns/:id'` → `CampaignDetail` (gestão/overview do mestre) `src/router.tsx:43`.
  - `'/master/campaigns/:id/plot'` → `PlotEditor` `src/router.tsx:44`.
  - Demais rotas permanecem inalteradas; `ModeGuard` já protege `/master/*`.

## Segurança e Sanitização
- Markdown convertido com `marked`; HTML sempre sanitizado com `DOMPurify` antes de renderizar.
- Nenhuma edição de Plot exposta fora de `/master/...`.
- Validação básica no cliente: `plot` `trim()`, limite de caracteres (ex.: ≤ 10k), evita payloads exagerados.

## Verificação
- Rodar dev server já ativo e navegar:
  - Jogador: `#/campaigns/:id` deve exibir plot em leitura, seguro.
  - Mestre: `#/master/campaigns/:id` com botão “Editar Plot”.
  - Mestre: `#/master/campaigns/:id/plot` deve permitir editar, salvar e ver preview sanitizado.
- Testar ausência de `plot` (renderizar estado vazio sem erro).
- Confirmar redirecionamento de não-mestre em `/master/...` por `ModeGuard`.

## Entregáveis
- Novos arquivos: `src/hooks/useCampaignById.ts`, `src/components/campaigns/CampaignDetail.tsx`, `src/components/campaigns/PlotEditor.tsx`.
- Atualizações: `src/services/campaign.service.ts` (função `updateCampaignPlot`), `src/router.tsx` (troca dos componentes nas rotas indicadas).
- Dependências adicionadas: `marked`, `dompurify`. 