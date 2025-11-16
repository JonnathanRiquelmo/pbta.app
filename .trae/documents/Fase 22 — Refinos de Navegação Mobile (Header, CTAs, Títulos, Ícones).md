# Objetivo
Implementar refinamentos mobile-first na navegação para a branch `feature/fase-22-mobile-nav`: títulos dinâmicos por página, componente Header dedicado, CTAs sticky e ícones nas Tabs, mantendo PWA e design system.

## Escopo
- Criar `Header` reutilizável com título, botão Voltar e slot para ações.
- Ajustar títulos dinâmicos (ex.: nome da campanha/sessão/ficha) quando dados estiverem carregados.
- Introduzir `StickyCTA` para ações principais sempre acessíveis em telas de edição e listas.
- Adicionar ícones aos rótulos das Tabs por papel (Jogador/Mestre).
- Garantir que tudo use componentes do design system (`Button`, `Card`, `Tabs`).

## Implementações Técnicas
### 1. Componente Header
- Arquivo: `src/components/layout/Header.tsx`
- Funções:
  - Exibe título dinâmico
  - Mostra `Button variant="ghost" size="sm"` com `navigate(-1)` quando não for top-level
  - Slot à direita para ações contextuais (ex.: "Editar Plot", "Salvar")
- Integração: substituir header inline em `AppLayout` (`src/components/layout/AppLayout.tsx`), delegando lógica de back/top-level e título.

### 2. Títulos Dinâmicos
- Criar `TitleContext` (`src/contexts/TitleContext.tsx`) com `setTitle(title: string)`.
- Em `AppLayout`, consumir `TitleContext` para priorizar título corrente; fallback para heurística por path (atual `usePageTitle`).
- Páginas que possuem dados definem título quando carregam:
  - `CampaignDetail`: título = `campaign.name` (`src/components/campaigns/CampaignDetail.tsx`)
  - `SessionEditor`/`SessionViewer`: título = `session.title` (ou `Campanha · Sessão`) (`src/components/sessions/*.tsx`)
  - `SheetEditor`/`SheetForm`/`SheetPublicView`: título = `character.name`/"Nova Ficha" (`src/components/sheets/*.tsx`)
  - `PdmEditor`/`PdmForm`: título = `pdm.name`/"Novo PDM" (`src/components/pdms/*.tsx`)
- Quando erro/empty-state: manter título heurístico (ex.: "Campanhas").

### 3. CTAs Sticky (Mobile)
- Componente: `src/components/layout/StickyCTA.tsx`
- Comportamento: barra fixa inferior com `Button` primário `fullWidth` + secundários quando necessário; respeita `env(safe-area-inset-bottom)`.
- Aplicações:
  - `SheetList`: "Criar ficha" sticky
  - `CampaignList` (mestre): "Nova campanha" sticky
  - `PdmList`: "Novo PDM" sticky
  - Editores (`SheetEditor`, `PdmEditor`, `SessionEditor`, `PlotEditor`): "Salvar" sticky
- Regras offline: desabilitar `Button` e usar `Toast` ao clicar se `!online`.

### 4. Ícones nas Tabs
- Atualizar `BottomTabs` para injetar ícones simples (emoji ou caracteres):
  - Jogador: 🏠 Dashboard, 🎭 Fichas, 🎲 Campanhas, 🎲 Rolagens, 📝 Notas
  - Mestre: 🎛️ Mestre, 🗺️ Campanhas, 👤 PDMs, 🎲 Rolagens
- `Tabs` aceita `label` como string, manter acessibilidade via texto + emoji.

## Ajustes de Navegação e Ações
- `CampaignDetail` (mestre): mover "Editar Plot" para Header (slot à direita) e manter "Voltar" no Header; usar `CardBody` apenas para conteúdo.
- Em páginas com múltiplas ações, priorizar CTA principal no `StickyCTA` e secundárias no `CardFooter` para desktop.

## PWA e Offline
- Sem alterações de SW; respeitar banner existente.
- Nos `StickyCTA`, detectar `online` via `useNetworkStatus` (`src/hooks/useNetworkStatus.ts`) para desabilitar e notificar.

## Critérios de Aceite
- Cabeçalho presente e consistente em todas as telas principais, com título correto e botão Voltar quando aplicável.
- CTAs principais visíveis no mobile sem necessidade de scroll, respeitando safe-area.
- Tabs exibem rótulos com ícones e navegam corretamente por papel.
- Build e testes passam: `npm run lint`, `npm run test:ci`, `npm run build`.

## Impacto em Arquivos
- Novos: `src/components/layout/Header.tsx`, `src/contexts/TitleContext.tsx`, `src/components/layout/StickyCTA.tsx`.
- Alterações: `src/components/layout/AppLayout.tsx`, `src/components/layout/BottomTabs.tsx`, páginas de campanhas/sessões/fichas/PDMs para setar título e usar `StickyCTA`.

## Riscos e Mitigações
- Título não disponível imediatamente: fallback heurístico; atualizar ao carregar dados.
- Conflito com actions existentes em `CardFooter`: manter compatível (desktop) e priorizar sticky no mobile.
- Acessibilidade: manter textos claros e contraste; `Tabs` com roles ARIA já implementados.

## Próxima Etapa
Com a sua confirmação, implemento os componentes (`Header`, `TitleContext`, `StickyCTA`), integro no layout e ajusto as páginas e Tabs dentro da branch `feature/fase-22-mobile-nav`. Deseja que eu avance?