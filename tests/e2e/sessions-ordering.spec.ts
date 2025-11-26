import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Sessões são listadas da mais recente para a mais antiga', async ({ page }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').waitFor({ state: 'visible', timeout: 10000 })
  await page.getByPlaceholder('Nome').fill('Campanha Ordenação')
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.waitForTimeout(500)
  await page.goto('dashboard/master')
  const idText = await page.locator('li >> nth=-1').locator('span').nth(1).textContent()
  const campaignId = (idText || '').replace('#','').trim()
  await page.goto(`/campaigns/${campaignId}/sessions`)

  function dateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const d1 = new Date(Date.now() - 86400000 * 2)
  const d2 = new Date(Date.now() - 86400000)
  const d3 = new Date(Date.now())

  // Criar três sessões
  const nameInput = page.getByRole('textbox', { name: 'Nome' }).first()
  const dateInput = page.getByLabel('Data').first()
  await nameInput.fill('S1')
  await dateInput.fill(dateStr(d1))
  await page.getByRole('button', { name: 'Criar' }).first().click()
  await nameInput.fill('S2')
  await dateInput.fill(dateStr(d2))
  await page.getByRole('button', { name: 'Criar' }).first().click()
  await nameInput.fill('S3')
  await dateInput.fill(dateStr(d3))
  await page.getByRole('button', { name: 'Criar' }).first().click()

  // Coleta ordem dos itens
  const items = page.locator('.list-item')
  const topName = await items.first().getByLabel('Nome').inputValue()
  expect(topName).toBe('S3')
})
