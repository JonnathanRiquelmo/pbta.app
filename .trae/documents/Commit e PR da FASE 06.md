## Objetivo
- Versionar as mudanças da FASE 06, abrir PR no GitHub e realizar merge squash via GitHub CLI.

## Etapas
- Verificar estado do repositório e remotos.
- Criar branch `feat/fase-06-player-dashboard`.
- Adicionar todos os arquivos alterados.
- Commit seguindo Conventional Commits em português:
  - `feat(dashboard): PlayerDashboard com cards e atalhos`
  - Incluir no corpo: hooks (`useCampaigns`, `useCharacters`, `useRolls`), correção do `AuthGuard` e ajuste do `ToastProvider`.
- Push da branch e criação de PR com título e descrição preenchidos.
- Merge squash do PR e deleção da branch.

## Comandos
- `git status`, `git remote -v`
- `git checkout -b feat/fase-06-player-dashboard`
- `git add -A`
- `git commit -m "feat(dashboard): PlayerDashboard com cards e atalhos" -m "hooks: useCampaigns/useCharacters/useRolls com Firestore" -m "fix(auth): corrige loading no AuthGuard" -m "fix(toast): evita duplicatas e auto-oculta"`
- `git push -u origin feat/fase-06-player-dashboard`
- `gh pr create --fill --title "feat: FASE 06 — PlayerDashboard" --body "Implementa PlayerDashboard com contagens em tempo real, hooks de dados e correções de auth/toast."`
- `gh pr merge --squash --delete-branch --auto`

## Resultado Esperado
- PR criado e mesclado via squash na `main`, com histórico consolidado e branch removida.