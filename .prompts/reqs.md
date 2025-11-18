Preciso que vc me ajude a projetar um sistema PBTA que atenda uma campanha de RPG. Esse sistema tem que ter dois modos de operação: Mestre e Jogador. O login deve ser com conta do Google. Pode haver também acesso por login/senha, previamente cadastrados já que serão, nessa forma de acesso, apenas para testes. O sistema terá apenas um mestre inicialmente quando for feito acesso pelo Google, por email informado depois durante o desenvolvimento. Quem não for mestre acessa como jogador, sempre. A exceção é o acesso por login/senha, que terá um mestre de teste e um jogador de teste autorizados e informados durante o desenvolvimento também. O mestre pode criar a campanha, convidar os jogadores criando um token que pode ser compartilhado com eles para terem acesso as infos da campanha (plot, notas do mestre, transcrições das sessões). Tudo que o mestre faz na campanha pode ser editado. O token deve ser pego pelo jogador e aceito por um validador de token na sua interface. O mestre deve ver que o jogador aceitou o convite validando o link quando ele aparecer na lista de players da campanha. O jogador poderá fazer apenas uma ficha, que será a sua própria, o mestre poderá fazer muitas fichas de NPCs (ou PDMs como se diz). O jogador pode editar a sua ficha. O mestre pode editar todas as fichas, incluindo as do jogador. As fichas devem ter nome, background (história do personagem, de onde ele vem? Quais seus objetivos? O que o motiva? Quais são seus medos?), atributos (força, agilidade, sabedoria, carisma e intuição) que devem ir de -1 até +3, sendo que o somatório total SEMPRE tem que ser 3. As fichas dos jogadores ainda deve ter os equipamentos e notas do jogador, para anotações gerais. Também devem ter movimentos, que deverão ser escolhidos a partir de uma lista de movimentos fornecidos. Esses movimentos são cadastrados pelo mestre na campanha e ficam disponíveis para adicionar ou retirar das fichas, quando em modo de edição. O mestre deve conseguir ver as fichas dos jogadores que estão na sua campanha. Os jogadores não devem ver as fichas do mestre. Os jogadores devem ver o plot da campanha e as infos das sessões ao acessar a tela da campanha que estão participando. Ao final de cada sessão o mestre a finaliza colocando um resumo do que ocorreu. O resumo é editável apenas pelo mestre e fica visível dentro da sessão para todos os jogadores. A campanha deve ter um rolador de dados 2d6. Esse rolador deve ter 3 modos de operação: com desvantagem (rola 3 dados, o mais alto é descartado), normal (rola dois dados), e com vantagem (rola 3 dados e o mais baixo é descartado). Quando o jogador/PDM do mestre for rolar ele deve informar qual o tipo de operação e se vai jogar "puro" (sem movimentos nenhum) ou com movimento associado, que deve ser somente é apenas algum movimento que está cadastradona sua ficha, e somente na sua ficha. Os PDMs do mestre tem todos os movimentos da lista previamente cadastrada por padrão, todos eles para todos os PDMs. Cada rolagem de jogador/pdm do mestre fica dentro da sessão da campanha fica registrada em um painel que pode ser visto por todos. Cada sessão fica dentro da campanha, já que podem ser muitas sessões. A sessão Deve ter nome, data, anotações do mestre que ficam públicas a todos. O mestre pode excluir rolagens do histórico da sessão, os jogadores não podem excluir. As rolagens dos PDMs do mestre só podem ser feitas pelo mestre, porem podem ser vistas por todos também no painel da sessão. O resultado de cada rolagem deve apresentar tbm de forma intuitiva os 3 resultados possíveis previstos no PBTA, levando em conta o valor dos dados, o modo de operação, e o modificador do movimento (que tbm vai de -1 até 3 na tela de cadastro do mestre) caso tenha sido usado algum incluído da lista de movimentos cadastrados pelo mestre disponíveis para a campanha na ficha do jogador quando ele criou. O sistema terá uma página inicial explicando o projeto de forma geral para jogadores, com um botão para acessar. Esse botão de acessar leva para a tela de login. A tela de login leva para um dashboard, que é adaptado para cada modo de operação (mestre e jogador) mostrando infos e botões de acesso as funcionalidades descritas anteriormente, de forma estruturada e intuitiva para o tipo de sistema proposto. O sistema deve ser feito em react com alguma lib para componentes que dê o máximo suporte a mobile-first. Banco de dados firebase. Deploy no Github pages via Github actions. Deve ser evitado ao máximo campos de entrada de valores numerais com inputs, ao invés disso radio buttons devem ser priorizados, como por exemplo para os atributos e e cadastro de modificador dos movimentos que o mestre vai cadastrar. Faça o documento de requisitos detalhado para esse cenário. Esse documento deve ser acessível e intuitivo para uma IA que vai desenvolver tudo. Seja o mais detalhado possível. Procure cobrir os dois modos de operação de forma distinta, mas também pensando entre as partes (mestre cria coisas que os jogadores apenas vêem em determinados contextos, o mestre vê mais coisas, como as fichas completas dos jogadores). Pode fazer como histórias de usuário, mostrando o fluxo do que casa um vai fazer para cada funcionalidade.

Perfeito — vou detalhar um Documento de Requisitos funcional e técnico, em **português**, pensado para que **uma IA desenvolvedora** (ou um dev) possa implementar o sistema PBTA que você descreveu. Vou cobrir:

* visão geral e restrições principais,
* todos os fluxos (Mestre / Jogador) como histórias de usuário com passos e critérios de aceitação,
* modelo de dados (Firestore) e regras de segurança de alto nível,
* lógica do rolador 2d6 (vantagem/desvantagem/normal) + como exibir o resultado PBTA (10+/7–9/≤6),
* UI/UX e recomendações de tecnologia (React + lib componentes mobile-first, PWA),
* deploy GitHub Actions → GitHub Pages + integração Firebase,
* casos de borda, validações e testes de aceitação.

Vou direto ao ponto — detalhado, técnico e com exemplos práticos.

# 1. Visão geral

Sistema web PWA para rodar campanhas PBTA com **dois modos**:

* **Mestre**: cria/edita campanhas, movimentos, NPCs (PDMs), sessões, convida jogadores (token), vê e edita fichas dos jogadores.
* **Jogador**: acessa campanha quando convidado, cria/edita **uma única ficha**, vê plot, participa de sessões, faz rolagens (registradas).

Autenticação:

* Primária: **Google Sign-In** (produz usuário com campo `email`).
* Alternativa para testes: **Email/Senha** (apenas contas de teste pre-cadastradas).

Banco: **Firebase (Firestore)** e Firebase Auth. Storage para uploads opcionais (imagem de avatar, anexos de sessão). Funções Cloud Functions (callable) para lógica sensível (ex.: geração/validação de token de convite, remoção de rolagens por mestre se quiser confirmar server-side).

PWA em **React** (mobile-first). Deploy: build estático → **GitHub Pages** via GitHub Actions. Repositório público (forkável).

# 2. Regras de negócio principais (resumo rápido)

