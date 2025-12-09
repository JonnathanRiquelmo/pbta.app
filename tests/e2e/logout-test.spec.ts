import { test, expect } from '@playwright/test'

test('Teste de logout simples', async ({ page }) => {
  // Primeiro, fazer login
  await page.goto('http://localhost:5173/pbta.app/login')
  await expect(page.locator('h1')).toContainText('PBTA')
  
  // Fazer login como mestre
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL('**/dashboard/master')
  await expect(page.locator('h2')).toContainText('Painel do Mestre')
  
  // Agora testar logout navegando para o dashboard primeiro
  await page.goto('http://localhost:5173/pbta.app/dashboard/master')
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL('**/home')
  
  // Verificar se voltou para a página home
  await expect(page.locator('h1')).toContainText('PBTA')
})

test('Teste de logout com navegação direta', async ({ page }) => {
  // Fazer login como jogador
  await page.goto('http://localhost:5173/pbta.app/login')
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  await page.waitForURL('**/dashboard/player')
  
  // Testar logout direto do dashboard
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL('**/home')
  
  await expect(page.locator('h1')).toContainText('PBTA')
})