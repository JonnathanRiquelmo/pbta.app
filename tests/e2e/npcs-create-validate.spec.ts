import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('NPCs: bloqueia soma inválida e cria com soma válida', async ({ page }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').fill('Campanha NPCs')
  await page.getByPlaceholder('Plot (opcional)').fill('Fluxo de NPCs')
  await page.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await page.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]

  await page.goto(`/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByText('Fichas (NPCs)').waitFor()
  const npcCard = page.locator('.card').filter({ hasText: 'Criar NPCs' })
  await expect(page.getByText('Nenhum NPC criado.')).toBeVisible()

  await npcCard.getByPlaceholder('Nome').fill('NPC Inválido')
  await npcCard.getByPlaceholder('Antecedentes').fill('Teste')
  const selects = npcCard.locator('select')
  await selects.nth(0).selectOption('1')
  await selects.nth(1).selectOption('0')
  await selects.nth(2).selectOption('0')
  await selects.nth(3).selectOption('0')
  await selects.nth(4).selectOption('0')
  await page.getByRole('button', { name: 'Adicionar à lista' }).click()
  await page.getByRole('button', { name: 'Criar NPCs' }).click()
  await expect(page.getByText('Nenhum NPC criado.')).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Fichas' }).click()
  const npcCard2 = page.locator('.card').filter({ hasText: 'Criar NPCs' })
  const selects2 = npcCard2.locator('select')
  await npcCard2.getByPlaceholder('Nome').fill('NPC Válido')
  await npcCard2.getByPlaceholder('Antecedentes').fill('Teste')
  await selects2.nth(0).selectOption('1')
  await selects2.nth(1).selectOption('1')
  await selects2.nth(2).selectOption('1')
  await npcCard2.getByRole('button', { name: 'Adicionar à lista' }).click()
  await npcCard2.getByRole('button', { name: 'Criar NPCs' }).click()
  const count = await page.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_npcs') || '{}')
    const npcs = root[cid] || {}
    return Object.keys(npcs).length
  }, campaignId)
  expect(count).toBeGreaterThan(0)
})