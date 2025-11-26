import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Rolagem com desvantagem usa os dois menores dados', async ({ page }) => {
  await page.addInitScript(() => {
    // Produz [2, 5, 6] => bottom dois: [2,5]
    ;(crypto as any).getRandomValues = (arr: Uint32Array) => {
      const src = new Uint32Array([1, 4, 5])
      arr.set(src.subarray(0, arr.length))
    }
  })
  await loginMaster(page)
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByRole('heading', { name: 'Nova Campanha' }).waitFor()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Disadv')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  await page.goto('dashboard/master')
  await page.waitForFunction(() => document.querySelectorAll('.campaign-card').length >= 1)
  await page.locator('.campaign-card').first().click()
  const url = page.url()
  const campaignId = url.split('/').pop() || ''
  await page.goto(`/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Fichas' }).click()
  const npcCard = page.locator('.card').filter({ hasText: 'Criar NPCs' })
  await npcCard.getByPlaceholder('Nome').fill('Goblin D')
  await npcCard.getByPlaceholder('Antecedentes').fill('NPC')
  const selects = npcCard.locator('select')
  await selects.nth(0).selectOption('1')
  await selects.nth(1).selectOption('1')
  await selects.nth(2).selectOption('1')
  await npcCard.getByRole('button', { name: 'Adicionar à lista' }).click()
  await npcCard.getByRole('button', { name: 'Criar NPCs' }).click()
  await page.goto(`/campaigns/${campaignId}/sessions`)
  await page.getByLabel('Nome').fill('Sessão D')
  const d = new Date(); const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).click()
  const firstLink = page.locator('.list-item').first().locator('a', { hasText: 'Abrir' })
  const href = await firstLink.getAttribute('href')
  await page.goto(href!)
  await page.getByText('Rolagens PBtA').waitFor()
  await page.getByLabel('Quem').selectOption({ label: 'NPC: Goblin D' })
  await page.getByLabel('Modo').selectOption('disadvantage')
  await page.getByRole('button', { name: 'Rolar' }).click()
  const diceText = await page.getByText(/Dados:/).textContent()
  const nums = diceText?.match(/Dados: \[(.*)\] → usados: \[(.*)\]/)
  const all = (nums?.[1] || '').split(',').map(s => Number(s.trim()))
  const used = (nums?.[2] || '').split(',').map(s => Number(s.trim()))
  const bottom = [...all].sort((a,b)=>a-b).slice(0,2)
  expect(used).toEqual(bottom)
})
