# Objetivo
Aprimorar a navegação mobile/PWA com:
- Títulos contextuais em páginas públicas (Sheet/NPC).
- Ações recorrentes de compartilhamento movidas para o Header com ícones persistentes (🔗), mantendo CTAs principais sticky.

## Escopo
- Páginas alvo para títulos contextuais:
  - `src/components/sheets/SheetPublicView.tsx`
  - `src/components/public/PublicCharacterView.tsx`
  - `src/components/public/PdmPublicView.tsx`
- Páginas alvo para ações de compartilhamento no Header:
  - `src/components/sheets/SheetEditor.tsx`
  - `src/components/pdms/PdmEditor.tsx`
  - `src/components/sheets/SheetForm.tsx` (após criação, compartilhar não se aplica)
  - `src/components/pdms/PdmForm.tsx` (após criação, compartilhar não se aplica)
  - Páginas públicas: ação “Copiar link” do próprio endereço.

## Implementação Técnica
### 1) Títulos Contextuais nas Páginas Públicas
- Importar `useTitle` e executar `setTitle(name)` quando os dados forem carregados.
- Fallbacks: 'Ficha Pública' (character), 'NPC Público' (PDM) quando o nome não estiver disponível.
- Limpar o título no unmount (`return () => setTitle('')`).
- Arquivos:
  - `src/components/sheets/SheetPublicView.tsx`: após obter `character`, `setTitle(character.name ?? 'Ficha Pública')`.
  - `src/components/public/PublicCharacterView.tsx`: se este for o componente público geral de personagem, aplicar o mesmo padrão.
  - `src/components/public/PdmPublicView.tsx`: após obter `npc`, `setTitle(npc.name ?? 'NPC Público')`.

### 2) Ações de Compartilhamento no Header
- Usar `TitleContext.setActions` para injetar botões no Header:
  - `SheetEditor.tsx`:
    - Se `shareToken` existir: ação "Copiar Link Público" (🔗) → `navigator.clipboard.writeText('#/public/character/'+shareToken)`.
    - Se não existir: ação "Gerar Link Público" (🔗) que chama `handleGenerateLink()` e, ao sucesso, também copia.
    - Manter CTA sticky "Salvar" como primário.
  - `PdmEditor.tsx`: replicar lógica com rota de NPC (`#/public/npc/…`).
  - Páginas públicas (`SheetPublicView`, `PdmPublicView`): ação "Copiar link" (🔗) que copia `location.href` (não exige token).
- Offline: desabilitar ações quando `!online` e usar `Toast` para feedback.
- Limpeza: `return () => setActions([])` no unmount.

### 3) UI/UX e Acessibilidade
- Ícone persistente via `Button iconLeft` com texto claro (ex.: "Gerar Link", "Copiar Link Público").
- Respeito ao design system (sem novos componentes): usar `Button` existente.
- Header continua com "Voltar" + título dinâmico; StickyCTA permanece para ações principais.

### 4) Validação
- `npm run lint`, `npm run test:ci`, `npm run build`.
- Verificar comportamento offline (banner + desabilitar compartilhamento).
- Testar nas rotas públicas e editores com e sem tokens.

## Critérios de Aceite
- Páginas públicas exibem o título do recurso quando disponível.
- Compartilhamento movido para Header nas páginas editoras e disponível nas públicas.
- Ícones (🔗) e rótulos adequados; ações desabilitadas offline.
- Build e testes passam.

## Riscos e Mitigações
- Dados assíncronos: aplicar fallback de título, atualizar ao carregar.
- UX duplicada (Header vs conteúdo): remover botões de gerar/copiar do corpo quando migrados para o Header.
- Clipboard indisponível em alguns navegadores: manter tratativas de erro em `Toast`.

## Sequência
1) Aplicar `setTitle` nas páginas públicas.
2) Migrar ações de compartilhar/gerar para o Header em `SheetEditor` e `PdmEditor` (remover duplicatas no corpo).
3) Adicionar ação "Copiar link" nas páginas públicas.
4) Validar offline e executar build e testes.

Confirma para eu implementar agora na branch `feature/fase-22-mobile-nav`?