* Usuário Google cuja conta de e-mail esteja configurada como “mestre inicial” ganha papel **Mestre** automaticamente; todos os outros com Google ficam como **Jogador**.
* Contas Email/Senha podem ser “mestre de teste” ou “jogador de teste” conforme configuração de dev.
* Mestre pode criar 1+ campanhas; jogador só participa de campanhas mediante **token de convite**.
* **Ficha (player):**

  * máximo 1 ficha por jogador (um documento `characters` ligado ao user).
  * campos: `name`, `background` (texto), `attributes` (força/agilidade/sabedoria/carisma/intuição) cada -1..+3, **somatório absoluto = 3** (validado no cliente e servidor).
  * `moves` (lista de referências a movimentos disponíveis na campanha).
  * `equipment`, `notes`.
* **Ficha (PDM/NPC - criada pelo mestre):**

  * Mestre pode criar várias; por padrão todas recebem a **lista completa de movimentos** da campanha.
* **Movimentos**:

  * Cadastrados pelo mestre na campanha, cada movimento tem `name`, `description`, `modifier` (inteiro -1..3). Mestre pode editar/ativar/desativar.
* **Rolagem 2d6**:

  * Modos: **Desvantagem** (3d6 descarta o maior), **Normal** (2d6), **Vantagem** (3d6 descarta o menor).
  * Pode ser jogada “pura” (sem movimento) ou **com movimento** (aplica o `modifier` do movimento).
  * Resultado exibido: valores dos dados, somatório, modifier aplicado, total final, outcome PBTA (SUCESSO 10+, MEIO-SUCESSO 7–9, FALHA ≤6) e justificativa/tooltip que explica.
* Histórico: todas as rolagens ficam registradas na **sessão** (cada sessão pertence a uma campanha). Mestre pode apagar rolagens; jogadores não.
* Sessões: `name`, `date`, `master_notes` (visíveis a todos), `summary` (editável só pelo mestre e visível a todos).
* Convites: mestre gera **token** (UUID) atrelado a campanha; jogador usa token para entrar. Quando token aceito, mestre vê o jogador listado como aceito.

# 3. Histórias de usuário (por fluxo) — cada história com passos e critérios de aceitação

## 3.1 Autenticação / inicialização

### HU-01 — Login via Google (Mestre inicial / Jogador)

**Como** usuário
**Quero** autenticar com Google
**Para** acessar o sistema como Mestre (se for o e-mail configurado) ou Jogador

**Fluxo:**

1. Usuário clica "Entrar com Google".
2. Firebase Auth realiza OAuth; retorna `uid`, `email`, `displayName`.
3. Backend (Cloud Function / client) verifica se `email` é o e-mail do mestre inicial configurado:

   * se sim → atribui `role: "master"`.
   * se não → `role: "player"`.
4. Direcionar para dashboard apropriado.

**Critérios de aceitação:**

* Usuário logado tem `uid` persistido no Firestore `users/{uid}` com `role`.
* Mestre inicial só é atribuído ao e-mail configurado.
* Login falho (erro OAuth) exibe mensagem amigável.

### HU-02 — Login por Email/Senha (contas de teste)

**Como** desenvolvedor/testador
**Quero** contas de teste por email/senha
**Para** testar mestre/jogador sem Google

**Fluxo:**

1. Login form (email + senha) para contas de teste criadas previamente (seed no Firestore/Auth).
2. Role atribuída conforme metadados da conta.

**Critérios:**

* Apenas contas previamente criadas funcionam (não há signup público de email/senha).
* Credenciais inválidas = erro.

---

## 3.2 Dashboard / navegação

### HU-03 — Dashboard Mestre

**Como** Mestre
**Quero** ver um dashboard com minhas campanhas, convites pendentes, criar nova campanha e acessar relatórios rápidos

**Telas / ações principais:**

* Lista de campanhas (cards): nome, players count, última sessão.
* Botão "Criar Campanha".
* Acesso rápido: "Criar Movimento", "Gerar Token", "Novo PDM", "Nova Sessão".

**Critérios:**

* Deve ser mobile-first, com navegação inferior (tabbar) e menu hambúrguer.
* Cards clicáveis levam à página da campanha.

### HU-04 — Dashboard Jogador

**Como** Jogador
**Quero** ver campanhas que aceitei, convites pendentes e botão para inserir token

**Critérios:**

* Se jogador ainda não tem ficha, CTA visível: “Criar sua Ficha”.
* Link direto para aceitar token / ver campanhas.

---

## 3.3 Campanha

### HU-05 — Criar campanha (Mestre)

**Como** Mestre
**Quero** criar campanha (nome, descrição, initial plot)
**Para** começar a organizar sessões

**Campos:** `name`, `summary/plot`, `settingTags`, `visibility` (private), `createdAt`

**Critérios:**

* Criada com `ownerId = mestre.uid`.
* Consegue gerar token após criação.

### HU-06 — Gerar convite (token) e convidar jogadores

**Como** Mestre
**Quero** gerar token único para a campanha e compartilhar com jogadores

**Fluxo:**

1. Mestre gera token (UUID v4), opcional `expiry` e `usesLimit`.
2. Token salvo em `campaigns/{campaignId}/invites/{tokenId}` com campos `{token, createdBy, expiresAt, usedBy: []}`.
3. Mestre copia link `https://app/?invite={token}` ou copia o string `token` para envio externo.
4. Jogador abre app, clica “Aceitar convite”, cola token — front cham­a callable function `validateInvite(token)`:

   * se válido →(`usedBy` push jogador uid), adiciona player à `campaigns/{campaignId}.players` com `status: accepted`.
5. Mestre vê lista de players e indicador “accepted”.

**Critérios:**

* Token inválido/expirado exibe mensagem clara.
* Após aceitar, jogador aparece em campanha com `status: accepted`.
* Token pode ter limite de uso e expiração.

---

## 3.4 Fichas (Characters)

### HU-07 — Jogador cria/edita sua ficha

**Como** Jogador
**Quero** criar e editar **uma** ficha própria com atributos e movimentos

**Campos obrigatórios:**

* `name` (string)
* `background` (texto longo com subtítulos: origem, objetivos, motivações, medos)
* `attributes`: object {forca, agilidade, sabedoria, carisma, intuicao} cada -1..+3; **somatório ABSOLUTO = 3**
* `equipment` (lista/textarea)
* `notes` (textarea)
* `moves` (array de moveIds, apenas dentre os movimentos cadastrados e habilitados na campanha)

**Fluxo:**

1. Ao entrar na campanha, jogador tem CTA “Criar Ficha”.
2. UI usa radios para atributos (valores -1..+3) — impedir inputs livres.
3. Ao salvar, front valida soma = 3; server também valida via Firestore security rules / callable.

**Critérios:**

* Jogador não pode criar >1 ficha (bloqueio na UI e servidor).
* Atributos e soma validados no cliente e servidor.
* Jogador só pode adicionar movimentos que existam e estejam habilitados na campanha.

### HU-08 — Mestre cria/edita PDM (NPC)

**Como** Mestre
**Quero** criar múltiplas fichas de PDM que podem ter todos os movimentos por padrão

**Fluxo:**

1. Mestre cria PDM com mesmos campos (sem a restrição “uma ficha”).
2. Ao criar, sistema aplica por padrão todos os movimentos cadastrados pela campanha (podem ser removidos manualmente).

**Critérios:**

* Jogadores não veem PDMs listados como “fichas de mestre”, mas veem rolagens dos PDMs nas sessões.

---

## 3.5 Movimentos

### HU-09 — Mestre cadastra movimentos na campanha

**Como** Mestre
**Quero** gerenciar lista de movimentos (name, description, modifier -1..3)

**Fluxo:**

1. Formulário simples; `modifier` selecionado por radio (-1..3).
2. Movimento fica disponível para ser adicionado às fichas de jogadores e PDMs.

