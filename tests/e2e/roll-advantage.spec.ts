import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Rolagem com vantagem usa os dois maiores dados e outcome coerente', async ({ page }) => {
  await page.addInitScript(() => {
    const orig = crypto.getRandomValues
    // Produz [1, 4, 6] => top dois: [6,4]
    ;(crypto as any).getRandomValues = (arr: Uint32Array) => {
      const src = new Uint32Array([0, 3, 5])
      arr.set(src.subarray(0, arr.length))
    }
  })
  await loginMaster(page)
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByRole('heading', { name: 'Nova Campanha' }).waitFor()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Rolls')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  const url = page.url()
  const campaignId = url.split('/').pop() || ''
  await page.goto(`/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Fichas' }).click()
  const npcCard = page.locator('.card').filter({ hasText: 'Criar NPCs' })
  await npcCard.getByPlaceholder('Nome').fill('Goblin')
  await npcCard.getByPlaceholder('Antecedentes').fill('NPC')
  const selects = npcCard.locator('select')
  await selects.nth(0).selectOption('1')
  await selects.nth(1).selectOption('1')
  await selects.nth(2).selectOption('1')
  await npcCard.getByRole('button', { name: 'Adicionar à lista' }).click()
  await npcCard.getByRole('button', { name: 'Criar NPCs' }).click()
  await expect(page.getByText('Nenhum NPC criado.')).toBeHidden()
  await page.goto(`/campaigns/${campaignId}/sessions`)
  await page.getByLabel('Nome').fill('Sessão 1')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).click()
  const firstLink = page.locator('.list-item').first().locator('a', { hasText: 'Abrir' })
  const href = await firstLink.getAttribute('href')
  await page.goto(href!)
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
