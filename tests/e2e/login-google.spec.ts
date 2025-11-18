import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
})

test('Login Google redireciona para dashboard por role player', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrar com Google' }).click()
  await expect(page).toHaveURL(/\/dashboard\/player$/)
})