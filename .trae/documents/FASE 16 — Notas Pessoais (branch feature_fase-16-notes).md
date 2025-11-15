## Branch
- Criar a branch seguindo o mapeamento: `feature/fase-16-notes`.
- Comandos: `git checkout -b feature/fase-16-notes` e push após implementação.

## Entidades e Modelos
- Coleção Firestore: `notes`.
- Modelo `Note`: `id`, `ownerUid`, `type: 'character' | 'session' | 'global'`, `title?`, `content?`, `tags?: string[]`, `updatedAt`.
- Modelo `NoteInput`: sem `id` e com campos editáveis.

## Service (src/services/notes.service.ts)
- Seguir padrão dos services existentes (Firestore + bypass).
- Métodos: `createNote(input)`, `updateNote(id, partial)`, `deleteNote(id)`.
- Bypass: usar `localStorage` com chave `bypass:notes` quando `VITE_TEST_BYPASS_AUTH === 'true'`.

## Hook (src/hooks/useNotes.ts)
- Ler notas do usuário autenticado (`ownerUid` via `AuthContext`).
- Query Firestore: `where('ownerUid','==',user.uid)` com `onSnapshot`.
- Bypass: ler de `localStorage('bypass:notes')`.
- Retornar `{ items, count, loading, error }` e utilitários para refresh.

## Página (src/pages/Notes.tsx)
- Substituir a rota stub de `/notes` por página funcional.
- Layout: lista de notas + editor (criar/editar/excluir).
- Usar `useNotes` e `notes.service.ts` para CRUD.

## Offline (rascunho)
- Detectar status com `useNetworkStatus`.
- Quando offline: desabilitar ações de rede e salvar rascunhos locais em `localStorage('drafts:notes')`.
- Indicar visualmente notas com rascunho pendente; oferecer ação de “Sincronizar” quando voltar online.

## Router (src/router.tsx)
- Trocar `{ path: '/notes', element: <PageStub title="Notes" /> }` por `{ path: '/notes', element: <Notes /> }`.
- Manter guards existentes (Auth/Mode) se aplicáveis à rota.

## Segurança e ACL
- `ownerUid` obrigatório; operações limitadas ao usuário atual.
- Não expor notas de outros usuários; filtrar sempre por `ownerUid`.

## Testes
- Unit de service: caminhos Firestore e bypass.
- Componente: render lista/edição e comportamento offline (botões desabilitados, rascunho salvo).

## Entregáveis
- `src/services/notes.service.ts` (CRUD + bypass).
- `src/hooks/useNotes.ts` (leitura reativa + bypass).
- `src/pages/Notes.tsx` (UI funcional).
- Atualização de `src/router.tsx` para a página.

## Critérios de Aceite
- Criação/edição funcionam com bloqueio de ações de rede quando offline.
- Rascunhos offline persistem e sincronizam ao voltar online.
- Lista e contagem refletem o estado atual (online/bypass).

## Passos de Execução
- Criar branch: `git checkout -b feature/fase-16-notes`.
- Implementar service, hook e página conforme padrões.
- Substituir rota `/notes` no router.
- Validar offline/online com `useNetworkStatus` e Firestore persistente.
- Executar testes e preparar PR na branch `feature/fase-16-notes`. 