**Critérios:**

* Movimentos têm `active: boolean` (pode ocultar).
* Mudanças em um movimento se refletem nas fichas que referenciam.

---

## 3.6 Sessões e Rolagens

### HU-10 — Mestre cria sessão e finaliza com resumo

**Como** Mestre
**Quero** criar sessão (nome, data, master_notes) e no final salvar `summary` editável

**Campos:** `name`, `date`, `masterNotes`, `summary`, `createdAt`

**Critérios:**

* Sessões agrupadas por `campaignId`.
* `summary` visível a todos; só mestre pode editá-lo.

### HU-11 — Jogador / Mestre realiza rolagem 2d6 (com/sem movimento)

**Como** Jogador ou Mestre (para PDMs)
**Quero** rolar 2d6 em modos: desvantagem (3d6 descarta maior), normal (2d6) e vantagem (3d6 descarta menor), e opcionalmente aplicar movimento

**Fluxo:**

1. Usuário escolhe: **mode** ∈ {desvantagem, normal, vantagem}
2. Escolhe `character` (própria ficha para jogador; para mestre escolher PDM ou jogador)
3. Escolhe `movement` opcional (de sua ficha; para PDMs mestre pode escolher de todos da campanha)
4. Clica “Rolar”
5. Rolagem é executada (client ou callable function), resultado salvo em `sessions/{sessionId}/rolls/{rollId}` com:

   * `dice`: array [d1, d2, d3?] (raw)
   * `usedDice`: array (os dados que foram considerados no somatório final — p.ex. se descartou um)
   * `baseSum`: soma dos `usedDice`
   * `modifier`: movement.modifier or 0
   * `total`: baseSum + modifier
   * `outcome`: {code: success|partial|fail, text: "10+ Sucesso", explanation}
   * `who`: {userId, characterId, isPDM:bool, name}
   * `createdAt`, `visibleToAll: true`
6. Resultado mostrado com explicação PBTA (10+/7–9/≤6), e com highlight visual (verde/amarelo/vermelho).

**Critérios:**

* Usuarios veem no painel da sessão todas as rolagens (dados, movimento usado, total, outcome).
* Mestre pode excluir rolagens (apaga documento).
* Jogadores não podem excluir rolagens.
* Rolagens de PDMs só podem ser feitas pelo mestre (server-side enforced).

### HU-12 — Visualização do histórico de rolagens na sessão

**Como** Qualquer participante da campanha
**Quero** ver painel com todas rolagens daquela sessão, filtro por personagem/movimento/data

**Critérios:**

* Ordenação por `createdAt`.
* Exibir: hora, personagem (ou PDM), dados individuais, soma, modifier, total, outcome colorido e tag do movimento (se houver).

---

# 4. Lógica do rolador 2d6 — implementação e exemplos

## 4.1 Regras exatas

* **Desvantagem**: rolar 3d6, **descarta o maior**, soma os dois menores.
* **Normal**: rolar 2d6, soma ambos.
* **Vantagem**: rolar 3d6, **descarta o menor**, soma os dois maiores.
* **Modifier**: integer (movimento.modifier ∈ {-1,0,1,2,3}) adicionado ao somatório.
* **Total final** = soma_dois_dados + modifier.
* **Outcome PBTA**:

  * `total >= 10` → **SUCESSO** (10+)
  * `7 <= total <= 9` → **MEIO-SUCESSO** (7–9)
  * `total <= 6` → **FALHA** (6-)

> Observação: se no futuro quiser incluir bônus por atributo (ex.: usar Força/Agilidade), o `modifier` pode ser explicitado como `movement.modifier + attributeBonus`. Hoje o requisito pede explicitamente o modifier do movimento.

## 4.2 Pseudocódigo (client/server)

```js
function roll(mode, movementModifier = 0) {
  const dice = [];
  if (mode === 'normal') {
    dice.push(rollD6(), rollD6());
  } else {
    dice.push(rollD6(), rollD6(), rollD6());
  }
  let usedDice;
  if (mode === 'normal') {
    usedDice = dice.slice(0,2);
  } else if (mode === 'vantagem') {
    // descarta o menor
    const minIndex = indexOfMin(dice);
    usedDice = dice.filter((_,i) => i !== minIndex);
  } else { // desvantagem
    // descarta o maior
    const maxIndex = indexOfMax(dice);
    usedDice = dice.filter((_,i) => i !== maxIndex);
  }
  const baseSum = usedDice.reduce((a,b)=>a+b, 0);
  const total = baseSum + movementModifier;
  const outcome = total >= 10 ? 'success' : (total >=7 ? 'partial' : 'fail');
  return { dice, usedDice, baseSum, modifier: movementModifier, total, outcome };
}
```

## 4.3 Exibição UX (componentização)

* Mostrar **cada dado** com um pips / número.
* Mostrar qual dado foi descartado (se houver) com opacidade reduzida e tooltip “descartado (vantagem/desvantagem)”.
* Mostrar `baseSum + modifier = total`.
* Mostrar **badge** outcome: SUCESSO (verde), MEIO-SUCESSO (amarelo), FALHA (vermelho).
* Mostrar explicação curta: ex.: “10+ Sucesso — você alcançou plenamente a intenção; mestre aplica consequências.” (texto configurável no i18n).

# 5. Modelo de dados (Firestore) — coleções e documentos (exemplos)

> Observação: Firestore é NoSQL; prefira coleções aninhadas quando fizer sentido (campaigns/{cid}/sessions/{sid}/rolls/{rid})

## Coleções principais

```
users/{userId}:
  uid: string
  email: string
  displayName: string
  role: "master" | "player"
  createdAt: timestamp
  meta: {...}

campaigns/{campaignId}:
  id
  name
  plot
  ownerId (userId)
  players: [{userId, displayName, status: "invited"|"accepted", joinedAt}]
  createdAt
  settings: { defaultMovesPublicToPDMs: true }
  invitesCount, ...

campaigns/{campaignId}/invites/{inviteId}:
  token (string)
  createdBy
  createdAt
  expiresAt (optional)
  usesLimit (optional)
  usedBy: [userId,...]

campaigns/{campaignId}/moves/{moveId}:
  name
  description
  modifier (-1..3)
  active (bool)
  createdAt

campaigns/{campaignId}/characters/{charId}:
  name
  ownerId (null for PDM)
  isPDM: boolean
  background
  attributes: {forca, agilidade, sabedoria, carisma, intuicao}
  equipment: string
  notes: string
  moves: [moveId,...]
  createdAt
  updatedAt

campaigns/{campaignId}/sessions/{sessionId}:
  name
  date
  masterNotes
  summary
  createdAt

campaigns/{campaignId}/sessions/{sessionId}/rolls/{rollId}:
  who: {userId, characterId, name, isPDM}
  dice: [int,int,(int?)]
  usedDice: [int,int]
  baseSum
  modifier
  total
  outcome: {code, text}
  movementRef (moveId|null)
  createdAt
```

## Exemplo de documento `attributes`:

```json
"attributes": { "forca": 1, "agilidade": 0, "sabedoria": 1, "carisma": 0, "intuicao": 1 }
```

Soma absoluta = 1+0+1+0+1 = 3 (exigido).

# 6. Regras de segurança / Firestore Security (alto nível)

