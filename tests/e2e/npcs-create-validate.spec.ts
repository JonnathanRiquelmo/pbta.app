import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('NPCs: bloqueia soma inválida e cria com soma válida', async ({ page }) => {
  await loginMaster(page)
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByRole('heading', { name: 'Nova Campanha' }).waitFor()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha NPCs')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Fluxo de NPCs')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  await page.goto('dashboard/master')
  await page.waitForFunction(() => document.querySelectorAll('.campaign-card').length >= 1)
  await page.locator('.campaign-card').first().click()
  const url = page.url()
  const campaignId = url.split('/').pop() || ''

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
  await expect(page.getByText('Nenhum NPC criado.')).toBeHidden()
})
