import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
})

test('Login redireciona para dashboard por role player', async ({ page }) => {
  await page.waitForLoadState('networkidle')
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/player$/, { timeout: 15000 })
})