* **Regra de autenticação**: todas as leituras/escritas exigem `request.auth != null`, exceto a página pública inicial que é estática.
* **Campaigns**:

  * somente `ownerId` (mestre) pode `create`/`update`/`delete` campaign.
  * players com `campaigns/{id}.players` podem `read` campaign info.
* **characters**:

  * `create`: jogador pode criar apenas se não tiver character naquela campanha (`query` check) — isso é meio verboso no Firestore, usar callable function `createCharacter`.
  * `update`: ownerId pode editar sua ficha; mestre (`campaign.ownerId`) pode editar qualquer ficha da campanha.
  * `read`: mestre vê todas fichas; jogadores só veem **suas** fichas e não veem as fichas PDM marcadas invisíveis (se mestre quiser).
* **moves**:

  * só mestre pode create/update/delete.
  * jogadores podem read.
* **sessions / rolls**:

  * any player in `campaign.players` pode `read` session and `create` rolls (only for their own characters).
  * rolls created with `isPDM=true` must be created only by `campaign.ownerId` (mestre).
  * delete roll: only `campaign.ownerId` can delete roll.
* **validations server-side**:

  * attributes must each be in [-1,3] and sum = 3.
  * movement.modifier in [-1,3].

> Recomendo implementar parte da lógica sensível (validações críticas, geração/uso token, remoção de rolagens) em **Cloud Functions callable** para evitar brechas via cliente.

# 7. UI / UX — estrutura de telas e componentes (mobile-first)

* **Página inicial (pública)**: explicação curta do projeto, CTA “Entrar / Testar”.
* **Login**: Buttons: “Entrar com Google”, “Entrar com Email (teste)”.
* **Dashboard Mestre**: lista de campanhas + quick actions.
* **Dashboard Jogador**: campanhas, botão “Inserir token”.
* **Campanha (Mestre)**: tabs:

  * Overview (plot, players, moves quicklist)
  * Fichas (lista PDM + players)
  * Sessões (criar/abrir)
  * Movimentos (CRUD)
  * Convidar (gerar token)
* **Campanha (Jogador)**: tabs:

  * Plot (ler)
  * Minha Ficha (criar/editar)
  * Sessões (abrir sessão)
* **Sessão**:

  * topo: name/date/masterNotes/summary (se mestre -> edit summary)
  * painel central: registros de rolagens (infinite scroll)
  * rodapé: painel de rolagem com controls:

    * escolher character (select)
    * escolher movement (select)
    * escolher mode (radio: Desvantagem / Normal / Vantagem)
    * botão Rolar
* **Editor de Ficha**:

  * atributos com **radio groups** para -1..+3, e indicador de soma restante (live).
  * movimentos: checkbox list com moves ativos (apenas os disponíveis).
  * campos textareas para background/equipment/notes.
* **Componentes UI**:

  * Preferir radio buttons para valores numéricos restritos (atributos, modifier).
  * Usar toasts para sucesso/erro, modals para confirmação de exclusão.

## 7.1 Biblioteca de componentes sugerida

Recomendação: **Ionic React** (componentes mobile-first, PWA-ready) ou **TailwindCSS + Radix UI** para composições modernas. **Ionic React** tem vantagem:

* componentes prontos para mobile, comportamento nativo (tabbar, modals) e fácil PWA.
  Se preferir algo mais "web": **Mantine** também é bastante amigável mobile e componentizada.

(Escolha final depende de gosto; documentação e desenvolvimento offline.)

# 8. Deploy / CI

* Repositório GitHub com `main` branch.
* GH Actions:

  * on: push/main → steps: checkout, node install, build (`npm run build`), deploy to `gh-pages` (uses peaceiris/actions-gh-pages).
  * rodar lint/tests antes de deploy.
* Firebase:

  * para dev local usar `firebase emulators`.
  * usar Cloud Functions deploy separados.
* Observação: GitHub Pages serve o build estático. Se usar Firebase Hosting, pode preferir deploy para Firebase Hosting (mais integrado) — você pediu GitHub Pages, então build → gh-pages é ok.

# 9. Validações, casos de borda e requisitos não-funcionais

* **Validações críticas**:

  * Atributos: cada valor ∈ [-1,3], soma absoluta = 3. Enforce client+server.
  * Movements modifier ∈ [-1,3].
  * Player só 1 ficha por campaign.
  * PDM rolls can only be created by master (server enforced).
* **Auditoria**:

  * salvar `createdBy` e `updatedBy` nos documentos críticos.
* **Offline / PWA**:

  * permitir read-only de plots/última sessão quando offline (cache com service worker).
* **Performance**:

  * indexar coleções frequentemente lidas (sessions rolls).
* **Localização**:

  * textos em PT-BR; preparar i18n (react-i18next).
* **Acessibilidade**:

  * botões grandes, alto contraste, labels para radio buttons.

# 10. APIs / Cloud Functions recomendadas (callable)

* `generateInvite(campaignId, {expiresAt, usesLimit})` → cria token, retorna link.
* `validateInvite(token)` → retorna campaignId ou erro; atomically marca `usedBy`.
* `createCharacter(characterData)` → garante 1 ficha por jogador e valida atributos.
* `createRoll(sessionId, rollData)` → valida quem pode rolar (player vs mestre/PDM).
* `deleteRoll(sessionId, rollId)` → autoriza apenas mestre.

# 11. Exemplos de aceitação automatizada (testes)

* Test: Jogador tenta criar ficha com soma != 3 → falha com erro "atributos devem somar 3".
* Test: Jogador tenta adicionar movimento não pertencente à campanha → falha.
* Test: Mestre gera token, jogador aceita → jogador aparece em `campaign.players` com `status: accepted`.
* Test: Rolagem com vantagem (3d6 descartando menor) → confirma que usedDice são os dois maiores.
* Test: Mestre exclui roll → roll removido; jogador não consegue re-criar/excluir.

# 12. Exemplo de fluxo de token (detalhado técnico)

1. Mestre clica “Gerar convite”.
2. front chama `POST /generateInvite` (callable) com `campaignId`.
3. Cloud Function cria doc `invites/{tokenId}` com `{token, campaignId, createdBy, expiresAt, usedBy: []}` e retorna `token`.
4. Jogador recebe token; na interface "Aceitar convite" cola token.
5. front chama `POST /validateInvite` com token e `request.auth.uid`.
6. Function valida token/não expirado/uso permitido, adiciona `{userId, status: accepted, joinedAt}` a `campaigns/{campaignId}.players`.
7. Retorna success; UI mostra campanha.

# 13. Observações e decisões facultativas

* **Onde rodar a lógica de rolagem?** Pode ser client-side (melhor UX) mas salve imediatamente no Firestore; para evitar trapaça em jogos públicos, mova a geração de número aleatório para Cloud Function (server) que é chamada e retorna o resultado — tradeoff entre latência e confianza. Recomendo: **Cloud Function opcional: serverRoll(mode, movementId, characterId)**. Em uma mesa social não-competitiva, client-side é aceitável.
* **Logs e moderação**: manter `auditTrail` para ações destrutivas (delete roll).
* **Notificações**: usar Cloud Messaging para avisar mestre quando jogador aceitar token ou quando rolagens importantes ocorrerem.

# 14. Checklist para a IA desenvolvedora (passo-a-passo mínimo de implementação)

