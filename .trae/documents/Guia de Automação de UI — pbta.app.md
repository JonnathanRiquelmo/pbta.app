## Objetivo

Definir um protocolo genérico para automatizar ações na interface (login, navegação, preenchimento, cliques e verificações) reutilizável em todas as fases.

## Contas de Teste

* Mestre: `testmaster@pbta.app` / `Test1234!`

* Jogador: `testplayer@pbta.app` / `Test1234!`

* Pré-condição: ambas existem em Authentication.

## Ambiente

* `{BASE} = http://localhost:{PORT}/pbta.app/`

* Hash routes: `#/...`

* Produção por padrão; emuladores só se `VITE_USE_EMULATORS==='true'`.

## Protocolo

* Atores: `MESTRE` | `JOGADOR`

* Ações: `LOGIN {ATOR} via email|google` → `NAVIGATE {ROUTE}` → `FILL {FIELD}={VALUE}` → `CLICK {BUTTON}` → `ASSERT TEXT {VALUE}` | `ASSERT EXISTS {SELECTOR}` | `ASSERT NOT EXISTS {SELECTOR}`.

* Resultado: relatório com evidências.

## Seletores

* Botões pelo texto visível; inputs pelos rótulos; headings para verificação de páginas.

## Templates

* Criar entidade: login → navegar → preencher → salvar → assert na lista/card.

* Excluir entidade: localizar card → excluir → assert remoção.

* Listar entidades: login → navegar → assert presença/contagem.

* Atualizar entidade: editor → alterar → salvar → assert mudanças.

## Verificações

* Presença/ausência de elementos; redirecionamentos; feedbacks.

## Diagnóstico

* Regras Firestore e App Check quando houver falhas; base path e emuladores para páginas vazias.

## Solicitação

* Exemplo: "Executar: LOGIN MESTRE via email; NAVIGATE #/master/campaigns/new; FILL Nome=..., Regra=..., Descrição=...; CLICK Criar campanha; ASSERT TEXT Campanhas; ASSERT TEXT Nome".

