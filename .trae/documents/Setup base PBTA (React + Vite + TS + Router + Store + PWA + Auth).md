## Objetivo
Implementar apenas a base do app com React 18 + TypeScript + Vite, React Router v6, store global, stub de Auth/Firebase, PWA, layout base e rotas protegidas, sem lógica de negócio.

## Stack e Dependências
- Base: `react`, `react-dom`, `typescript`, `vite`
- Roteamento: `react-router-dom@6`
- Estado global: `zustand`
- Auth/Firebase: `firebase` (opcional); stub próprio quando não houver config
- PWA: `vite-plugin-pwa`
- Tipos/Qualidade: `@types/react`, `@types/react-dom`

## Estrutura de Pastas
- `src/`
  - `auth/` (stub auth, tipos, guards)
  - `campaigns/` (rotas vazias)
  - `characters/` (rotas vazias)
  - `moves/` (placeholder)
  - `sessions/` (rotas vazias)
  - `rolls/` (placeholder)
  - `shared/` (layout, componentes, utils, tema)
  - `routes/` (definição e composição de rotas)
  - `App.tsx`, `main.tsx`
- `public/manifest.json` (PWA)

## Implementação por Fases
### Fase 1: Bootstrapping Vite + TS
- Inicializar projeto Vite React TS
- Configurar `tsconfig.json` e scripts em `package.json`

### Fase 2: Store Global (Zustand)
- Criar store com `user`, `role`, `currentCampaign`
- Tipar `User` e `Role`

### Fase 3: Autenticação (Stub + Firebase opcional)
- `auth/types.ts`: tipos de usuário
- `auth/stubAuth.ts`: login Google simulado e email/senha restrito
  - Google: retorna `{ uid, email, displayName, role }`; `role = "master"` quando `email === "jonnathan.riquelmo@gmail.com"`, senão `"player"`
  - Email/senha: aceitar apenas
    - Mestre: `master.teste@pbta.dev` / `Test1234!` → `role: "master"`
    - Jogador: `player.teste@pbta.dev` / `Test1234!` → `role: "player"`
  - Outras credenciais: lançar erro `"credenciais de teste inválidas"`
- `auth/firebase.ts` (opcional): wrapper que usa Firebase se variáveis existirem; cai para stub caso contrário
- `auth/useAuth.ts`: hooks simples para login/logout e atualização da store

### Fase 4: Guards e Roteamento
- `routes/index.tsx`: declarar rotas exigidas
  - `/login`, `/dashboard/master`, `/dashboard/player`, `/campaigns/:id`, `/characters/:id`, `/sessions/:id`
- `auth/guards.tsx`: `RequireAuth` (bloqueia não autenticados) e `RequireRole` (redireciona por `role`)
- Páginas de casca (placeholders) em cada pasta; sem lógica de negócio

### Fase 5: Layout e Tema
- `shared/layout/AppLayout.tsx`: Header + Container
- `shared/components/Header.tsx`: título/logo placeholder e botão logout
- Tema mobile-first: CSS base com variáveis; tipografia, espaçamento, cores; dark-ready

### Fase 6: PWA
- `vite.config.ts`: configurar `vite-plugin-pwa` (register, manifest, assets)
- `public/manifest.json`: nome, ícones placeholder, tema, scope
- Service worker via plugin (sem lógica extra)

### Fase 7: Integração Inicial e Navegação
- `main.tsx`: `RouterProvider` + App
- `App.tsx`: layout + rotas, proteção e redirecionamentos por `role`

## Regras e Restrições
- Não criar telas de negócio; somente placeholders e navegação
- Não modificar outros módulos além do setup
- Usar variáveis de ambiente para Firebase; nunca commitar segredos
- Se Firebase ausente: sempre usar stub

## Validação
- Subir dev server e verificar:
  - Rotas existem e são protegidas
  - Login stub Google retorna corretamente as `roles`
  - Email/senha aceita apenas contas de teste; demais bloqueadas com erro
  - PWA registra service worker e `manifest.json` é servido

## Entregáveis
- Projeto Vite React TS com dependências instaladas
- Pastas `auth/`, `campaigns/`, `characters/`, `moves/`, `sessions/`, `rolls/`, `shared/`, `routes/`
- Store global funcional
- Guards de rota e placeholders
- PWA configurado (manifest + SW via plugin)
- Stub de Auth com Google + email/senha restrito