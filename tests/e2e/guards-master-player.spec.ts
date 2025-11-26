import { test, expect } from '@playwright/test'

test('Guards: não autenticado redireciona para /home', async ({ page }) => {
  await page.goto('campaigns/any')
  await expect(page).toHaveURL(/\/home$/)
})

test('Guards: player não acessa rotas de mestre', async ({ page }) => {
  await page.goto('login')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/player$/)
  await page.goto('campaigns/c-1/moves')
  await expect(page).toHaveURL(/\/dashboard\/player$/)
})

test('Guards: mestre acessa dashboard do jogador (sem restrição)', async ({ page }) => {
  await page.goto('login')
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/master$/)
  await page.goto('dashboard/player')
  await expect(page).toHaveURL(/\/dashboard\/player$/)
})
