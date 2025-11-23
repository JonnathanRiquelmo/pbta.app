import { test, expect } from '@playwright/test'

test('Login mestre por email/senha redireciona para /dashboard/master', async ({ page }) => {
  await page.goto('login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/master$/)
})

test('Login jogador por email/senha redireciona para /dashboard/player', async ({ page }) => {
  await page.goto('login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/player$/)
})

test('Login inválido mostra erro', async ({ page }) => {
  await page.goto('login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[placeholder="email"]', 'invalido@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'SenhaErrada')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page.locator('.error')).toBeVisible({ timeout: 10000 })
})
