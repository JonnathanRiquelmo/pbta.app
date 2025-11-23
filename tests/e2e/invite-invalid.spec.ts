import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
}

test('Convite expirado e limite de uso', async ({ page }) => {
  await loginMaster(page)
  await page.getByPlaceholder('Nome').fill('Campanha Invite')
  await page.getByPlaceholder('Plot (opcional)').fill('Fluxo de invites')
  await page.getByRole('button', { name: 'Criar' }).click()
  const campaignsJson = await page.evaluate(() => localStorage.getItem('pbta_campaigns'))
  const campaigns = JSON.parse(campaignsJson || '{}')
  const campaignId = Object.keys(campaigns)[Object.keys(campaigns).length - 1]
  const expiredToken = await page.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_campaigns') || '{}')
    const pc = root[cid]
    const id = `i-expired-${Date.now()}`
    const token = crypto.randomUUID()
    pc.invites[id] = { id, token, campaignId: cid, createdBy: 'u-master', createdAt: Date.now(), expiresAt: Date.now() - 1000, usedBy: [] }
    localStorage.setItem('pbta_campaigns', JSON.stringify(root))
    return token
  }, campaignId)
  const limitedToken = await page.evaluate((cid) => {
    const root = JSON.parse(localStorage.getItem('pbta_campaigns') || '{}')
    const pc = root[cid]
    const id = `i-limit-${Date.now()}`
    const token = crypto.randomUUID()
    pc.invites[id] = { id, token, campaignId: cid, createdBy: 'u-master', createdAt: Date.now(), usesLimit: 1, usedBy: [] }
    localStorage.setItem('pbta_campaigns', JSON.stringify(root))
    return token
  }, campaignId)
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.goto('login')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.evaluate(() => { (window as any).__alerts = []; window.alert = (msg: any) => { (window as any).__alerts.push(String(msg)) } })
  await page.getByPlaceholder('Cole o token de convite').fill(expiredToken)
  await page.getByRole('button', { name: 'Usar token' }).click()
  const alerts1: string[] = await page.evaluate(() => (window as any).__alerts)
  expect(alerts1.some(a => /Convite expirado/.test(a))).toBe(true)
  await page.evaluate(() => { (window as any).__alerts = [] })

  await page.getByPlaceholder('Cole o token de convite').fill(limitedToken)
  await page.getByRole('button', { name: 'Usar token' }).click()
  const alerts2: string[] = await page.evaluate(() => (window as any).__alerts)
  expect(alerts2.some(a => /Convite aceito|Convite expirado|Limite de usos atingido|Token inválido/.test(a))).toBe(true)
})
