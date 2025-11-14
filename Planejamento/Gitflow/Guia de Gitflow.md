# Guia de Gitflow — pbta.app

## Objetivo

- Definir um fluxo simples e sólido para desenvolvimento por fases, garantindo estabilidade em `main`, rastreabilidade e entregas incrementais.

## Visão Geral do Fluxo

- Branches por fase: `feature/fase-XX-nome-curto`
- Validação local: `lint` + `test:ci` + `build` + critérios da fase
- Pull Request para `main` com checklist de aceitação
- CI (após FASE 21) roda automaticamente e bloqueia merges quebrados
- Merge via “Squash and merge” e remoção da branch
- Tags opcionais por marcos

## Convenções de Branch

- Padrão: `feature/fase-XX-nome-curto`
- Exemplos:
  - `feature/fase-01-setup`
  - `feature/fase-02-firebase`
  - `feature/fase-03-router`
  - `feature/fase-21-deploy-actions`
- Outras categorias quando aplicável:
  - `fix/...` (correções)
  - `chore/...` (infra, configs)
  - `refactor/...` (refatorações)

## Commits Semânticos

- Formato: `tipo(escopo): resumo`
- Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `build`, `ci`
- Exemplos:
  - `feat(router): configurar rotas comuns, jogador, mestre e públicas`
  - `feat(sheets): CRUD de fichas com validação de ownership`
  - `feat(roller): rolagem 2d6 com histórico e perfil`
  - `ci(actions): adicionar workflow de deploy para GitHub Pages`
  - `docs(planejamento): atualizar fases e índice`

## Workflow por Fase

1. Criar branch a partir de `main`:
   - `git checkout -b feature/fase-XX-nome`
2. Implementar conforme `Planejamento/Fase de Implementação/FASE XX.md`:
   - Seguir Objetivo, Tarefas, Referências e Critérios de Aceite
3. Validação local:
   - `npm run lint`
   - `npm run test:ci`
   - `npm run build`
   - Conferir “Critérios de Aceite” da fase
4. Commit semântico e push:
   - `git add .`
   - `git commit -m "feat(scope): ..."`
   - `git push -u origin feature/fase-XX-nome`
5. Abrir Pull Request para `main`:
   - Título: `Fase XX — <Resumo>`
   - Descrição: listar Tarefas e marcar “Critérios de Aceite” da fase
   - Referências: linkar arquivos de `Planejamento/...` relevantes
6. Aguardar CI (após FASE 21):
   - Workflow de deploy/CI verifica `lint`, `test:ci`, `build`
7. Merge:
   - “Squash and merge”
   - Deletar branch
8. Tag opcional:
   - `git tag v0.1.0 && git push --tags` (após marcos)

## Validação Local (Checklist)

- Rotas funcionam sem 404 (ver `Planejamento/Rotas.md`)
- Firebase inicializa e offline persistence habilitada (ver `Planejamento/Configuração Firebase.md`)
- Componentes seguem `Design System` (ver `Planejamento/Definição de Páginas/Design System.md`)
- PWA: `/offline` disponível e SW funcional (ver `Planejamento/Implementação PWA e Offline.md`)
- Testes unitários passam (ver `Planejamento/Testes Unitários.md`)

## Integração Contínua (CI/CD)

- Requer FASE 21 para habilitar Actions + Pages
- Referência: `Planejamento/Deploy e CI-CD.md`
- Scripts executados: `lint`, `test:ci`, `build`
- Base do Vite ajustada: `base: '/pbta.app/'`

## Estratégia de Merge

- Usar “Squash and merge” para manter histórico limpo
- Habilitar “Require status checks to pass” e “Require linear history”
- Antes de abrir PR, preferir rebase com `main`:
  - `git fetch origin && git rebase origin/main`

## Proteção da Branch `main`

- Bloquear push direto em `main`
- Exigir PR com CI passando
- Exigir revisões quando aplicável

## Mapeamento de Fases → Branches

- FASE 01 → `feature/fase-01-setup`
- FASE 02 → `feature/fase-02-firebase`
- FASE 03 → `feature/fase-03-router`
- FASE 04 → `feature/fase-04-auth-mode`
- FASE 05 → `feature/fase-05-design-system`
- FASE 06 → `feature/fase-06-player-dashboard`
- FASE 07 → `feature/fase-07-master-dashboard`
- FASE 08 → `feature/fase-08-campaigns`
- FASE 09 → `feature/fase-09-campaign-detail-plot`
- FASE 10 → `feature/fase-10-sheets-crud`
- FASE 11 → `feature/fase-11-sheet-public`
- FASE 12 → `feature/fase-12-pdms`
- FASE 13 → `feature/fase-13-moves`
- FASE 14 → `feature/fase-14-sessions`
- FASE 15 → `feature/fase-15-roller-profile`
- FASE 16 → `feature/fase-16-notes`
- FASE 17 → `feature/fase-17-pwa-offline`
- FASE 18 → `feature/fase-18-analytics`
- FASE 19 → `feature/fase-19-acl-security`
- FASE 20 → `feature/fase-20-tests-quality`
- FASE 21 → `feature/fase-21-deploy-actions`
- FASE 22 → `feature/fase-22-public-npc`
- FASE 23 → `feature/fase-23-indexes-performance`
- FASE 24 → `feature/fase-24-accessibility-polish`
- FASE 0x → `feature/fase-0x-template`
- FASE XX → `feature/fase-xx-backlog`

## Resolução de Conflitos

- Atualizar branch: `git fetch origin && git rebase origin/main`
- Corrigir conflitos nos arquivos, depois:
  - `git add <arquivos>`
  - `git rebase --continue`
  - Reexecutar `npm run test:ci` e `npm run build`
- Alternativa: `git merge origin/main` (se preferir merge)

## Tags e Releases

- SemVer: `v0.1.0`, `v0.2.0`, etc.
- Recomendações:
  - Tag após grandes marcos (ex.: conclusão de CRUDs principais)
  - Changelog no PR descrevendo mudanças agregadas

## Recursos e Referências

- Repositório remoto: `https://github.com/JonnathanRiquelmo/pbta.app`
- Fases: `Planejamento/Fase de Implementação/FASE 01.md` … `FASE 24.md`, `FASE 0x.md`, `FASE XX.md`
- Documentos base:
  - `Planejamento/Arquitetura do Servidor.md`
  - `Planejamento/Arquitetura do Sistema.md`
  - `Planejamento/Configuração Firebase.md`
  - `Planejamento/Deploy e CI-CD.md`
  - `Planejamento/Descrição das Tecnologias.md`
  - `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md`
  - `Planejamento/Estrutura de Componentes React.md`
  - `Planejamento/Implementação PWA e Offline.md`
  - `Planejamento/Monitoramento e Analytics.md`
  - `Planejamento/Rotas.md`
  - `Planejamento/Testes Unitários.md`