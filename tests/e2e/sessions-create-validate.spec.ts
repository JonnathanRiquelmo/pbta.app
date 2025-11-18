import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Sessões: criar, salvar, deletar e validações de nome/data', async ({ page }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').fill('Campanha Sessões')
  await page.getByPlaceholder('Plot (opcional)').fill('Fluxo de Sessões')
  await page.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await page.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]

  await page.goto(`/campaigns/${campaignId}/sessions`)
  await page.getByText('Criar Sessão').waitFor()
  await expect(page.getByRole('button', { name: 'Criar' })).toBeDisabled()
  await page.getByLabel('Nome').fill('Sessão A')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).click()

  await expect(page.getByText('Lista')).toBeVisible()
  await page.getByRole('link', { name: 'Abrir' }).click()
  await page.getByText('Resumo').waitFor()
  await page.goto(`/campaigns/${campaignId}/sessions`)
  const firstItem = page.locator('.list-item').first()
  await firstItem.getByLabel('Nome').fill('Sessão A Editada')
  await firstItem.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('saved')).toBeVisible()
  await firstItem.getByRole('button', { name: 'Deletar' }).click()
  await expect(page.getByText('deleted')).toBeVisible()
})