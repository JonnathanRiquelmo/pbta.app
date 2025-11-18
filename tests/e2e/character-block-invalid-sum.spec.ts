import { test, expect } from '@playwright/test'

async function ensureCampaignForPlayer(page: any, browser: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.getByPlaceholder('Nome').fill('Campanha Ficha')
  await page.getByPlaceholder('Plot (opcional)').fill('Teste')
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.goto('/dashboard/master')
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
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()
  await playerPage.goto('/login')
  await playerPage.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await playerPage.fill('input[placeholder="senha"]', 'Test1234!')
  await playerPage.getByRole('button', { name: 'Entrar com Email' }).click()
  await playerPage.fill('input[placeholder="Cole o token de convite"]', token)
  await playerPage.getByRole('button', { name: 'Usar token' }).click()
  await playerContext.close()
  return campaignId
}

test('Jogador bloqueado quando soma != 3 na ficha', async ({ page, browser }) => {
  const campaignId = await ensureCampaignForPlayer(page, browser)
  await page.goto(`/characters/${campaignId}`)
  await page.waitForLoadState('networkidle')
  await page.getByText('Minha Ficha').waitFor()
  await page.getByLabel('Nome').fill('Jogador')
  await page.getByLabel('Antecedentes').fill('Teste')
  await page.getByRole('group', { name: 'Força' }).getByLabel('1', { exact: true }).click()
  await page.getByRole('group', { name: 'Agilidade' }).getByLabel('1', { exact: true }).click()
  await expect(page.getByText(/Soma restante: 1/)).toBeVisible()
  await expect(page.getByRole('button', { name: /Criar Ficha/i })).toBeDisabled()
})
