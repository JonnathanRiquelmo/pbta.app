# 📋 Mapeamento Completo dos Testes E2E

Este documento lista todos os testes Playwright do projeto, organizados por categoria e com suas respectivas localizações.

## 📁 Localização dos Arquivos

Todos os testes estão localizados em: `tests/e2e/`

---

## 🔐 **Autenticação & Autorização**

| Arquivo | Classe/Contexto | Descrição Principal |
|---------|-----------------|---------------------|
| `login-email.spec.ts` | Login por Email | Login mestre/jogador por email/senha e redirecionamento |
| `login-google.spec.ts` | Login Google | Login com provedor Google e redirecionamento |
| `logout-verification.spec.ts` | Logout | Verificação de encerramento de sessão e redirecionamento |
| `guards-master-player.spec.ts` | Guards de Rota | Testa restrições de acesso entre mestre e jogador |
| `routes-unauth-redirect.spec.ts` | Rotas Protegidas | Redirecionamento quando não autenticado |

---

## 🎲 **Rolagens & Sistema de Dados**

| Arquivo | Classe/Contexto | Descrição Principal |
|---------|-----------------|---------------------|
| `roll-advantage.spec.ts` | Rolagens com Vantagem | Usa os 2 maiores dados de 3 rolados |
| `rolls-disadvantage.spec.ts` | Rolagens com Desvantagem | Usa os 2 menores dados de 3 rolados |
| `rolls-modifiers-total.spec.ts` | Cálculo de Modificadores | Soma correta de atributo + movimento |
| `rolls-player-permissions.spec.ts` | Permissões de Rolagem | Controle de acesso entre mestre e jogador |
| `roll-delete-permissions.spec.ts` | Exclusão de Rolagens | Permissões para deletar rolagens |

---

## 📝 **Sessões & Gerenciamento de Campanhas**

| Arquivo | Classe/Contexto | Descrição Principal |
|---------|-----------------|---------------------|
| `sessions-create-validate.spec.ts` | Criação de Sessões | CRUD e validações de nome/data |
| `sessions-ordering.spec.ts` | Ordenação de Sessões | Listagem da mais recente para a mais antiga |
| `session-realtime-updates.spec.ts` | Tempo Real | Sincronização entre mestre e jogador |

---

## 🎭 **Personagens, NPCs & Fichas**

| Arquivo | Classe/Contexto | Descrição Principal |
|---------|-----------------|---------------------|
| `character-block-invalid-sum.spec.ts` | Validação de Soma | Bloqueio quando soma de atributos ≠ 3 |
| `character-update-validation.spec.ts` | Atualização de Fichas | Validação durante atualização |
| `npcs-create-validate.spec.ts` | NPCs - Criação/Validação | Criação, validação de soma, lote e exclusão |

---

## 🎮 **Movimentos & Mecânicas**

| Arquivo | Classe/Contexto | Descrição Principal |
|---------|-----------------|---------------------|
| `moves-create-toggle.spec.ts` | Movimentos | Criação, ativação/desativação e reflexo em fichas |

---

## 🔗 **Convites & Sistema de Compartilhamento**

| Arquivo | Classe/Contexto | Descrição Principal |
|---------|-----------------|---------------------|
| `invite-acceptance.spec.ts` | Convites Válidos | Fluxo completo: geração → aceitação → participação |
| `invite-invalid.spec.ts` | Convites Inválidos | Validação de expiração e limites de uso |

---

## 📋 **Resumo por Categoria**

| Categoria | Quantidade | Arquivos |
|-----------|------------|----------|
| 🔐 Autenticação & Autorização | 5 | login-email, login-google, logout-verification, guards-master-player, routes-unauth-redirect |
| 🎲 Rolagens & Dados | 5 | roll-advantage, rolls-disadvantage, rolls-modifiers-total, rolls-player-permissions, roll-delete-permissions |
| 📝 Sessões & Campanhas | 3 | sessions-create-validate, sessions-ordering, session-realtime-updates |
| 🎭 Personagens & NPCs | 3 | character-block-invalid-sum, character-update-validation, npcs-create-validate |
| 🎮 Movimentos | 1 | moves-create-toggle |
| 🔗 Convites | 2 | invite-acceptance, invite-invalid |

**Total de Testes E2E: 19**

---

## 🔧 **Funções Auxiliares Comuns**

### Funções de Login (reutilizáveis)
```typescript
// Função padrão usada na maioria dos testes
async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

async function loginPlayer(page: any) {
  await page.goto('login')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}
```

### Credenciais de Teste Padrão
- **Mestre**: `master.teste@pbta.dev` / `Test1234!`
- **Jogador**: `player.teste@pbta.dev` / `Test1234!`

---

## 📝 **Notas de Manutenção**

- Todos os testes usam Playwright com TypeScript
- Localização padrão: `tests/e2e/`
- Estrutura de atributos: 5 atributos (força, agilidade, sabedoria, carisma, intuição)
- Regra de validação: soma absoluta dos atributos deve ser = 3
- Timeout padrão: 15000ms para carregamentos complexos