# Definição de Rotas — pbta.app

Plataforma PBTA com modos Player e Master, PWA e Firebase. As rotas abaixo refletem os requisitos do documento e separam claramente o que é público, autenticado (Player) e administrativo (Master).

## Convenções

- Autenticação exclusivamente via Google (exceto rotas públicas)
- Modo é determinado após login: PLAYER ou MASTER
- Prefixo `master/` indica rotas restritas ao Mestre
- `:id` representa IDs do Firestore; `:publicShareId` é o identificador público de compartilhamento
- Router pode operar em modo hash (`#/...`) no deploy; caminhos abaixo são a forma canônica

## Rotas Comuns

| Rota | Propósito | Acesso |
|---|---|---|
| `/` | Página inicial com apresentação e navegação | Público |
| `/login` | Tela de autenticação (Google) | Público |
| `/dashboard` | Dashboard adaptado ao modo (PLAYER/MASTER) | Autenticado |
| `/profile` | Perfil do usuário; rolagens pessoais; notas | Autenticado |
| `/roller` | Rolador PBTA 2d6; histórico salvo | Autenticado |
| `/offline` | Estado offline e sincronização | Público |

## Rotas do Jogador (PLAYER)

| Rota | Propósito |
|---|---|
| `/sheets` | Lista de fichas do usuário |
| `/sheets/new` | Criar nova ficha PBTA |
| `/sheets/:id` | Editor de ficha do próprio usuário |
| `/sheets/:id/view` | Visualização somente leitura da ficha |
| `/campaigns` | Campanhas em que participa |
| `/campaigns/:id` | Visão da campanha (plot em modo leitura) |
| `/campaigns/:id/moves` | Moves atribuídos ao jogador na campanha |
| `/campaigns/:id/sessions` | Lista de sessões públicas da campanha |
| `/campaigns/:id/sessions/:sessionId` | Visualizar resumo de sessão |
| `/notes` | Notas pessoais do jogador |

## Rotas do Mestre (MASTER)

| Rota | Propósito |
|---|---|
| `/master` | Home/Dashboard do Mestre |
| `/master/campaigns` | Listar e gerenciar campanhas |
| `/master/campaigns/new` | Criar nova campanha |
| `/master/campaigns/:id` | Gerenciar campanha (visão geral) |
| `/master/campaigns/:id/plot` | Editor de plot da campanha |
| `/master/campaigns/:id/characters` | Ver/editar fichas de todos os jogadores |
| `/master/pdms` | Lista de PDMs (Personagens do Mestre) |
| `/master/pdms/new` | Criar novo PDM |
| `/master/pdms/:id` | Editor de PDM |
| `/master/campaigns/:id/moves` | Criar/editar/excluir moves da campanha |
| `/master/campaigns/:id/sessions` | Gerenciar sessões da campanha |
| `/master/campaigns/:id/sessions/new` | Criar nova sessão |
| `/master/campaigns/:id/sessions/:sessionId` | Editar sessão existente |
| `/master/rolls` | Painel com rolagens de todos os jogadores |
| `/master/invites` | Convidar jogadores para campanhas |
| `/master/settings` | Gestão de mestres/ACL (futuro) |

## Rotas Públicas (sem login)

| Rota | Propósito |
|---|---|
| `/public/character/:publicShareId` | Visualização pública somente leitura da ficha |
| `/public/npc/:publicShareId` | Visualização pública de PDM compartilhável |

## Observações de Acesso

- Jogadores não podem editar plot, moves globais, PDMs ou fichas de terceiros
- Mestre inicial reconhecido: `jonnathan.riquelmo@gmail.com`; demais mestres via coleção `masters`
- Histórico de rolagens:
  - Jogador vê apenas as próprias (em `/profile`)
  - Mestre vê todas (em `/master/rolls`)
- Sessões e notas privadas do mestre ficam acessíveis apenas nas rotas `master/*`