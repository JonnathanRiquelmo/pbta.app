# Guia de Automação de UI — pbta.app (Genérico)

## Objetivo
Definir um protocolo genérico para automatizar ações na interface (login, navegação, preenchimento, cliques e verificações), reutilizável em qualquer fase e funcionalidade.

## Contas de Teste
- Mestre: `testmaster@pbta.app` / `Test1234!`
- Jogador: `testplayer@pbta.app` / `Test1234!`
- Pré-condição: contas existentes em Authentication.

## Ambiente
- `{BASE} = http://localhost:{PORT}/pbta.app/`
- Hash routes: `#/...`
- Produção por padrão; emuladores só se `VITE_USE_EMULATORS==='true'`.

## Protocolo de Automação
- Atores: `MESTRE` | `JOGADOR`
- Ações:
  - `LOGIN {ATOR} via email` | `LOGIN {ATOR} via google`
  - `NAVIGATE {ROUTE}`
  - `FILL {FIELD} = {VALUE}`
  - `CLICK {BUTTON}`
  - `ASSERT TEXT {VALUE}` | `ASSERT EXISTS {SELECTOR}` | `ASSERT NOT EXISTS {SELECTOR}`
- Resultado: relatório com evidências (textos/elementos encontrados ou erro específico).

## Seletores
- Botões por texto visível; inputs por rótulo (`E-mail`, `Senha`, etc.); headings para páginas (`Master Home`, `Campanhas`).

## Templates de Cenários
- `CRIAR_ENTIDADE {contexto}`: login → navegar → preencher → salvar → assert na lista/card.
- `EXCLUIR_ENTIDADE {contexto}`: localizar card → excluir → assert remoção.
- `LISTAR_ENTIDADES {contexto}`: login → navegar → assert presença/contagem.
- `ATUALIZAR_ENTIDADE {contexto}`: navegar ao editor → alterar → salvar → assert mudanças.

## Verificações
- Presença/ausência de elementos e textos-chave.
- Redirecionamentos pós-ação.
- Mensagens de feedback quando existirem.

## Diagnóstico
- Erro de escrita/leitura: regras Firestore e App Check.
- UI vazia: base path ou emuladores.

## Como Solicitar
- Exemplos:
  - "Executar: LOGIN MESTRE via email; NAVIGATE #/master/campaigns/new; FILL Nome=..., Regra=..., Descrição=...; CLICK Criar campanha; ASSERT TEXT Campanhas; ASSERT TEXT Nome".
  - "Executar: LOGIN JOGADOR via email; NAVIGATE #/dashboard; ASSERT TEXT Dashboard".

## Observações
- Para testar jogador em listas dependentes, posso incluir o jogador em `players` antes da verificação, quando solicitado.