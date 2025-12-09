import { test, expect } from '@playwright/test'

test('Teste básico de login - mestre', async ({ page }) => {
  await page.goto('http://localhost:5173/pbta.app/login')
  
  // Verificar se a página carregou
  await expect(page.locator('h1')).toContainText('PBTA')
  
  // Clicar em Login Mestre
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  // Verificar se foi redirecionado para o dashboard
  await page.waitForURL('**/dashboard/master')
  
  // Verificar se o dashboard do mestre carregou
  await expect(page.locator('h2')).toContainText('Painel do Mestre')
  
  console.log('Login como mestre funcionou!')
})

test('Teste básico de login - jogador', async ({ page }) => {
  await page.goto('http://localhost:5173/pbta.app/login')
  
  // Verificar se a página carregou
  await expect(page.locator('h1')).toContainText('PBTA')
  
  // Clicar em Login Jogador
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  
  // Verificar se foi redirecionado para o dashboard
  await page.waitForURL('**/dashboard/player')
  
  // Verificar se o dashboard do jogador carregou
  await expect(page.locator('h2')).toContainText('Painel do Jogador')
  
  console.log('Login como jogador funcionou!')
})