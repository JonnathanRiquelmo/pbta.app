import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/master$/)
}

async function loginPlayer(page: any) {
  await page.goto('login')
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
  await page.goto('dashboard/master')
  const idText = await page.locator('li >> nth=-1').locator('span').nth(1).textContent()
  const campaignId = (idText || '').replace('#','').trim()
  await page.getByRole('button', { name: 'Gerar convite' }).click()
  const lastInviteText = await page.locator('.card').filter({ hasText: 'Criar campanha' }).locator('div', { hasText: 'Último convite:' }).textContent()
  const token = (lastInviteText || '').split('invite=').pop()!.trim()
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.goto('login')
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
