## Objetivo
- Inicializar projeto React+TypeScript+Vite, configurar lint e testes, e criar a estrutura base conforme planejamento.

## Referências
- `.trae/Planejamento/Prompts por Fase/FASE 01.md`
- `.trae/Planejamento/Deploy e CI-CD.md`
- `.trae/Planejamento/Estrutura de Componentes React.md`
- `.trae/Planejamento/Descrição das Tecnologias.md`

## Gitflow
- Criar branch: `feature/fase-01-setup` a partir de `main`.
- Commits semânticos: `tipo(escopo): resumo`.
- PR para `main` com checklist dos critérios de aceite; merge via “Squash and merge”.

## Passos de Implementação
- Preparar ambiente Node 20.
- Inicializar Vite React TS no diretório atual:
  - `npm create vite@latest . -- --template react-ts`
- Instalar dependências:
  - Produção: as criadas pelo template.
  - Dev: `eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks vitest @testing-library/react @testing-library/jest-dom jsdom`
  - `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks vitest @testing-library/react @testing-library/jest-dom jsdom`
- Ajustar `vite.config.ts`:
  - `base: '/pbta.app/'`.
  - Configurar `test` (Vitest) com `environment: 'jsdom'` e `setupFiles: 'src/test/setup.ts'`.
- Adicionar `src/test/setup.ts` para `@testing-library/jest-dom`.
- Atualizar `package.json` scripts conforme CI/CD:
  - `dev`, `build` (`tsc && vite build`), `preview`, `test`, `test:ci`, `lint` (`eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`).
- Criar `.eslintrc.cjs` mínimo para React+TS:
  - Parser `@typescript-eslint/parser` e plugins `@typescript-eslint`, `react`, `react-hooks`.
- Ajustar `tsconfig.json` para testes:
  - Incluir `types: ['vitest', 'vite/client']`.
- Estrutura de diretórios inicial:
  - `src/components/` (com `common/` vazio), `src/hooks/`, `src/contexts/`, `src/services/`, `src/utils/`.
  - Manter subpastas adicionais para fases futuras; evitar arquivos desnecessários.

## Verificações Locais
- `npm run dev` roda sem erros.
- `npm run build` compila sem erros.
- `npm run lint` não apresenta erros.
- `npm run test:ci` executa com sucesso.

## Saídas no PR
- Diff contendo `vite.config.ts` com `base`, `package.json` com scripts, `.eslintrc.cjs`, `src/test/setup.ts` e estrutura de diretórios.
- Instruções no PR: `npm ci`, `npm run dev`, `npm run build`, `npm run test:ci`, `npm run lint`.

## Critérios de Aceite
- Dev server funcional, build sem erros.
- Estrutura de pastas criada conforme definido.
- Lint e testes executando sem erros.

## Próximo Passo
- Após merge da FASE 01, preparar apenas o plano da FASE 02 (sem executar).