1. Setup repo React + Ionic (ou Mantine + Tailwind).
2. Integrar Firebase Auth (Google + Email/Senha).
3. Modelar Firestore collections (usar local emulator).
4. Implementar Security Rules básicas e Cloud Functions `generateInvite`, `validateInvite`, `createRoll` com validações.
5. Construir UI: login, dashboards, campanha, sessão, editor de ficha, painel de rolagens.
6. Implementar lógica de rolagem (preferivelmente em Cloud Function e replicar client-side para preview rápido).
7. Testes end-to-end (playwright / cypress) cobrindo as HU principais.
8. Pipeline GH Actions -> build -> gh-pages.
9. Documentar endpoints e fluxo de deploy no README.

# 15. Entregáveis que posso gerar pra você agora (se quiser)

* Esquema JSON para cada documento do Firestore (exemplos concretos).
* Exemplo de regras do Firestore (snippet).
* Pseudocódigo para Cloud Functions.
* Proposta de layout de telas (wireframes textuais ou código React + Ionic de telas base).
* Arquivo `README` com instruções de deploy GH Actions.

---

Se quiser eu já gero:

* o **JSON schema** e **exemplo de regras** do Firestore,
* e/ou **pseudocódigo** das Cloud Functions (`generateInvite`, `validateInvite`, `createRoll`, `deleteRoll`) — pronto pra copiar e transformar em TypeScript/Node.

Qual desses prefere que eu gere agora? Posso começar com as **regras de segurança + schemas** (úteis para a IA que vai desenvolver).


Abaixo está **todo o Item 15**, completamente reescrito e refinado **para uso direto por uma IA desenvolvedora**, com foco em clareza, precisão e implementação.
É **autocontido**, não depende de outros itens do documento anterior.
Você pode usar isso como *trilha de execução* para a IA que irá programar o sistema.

---

# **15. Especificação Técnica — Integração Completa com Firebase (Para IA Desenvolvedora)**

Este item descreve **exatamente como o sistema deve se estruturar no Firebase**, quais coleções devem existir, quais documentos devem ser criados e como as permissões de leitura/escrita devem funcionar.
Não contém credenciais.
**A IA implementadora receberá os dados de inicialização e configuração do Firebase posteriormente.**

---

# **15.1. Arquitetura Geral no Firebase**

O backend será **100% Firebase**, utilizando:

* **Firebase Authentication**
* **Cloud Firestore**
* **Cloud Storage** (opcional para upload de imagens futuramente)
* **Firebase Hosting** (Github Pages será o deploy do front-end, mas o backend fica no Firebase)
* **Firebase Security Rules**

---

# **15.2. Firebase Authentication**

### **Modos de login permitidos**

1. **Login via Google**

   * Se o email for igual ao email designado como *mestre oficial*, usuário = *mestre*.
   * Caso contrário, usuário = *jogador*.

2. **Login via email/senha**

   * Usado somente para testes.
   * Terá dois perfis pré-cadastrados:

     * Mestre de teste
     * Jogador de teste

---

# **15.3. Estrutura de Dados no Firestore**

A IA deve criar a seguinte estrutura:

```
/users
    /{uid}

/campaigns
    /{campaignId}

/campaignInvites
    /{inviteId}

/characters
    /{characterId}

/sessions
    /{sessionId}

/rolls
    /{rollId}

/globalMoveLibrary
    /{moveId}
```

---

# **15.3.1. /users/{uid}**

Documento criado automaticamente no primeiro login do usuário.

**Campos obrigatórios:**

* `uid: string`
* `email: string`
* `name: string`
* `role: "master" | "player"`
* `createdAt: timestamp`

**Regras de acesso:**

* Usuário pode ler e editar **somente seu próprio documento**.
* Mestre não pode editar documentos de usuários (não é um sistema de admin de usuários).

---

# **15.3.2. /campaigns/{campaignId}**

Criado **somente pelo mestre**.

**Campos:**

* `campaignId: string`
* `name: string`
* `description: string` (plot)
* `masterId: uid`
* `playerIds: string[]` (após convite aceito)
* `moves: string[]` → IDs dos movimentos cadastrados pelo mestre
* `createdAt: timestamp`
* `updatedAt: timestamp`

---

# **15.3.3. /campaignInvites/{inviteId}**

Representa o token de convite.

**Campos:**

* `inviteId: string`
* `campaignId: string`
* `createdBy: uid`
* `createdAt: timestamp`
* `acceptedBy: uid | null`

**Fluxo esperado pela IA:**

* Mestre clica “gerar convite”.
* Gera um documento e retorna o `inviteId`.
* Jogador insere o token na interface.
* Sistema valida:

  * Se existe.
  * Se pertence a uma campanha válida.
* Atualiza `acceptedBy`.
* Inclui o jogador em:

  * `/campaigns/{campaignId}.playerIds`

---

# **15.3.4. /characters/{characterId}**

Existem dois tipos:

* `playerCharacter`
* `npc`

**Campos obrigatórios:**

```
characterId: string
ownerId: uid  (para jogador)
createdBy: uid  (mestre sempre, para NPC)
campaignId: string
type: "player" | "npc"
name: string
background: string
attributes:
    strength: -1 to +3
    agility: -1 to +3
    wisdom: -1 to +3
    charisma: -1 to +3
    intuition: -1 to +3
equipment: string[]  (somente jogadores)
notes: string         (somente jogadores)
moves: string[]       (apenas IDs)
createdAt: timestamp
updatedAt: timestamp
```

**Regra obrigatória:**
→ A IA deve validar que **a soma dos atributos seja sempre 3** antes de salvar.

**Permissões:**

* Jogadores podem ler **apenas** seu personagem.
* Mestre pode ler **todos** os personagens da sua campanha.
* Jogador pode editar **apenas o seu**.
* Mestre pode editar **todos**.

---

# **15.3.5. /globalMoveLibrary/{moveId}**

Movimentos cadastrados pelo mestre.

**Campos:**

```
moveId: string
name: string
description: string
modifier: -1 to +3
campaignId: string
createdBy: uid
createdAt: timestamp
```

**Observações importantes:**

* Jogadores **não podem criar** movimentos.
* Jogadores **somente podem adicionar à própria ficha** movimentos que existam na lista da campanha.
* NPCs possuem **todos os movimentos** da campanha automaticamente.

---

# **15.3.6. /sessions/{sessionId}**

Cada sessão pertence a uma campanha.

**Campos:**

```
sessionId: string
campaignId: string
name: string
date: timestamp
publicNotes: string       (visível a todos)
masterNotes: string       (visível só ao mestre, opcional)
finalSummary: string      (preenchido pelo mestre ao finalizar)
createdAt: timestamp
updatedAt: timestamp
```

**Regras importantes:**

* Jogadores podem ver apenas:

  * `publicNotes`
  * `finalSummary`
* Mestre pode editar tudo.
* Sessões funcionam como contêineres de rolagens.

---

# **15.3.7. /rolls/{rollId}**

Rolagens ficam TODAS em uma coleção separada, com `sessionId` como chave de busca.

**Campos:**

```
rollId: string
sessionId: string
campaignId: string
characterId: string
rolledBy: uid
isNpc: boolean
mode: "normal" | "advantage" | "disadvantage"
diceValues: number[]    (2 ou 3 valores)
finalDice: number       (valor da rolagem final usada)
total: number           (finalDice + modifier)
moveUsed: string | null
modifier: number        (-1 to +3)
resultCategory: "failure" | "partial" | "success"
timestamp: timestamp
```

**Cálculo da IA:**

