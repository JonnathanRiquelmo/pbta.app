import { test, expect } from '@playwright/test'

test('Atualizações em tempo real: rolagens aparecem/exclusões refletem entre mestre e jogador', async ({ browser }) => {
  const context = await browser.newContext()
  const master = await context.newPage()
  const player = await context.newPage()

  await master.goto('/login')
  await master.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await master.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await master.fill('input[placeholder="senha"]', 'Test1234!')
  await master.getByRole('button', { name: 'Entrar com Email' }).click()
  await master.getByPlaceholder('Nome').fill('Campanha Realtime')
  await master.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await master.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]
  const token = await master.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_campaigns') || '{}')
    const pc = root[cid]
    const id = `i-${Date.now()}`
    const token = crypto.randomUUID()
    pc.invites[id] = { id, token, campaignId: cid, createdBy: 'u-master', createdAt: Date.now(), usedBy: [] }
    localStorage.setItem('pbta_campaigns', JSON.stringify(root))
    return token
  }, campaignId)
  // Cria NPC via UI e sessão
  await master.goto(`/campaigns/${campaignId}`)
  await master.getByRole('button', { name: 'Fichas' }).click()
  const npcCard = master.locator('.card').filter({ hasText: 'Criar NPCs' })
  await npcCard.getByPlaceholder('Nome').fill('NPC RT')
  await npcCard.getByPlaceholder('Antecedentes').fill('Teste')
  const selects = npcCard.locator('select')
  await selects.nth(0).selectOption('1')
  await selects.nth(1).selectOption('1')
  await selects.nth(2).selectOption('1')
  await npcCard.getByRole('button', { name: 'Adicionar à lista' }).click()
  await npcCard.getByRole('button', { name: 'Criar NPCs' }).click()

  // Cria sessão
  
  await master.goto(`/campaigns/${campaignId}/sessions`)
  await master.getByLabel('Nome').fill('Sessão RT')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await master.getByLabel('Data').fill(ds)
  await master.getByRole('button', { name: 'Criar' }).click()
  const sessionId = await master.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_sessions') || '{}')
    const sessions = root[cid] || {}
    const ids = Object.keys(sessions)
    return ids[0] || ''
  }, campaignId)

  // Jogador entra, aceita convite e cria ficha
  await player.goto('/')
  await player.evaluate(() => { localStorage.removeItem('pbta_user') })
  await player.goto('/login')
  await player.locator('input[placeholder="email"]').waitFor()
  await player.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await player.fill('input[placeholder="senha"]', 'Test1234!')
  await player.getByRole('button', { name: 'Entrar com Email' }).click()
  await player.getByPlaceholder('Cole o token de convite').fill(token)
  await player.getByRole('button', { name: 'Usar token' }).click()
  await player.goto(`/characters/${campaignId}`)
  await player.getByText('Minha Ficha').waitFor()
  await player.getByLabel('Nome').fill('Jogador RT')
  await player.getByLabel('Antecedentes').fill('Teste')
  await player.getByRole('group', { name: 'Força' }).getByLabel('1', { exact: true }).click()
  await player.getByRole('group', { name: 'Agilidade' }).getByLabel('1', { exact: true }).click()
  await player.getByRole('group', { name: 'Sabedoria' }).getByLabel('1', { exact: true }).click()
  await player.getByRole('button', { name: 'Criar Ficha' }).click()

  await master.goto(`/sessions/${sessionId}`)
  await master.reload()
  await player.goto(`/sessions/${sessionId}`)
  await master.getByText('Rolagens PBtA').waitFor()
  await player.getByText('Rolagens PBtA').waitFor()
  const initialCount = await player.locator('text=Dados:').count()

  // Mestre cria rolagem diretamente via storage (simulando criação)
  await master.evaluate((sid) => {
    const root = JSON.parse(localStorage.getItem('pbta_session_rolls') || '{}')
    const rolls = root[sid] || {}
    const id = `rl-${Date.now()}`
    rolls[id] = {
      id,
      sessionId: sid,
      dice: [3, 4, 5],
      usedDice: [5, 4],
      baseSum: 9,
      attributeRef: 'forca',
      attributeModifier: 1,
      moveRef: '',
      moveModifier: undefined,
      totalModifier: 1,
      total: 10,
      outcome: 'success',
      who: { kind: 'npc', sheetId: 'npc-rt', name: 'NPC RT' },
      createdAt: Date.now(),
      createdBy: 'u-master'
    }
    root[sid] = rolls
    localStorage.setItem('pbta_session_rolls', JSON.stringify(root))
  }, sessionId)
  await expect(player.locator('text=Dados:')).toHaveCount(initialCount + 1)

  // Mestre exclui; jogador deve ver histórico diminuir
  const before = await player.locator('text=Dados:').count()
  await master.evaluate((sid) => {
    const root = JSON.parse(localStorage.getItem('pbta_session_rolls') || '{}')
    const rolls = root[sid] || {}
    const keys = Object.keys(rolls)
    if (keys.length) delete rolls[keys[0]]
    root[sid] = rolls
    localStorage.setItem('pbta_session_rolls', JSON.stringify(root))
  }, sessionId)
  await expect(player.locator('text=Dados:')).toHaveCount(before - 1)

  // Jogador cria rolagem via storage e mestre vê histórico aumentar
  const masterCountBefore = await master.locator('text=Dados:').count()
  await player.evaluate((sid) => {
    const root = JSON.parse(localStorage.getItem('pbta_session_rolls') || '{}')
    const rolls = root[sid] || {}
    const id = `rl-${Date.now()}`
    rolls[id] = {
      id,
      sessionId: sid,
      dice: [2, 6],
      usedDice: [2, 6],
      baseSum: 8,
      attributeRef: 'forca',
      attributeModifier: 1,
      moveRef: '',
      moveModifier: undefined,
      totalModifier: 1,
      total: 9,
      outcome: 'partial',
      who: { kind: 'player', sheetId: 'sheet-rt', name: 'Jogador RT' },
      createdAt: Date.now(),
      createdBy: 'u-player'
    }
    root[sid] = rolls
    localStorage.setItem('pbta_session_rolls', JSON.stringify(root))
  }, sessionId)
  await expect(master.locator('text=Dados:')).toHaveCount(masterCountBefore + 1)

  await context.close()
})