## Objetivo
- Publicar a aplicação no GitHub Pages com deploy automático em `push` para `main` e site acessível sem 404.

## Pré‑requisitos
- Repositório: `https://github.com/JonnathanRiquelmo/pbta.app`.
- Vite com `base` correta para Project Pages.
- Ações do GitHub Pages habilitadas para usar `GitHub Actions`.

## Branch de Trabalho
- Criar a branch de implementação seguindo o Gitflow: `feature/fase-21-deploy-actions`.
- Comandos (serão executados após aprovação):
  - `git checkout -b feature/fase-21-deploy-actions`

## Ajuste Vite (verificação)
- A `base` já está correta em `vite.config.ts:6` com `'/pbta.app/'`; nenhum ajuste necessário.

## Workflow de Deploy (novo arquivo)
- Adicionar o arquivo `/.github/workflows/deploy.yml` com o conteúdo abaixo, alinhado ao guia:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run test:ci --if-present
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Habilitar Pages
- Confirmar que o repositório está configurado para Pages via `GitHub Actions` (Configurações → Pages → Source: GitHub Actions).

## Validação do Deploy
- Realizar `push` da branch e abrir PR para `main`.
- Após merge na `main`, validar:
  - Execução do workflow `Deploy to GitHub Pages` com sucesso.
  - Site disponível em `https://JonnathanRiquelmo.github.io/pbta.app/` sem 404.

## Integração
- Após validação, manter o `deploy.yml` na `main` e prosseguir com o fluxo padrão.

## Rollback
- Em caso de falha: reverter o commit do `deploy.yml` ou desativar temporariamente o workflow.

## Próximos Passos
- Após aprovação, criarei a branch `feature/fase-21-deploy-actions`, adicionarei `deploy.yml`, abrirei PR e executarei a validação descrita acima.