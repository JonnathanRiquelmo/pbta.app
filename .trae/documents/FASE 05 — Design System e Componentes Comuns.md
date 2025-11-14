## Contexto do Projeto
- React 18 + TypeScript + Vite; sem framework de estilos existente; Testing Library e Vitest disponíveis.
- Sem Design Tokens; sem PWA/manifest; acessibilidade básica.
- Estrutura atual útil: `src/components/common/` (placeholder), `src/contexts/`, `src/hooks/`, `src/pages/`.

## Objetivo
- Implementar tokens visuais (tipografia, cores, espaçamentos, radius, sombras) e componentes comuns acessíveis, mobile-first.
- Componentes: Button, Input, Card, Loading, Modal, Tabs, Badge, Toast, Avatar, EmptyState.
- Atender estados `loading/disabled/error`, contraste AA e áreas de toque ≥42px.

## Entregáveis
1. Tokens globais e base CSS (importados no app).
2. Biblioteca de componentes em `src/components/common/` com exports tipados.
3. Testes de acessibilidade e interação (Vitest + Testing Library).
4. Hooks utilitários mínimos (rede/offline, foco, portal).

## Estrutura de Pastas
- `src/styles/tokens.css` — variáveis CSS de tema (cores, espaçamentos, radius, sombras, tipografia).
- `src/styles/base.css` — reset leve, padrões mobile-first, utilitários focados em acessibilidade.
- `src/components/common/` — cada componente em pasta própria:
  - `button/`, `input/`, `card/`, `loading/`, `modal/`, `tabs/`, `badge/`, `toast/`, `avatar/`, `empty-state/` (cada uma com `index.ts`, `*.tsx`, `*.css`).
- `src/hooks/` — `useNetworkStatus.ts`, `usePortal.ts`.

## Tokens (CSS Variables)
- Tipografia: escala (`--font-size-xs/sm/base/lg/xl/2xl`), linha (`--line-height-tight/normal/relaxed`), família (`--font-sans`).
- Cores: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-primary`, `--color-success`, `--color-warning`, `--color-danger`, com pares `*-on` para contraste.
- Espaçamentos: `--space-0/1/2/3/4/6/8/12/16` (rem-based).
- Radius: `--radius-sm/md/lg/full`.
- Sombras: `--shadow-sm/md/lg` com foco visível (`--focus-ring`).
- Alvo de toque: `--tap-target-min: 44px` (≥42px exigido).

## Base CSS
- Reset moderno (box-sizing, antialiasing, remove estilos padrão problemáticos).
- Foco visível com `:focus-visible` usando `--focus-ring`.
- Preferência de usuário: respeitar `prefers-reduced-motion`.
- Contêiner responsivo, tipografia base (mobile-first), utilitários mínimos (`.sr-only`, `.visually-hidden`, `.truncate`).

## Componentes e APIs
- Button
  - Props: `variant (primary/secondary/ghost)`, `size (sm/md/lg)`, `disabled`, `loading`, `icon`, `fullWidth`.
  - Acessibilidade: `aria-busy` quando `loading`, foco visível, área ≥ `--tap-target-min`.
- Input
  - Props: `label`, `name`, `value`, `onChange`, `placeholder`, `type`, `error`, `helperText`, `disabled`, `required`.
  - A11y: `id/for`, `aria-invalid`, `aria-describedby`.
- Card
  - Estrutura: `Card`, `CardHeader`, `CardBody`, `CardFooter` com padding/elevação.
- Loading
  - `Spinner` com `role="status"` e `aria-live="polite"`; opção `inline/block`.
- Modal
  - Props: `open`, `onClose`, `title`, `children`.
  - A11y: foco aprisionado, fechar via `Esc`, `aria-modal`, `role="dialog"`, `aria-labelledby/aria-describedby`, portal (`usePortal`).
- Tabs
  - Props: `items [{id,label,content}]`, `value`, `onChange`.
  - A11y: `role="tablist"`, teclas setas/home/end, `aria-selected`, `aria-controls`.
- Badge
  - Props: `variant (neutral/success/warning/danger)`, `soft/solid`, `icon`.
- Toast
  - `ToastProvider` + `useToast()`; fila de mensagens; `aria-live="polite"`.
  - Offline-aware: integração com `useNetworkStatus` para avisos.
- Avatar
  - Props: `src`, `alt`, `fallback` (iniciais), `size`, `status`.
  - A11y: `alt` obrigatório; fallback acessível.
- EmptyState
  - Props: `icon`, `title`, `description`, `action` (render de botão).

## Acessibilidade
- Contraste: paleta com contraste AA (≥4.5:1 texto normal; ≥3:1 grandes).
- Foco: sempre visível; não removido.
- Teclado: todos interativos navegáveis; Modal/Tabs com navegação correta.
- ARIA: apenas quando necessário; `aria-*` coerentes com estado (`loading/disabled/error`).
- Motion: animações respeitam `prefers-reduced-motion`.

## Offline-aware
- `useNetworkStatus`: expõe `online` e eventos `online/offline` do navegador.
- `Toast` mostra perda/retomada de conectividade; componentes evitam chamadas que exigem rede quando `offline` (onde aplicável).

## Testes
- Unitários e de interação (Testing Library):
  - Button: estados `loading/disabled`; acionamentos; foco.
  - Input: `aria-*`, erro, helper, label.
  - Modal: abertura/fechamento, trap de foco, `Esc`.
  - Tabs: teclado e seleção.
  - Toast: fila e `aria-live`.
  - Avatar: fallback e `alt`.
  - EmptyState: render e ação.
- A11y smoke: roles e atributos esperados; snapshots mínimos.

## Integração
- Importar `tokens.css` e `base.css` no bootstrap (`src/main.tsx` ou `index.html`).
- Exportar todos os componentes via `src/components/common/index.ts`.
- Substituir usos existentes (ex.: botões de login) pelos novos componentes gradualmente.

## Critérios de Aceite e Verificação
- Estados `loading/disabled/error` presentes e funcionais.
- Contraste AA validado na paleta.
- Tap targets com altura ≥ `--tap-target-min`.
- Teclado e ARIA conforme descrito; testes passam.

## Fases de Implementação
1. Criar `tokens.css` e `base.css`; importar no app.
2. Implementar Button e Input; validar estados e a11y.
3. Implementar Card, Loading, Badge.
4. Implementar Modal e Tabs com navegação de teclado.
5. Implementar Toast com provider e `useNetworkStatus`.
6. Implementar Avatar e EmptyState.
7. Escrever testes; ajustar contraste e foco.
8. Integrar em páginas corrente (Login, Dashboard) e revisar.

## Dependências (opcionais)
- Sem dependências novas (prioridade). Se necessário, considerar `clsx` para composição de classes (leve) e `eslint-plugin-jsx-a11y` para lint de a11y.
