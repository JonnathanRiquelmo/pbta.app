## Branch
- Criar `feature/fase-18-analytics` a partir de `develop` (se existir) ou `main`.
- Padrão conforme Guia de Gitflow (FASE 18).

## Utilitários
- Criar `src/utils/analytics.ts` com:
  - `initAnalytics({ enabled?: boolean })`: liga/desliga coleta, segura execução até app pronto.
  - `logEvent(name: string, params?: Record<string, any>)`: registra eventos em `analytics_events` (Firestore) e faz fallback para `console` se indisponível.
  - Usa `auth.currentUser` para anexar `uid` quando existir; nunca grava dados sensíveis.
- Criar `src/utils/performance.ts` com:
  - `traceOperation<T>(name: string, fn: () => Promise<T>, meta?: Record<string, any>): Promise<T>`: mede duração com `performance.now()`, resultado/sucesso/erro e grava em `performance_traces` (ou `console` se indisponível).
  - Só opera após app estar inicializado.

## Inicialização
- Garantir que a inicialização ocorra apenas depois de `initializeApp` em `firebase/config.ts:15`.
- Em `src/main.tsx` (bootstrap), após importar `../firebase/config`, chamar `initAnalytics({ enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false' })`.
- Os utilitários validam presença de `db` e `auth` antes de gravar.

## Pontos de Instrumentação
- Fichas
  - `src/services/characters.service.ts:41` (`createCharacter`): `logEvent('character:create', { ownerUid, id })` após criação (bypass e Firestore).
- Sessões
  - `src/services/sessions.service.ts:38` (`createSession`): `logEvent('session:create', { campaignId, id })` após criação.
- Rolagens
  - `src/services/rolls.service.ts:30` (`createRoll`): `logEvent('roll:create', { rollerUid, total, id })` após criação.
- Login (Auth)
  - `src/contexts/AuthContext.tsx:45-48` (`signInWithGoogle`): envolver com `traceOperation('auth:google', ...)`.
  - `src/contexts/AuthContext.tsx:54-56` (`signInWithEmail`): `traceOperation('auth:email:login', ...)`.
  - `src/contexts/AuthContext.tsx:58-60` (`signUpWithEmail`): `traceOperation('auth:email:signup', ...)`.
  - `src/contexts/AuthContext.tsx:50-52` (`signOut`): `traceOperation('auth:signout', ...)`.
- Salvamentos (services)
  - Envolver operações de persistência com `traceOperation`:
    - Characters: `createCharacter (characters:create)`, `updateCharacter (characters:update)`, `deleteCharacter (characters:delete)`, `duplicateCharacter (characters:duplicate)`, `generatePublicShareId (characters:share)`.
    - Sessions: `createSession (sessions:create)`, `updateSession (sessions:update)`, `deleteSession (sessions:delete)`.
    - Rolls: `createRoll (rolls:create)`.
    - Campaigns/Notes/Moves/PDMs (mesmo padrão) para consistência.

## Critérios de Aceite
- Eventos e traces só são gravados após `initializeApp`.
- Falha de coleta não interrompe fluxo (fallback para `console`).
- Sem dados sensíveis nos payloads; apenas IDs, tipos e resumo.

## Validação
- Fluxo de login (Google e e-mail) e `signOut`: verificar `traceOperation` no console/Firestore.
- Criar ficha, sessão e rolagem: verificar `logEvent` com dados mínimos.
- Testar ambiente `BYPASS` (auth de teste): utilitários seguem fallback sem quebrar.

## Arquivos tocados
- Novos: `src/utils/analytics.ts`, `src/utils/performance.ts`.
- Alterados: `src/main.tsx`, `src/contexts/AuthContext.tsx`, `src/services/characters.service.ts`, `src/services/sessions.service.ts`, `src/services/rolls.service.ts`.

## Observações
- Sem `measurementId` em `firebase/config.ts`, a implementação será interna (Firestore/console); futura integração com GA/Firebase Performance pode ser adicionada se o `firebaseConfig` incluir as chaves necessárias.
- Mantém estilo e padrões existentes dos services, respeitando caminhos e envs (`VITE_TEST_BYPASS_AUTH`).