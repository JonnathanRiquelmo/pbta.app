import { test, expect } from '@playwright/test'

test('Teste simples: login mestre e logout', async ({ page }) => {
  // Passo 1: Fazer logout inicial
  await page.goto('http://localhost:5173/pbta.app/dashboard/master')
  const logoutButton = page.getByRole('button', { name: 'Sair' })
  if (await logoutButton.count() > 0) {
    await logoutButton.click()
    await page.waitForURL('**/home')
  }
  
  // Passo 2: Ir para home e fazer login
  await page.goto('http://localhost:5173/pbta.app/home')
  await page.getByRole('button', { name: 'Acessar Sistema' }).click()
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL('**/dashboard/master')
  
  // Verificar se está no dashboard correto
  await expect(page.locator('h2')).toContainText('Painel do Mestre')
  
  // Passo 3: Fazer logout
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL('**/home')
  
  // Verificar se voltou para home
  await expect(page.locator('h1')).toContainText('PBTA')
})

test('Teste simples: login jogador e logout', async ({ page }) => {
  // Passo 1: Fazer logout inicial
  await page.goto('http://localhost:5173/pbta.app/dashboard/player')
  const logoutButton = page.getByRole('button', { name: 'Sair' })
  if (await logoutButton.count() > 0) {
    await logoutButton.click()
    await page.waitForURL('**/home')
  }
  
  // Passo 2: Ir para home e fazer login
  await page.goto('http://localhost:5173/pbta.app/home')
  await page.getByRole('button', { name: 'Acessar Sistema' }).click()
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  await page.waitForURL('**/dashboard/player')
  
  // Verificar se está no dashboard correto
  await expect(page.locator('h2')).toContainText('Painel do Jogador')
  
  // Passo 3: Fazer logout
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL('**/home')
  
  // Verificar se voltou para home
  await expect(page.locator('h1')).toContainText('PBTA')
})