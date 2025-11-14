# Design System — pbta.app

## Princípios

- Mobile-first, adaptativo, touch-friendly, acessível
- Clareza visual com alto contraste, foco visível e hierarquia de informação
- Consistência: mesma linguagem visual em todas as páginas (PLAYER/MASTER)

## Tokens

- Cores
  - Primary: `#0F172A`
  - Accent: `#7C3AED`
  - Success: `#22C55E`
  - Warning: `#F59E0B`
  - Danger: `#EF4444`
  - Surface: `#FFFFFF`
  - Muted: `#64748B`
- Tipografia
  - Fonte: `system-ui, Inter, Segoe UI`
  - Tamanhos: `xs 12`, `sm 14`, `base 16`, `lg 18`, `xl 20`, `2xl 24`
  - Peso: `400`, `600`
- Espaçamento
  - Escala: `4, 8, 12, 16, 24, 32`
- Bordas e Sombra
  - Radius: `8` (botões/inputs), `12` (cards/modais)
  - Shadow: `0 4px 12px rgba(15,23,42,0.12)`
- Breakpoints
  - `sm 375+`, `md 768+`, `lg 1024+`

## Componentes

- Button (primary, secondary, outline, ghost, danger; sm/base/lg)
- Input (text, number, textarea; estados: focus, error, disabled)
- Card (título, conteúdo, ações)
- Modal (título, conteúdo, footers)
- Tabs (largura total em mobile; alto contraste)
- Loading (spinner e skeleton)
- Badge/Tag (status e interpretações da rolagem)
- Toast (feedback de ações)
- Avatar (iniciais do usuário)
- EmptyState (mensagens de vazio com CTA)

## Layout

- Header
  - Branding, indicador de modo (`PLAYER`/`MASTER`), ações rápidas
- Navegação
  - Mobile: tabs ou bottom-nav
  - Tablet/Desktop: sidebar persistente
- Conteúdo
  - Container `max-width 960` em desktop; padding `16`

## Acessibilidade

- Focus ring visível em todos os elementos interativos
- Contraste mínimo `AA 4.5:1`
- Tamanhos de toque `≥42px`
- ARIA nos modais, tabs e listas

## Offline-aware

- Banner de modo offline persistente
- Desabilitar ações que dependem do Firestore
- Sincronizar automaticamente ao reconectar