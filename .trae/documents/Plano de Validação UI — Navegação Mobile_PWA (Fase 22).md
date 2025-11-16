# Objetivo
Validar a implementação de navegação mobile/PWA e ações no Header usando o protocolo de “Guia de Automação de UI — pbta.app”. Cobrir fluxos de JOGADOR e MESTRE, títulos dinâmicos, CTAs sticky, Tabs com ícones e páginas públicas.

## Preparação
- Base: `{BASE} = http://localhost:{PORT}/pbta.app/` (ou seu preview local)
- Atores: `MESTRE` e `JOGADOR` com credenciais do guia
- Seletores: botões por texto visível; headings/títulos por texto; confirmar ausência/presença de elementos conforme cada tela

## Cenários — JOGADOR
### 1) Login e Dashboard
- LOGIN JOGADOR via email
- NAVIGATE `#/dashboard`
- ASSERT TEXT `Dashboard`
- ASSERT EXISTS `🏠 Dashboard` (Tab inferior)

### 2) Fichas – Lista e CTA Sticky
- NAVIGATE `#/sheets`
- ASSERT TEXT `Fichas`
- ASSERT TEXT `Nova ficha` (StickyCTA)
- CLICK `Nova ficha`

### 3) Fichas – Criação e Editor
- FILL `Nome = Herói Teste`
- FILL `Playbook = Guerreiro`
- CLICK `Salvar`
- ASSERT TEXT `Editar Ficha`
- ASSERT TEXT `Herói Teste` (título dinâmico no Header)
- ASSERT EXISTS `💾 Salvar` (ação no Header)
- CLICK `Voltar`

### 4) Tabs com Ícones (Jogador)
- NAVIGATE `#/dashboard`
- ASSERT EXISTS `🎭 Fichas`
- ASSERT EXISTS `🗺️ Campanhas`
- ASSERT EXISTS `🎲 Rolagens`
- ASSERT EXISTS `📝 Notas`

### 5) Páginas Públicas – Ficha
- NAVIGATE `#/public/character/{token_valido}`
- ASSERT TEXT `Ficha Pública` ou nome da ficha
- ASSERT EXISTS `🔗 Copiar link` (Header)
- CLICK `🔗 Copiar link`

## Cenários — MESTRE
### 1) Login e Master Home
- LOGIN MESTRE via email
- NAVIGATE `#/master`
- ASSERT TEXT `Mestre`
- ASSERT EXISTS `🎛️ Mestre` (Tab inferior)

### 2) Campanhas – Lista e CTA Sticky
- NAVIGATE `#/master/campaigns`
- ASSERT TEXT `Campanhas`
- ASSERT TEXT `Nova campanha` (StickyCTA)
- CLICK `Nova campanha`

### 3) Campanhas – Criação, Detalhe e Ação no Header
- FILL `Nome = Campanha Teste`
- FILL `Regra = PbtA`
- FILL `Descrição = ...`
- CLICK `Criar` (ou `Salvar`)
- NAVIGATE `#/master/campaigns/{id_criada}`
- ASSERT TEXT `Campanha Teste` (título dinâmico)
- ASSERT EXISTS `✏️ Editar Plot` (Header)
- CLICK `✏️ Editar Plot`

### 4) Plot Editor – Ação Salvar (Header) e CTA Sticky
- FILL `Markdown do plot = ...`
- ASSERT EXISTS `💾 Salvar` (Header)
- ASSERT TEXT `Salvar` (StickyCTA)
- CLICK `Salvar`
- ASSERT TEXT `Plot salvo` (feedback)

### 5) PDMs – Lista, Criação e Editor
- NAVIGATE `#/master/pdms`
- ASSERT TEXT `PDMs`
- ASSERT TEXT `Novo PDM` (StickyCTA)
- CLICK `Novo PDM`
- FILL `Nome = NPC Teste`
- CLICK `Salvar`
- ASSERT TEXT `NPC Teste` (título dinâmico)
- ASSERT EXISTS `💾 Salvar` (Header)

### 6) Páginas Públicas – NPC
- NAVIGATE `#/public/npc/{token_valido}`
- ASSERT TEXT `NPC Público` ou `NPC Teste`
- ASSERT EXISTS `🔗 Copiar link`
- CLICK `🔗 Copiar link`

## Comportamento de Voltar e Offline
### 7) Botão Voltar
- Em páginas de detalhe (Campanha, Ficha, PDM, Sessão): CLICK `Voltar`
- ASSERT redireciona para a rota pai

### 8) Offline
- Simular offline (DevTools ou interrupção de rede)
- ASSERT `#/offline` (redirecionamento)
- ASSERT banner “Você está offline…”
- Em páginas com StickyCTA: ASSERT `Botões desabilitados` (ex.: “Nova campanha”, “Salvar”)

## Validação do Header e Títulos
- Verificar que cada página definida exibe título correto e ações no Header quando aplicável:
  - `CampaignDetail`: ✏️ Editar Plot
  - `PlotEditor`, `SessionEditor`, `SheetEditor`, `PdmEditor`: 💾 Salvar
  - Públicas (`SheetPublicView`, `PublicCharacterView`, `PdmPublicView`): 🔗 Copiar link

## Diagnóstico e Ajustes
- Se algum título não atualizar: revisar `useTitle` na página e dependências (ex.: `sheet?.name`, `pdm?.name`).
- Se ação de copiar falhar: validar disponibilidade do `navigator.clipboard` e exibir `Toast` de erro.
- Se StickyCTA não aparecer: confirmar import e inclusão da barra na página.

## Entregáveis
- Registro passo-a-passo (logs de sucesso/erros por cenário)
- Lista de correções, se houver

Confirmando, inicio a execução dos cenários acima e reporto os resultados com base no protocolo do “Guia de Automação de UI”.