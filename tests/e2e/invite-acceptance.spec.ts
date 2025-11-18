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
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.goto('/login')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.getByPlaceholder('Cole o token de convite').fill(token)
  await page.getByRole('button', { name: 'Usar token' }).click()
  await page.waitForFunction((cid) => {
    try {
      const root = JSON.parse(localStorage.getItem('pbta_campaigns') || '{}')
      const pc = (root as any)[cid]
      return !!pc && Array.isArray(pc.players) && pc.players.length > 0
    } catch { return false }
  }, campaignId)
  await page.goto(`/campaigns/${campaignId}`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('li', { hasText: 'Jogador' })).toBeVisible()
})