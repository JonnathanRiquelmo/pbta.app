## Branch
- Criar a branch seguindo o Gitflow: `feature/fase-15-roller-profile`.
- Comandos: `git checkout -b feature/fase-15-roller-profile` e `git push -u origin feature/fase-15-roller-profile`.

## Implementação Core
- Adicionar `src/utils/pbta.ts` com `roll2d6(mod)` que retorna `{ dice, total, result }` classificando PBTA: `<7 miss`, `7–9 hit-7-9`, `>=10 hit-10+`.
- Exportar em `src/utils/index.ts`.

## Serviço de Rolagens
- Criar `src/services/rolls.service.ts` com `createRoll(input)` seguindo padrão BYPASS/Firestore.
  - BYPASS: persiste em `localStorage('bypass:rolls')` com `id` e `timestamp` ISO.
  - Firestore: `addDoc(collection(db, 'rolls'), { ...input, timestamp: new Date() })`.
- Exportar em `src/services/index.ts`.

## Hooks existentes
- Reusar os hooks já prontos:
  - `src/hooks/useRolls.ts:22-59` lista rolagens do usuário atual (`useRolls`).
  - `src/hooks/useRollsAll.ts:21-47` lista todas as rolagens (painel do mestre).

## Componentes UI
- `src/components/roller/DiceRoller.tsx`: executa `roll2d6`, exibe resultado e salva via `createRoll` (usa `useAuth` e `useToast`).
- `src/components/roller/RollHistory.tsx`: consome `useRolls` para listar histórico do usuário com UI de `Card`/`EmptyState`.
- `src/components/roller/RollMonitor.tsx`: consome `useRollsAll` para painel global do mestre.

## Páginas
- Atualizar `src/pages/Roller.tsx:1-6` para renderizar `<DiceRoller />` e `<RollHistory />`.
- Atualizar `src/pages/Profile.tsx:1-7` para exibir histórico do próprio usuário via `<RollHistory />` dentro de `Card`.

## Rotas do Mestre
- Substituir stub da rota `/master/rolls` por `RollMonitor`.
  - `src/router.tsx:71` trocar `PageStub` por `<RollMonitor />` com import adequado.
  - Guarda de modo mestre já está em `src/components/auth/ModeGuard.tsx:4-8` e `src/contexts/ModeContext.tsx:21-28`.

## Testes
- Criar testes unitários com `vitest` para:
  - `roll2d6(mod)`: distribuição básica e classificação correta.
  - Renderização de `DiceRoller` e persistência chamando `createRoll` (mock).
- Setup já configurado em `vite.config.ts` e `src/test/setup.ts`.

## Validação
- Rodar em modo bypass (`VITE_TEST_BYPASS_AUTH='true'`) com `testUserRole` variando master/player.
- Verificar critérios de aceite:
  - Jogador vê apenas suas rolagens no Perfil (`src/hooks/useRolls.ts:61-64`).
  - Mestre vê todas em `/master/rolls` (`src/router.tsx:71`).

## Segurança e ACL
- Respeitar `ModeGuard` e `useMode.isMaster` para acesso a `/master/*`.
- Persistir apenas `rollerUid` do usuário autenticado (`src/contexts/AuthContext.tsx:27-44`).

## Entregáveis
- Novos arquivos: `utils/pbta.ts`, `services/rolls.service.ts`, `components/roller/DiceRoller.tsx`, `components/roller/RollHistory.tsx`, `components/roller/RollMonitor.tsx`.
- Alterações: `utils/index.ts`, `services/index.ts`, `pages/Roller.tsx`, `pages/Profile.tsx`, `router.tsx`.
- Testes: unitários para util e componentes.

Confirma executar este plano agora e iniciar pela criação da branch?