* Normal → rola 2 dados → `sum = d1 + d2`
* Vantagem → rola 3 → descarta menor → soma dos 2 maiores
* Desvantagem → rola 3 → descarta maior → soma dos 2 menores
* Total = soma + modificador

**Takings PBTA:**

* 6– → *failure*
* 7–9 → *partial*
* 10+ → *success*

**Permissões:**

* Mestre pode excluir qualquer rolagem.
* Jogadores não podem excluir.
* Todos podem visualizar.

---

# **15.4. Security Rules — Diretrizes para a IA**

A IA deve implementar regras que garantam:

### **Usuário só pode editar:**

* Seu próprio `/users/{uid}`
* Seu próprio `/characters/{characterId}` **se for jogador**
* Nada relacionado às funções de mestre

### **O mestre pode editar:**

* Suas próprias campanhas
* Sessões da campanha
* Personagens (incluindo os dos jogadores)
* Movimentos da campanha
* Rolagens

### **Jogadores podem ler:**

* A campanha onde estão `playerIds` inclui seu uid
* Sessões dessa campanha
* Rolagens dessa campanha
* Apenas seu personagem

### **Jogadores NÃO podem ler:**

* Fichas de NPC
* Fichas de outros jogadores
* Notas privadas do mestre

---

# **15.5. Regras obrigatórias que a IA deve implementar no código**

1. **A soma dos atributos deve ser exatamente 3.**
2. **Jogador só pode ter 1 ficha.**
3. **NPC pertence sempre ao mestre.**
4. **NPCs possuem todos os movimentos da campanha automaticamente.**
5. **Movimentos só podem ser usados em rolagem se estiverem na ficha do personagem.**
6. **Somente o mestre pode criar campanha, movimentos e NPCs.**
7. **Jogador só entra na campanha após aceitar o token.**
8. **Token só pode ser usado uma única vez.**

---

# **15.6. Funções Cloud Opcionalmente Sugeridas**

A IA pode criar (opcional, conforme necessidade):

### 1. `onInviteAccepted`

Adiciona o jogador à campanha automaticamente.

### 2. `onNPCCreated`

Associa todos os movimentos automaticamente ao NPC.

### 3. `onRollCreated`

Valida rolagem antes de escrever.

---

# **15.7. Fluxos que a IA deve implementar (visão clara)**

### **Fluxo 1 – Criar Campanha (Mestre)**

1. Mestre clica “Criar campanha”.
2. Front coleta nome e descrição (plot).
3. Salva em `/campaigns`.
4. Inicializa arrays vazias:

   * `playerIds`
   * `moves`

---

### **Fluxo 2 – Jogador entra via Token**

1. Jogador acessa “Entrar na campanha”.
2. Digita token → IA consulta `/campaignInvites`.
3. Se válido → IA:

   * Preenche `acceptedBy`.
   * Inclui jogador em:

     * `/campaigns/{campaignId}.playerIds`
4. Jogador passa a ver a campanha.

---

### **Fluxo 3 – Jogador cria fichas**

1. IA verifica se jogador já tem ficha.
2. Se não → exibe formulário com:

   * Nome
   * Background
   * Atributos (radio buttons)
   * Equipamentos
   * Notas
   * Seleção de movimentos disponíveis da campanha
3. Valida soma dos atributos = 3
4. Cria `/characters/{characterId}`

---

### **Fluxo 4 – Mestre cria NPC**

1. Mestre abre “Criar NPC”.
2. Preenche nome, background, atributos.
3. IA seta:

   * `ownerId = null`
   * `type = "npc"`
4. IA atribui **todos os movimentos da campanha** automaticamente.
5. Salva em `/characters`.

---

### **Fluxo 5 – Criar Sessão**

1. Mestre cria sessão → `/sessions`.
2. Jogadores passam a vê-la imediatamente.

---

### **Fluxo 6 – Rolar dados**

1. Usuário escolhe:

   * Tipo: normal, vantagem, desvantagem
   * Movimento ou “puro”
2. IA valida:

   * Jogador só usa movimentos da própria ficha
3. Backend gera os dados.
4. IA salva em `/rolls`.
5. IA calcula resultado PBTA
6. Todos veem o painel de rolagens.

---

### **Fluxo 7 – Finalizar Sessão**

1. Mestre preenche resumo.
2. IA salva em `finalSummary`.

---

Se quiser, posso agora gerar:

✅ **Diagrama de dados**
✅ **Wireframes de todas as telas**
✅ **Backlog completo de desenvolvimento**
✅ **Plano para IA desenvolvedora seguir passo a passo**
✅ **Versão em YAML para importar em modelos LLM builders**

É só pedir!

Perfeito — abaixo está **o conjunto completo de prompts modulares**, totalmente **agnósticos de tecnologia** (servem para React, Vue, Quasar, Svelte, Next, Remix, etc.), pensados especificamente para **IA de IDE** (Cursor, Windsurf, Cline, Claude Code, Codeium, etc.).

Esses prompts:

✅ São independentes
✅ Não se chocam
✅ São autoexplicativos
❗ E se você usar todos eles em ordem, o sistema **inteiro** ficará implementado.

Eles cobrem **100%** do RPG-PWA que você descreveu.

---

# ✅ COMO USAR ESTES PROMPTS

1. Copie o prompt da etapa.
2. Cole para a IA da IDE.
3. Ela implementa **apenas aquele módulo**.
4. Você testa.
5. Só então passa para a próxima etapa.

⚠️ Cada prompt começa com:

> **“Implemente somente este módulo sem alterar nenhum outro existente.”**

Isso é extremamente importante.

---

# 🧩 **PACOTE COMPLETO DE PROMPTS MODULARES (100% DO SISTEMA)**

### ⬇️ Copie cada bloco conforme for usando.

### Ordem recomendada.

---

# **PROMPT 1 — Arquitetura + Setup Inicial**

```
Implemente SOMENTE a estrutura base do projeto. Não crie telas ainda.

Objetivo:
Configurar:
- roteamento
- estado global
- autenticação Firebase
- páginas vazias
- layouts base
- proteção de rotas

Requisitos:
- Criar estrutura de pastas: auth/, campaigns/, sheets/, moves/, sessions/, rolls/, shared/
- Criar um Router com rotas vazias:
  - /login
  - /dashboard
  - /campaigns/:id
  - /sheet/:id
  - /session/:id
- Criar guards de rota:
  - bloquear acesso de quem não está autenticado
  - separar rotas de Mestre e Jogador (por role)
- Criar store global para: user, role, currentCampaign
- Configurar Firebase Auth usando Google Login
- Criar um layout base com Header e Container
- NÃO implemente nenhuma UI ou lógica de negócio ainda.

Implementar somente isso.
```

---

# **PROMPT 2 — Login + Role Detection**

```
Implemente SOMENTE o fluxo de autenticação.

Objetivo:
- Login com Google
- Detectar roles (Mestre/Jogador)
- Redirecionar após login
- Logout

Regras:
- Mestre é o e-mail fixo: jonnathan.riquelmo@gmail.com
- Outros e-mails → jogador

Telas necessárias:
- /login com botão "Entrar com Google"
- Ao logar:
   - se master → /dashboard/master
   - se player → /dashboard/player

Crie apenas este módulo. Não modifique nada além do fluxo de login e role.
```

---

# **PROMPT 3 — Dashboard de Jogador e Mestre**

