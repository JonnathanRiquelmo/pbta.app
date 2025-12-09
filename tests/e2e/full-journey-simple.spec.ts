import { test, expect, Page, Browser } from '@playwright/test'

async function logout(page: Page) {
  try {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.goto('/pbta.app/login')
  } catch {
    // Ignore errors
  }
}

async function loginMaster(page: Page) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.reload()
  
  const loginBtn = page.getByRole('button', { name: 'Login Mestre' })
  await loginBtn.waitFor({ state: 'visible' })
  await loginBtn.click()
  
  // Wait for dashboard header
  try {
    await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible({ timeout: 20000 })
  } catch (e) {
    console.log('Login failed or dashboard not loaded. Current URL:', page.url())
    throw e
  }
}

async function loginPlayer(page: Page) {
  await logout(page)
  await page.goto('/pbta.app/login')
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  await page.waitForURL(/\/dashboard\/player$/)
}

test('Teste simples: login mestre e criar campanha', async ({ page }) => {
  await loginMaster(page)
  
  // Navigate to campaign creation
  await page.goto('/pbta.app/dashboard/create-campaign')
  
  // Fill form
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Teste Simples')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha teste')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Wait for redirect
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 15000 })
  
  const campaignId = page.url().split('/').pop()
  expect(campaignId).toBeTruthy()
  
  console.log('Campaign created with ID:', campaignId)
})