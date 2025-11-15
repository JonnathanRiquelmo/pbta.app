## Escopo e Preparação
- Criar a branch `feature/fase-20-tests-quality` conforme Gitflow.
- Alinhar o alvo "rollPBTA" para a função real `roll2d6` em `src/utils/pbta.ts:3-13`.
- Confirmar setup de testes com Vitest: `vite.config.ts:10-14` e script `test:ci` em `package.json:10-12`.

## Alvos de Teste
- Utilitários de rolagem: `roll2d6` — já possui cobertura básica em `src/utils/__tests__/pbta.test.ts` (validaremos e ampliamos casos limítrofes). Referência de implementação: `src/utils/pbta.ts:1-13`.
- Validadores de segurança: `validateSheetUpdate` — coberto em `tests/security.test.ts`. Fonte: `src/utils/validators.ts:1-6`.
- ACL (Mestre): `isMaster` exposto via `useMode()` — ainda sem teste direto. Implementação: `src/contexts/ModeContext.tsx:11,21-24,26-30,33-35`.

## Implementação de Testes
- `src/contexts/__tests__/ModeContext.test.tsx`
  - Testar `isMaster(email)` com o e-mail padrão do mestre `jonnathan.riquelmo@gmail.com` para retorno `true` e com um e-mail comum para `false`.
  - Testar fallback sem parâmetro usando `AuthProvider` com bypass (`VITE_TEST_BYPASS_AUTH='true'`) e `localStorage('testUserRole')`:
    - Caso mestre: definir `VITE_MASTER_EMAIL='testmaster@pbta.app'` e simular usuário mestre; esperar `useMode().mode === 'MASTER'` e `isMaster() === true`.
    - Caso jogador: simular usuário jogador; esperar `useMode().mode === 'PLAYER'` e `isMaster() === false`.
  - Carregar módulo de contexto após definir `import.meta.env` (via `vi.resetModules()` + `await import()`), dado que `MASTER_EMAIL` é avaliado em `ModeContext.tsx:11` no carregamento do módulo).
- `src/utils/__tests__/pbta.test.ts`
  - Validar casos determinísticos com mock de `Math.random` para limites: totais 6- (`miss`), 7-9 (`hit-7-9`) e 10+ (`hit-10+`).
  - Adicionar caso com modificador negativo grande garantindo resultado mínimo.
- `tests/security.test.ts`
  - Confirmar mensagens e tipos de erro ao bloquear acesso; manter compatível com `validators.ts:1-6` (lança `Error('Unauthorized')`).

## Integração CI
- Atualizar `package.json:11` para `"test:ci": "vitest run"` (remover `--passWithNoTests`) assegurando falha quando não houver testes ou quando falharem.
- Adicionar `.github/workflows/ci.yml` (inexistente segundo varredura) com:
  - `on: [push, pull_request]` nas branches principais.
  - Node 20 com cache npm.
  - Passos: `npm ci` → `npm run lint` → `npm run test:ci`.
- Opcional: incluir `npm run build` após testes para validar build.

## Critérios de Aceite
- CI executa `npm run test:ci` com sucesso e falha quando apropriado.
- Testes cobrem `roll2d6`, `validateSheetUpdate`, `isMaster` com cenários positivos/negativos.
- Nenhum teste depende de Firebase real (uso de bypass em `AuthContext.tsx:28-37`).

## Passos de Execução (após aprovação)
- `git checkout -b feature/fase-20-tests-quality`
- Implementar/ajustar testes e scripts.
- Criar workflow de CI.
- Rodar localmente: `npm run test` e `npm run test:ci`.
- Abrir PR para revisão.

## Observações
- O nome "rollPBTA" nos documentos referencia a API conceitual; no código a função é `roll2d6`. O plano usa o nome real mantendo intenção dos docs.
- Referências úteis: `package.json:10-12`, `vite.config.ts:10-14`, `src/contexts/ModeContext.tsx:11,21-24,26-30`, `src/utils/validators.ts:1-6`, `src/utils/pbta.ts:1-13`.