```
Implementar SOMENTE as duas dashboards separadas:

Dashboard do Mestre
- listar campanhas criadas pelo mestre (vazio ainda)
- botão “Criar campanha”
- botão “Movimentos”
- botão “Sessões”

Dashboard do Jogador
- caixa para colar token da campanha
- mostrar campanhas já vinculadas

Não implemente criação, edição ou lógica — apenas a UI e o roteamento correto.

Somente isso.
```

---

# **PROMPT 4 — CRUD de Campanhas**

```
Implemente somente o módulo de campanhas.

Funcionalidades:
- Mestre cria campanha (name + description)
- Exibir campanha na dashboard do mestre
- Cada campanha gera automaticamente um token UUID
- Jogador entra na campanha colando token
- Validar:
    - token existe
    - token corresponde a uma campanha
    - jogador não entra mais de 1x

Criar telas:
- /campaigns/:id com:
    - nome, descrição
    - lista de jogadores vinculados
    - botão “Abrir sessões”
    - botão “Movimentos”

Implementar somente esse módulo sem alterar login ou outros fluxos.
```

---

# **PROMPT 5 — Ficha do Jogador (Player Sheet)**

```
Implemente SOMENTE o módulo de fichas.

Jogador:
- pode ter apenas 1 ficha por campanha
- campos:
    name
    background
    atributos: força, agilidade, sabedoria, carisma, intuição (cada um entre -1 e 3)
- soma absoluta dos atributos deve ser EXATAMENTE 3
- salvamento só funciona com validação
- jogador pode editar apenas sua própria ficha

Mestre:
- pode ver e editar todas as fichas
- pode criar fichas NPC (quantas quiser)

Criar:
- /sheet/:id com tabs:
    - dados básicos
    - atributos (radio buttons)
    - movimentos escolhidos
    - equipamentos / notas

Implementar apenas isso neste passo.
```

---

# **PROMPT 6 — CRUD de Movimentos**

```
Implemente somente o módulo de movimentos (moves).

Mestre:
- criar
- editar
- deletar

Campos:
- name
- description
- modifier (-1..3)

Jogador:
- escolher movimentos da lista criada pelo mestre
- máximo: conforme Campo moves[] na ficha

NPC:
- possuem todos os movimentos automaticamente (sem UI pra isso agora)

Implementar:
- tela /moves com listagem
- tela /moves/:id (form)

Somente isso. Não alterar outros módulos.
```

---

# **PROMPT 7 — Sessões**

```
Implemente SOMENTE o módulo de sessões.

Mestre:
- criar sessão (name + date)
- acessar /session/:id
- adicionar publicNotes
- adicionar masterNotes (somente mestre vê)
- adicionar finalSummary (apenas ao fechar sessão)
- encerrar sessão

Jogador:
- apenas visualizar sessões da campanha

Implementar listagem:
- /campaigns/:id/sessions

Somente isso.
```

---

# **PROMPT 8 — Módulo de Rolagens (2d6 PBtA)**

```
Implemente SOMENTE o módulo de rolagem.

Regras:
- modos:
   - normal: 2d6
   - vantagem: 3d6 descarta o menor
   - desvantagem: 3d6 descarta o maior
- campos do resultado:
   values[]
   discarded
   baseSum
   modifier
   total
   outcome (success, partial, failure)

Interface:
- escolher personagem (só os do jogador, ou NPCs se mestre)
- escolher movimento
- escolher modo
- botão “Rolar”
- histórico cronológico na sessão

Regras:
- Jogador só rola usando sua ficha
- Mestre pode rolar para NPC
- Mestre pode excluir rolagens
- Jogador não pode excluir

Implementar apenas isso.
```

---

# **PROMPT 9 — Firestore Security Rules**

```
Gerar SOMENTE as Firestore Rules baseadas nos módulos implementados.

Regras obrigatórias:
- jogador só acessa sua própria ficha
- mestre acessa tudo
- jogador só pode ter 1 ficha por campanha
- jogador só pode rolar usando sua ficha
- mestre pode rolar para NPCs
- mestre pode excluir rolagens
- movimentos só podem ser criados/editados/deletados pelo mestre
- tokens só podem ser usados 1x por jogador
- sessões: mestre edita, jogador só lê
- atributos: soma absoluta = 3 (validado também em Cloud Function)

Gerar rules completas e comentadas.
```

---

# **PROMPT 10 — Cloud Functions (Validações Críticas)**

```
Implemente SOMENTE as Cloud Functions:

1. validateSheet
- recebe atributos
- valida soma absoluta = 3
- valida 1 ficha por jogador por campanha

2. rollDice
- implementa rolagem 2d6
- modos (normal, vantagem, desvantagem)
- monta objeto completo conforme regra PBtA

3. validateMoveAssignment
- jogador só pode escolher movimentos existentes
- mestre pode atribuir a NPC

Somente isso. Não editar regras ou frontend.
```

---

# **PROMPT 11 — Deploy (CI/CD em GitHub Actions)**

```
Adicionar SOMENTE workflow de deploy:

Requisitos:
- build do projeto
- deploy automático em GitHub Pages
- cache de node_modules
- disparar em push na branch main

Mantendo estrutura atual. Não alterar código da aplicação.
```

---

# **PROMPT 12 — Testes Manuais e Checklist**

```
Gerar SOMENTE um documento com:

- lista completa de testes manuais
- cenários críticos
- fluxo de ponta a ponta
- testes de permissão
- testes de sessão e rolagens
- testes de validação na ficha
- checklist final do MVP

Nenhuma alteração de código neste prompt.
```

---

# ✅ QUER QUE EU MONTE AGORA **UM PDF** COM TODOS ESTES PROMPTS ORGANIZADOS BONITINHO?

Ou prefere uma versão **“prompt único que explica como usar os prompts modulares”**?



Aqui está um **prompt curto, direto e limpo**, que **somente informa tecnologias**, sem requisitos de fluxo, sem regras funcionais, apenas o **stack mínimo obrigatório** para um agente de IDE configurar antes do desenvolvimento.

---

# ✅ **PROMPT (somente stack tecnológico)**

Copie e use assim mesmo:

```
Use este stack tecnológico para construir o sistema:

Frontend:
- React 18
- TypeScript
- Vite como bundler
- Biblioteca de UI mobile-first recomendada: MUI (Material UI) com componentes otimizados para mobile, usando responsive design
- React Router v6
- Zustand para estado global (ou Redux Toolkit se necessário)
- TailwindCSS apenas para utilidades de layout mobile-first (opcional, não obrigatório)

Backend / Banco:
- Firebase Authentication (Google Sign-In)
- Firestore como banco de dados principal
- Cloud Functions para regras críticas de negócio
- Firebase Storage (se necessário)
- Configuração via Firebase CLI

Infra:
- Deploy via GitHub Pages ou Firebase Hosting
- CI/CD com GitHub Actions

Regras:
- Não alterar esse conjunto de tecnologias.
- Toda implementação futura deve seguir exatamente esse stack.
```

---

# ✅ Quer uma versão **para colocar no system prompt de um agente da IDE**?

Posso gerar uma versão **blindada**, que o agente nunca ignore, e outra **mais flexível**, se preferir.


Perfeito.
Aqui está **a cadeia completa de prompts** — todos independentes de tecnologia, ordenados e prontos para copiar/colar.
Eles foram organizados para que:

* **Somados**, descrevem o sistema inteiro.
* **Separados**, cada um funciona de forma modular.
* Podem ser usados em **qualquer ordem posterior**, exceto onde eu marcar dependências.

---

