import { test, expect } from '@playwright/test'

async function setupCampaignSessionWithNpc(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.getByPlaceholder('Nome').fill('Campanha Permissões')
  await page.getByPlaceholder('Plot (opcional)').fill('Fluxo de Rolagens')
  await page.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await page.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]
  const token = await page.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_campaigns') || '{}')
    const pc = root[cid]
    const id = `i-${Date.now()}`
    const token = crypto.randomUUID()
    pc.invites[id] = { id, token, campaignId: cid, createdBy: 'u-master', createdAt: Date.now(), usedBy: [] }
    localStorage.setItem('pbta_campaigns', JSON.stringify(root))
    return token
  }, campaignId)
  await page.goto(`/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Fichas' }).click()
  const npcCard = page.locator('.card').filter({ hasText: 'Criar NPCs' })
  await npcCard.getByPlaceholder('Nome').fill('NPC Perm')
  await npcCard.getByPlaceholder('Antecedentes').fill('Teste')
  const selects = npcCard.locator('select')
  await selects.nth(0).selectOption('1')
  await selects.nth(1).selectOption('1')
  await selects.nth(2).selectOption('1')
  await npcCard.getByRole('button', { name: 'Adicionar à lista' }).click()
  await npcCard.getByRole('button', { name: 'Criar NPCs' }).click()
  await page.goto(`/campaigns/${campaignId}/moves`)
  await page.getByLabel('Nome').fill('Move Inativo')
  await page.getByLabel('Descrição').fill('Deve ficar inativo')
  await page.getByLabel('Modificador').selectOption('1')
  await page.getByRole('checkbox', { name: 'Ativo' }).uncheck()
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.goto(`/campaigns/${campaignId}/sessions`)
  await page.getByLabel('Nome').fill('Sessão Perm')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).click()
  const sessionId = await page.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_sessions') || '{}')
    const sessions = root[cid] || {}
    const ids = Object.keys(sessions)
    return ids[0] || ''
  }, campaignId)
  return { campaignId, token, sessionId }
}

test('Jogador não pode rolar para NPC; move inativo não aparece', async ({ page, browser }) => {
  const { campaignId, token, sessionId } = await setupCampaignSessionWithNpc(page)
  const pctx = await browser.newContext()
  const p = await pctx.newPage()
  await p.goto('/login')
  await p.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await p.fill('input[placeholder="senha"]', 'Test1234!')
  await p.getByRole('button', { name: 'Entrar com Email' }).click()
  await p.getByPlaceholder('Cole o token de convite').fill(token)
  await p.getByRole('button', { name: 'Usar token' }).click()

  await p.goto(`/characters/${campaignId}`)
  await p.getByText('Minha Ficha').waitFor()
  await p.getByLabel('Nome').fill('Jogador Perm')
  await p.getByLabel('Antecedentes').fill('Teste')
  await p.getByRole('group', { name: 'Força' }).getByLabel('1', { exact: true }).click()
  await p.getByRole('group', { name: 'Agilidade' }).getByLabel('1', { exact: true }).click()
  await p.getByRole('group', { name: 'Sabedoria' }).getByLabel('1', { exact: true }).click()
  await p.getByRole('button', { name: 'Criar Ficha' }).click()

  await p.evaluate(({ cid, sid }) => {
    const root = JSON.parse(localStorage.getItem('pbta_sessions') || '{}')
    const sessions = root[cid] || {}
    sessions[sid] = {
      id: sid,
      campaignId: cid,
      name: 'Sessão Perm',
      date: Date.now(),
      masterNotes: '',
      summary: '',
      createdAt: Date.now(),
      createdBy: 'u-master',
      updatedAt: Date.now()
    }
    root[cid] = sessions
    localStorage.setItem('pbta_sessions', JSON.stringify(root))
  }, { cid: campaignId, sid: sessionId })
  await p.goto(`/sessions/${sessionId}`)
  await p.getByText('Rolagens PBtA').waitFor()
  const whoOptions = await p.getByLabel('Quem').locator('option').allTextContents()
  expect(whoOptions.some(t => t.includes('NPC: NPC Perm'))).toBe(false)
  await p.getByLabel('Quem').selectOption({ label: 'Jogador: Jogador Perm' })
  const moveOptions = await p.getByLabel('Movimento').locator('option').allTextContents()
  expect(moveOptions.includes('Move Inativo')).toBe(false)
  await pctx.close()
})