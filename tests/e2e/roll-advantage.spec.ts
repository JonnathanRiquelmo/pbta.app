import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Rolagem com vantagem usa os dois maiores dados e outcome coerente', async ({ page }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').fill('Campanha Rolls')
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
      name: 'Goblin',
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
      name: 'Sessão 1',
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
  await page.waitForTimeout(500)
  await page.getByText('Rolagens PBtA').waitFor()
  await page.getByLabel('Quem').selectOption({ label: 'NPC: Goblin' })
  await page.getByLabel('Modo').selectOption('advantage')
  await page.getByRole('button', { name: 'Rolar' }).click()
  const diceText = await page.getByText(/Dados:/).textContent()
  const nums = diceText?.match(/Dados: \[(.*)\] → usados: \[(.*)\]/)
  const all = (nums?.[1] || '').split(',').map(s => Number(s.trim()))
  const used = (nums?.[2] || '').split(',').map(s => Number(s.trim()))
  const top = [...all].sort((a,b)=>b-a).slice(0,2)
  expect(used).toEqual(top)
  const totalText = await page.getByText(/Total:/).textContent()
  const parts = totalText?.match(/Total: (\d+) \+ (\-?\d+) = (\d+) → (\w+)/)
  const baseSum = Number(parts?.[1] || '0')
  const mod = Number(parts?.[2] || '0')
  const total = Number(parts?.[3] || '0')
  expect(total).toBe(baseSum + mod)
})