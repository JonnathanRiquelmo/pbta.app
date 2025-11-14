Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 01 — Setup do Projeto: inicializar React+TypeScript+Vite, configurar lint, testes e estrutura base.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 01.md
- Referências: Deploy e CI-CD.md; Estrutura de Componentes React.md; Descrição das Tecnologias.md
- Não usar SOLO Builder

Gitflow
- Criar branch: `feature/fase-01-setup`
- Commits semânticos: `tipo(escopo): resumo`
- Validação local: `npm run lint`, `npm run test:ci`, `npm run build`
- Abrir PR para `main` com checklist dos critérios de aceite e links às referências
- Merge: “Squash and merge”; apagar a branch após merge

Tarefas Obrigatórias
- Criar projeto Vite (template `react-ts`) com `vite.config.ts` ajustando `base: '/pbta.app/'`
- Adicionar e configurar `eslint`, `vitest`, `@testing-library/react` e scripts em `package.json`
- Criar estrutura inicial de diretórios conforme hierarquia (components, hooks, contexts, services, utils)

Critérios de Aceite
- `npm run dev` funciona; `npm run build` compila sem erros
- Estrutura de pastas criada conforme definido
- Lint e testes executam sem erros

Saídas Esperadas
- Branch `feature/fase-01-setup` no remoto e PR aberto
- Diff com `vite.config.ts`, `package.json` scripts e estrutura de diretórios
- Instruções de execução local no PR: `npm ci`, `npm run dev`, `npm run build`, `npm run test:ci`, `npm run lint`

Restrições
- Evitar criação de arquivos desnecessários
- Não expor segredos; esta fase não requer secrets
- Manter histórico linear e proteção da `main`

Avanço
- Após concluir, preparar apenas o plano da FASE 02 (sem executar)