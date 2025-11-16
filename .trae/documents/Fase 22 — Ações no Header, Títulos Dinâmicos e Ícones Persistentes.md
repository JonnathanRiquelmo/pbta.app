# Objetivo
Migrar ações secundárias para um slot no Header, refinar títulos dinâmicos em editores (Sheets/PDMs) e adicionar ícones persistentes nos botões do Header quando apropriado.

## Abordagem
- Estender o `Header` para suportar um "slot de ações" à direita, controlado por contexto.
- Evoluir `TitleContext` para também gerenciar ações do header.
- Nas páginas, definir título e ações ao carregar os dados (e limpar ao desmontar).
- Usar `Button` do design system com `iconLeft` para ícones persistentes.

## Implementação Técnica
### 1. Contexto de Título e Ações
- Atualizar `src/contexts/TitleContext.tsx`:
  - Adicionar `actions: HeaderAction[]` e `setActions(actions: HeaderAction[])`.
  - Tipo `HeaderAction = { label: string; onClick: () => void; icon?: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }`.
  - Resetar `actions` ao desmontar de cada página (via `useEffect` return).

### 2. Componente Header com Slot de Ações
- Atualizar `src/components/layout/Header.tsx`:
  - Consumir `{ title, actions }` do `TitleContext`.
  - Renderizar à direita uma linha de `Button`s com `iconLeft` (ex.: ✏️, 💾, 🔗) conforme `actions`.
  - Manter título dinâmico e botão "Voltar" já existentes.

### 3. Migração de Ações para o Header
- `CampaignDetail` (`src/components/campaigns/CampaignDetail.tsx`):
  - Se `isMaster()`, mover "Editar Plot" para `setActions([{ label: 'Editar Plot', icon: '✏️', onClick: navigate(`/master/campaigns/${id}/plot`) }])`.
  - Remover o botão equivalente do `CardFooter` para evitar duplicidade.
- Editores principais (mantendo `StickyCTA` como ação primária):
  - `PlotEditor` (`src/components/campaigns/PlotEditor.tsx`): adicionar ação no header "Salvar" (💾) apontando para `handleSave`; manter CTA sticky como primário.
  - `SessionEditor` (`src/components/sessions/SessionEditor.tsx`): idem, ação "Salvar" (💾) no header.
  - `SheetEditor` (`src/components/sheets/SheetEditor.tsx`): se existir `handleSave`, adicionar ação "Salvar" (💾).
  - `PdmEditor` (`src/components/pdms/PdmEditor.tsx`): idem.

### 4. Títulos Dinâmicos em Edtiores
- `SheetEditor`/`SheetForm` (`src/components/sheets/SheetEditor.tsx`, `src/components/sheets/SheetForm.tsx`):
  - `setTitle(character.name)` ao carregar; fallback "Nova Ficha".
- `PdmEditor`/`PdmForm` (`src/components/pdms/PdmEditor.tsx`, `src/components/pdms/PdmForm.tsx`):
  - `setTitle(pdm.name)` ao carregar; fallback "Novo PDM".
- `SessionViewer` (`src/components/sessions/SessionViewer.tsx`):
  - `setTitle(session.title ?? 'Sessão')` ao carregar.

### 5. Ícones Persistentes no Header
- Padrões de ícones (texto/emoji para manter leve):
  - Editar: ✏️ (pencil)
  - Salvar: 💾 (floppy)
  - Compartilhar: 🔗 (link)
  - Visualizar: 👁️ (eye)
- Acessibilidade: manter rótulos textuais nos botões; ícone apenas como apoio visual.

## Arquivos Impactados
- Contexto/Layouts:
  - `src/contexts/TitleContext.tsx` (expandir para ações)
  - `src/components/layout/Header.tsx` (slot de ações à direita)
- Páginas:
  - `src/components/campaigns/CampaignDetail.tsx` (migrar "Editar Plot" para header)
  - `src/components/campaigns/PlotEditor.tsx` (ação salvar)
  - `src/components/sessions/SessionEditor.tsx` (ação salvar)
  - `src/components/sessions/SessionViewer.tsx` (título dinâmico)
  - `src/components/sheets/SheetEditor.tsx`, `src/components/sheets/SheetForm.tsx` (título dinâmico, possível ação salvar)
  - `src/components/pdms/PdmEditor.tsx`, `src/components/pdms/PdmForm.tsx` (título dinâmico, possível ação salvar)

## Critérios de Aceite
- Header exibe ações contextuais nas páginas especificadas, sem duplicar CTAs existentes.
- Títulos das páginas refletem o recurso carregado (nome de campanha, ficha, PDM, sessão) com fallback quando necessário.
- Ícones persistentes aparecem nos botões do header onde aplicável.
- `npm run lint`, `npm run test:ci`, `npm run build` passam.

## Riscos e Mitigações
- Duplicidade de ações (header vs sticky): manter sticky como primário e usar header para ações rápidas; remover duplicatas do conteúdo.
- Dados assíncronos: usar fallback nos títulos e atualizar ao carregar; limpar ações no unmount.
- Acessibilidade: manter texto legível e contraste; ícones como complemento.

## Sequência de Entrega
1) Expandir `TitleContext` e `Header` com suporte a ações.
2) Migrar "Editar Plot" de `CampaignDetail` para o header.
3) Adicionar ação "Salvar" nos editores (`PlotEditor`, `SessionEditor`, `SheetEditor`, `PdmEditor`).
4) Ajustar títulos dinâmicos em `Sheet*`, `Pdm*`, `SessionViewer`.
5) Rodar build e testes; ajustar pontos finos conforme necessário.

Confirma para eu implementar agora dentro da branch `feature/fase-22-mobile-nav`?