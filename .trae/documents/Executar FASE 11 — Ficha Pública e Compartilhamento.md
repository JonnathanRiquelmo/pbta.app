## Branch e Escopo
- Criar a branch: `feature/fase-11-sheet-public` (conforme Gitflow). 
- Implementar visualização somente leitura da ficha e o compartilhamento público via `publicShareId`.

## Rotas
- Substituir os stubs existentes pelas páginas reais:
  - `'/sheets/:id/view'` em `src/router.tsx:36` → usar `SheetPublicView`.
  - `'/public/character/:publicShareId'` em `src/router.tsx:25` → usar `PublicCharacterView`.
- Manter rota pública fora de `AuthGuard` (já está em `baseRoutes`).

## Serviços e Dados
- Acrescentar suporte a compartilhamento no serviço de personagens:
  - Campo `publicShareId?: string` no documento `characters` (ver requisitos em `.trae/Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:175-176`).
  - Função `generatePublicShareId(id, currentUid)` para criar e gravar um token curto e único:
    - Firestore: `updateDoc(doc(db,'characters',id), { publicShareId })`.
    - Bypass: salvar no `localStorage` dentro do item `bypass:characters`.
  - Consulta pública por token: `getCharacterByPublicShareId(publicShareId)`:
    - Firestore: `query(collection(db,'characters'), where('publicShareId','==',token), where('isNPC','==',false))`.
    - Bypass: busca no `localStorage`.
- Seguir o padrão existente de validação de proprietário via `validateSheetUpdate` ao gerar/revogar link (src/utils/validators.ts:1-6).

## Páginas
- `src/components/sheets/SheetPublicView.tsx`:
  - Carrega `characters/:id` (via `onSnapshot`) e renderiza em modo leitura.
  - Usa componentes do design system: `Card`, `Badge`, `Spinner` (`src/components/common/index.ts:1-10`).
  - Mostra `name`, `playbook` e, se existirem, `stats` e `moves`.
- `src/components/public/PublicCharacterView.tsx`:
  - Lê `:publicShareId` e carrega via consulta por token.
  - Renderização idêntica à de leitura, sem elementos de edição.
  - Acessível sem login (rota está em `baseRoutes`).

## UI no Editor
- Em `src/components/sheets/SheetEditor.tsx`:
  - Adicionar ações de compartilhamento para o proprietário:
    - Botão “Gerar link público”: chama `generatePublicShareId` e exibe toast (usar `useToast`).
    - Botão “Copiar link público”: copia `#/public/character/<publicShareId>` para a área de transferência.
  - Manter regras: apenas o dono pode gerar/revogar (seguir `isOwner` já presente em `SheetEditor.tsx:62-63`).

## Analytics e Offline
- Registrar eventos de page view (placeholder simples, sem dependência externa):
  - `SheetPublicView` → `console.info('page_view_sheet_view')`.
  - `PublicCharacterView` → `console.info('page_view_public_character')`.
- Offline: Firestore persistence já habilitada (`firebase/firestore.ts:1-11`). Sem ajustes adicionais nesta fase.

## Verificação
- Fluxo autenticado:
  - Criar ficha e abrir `/sheets/:id/view` para confirmar leitura.
  - Gerar link público e validar que a UI mostra/copia `#/public/character/<token>`.
- Fluxo público:
  - Abrir `/#/public/character/<token>` sem login e conferir renderização.
- Bypass (dev):
  - Com `VITE_TEST_BYPASS_AUTH==='true'`, validar geração/consulta pelo `localStorage` (serviço atual usa bypass em `src/services/characters.service.ts:39-58,96-122`).

## Observações de Segurança
- Com as regras atuais do Firestore (`DOCUMENTO...md:56-65`), leituras públicas sem login em produção não são permitidas.
- A rota pública exibirá conteúdo apenas em ambientes de desenvolvimento com bypass; a liberação real deve ocorrer na FASE 19 (ACL/Security) ajustando regras ou servindo público via backend.

## Arquivos a alterar/criar
- Alterar: `src/router.tsx` (trocar `PageStub` pelas páginas reais).
- Alterar: `src/components/sheets/SheetEditor.tsx` (ações de compartilhamento).
- Alterar: `src/services/characters.service.ts` (gerar/consultar `publicShareId`).
- Criar: `src/components/sheets/SheetPublicView.tsx`.
- Criar: `src/components/public/PublicCharacterView.tsx`.

## Próximo Passo
- Criar a branch `feature/fase-11-sheet-public` e implementar conforme acima, mantendo o estilo e padrões do projeto.