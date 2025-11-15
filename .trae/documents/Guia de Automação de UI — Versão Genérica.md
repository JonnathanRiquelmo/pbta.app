## Objetivo
Tornar o guia de automação reutilizável em todas as fases, com instruções genéricas para login, navegação, preenchimento, cliques e verificações, parametrizáveis por cenário.

## Onde ficará
- Consolidar o documento único em `.trae/documents/Guia de Automação de UI — pbta.app.md`.
- Atualizar o conteúdo para ser genérico e referenciável em qualquer fase.

## Conteúdo proposto
### 1. Contas de Teste
- Mestre: `testmaster@pbta.app` / `Test1234!`
- Jogador: `testplayer@pbta.app` / `Test1234!`
- Pré-condição: contas já existem em Authentication; App Check não obrigatório para Firestore.

### 2. Ambiente
- `{BASE} = http://localhost:{PORT}/pbta.app/` (detecção automática do `PORT`).
- Base path fixo com hash routes: `#/...`.
- Emuladores apenas se `VITE_USE_EMULATORS==='true'` (por padrão, produção).

### 3. Protocolo de Automação (Genérico)
- Atores: `MESTRE` | `JOGADOR` (escolha da conta)
- Ações
  - `LOGIN {ATOR} via email` ou `LOGIN {ATOR} via google`
  - `NAVIGATE {ROUTE}` (ex.: `#/master/campaigns/new`)
  - `FILL {FIELD} = {VALUE}` (ex.: `Nome = "..."`)
  - `CLICK {BUTTON}` (ex.: `Criar campanha`)
  - `ASSERT TEXT {VALUE}` (ex.: `Campanhas`), `ASSERT EXISTS {SELECTOR}`, `ASSERT NOT EXISTS {SELECTOR}`
- Resultado
  - Reporto sucesso/erro com evidências (textos/elementos encontrados).

### 4. Estratégia de Seletores
- Priorizar labels visíveis e roles: botões pelo texto, inputs pelos rótulos (`E-mail`, `Senha`, `Nome`, etc.).
- Verificações por headings e textos-chave da página.

### 5. Templates de Cenários
- `CRIAR_ENTIDADE {contexto}`: login, navegar, preencher campos, clicar ação, assert card/lista.
- `EXCLUIR_ENTIDADE {contexto}`: localizar card, acionar exclusão, assert remoção.
- `LISTAR_ENTIDADES {contexto}`: login, navegar, assert lista e contagem.
- `ATUALIZAR_ENTIDADE {contexto}`: navegar ao editor, alterar campos, salvar, assert mudanças.

### 6. Verificações Padrão
- Presença/ausência de elementos.
- Redirecionamento pós-ação (ex.: pós-login, pós-criação).
- Mensagens de feedback (toasts quando existirem).

### 7. Diagnóstico
- Erro de escrita/leitura: revisar regras Firestore.
- Páginas vazias: base path e emuladores.
- Provedor de login: email/senha exige conta existente; Google requer domínio `localhost` autorizado.

### 8. Como Solicitar
- Você descreve cenários citando este guia, por exemplo:
  - "Executar: LOGIN MESTRE via email; NAVIGATE #/master/campaigns/new; FILL Nome=..., Regra=..., Descrição=...; CLICK Criar campanha; ASSERT TEXT Campanhas; ASSERT TEXT Nome".
- Eu executo e retorno o resultado com evidências.

## Implementação
- Vou atualizar o documento em `.trae/documents/Guia de Automação de UI — pbta.app.md` com o conteúdo acima, e remover duplicatas em outras pastas se existirem.