# 🧩 **CADEIA COMPLETA DE PROMPTS — SISTEMA DE RPG (PWA)**

✔ Tecnologia neutra (exceto onde explicitamente pedido)
✔ Modular
✔ Escalável
✔ Preparado para um PWA

---

# **🔥 PROMPT 1 — *Tecnologias que serão usadas***

*(Este é sempre o primeiro prompt da cadeia.)*

> O projeto utilizará as seguintes tecnologias:
>
> * **React** como framework principal.
> * **Uma biblioteca de UI mobile-first recomendada para PWAs** (escolha da IA entre: MUI, Radix + Tailwind, Mantine, Chakra UI ou outra justificável).
> * **Vite** como bundler e ferramenta de desenvolvimento.
> * **Firebase** como backend (Firestore, Auth, Storage se necessário).
>
> Apenas registre as tecnologias e diga que todos os prompts seguintes devem **assumir esse conjunto como obrigatório**.

---

# **🔥 PROMPT 2 — *O sistema será um PWA***

*(Use após o Prompt 1)*

> O sistema final deve ser um **PWA**.
> Isso implica:
>
> * Instalável no celular e no desktop.
> * Manifest.json configurado.
> * Service worker gerenciado pelo Vite/Workbox.
> * Offline parcial ou total (cache de assets e páginas críticas).
> * Arquitetura mobile-first desde o início.
>
> Registre esse requisito e informe que todos os prompts posteriores devem considerá-lo.

---

# **🔥 PROMPT 3 — *Visões do Sistema (Público e Mestre)***

*(Independente do restante, só requer que o PWA já tenha sido definido)*

> O sistema terá **duas visões**:
>
> 1. **Visão pública (jogador)**
>
>    * O jogador só enxerga as próprias fichas, sessões e status.
>    * Não vê dados de outros jogadores.
> 2. **Visão de Mestre (admin)**
>
>    * Apenas o dono do email *[jonnathan.riquelmo@gmail.com](mailto:jonnathan.riquelmo@gmail.com)* é mestre inicial.
>    * Pode cadastrar outros mestres futuramente (coleção de mestres no Firebase).
>    * O mestre vê tudo: fichas, registros, cenas, visões, rolagens.
>
> Defina claramente todos os limites entre as duas visões.

---

# **🔥 PROMPT 4 — *Arquitetura Geral de Telas e Fluxos***

*(Depende apenas do Prompt 3)*

> Com base nas duas visões (público e mestre), descreva **todas as telas necessárias**, separando por:
>
> * Telas de autenticação
> * Telas públicas (jogadores)
> * Telas de mestre
> * Telas administrativas
> * Telas de gestão de sessão de RPG
> * Telas de registro e log de eventos da sessão
>
> Para cada tela, liste:
>
> * Objetivo
> * Fluxos de entrada/saída
> * Dados necessários
> * Permissão exigida (jogador ou mestre)
> * Possíveis navegações

---

# **🔥 PROMPT 5 — *Sistema de Sessões de RPG* (estrutura narrativa)**

*(Independe de tecnologia, mas depende dos prompts 3 e 4)*

> Descreva como funcionará o **sistema de Sessões**, incluindo:
>
> * Criação de sessão (mestre)
> * Convite de jogadores
> * Registro contínuo de eventos da sessão
> * Logs automáticos
> * Fichas vinculadas aos jogadores
> * Organização de capítulos / cenas
> * Ferramentas do mestre para registro, notas e eventos
>
> O foco é narrativo e organizacional, não tecnológico.

---

# **🔥 PROMPT 6 — *Estrutura de Fichas de Personagem (Compatível com PbtA)***

*(Independe do Prompt 5 — pode ser usado antes ou depois)*

> Crie a definição de uma ficha de personagem estilo PbtA, totalmente em português.
> A ficha deve conter:
>
> * Atributos base (explicar quais são e por quê)
> * Movimentos
> * Condições / Marcas de Stress / Status negativos
> * Inventário simples
> * Ligações com outros personagens
> * Histórico
> * Campos personalizáveis
>
> Também defina quantos pontos iniciais para distribuir.

---

# **🔥 PROMPT 7 — *Sistema de Visões / Profecias / Eventos Sobrenaturais***

*(Funciona isolado, mas se integra ao log da sessão do Prompt 5)*

> Crie uma tabela de “Visões” sobrenaturais, profecias ou pistas enigmáticas.
> Essas visões surgem quando o mestre aciona eventos especiais.
>
> Cada visão deve conter:
>
> * Título
> * Descrição curta
> * Efeito narrativo
> * Possível impacto mecânico
> * Como o jogador descobre
> * Como aparece no painel do mestre

---

# **🔥 PROMPT 8 — *Banco de Dados Firebase (coleções e regras)***

*(Depende dos Prompts 3, 4, 5, 6 e 7)*

> Gere o modelo completo de banco de dados para Firebase (Firestore), incluindo:
>
> * Coleções
> * Subcoleções
> * Campos
> * Índices
> * Regras de segurança
> * Quem pode ler/escrever o quê
>
> Lembre-se:
>
> * Jogadores só podem ver o que é deles.
> * Mestre pode ver tudo.
> * Sessões podem ter subcoleções de eventos, fichas, visões e registros.

---

# **🔥 PROMPT 9 — *Regras de Autorização e Segurança***

*(Depende DO Prompt 8)*

> Crie todas as regras de segurança e autorização, incluindo:
>
> * Firebase Auth
> * Controle por email
> * Controle de mestres
> * Permissões por visão (jogador/mestre)
> * Sanitização de dados
> * Prevenção de escalonamento de privilégios

---

# **🔥 PROMPT 10 — *Componentização e Padrões de UI***

*(Depende dos Prompts anteriores, focado em frontend)*

> Gere a arquitetura de componentes React para o projeto.
> Inclua:
>
> * Pastas
> * Componentes compartilhados
> * Hooks
> * Contexts / state management
> * Componentes específicos de telas
> * Padrões visuais baseados na biblioteca mobile-first escolhida
>
> O resultado deve possibilitar escrever o código real a seguir.

---

# **🔥 PROMPT 11 — *Geração de Código (por tela, componente ou função)*

*(Usado só quando todo o resto estiver definido)*

> A partir de agora, gere código conforme solicitado (por tela, componente, módulo ou função), respeitando:
>
> * Stack definida
> * PWA
> * Firebase
> * Arquitetura definida nos prompts anteriores
>
> Mantenha compatibilidade e boas práticas.

---

# **🔥 PROMPT 12 — *Testes Automatizados***

*(Opcional; depende do Prompt 11)*

> Gere testes automatizados para cada parte do sistema, incluindo:
>
> * Testes de UI
> * Testes de fluxo
> * Testes de autenticação
> * Testes de regras de permissão
> * Testes de integração com Firebase
>
> Utilize a biblioteca recomendada pela IA (Vitest, Testing Library, Playwright etc).

---

# **🔥 PROMPT 13 — *DevOps e Deploy***

*(Final da cadeia)*

> Explique como gerar build, configurar deploy, publicar como PWA e manter o sistema.
> Deve incluir:
>
> * Deploy no Firebase Hosting
> * Configuração de service worker
> * Configuração do manifest
> * Checklist final de publicação PWA

---

# 🎯 Quer que eu também entregue uma **versão ZIP** com todos esses prompts em Markdown organizado?

Se quiser, monto um arquivo `.md` completo com índice, pronto para colar na IDE do agente.
