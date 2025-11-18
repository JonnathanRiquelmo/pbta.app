import { test, expect } from '@playwright/test'

async function setupSessionWithRoll(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.getByPlaceholder('Nome').fill('Campanha Del')
  await page.getByPlaceholder('Plot (opcional)').fill('Teste')
  await page.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await page.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]
  const sessionId = await page.evaluate((cid) => {
    const npcRoot = JSON.parse(localStorage.getItem('pbta_npcs') || '{}')
    const npcs = npcRoot[cid] || {}
    const npcId = `npc-${Date.now()}`
    npcs[npcId] = {
      id: npcId,
      campaignId: cid,
      createdBy: 'u-master',
      type: 'npc',
      name: 'Orc',
      background: 'NPC',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: '',
      notes: '',
      moves: ['Movimento 1', 'Movimento 2', 'Movimento 3'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    npcRoot[cid] = npcs
    localStorage.setItem('pbta_npcs', JSON.stringify(npcRoot))
    const sessRoot = JSON.parse(localStorage.getItem('pbta_sessions') || '{}')
    const sessions = sessRoot[cid] || {}
    const sid = `ss-${Date.now()}`
    sessions[sid] = {
      id: sid,
      campaignId: cid,
      name: 'Sessão X',
      date: Date.now(),
      masterNotes: '',
      summary: '',
      createdAt: Date.now(),
      createdBy: 'u-master',
      updatedAt: Date.now()
    }
    sessRoot[cid] = sessions
    localStorage.setItem('pbta_sessions', JSON.stringify(sessRoot))
    return sid
  }, campaignId)
  await page.goto(`/sessions/${sessionId}`)
  await page.waitForLoadState('networkidle')
  await page.getByText('Rolagens PBtA').waitFor()
  await page.getByLabel('Quem').selectOption({ label: 'NPC: Orc' })
  await page.getByRole('button', { name: 'Rolar' }).click()
  const currentUrl = page.url()
  return currentUrl
}

test('Mestre consegue excluir rolagem e jogador não vê botão', async ({ page, browser }) => {
  const sessionUrl = await setupSessionWithRoll(page)
  await expect(page.getByText(/Histórico/)).toBeVisible()
  const before = await page.locator('text=Dados:').count()
  await page.getByRole('button', { name: 'Deletar' }).click()
  const after = await page.locator('text=Dados:').count()
  expect(after).toBe(before - 1)
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()
  await playerPage.goto('/login')
  await playerPage.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await playerPage.fill('input[placeholder="senha"]', 'Test1234!')
  await playerPage.getByRole('button', { name: 'Entrar com Email' }).click()
  await playerPage.goto(sessionUrl)
  await expect(playerPage.getByRole('button', { name: 'Deletar' })).toHaveCount(0)
  await playerContext.close()
})