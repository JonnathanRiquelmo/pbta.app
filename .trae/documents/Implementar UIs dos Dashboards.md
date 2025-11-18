## Escopo e Diretrizes
- Implementar somente UI conforme `c:\Users\jonna\Documents\pbta.app\.prompts\03-dashboards-ui.txt`.
- Não adicionar lógica complexa, CRUD ou convites.
- Usar dados mockados em memória quando necessário.
- Preservar roteamento existente (`src/routes/index.tsx:22-36`).

## Locais de Código
- Atualizar `src/shared/pages/DashboardMaster.tsx:1-3`.
- Atualizar `src/shared/pages/DashboardPlayer.tsx:1-3`.
- Manter layout e estilos atuais (`src/shared/layout/AppLayout.tsx:3-9`, `src/shared/theme.css`).

## Dashboard do Mestre
- Cabeçalho e descrição simples dentro de `.container`.
- Ações rápidas em um `.card`:
  - Botões visuais: `Criar campanha`, `Movimentos`, `Sessões` (sem navegação/ação funcional).
- Lista de campanhas do mestre (placeholder) em outro `.card`:
  - Renderizar 3–5 itens mock com `nome` e `id`.
  - Exibir botão `Abrir` desabilitado ou sem handler, mantendo UI sem lógica.

## Dashboard do Jogador
- Campo para colar token de convite em um `.card`:
  - `input` de token e botão `Usar token` sem handler funcional.
- Lista de campanhas aceitas (placeholder) em `.card`:
  - Renderizar 2–4 itens mock com `nome` e `id`.
- CTA "Criar sua Ficha" quando não houver ficha:
  - Exibir um botão destacado em `.card` condicionado a um mock `hasCharacter = false`.

## Mocks e Estado
- Definir arrays/flags mock localmente dentro de cada componente.
- Não integrar com stores ou backend; somente renderização estática.

## Navegação e Rotas
- Não alterar rotas existentes:
  - Mestre: `'/dashboard/master'` → `DashboardMaster` (`src/routes/index.tsx:22-27`).
  - Jogador: `'/dashboard/player'` → `DashboardPlayer` (`src/routes/index.tsx:29-35`).
- Não criar novas rotas para ações rápidas.

## Estilo e Consistência
- Usar classes existentes: `.container`, `.card`, `button`, `input` (`src/shared/theme.css:14-22`).
- Seguir o padrão visual do `Header` e do `AppLayout`.

## Validação
- Após implementação, abrir a aplicação e verificar:
  - Renderização correta das duas páginas protegidas por papel.
  - Presença das seções e botões exigidos.
  - Ausência de efeitos colaterais (nenhuma navegação/ação funcional).

## Entregáveis
- `DashboardMaster.tsx` com ações rápidas e lista mock de campanhas.
- `DashboardPlayer.tsx` com campo de token, lista mock e CTA de ficha.
- Nenhuma alteração em roteamento, stores ou backend.