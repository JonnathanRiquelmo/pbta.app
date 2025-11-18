import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/master$/)
}

async function loginPlayer(page: any) {
  await page.goto('/login')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/player$/)
}

test('Fluxo convite: mestre gera, jogador aceita e aparece em jogadores', async ({ page, browser }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').fill('Campanha E2E')
  await page.getByPlaceholder('Plot (opcional)').fill('Teste')
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.goto('/dashboard/master')
  await page.getByText('Suas campanhas').waitFor()
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
  await playerPage.getByPlaceholder('Cole o token de convite').fill(token)
  await playerPage.getByRole('button', { name: 'Usar token' }).click()
  await playerContext.close()
  await page.goto(`/campaigns/${campaignId}`)
  await expect(page.getByText('Jogadores')).toBeVisible()
  await expect(page.getByText('Jogador')).toBeVisible()
})