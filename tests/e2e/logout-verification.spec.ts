import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await expect(page).toHaveURL(/\/dashboard\/master$/)
}

test('Logout encerra sessão e redireciona para /home; refresh mantém /home', async ({ page }) => {
  await loginMaster(page)

  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForTimeout(500)
  await expect(page).toHaveURL(/\/home$/)

  await page.reload()
  await page.waitForTimeout(1000)
  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByRole('button', { name: 'Acessar Sistema' })).toBeVisible()
})

