import { test, expect } from '@playwright/test'

test('Acesso direto não autenticado a rota protegida redireciona para /home', async ({ page }) => {
  await page.goto('home')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.goto('campaigns/abc')
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByRole('button', { name: 'Acessar Sistema' })).toBeVisible()
})
