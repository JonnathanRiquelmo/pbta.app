## Objetivo
Implementar o fluxo de autenticação e detecção de papéis com Google e e‑mail/senha de contas de teste, persistindo `users/{uid}` e redirecionando conforme papel.

## Contexto Atual
- Framework: React + Vite; roteamento com `react-router-dom`; store com Zustand.
- Rotas e guards já definidos: `/login`, `/dashboard/master`, `/dashboard/player` com `RequireAuth` e `RequireRole`.
- Auth gate: `src/auth/firebase.ts` (sem Firebase configurado → usa stubs). Stubs presentes em `src/auth/stubAuth.ts` com contas de teste.

## Escopo
- Não alterar outros módulos além de `auth` e integração mínima com store e página de login.
- Suportar dois caminhos: Firebase (quando configurado) e Stub local em memória (quando não).

## Implementação
### Tipos e Regras de Papel
- Atualizar `src/auth/types.ts` para incluir `createdAt` em `User`.
- Regra: `email === "jonnathan.riquelmo@gmail.com"` → `role: "master"`; caso contrário → `role: "player"`.

### Serviço de Auth (Gate Firebase/Stub)
- `src/auth/firebase.ts`:
  - Se variáveis Firebase existirem: implementar Google Sign-In e Sign-Out via `firebase/auth`; opcionalmente `signInWithEmailAndPassword` restrito às contas de teste.
  - Se não configurado: delegar para `src/auth/stubAuth.ts`.

### Persistência de Usuários
- Criar `src/auth/userRepo.ts` para abstrair `upsertUser(user)`:
  - Firebase ativo: `Firestore` em `users/{uid}` com `{ email, displayName, role, createdAt }` (merge/update).
  - Stub: persistência em memória (objeto `usersByUid`) no escopo do módulo.

### Hook de Autenticação
- `src/auth/useAuth.ts`:
  - Unificar métodos `loginWithGoogle`, `loginWithEmail`, `logout` chamando o gate (`firebase.ts`) e `userRepo.upsertUser`.
  - Após login, calcular papel pela regra e gravar em store: `setUser({ uid, email, displayName, role, createdAt })`.

### Página de Login
- `src/auth/Login.tsx`:
  - Botão “Entrar com Google” que chama `loginWithGoogle()`.
  - Form de e‑mail/senha para contas de teste:
    - Mestre: `master.teste@pbta.dev` / `Test1234!`
    - Jogador: `player.teste@pbta.dev` / `Test1234!`
    - Outros: exibir erro "credenciais de teste inválidas".

### Logout e Guards
- `src/shared/store/appStore.ts`:
  - Garantir que `logout()` limpe `user`, `role` e estado derivado; `Header.tsx` já chama.
- `src/auth/guards.tsx` permanece, usando `user` e `role` da store.

### Redirecionamentos
- Após autenticar:
  - Se `role === 'master'` → navegar para `/dashboard/master`.
  - Se `role === 'player'` → navegar para `/dashboard/player`.
- Em `RequireAuth`/`RequireRole` já há bloqueio e redirect para `/login` quando deslogado.

## Validação
- Cenário Stub (sem `.env` Firebase):
  - Login Google (stub) → cria/atualiza usuário em memória → redireciona conforme papel.
  - Login e‑mail/senha: aceitar apenas contas de teste; demais mostram erro.
  - Logout: limpar store e voltar para `/login`.
- Cenário Firebase (com `.env`):
  - Google Sign‑In real; `userRepo` grava em `Firestore`.
  - E‑mail/senha opcionalmente limitado às contas de teste.

## Arquivos Afetados
- `src/auth/types.ts`
- `src/auth/firebase.ts`
- `src/auth/stubAuth.ts`
- `src/auth/userRepo.ts` (novo)
- `src/auth/useAuth.ts`
- `src/auth/Login.tsx`
- `src/shared/store/appStore.ts`

## Observações
- Manter nomes e padrões existentes (Zustand store, hooks, guards, rotas).
- Não expor segredos; variáveis de ambiente apenas via `import.meta.env`.
- Sem mudanças em rotas existentes — apenas usa redirecionamentos após login.