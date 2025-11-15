## Branch de Trabalho
- Criar branch a partir da `main` seguindo o guia Gitflow: `feature/fase-10-sheets-crud`.
- Comandos:
  - `git checkout main`
  - `git pull`
  - `git checkout -b feature/fase-10-sheets-crud`

## Escopo e Critérios
- Implementar lista, criação e edição de fichas do jogador.
- Validar ownership: apenas o proprietário (`ownerUid`) pode editar/excluir.
- Rotas já mapeadas em `src/router.tsx`: `'/sheets'`, `'/sheets/new'`, `'/sheets/:id'`.
- Aceite: jogador cria/edita apenas as próprias fichas.

## Serviços
- `src/services/characters.service.ts`:
  - `createCharacter(input, ownerUid): Promise<string>` — cria doc em `characters` com `isNPC=false`.
  - `updateCharacter(id, partial, currentUid): Promise<void>` — carrega doc, valida com `validateSheetUpdate`, então aplica `updateDoc`.
  - `deleteCharacter(id, currentUid): Promise<void>` — valida `ownerUid` antes de remover.
  - `duplicateCharacter(id, currentUid): Promise<string>` — duplica dados para novo doc com `ownerUid=currentUid` e sufixo no `name`.
- Tipos flexíveis: `CharacterInput` com campos opcionais (`name`, `playbook`, `stats`, `moves`, etc.), preservando `ownerUid` e `isNPC`.

## Validador de Segurança
- `src/utils/validators.ts`:
  - `validateSheetUpdate(userUid: string, sheet: { ownerUid?: string }): void` — lança `Unauthorized` se `userUid !== sheet.ownerUid`.
  - Export do helper para uso nos serviços e em componentes.

## Páginas e Componentes
- `src/components/sheets/SheetList.tsx`:
  - Usa `useCharacters()` para listar fichas do usuário.
  - Filtros locais por nome; ações: abrir editor, duplicar; botão “Nova ficha”.
  - Bloqueio básico quando offline (`useNetworkStatus()`): desabilita criar/duplicar.
- `src/components/sheets/SheetForm.tsx`:
  - Form mínimo: `name` (obrigatório) e `playbook` (opcional) com `Button`/`Input`.
  - Salva via `createCharacter` com `ownerUid = user.uid`; feedback com `useToast()`.
  - Desabilita envio quando offline.
- `src/components/sheets/SheetEditor.tsx`:
  - Carrega `characters/:id` via `onSnapshot`; mostra campos básicos.
  - Salva via `updateCharacter(id, partial, user.uid)` com validação de ownership.
  - Desabilita salvar quando offline; mostra erros via `useToast()`.

## Rotas
- Atualizar `src/router.tsx` para substituir `PageStub` pelas novas páginas:
  - `'/sheets'` → `SheetList`
  - `'/sheets/new'` → `SheetForm`
  - `'/sheets/:id'` → `SheetEditor`
  - Referências: `src/router.tsx:20-27` (rotas de Sheets existentes).

## Reuso de UI
- Reutilizar componentes existentes: `Card`, `Button`, `Input`, `Tabs`, `EmptyState`, `Spinner`, `ToastProvider` (`src/components/common/index.ts`).
- Não criar `SheetCard` agora; usar `Card` simples para manter consistência e reduzir escopo.

## Offline
- Usar `src/hooks/useNetworkStatus.ts` para estado de rede.
- Desabilitar ações de criação/duplicação/edição quando `!online`; leitura continua via cache do Firestore.

## Testes
- Adicionar teste de segurança:
  - `tests/security.test.ts` validando `validateSheetUpdate` impede atualização por não proprietário.
- Rodar suíte com `npm test` (Vitest já configurado em `vite.config.ts`).

## Verificação
- Manual:
  - Acessar `/dashboard` → cartões mostram contagem de “Fichas”.
  - Navegar para `/sheets` e conferir lista com filtro.
  - Criar nova ficha em `/sheets/new`; validar feedback e navegação.
  - Editar ficha em `/sheets/:id`; tentar editar como outro usuário deve falhar.
- Automática:
  - Executar testes unitários de validação.

## Entregáveis
- Novos arquivos: serviços (`characters.service.ts`), util (`validators.ts`), componentes (`SheetList.tsx`, `SheetForm.tsx`, `SheetEditor.tsx`).
- Atualização de rotas em `src/router.tsx`.
- Teste `tests/security.test.ts`.

## Próximos Passos
- Após aprovação da execução, criar a branch `feature/fase-10-sheets-crud` e implementar conforme acima.
