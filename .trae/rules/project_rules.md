# Project Rules - PBTA RPG App

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite.
- **State**: Zustand.
- **Backend**: Firebase (Firestore, Auth, Functions).
- **Testes**: Playwright (E2E) e Vitest (Unit).
- **Estilo**: CSS Modules / Global, clsx.

## Arquitetura (Feature-Sliced)
- Organize código por domínio em `src/` (ex: `campaigns`, `auth`, `characters`).
- Use **Path Aliases** (`@shared/*`, `@campaigns/*`) para importações limpas.

## Padrões de Projeto (Conventions)
- **Repository Pattern**: Todo acesso a dados (Firestore) deve ficar em `*Repo.ts`.
  - Use `onSnapshot` para dados em tempo real.
  - Retorne `unsubscribe` functions para limpeza.
- **Hooks**: Isole lógica de estado e efeitos em Custom Hooks.
- **Logging**: Use `logger.ts` de `@shared`, nunca `console.log`.

## Firebase
- Respeite a estrutura de coleções existente.
- Use operações "fire-and-forget" para escritas não bloqueantes quando apropriado, mas trate erros internamente.