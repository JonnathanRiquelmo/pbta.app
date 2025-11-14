## Estado Atual
- Login com Google já implementado em `src/pages/Login.tsx:5-13` usando `signInWithPopup`.
- Proteções por rota existentes: `AuthGuard` (`src/components/auth/AuthGuard.tsx:6-19`) e `ModeGuard` com e-mail fixo (`src/components/auth/ModeGuard.tsx:5-8`).
- Rotas configuradas em `src/router.tsx:12-58` para `/dashboard` e área `/master`.
- Contextos globais inexistentes (`src/contexts/index.ts` vazio). Não há `GoogleLoginButton.tsx`.

## Objetivo
- Centralizar estado de autenticação e modo (PLAYER/MASTER) em contextos.
- Criar botão de login reutilizável e definir redirecionamento pós-login conforme o modo.
- Preparar `isMaster` com e-mail fixo e base para coleção `masters`.

## Implementação Técnica
### 1) AuthContext
- Arquivo: `src/contexts/AuthContext.tsx`.
- Expor `user`, `loading`, `signInWithGoogle()`, `signOut()`.
- Implementar `onAuthStateChanged(auth, ...)` para manter `user` e `loading`.
- Tipar `user` com `firebase.User | null`.

### 2) ModeContext
- Arquivo: `src/contexts/ModeContext.tsx`.
- Expor `mode: 'PLAYER' | 'MASTER'`, `isMaster(email?: string): boolean`.
- Regra inicial: email fixo `'jonnathan.riquelmo@gmail.com'` → MASTER; demais → PLAYER.
- Estrutura para futura checagem em Firestore (`masters`), mantendo assinatura síncrona com cache (opcional iniciar como `false` quando desconhecido).

### 3) Providers
- Envolver `<RouterProvider router={router} />` com `<AuthProvider>` e `<ModeProvider>` em `src/main.tsx`.

### 4) GoogleLoginButton
- Arquivo: `src/components/auth/GoogleLoginButton.tsx`.
- Usar `signInWithGoogle()` do `AuthContext`.
- Após sucesso, usar `ModeContext` para decidir destino: MASTER → `'/master'`, PLAYER → `'/dashboard'`.
- Prop opcional `redirectOverride?: string` para cenários futuros.

### 5) Login Page
- Atualizar `src/pages/Login.tsx` para renderizar `<GoogleLoginButton />`.
- Se já autenticado, redirecionar imediatamente conforme modo.

### 6) Guards
- `AuthGuard`: consumir `AuthContext` (`user`, `loading`) em vez de instância direta do `auth`.
- `ModeGuard`: consumir `ModeContext.isMaster()` em vez de ler `auth.currentUser` diretamente.

### 7) Fundação para `masters`
- Criar util opcional `src/services/masters.ts` com leitura da coleção `masters` por email.
- Deixar integração real para fase futura; nesta fase, `isMaster` cumpre critério com e-mail fixo.

## Critérios de Aceite
- Usuário loga com Google e é redirecionado para `'/master'` quando master, caso contrário para `'/dashboard'`.
- `isMaster` retorna verdadeiro para `'jonnathan.riquelmo@gmail.com'` e falso para demais emails.

## Validação
- Testar login com email não-master: deve ir para `'/dashboard'` e acessar rotas protegidas comuns.
- Testar login com email master: deve ir para `'/master'` e acessar rotas master; acesso a `/master` negado para não-master via `ModeGuard`.
- Verificar atualização de guards usando contextos sem regressões.

## Entregáveis
- `AuthContext.tsx`, `ModeContext.tsx`, `GoogleLoginButton.tsx` criados.
- `main.tsx`, `Login.tsx`, `AuthGuard.tsx`, `ModeGuard.tsx` atualizados conforme acima.