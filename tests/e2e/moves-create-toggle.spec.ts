import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Criar movimento, ativar/desativar e refletir em ficha e sessão', async ({ page }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').fill('Campanha Moves')
  await page.getByPlaceholder('Plot (opcional)').fill('Fluxo de Moves')
  await page.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await page.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]

  await page.goto(`/campaigns/${campaignId}/moves`)
  await page.getByText('Movimentos').waitFor()
  await page.getByLabel('Nome').fill('Ataque Preciso')
  await page.getByLabel('Descrição').fill('Ataque com precisão')
  await page.getByLabel('Modificador').selectOption('2')
  await page.getByLabel('Ativo').check()
  await page.getByRole('button', { name: 'Criar' }).click()
  await expect(page.getByText('created')).toBeVisible()
  await expect(page.locator('input[value="Ataque Preciso"]')).toBeVisible()

  await page.goto(`/characters/${campaignId}`)
  await page.getByText('Minha Ficha').waitFor()
  await page.getByLabel('Nome').fill('Jogador Moves')
  await page.getByLabel('Antecedentes').fill('Tester')
  await page.getByRole('group', { name: 'Força' }).getByLabel('1', { exact: true }).click()
  await page.getByRole('group', { name: 'Agilidade' }).getByLabel('1', { exact: true }).click()
  await page.getByRole('group', { name: 'Sabedoria' }).getByLabel('1', { exact: true }).click()
  await page.getByText('Ataque Preciso').click()
  await page.getByRole('button', { name: 'Criar Ficha' }).click()
  await expect(page.getByText('created')).toBeVisible()

  await page.goto(`/campaigns/${campaignId}/sessions`)
  await page.getByText('Criar Sessão').waitFor()
  await page.getByLabel('Nome').fill('Sessão Moves')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.getByRole('link', { name: 'Abrir' }).click()
  await page.getByLabel('Quem').selectOption({ label: 'Jogador: Jogador Moves' })
  await page.getByLabel('Movimento').selectOption({ label: 'Ataque Preciso' })

  await page.goto(`/campaigns/${campaignId}/moves`)
  const nameInput = page.locator('input[value="Ataque Preciso"]')
  const row = nameInput.locator('..').locator('..').locator('..')
  await row.getByLabel('Ativo').uncheck()
  await row.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('saved')).toBeVisible()
  const sessionId = await page.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_sessions') || '{}')
    const sessions = root[cid] || {}
    const ids = Object.keys(sessions)
    return ids[0] || ''
  }, campaignId)
  await page.goto(`/sessions/${sessionId}`)
  await page.getByText('Rolagens PBtA').waitFor()
  await page.getByLabel('Quem').selectOption({ label: 'Jogador: Jogador Moves' })
  const opts = await page.getByLabel('Movimento').locator('option').allTextContents()
  expect(opts.includes('Ataque Preciso')).toBe(false)
})