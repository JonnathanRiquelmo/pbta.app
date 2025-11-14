# Deploy e CI/CD — pbta.app

## 11. Deploy e CI/CD

### 11.1 GitHub Actions Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
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
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 11.2 Configuração do Repositório

```json
{
  "name": "pbta.app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ci": "vitest run",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pbta.app/'
})
```

### 11.3 Observações

- Repositório: `https://github.com/JonnathanRiquelmo/pbta.app`.
- GitHub Pages: usar Project Pages com base `/pbta.app/` para evitar 404.
- A configuração Firebase usa constantes fixas no código; não requer secrets.
- Se futuramente usar variáveis de ambiente, definir em `Repository secrets` e referenciar no passo `Build`.
- Após habilitar Pages, verificar a URL publicada e ajustar rotas para `hash` ou `base` conforme necessário.