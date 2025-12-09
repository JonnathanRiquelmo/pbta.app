import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 15000 })
}

async function loginPlayer(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
  await page.fill('input[placeholder="senha"]', 'Test1234!')
  await page.getByRole('button', { name: 'Entrar com Email' }).click()
  await page.waitForURL(/\/dashboard\/player$/, { timeout: 15000 })
}

test.describe('Testes de Navegação e Acesso - Movimentos', () => {
  
  test('E2E: mestre acessa "Movimentos" pela campanha', async ({ page }) => {
    // Login como mestre
    await loginMaster(page)
    
    // Criar uma campanha de teste (simplificado)
    await page.goto('dashboard/master')
    
    // Criar nova campanha
    await page.getByRole('link', { name: 'Nova Campanha' }).click()
    await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Teste Navegação')
    await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha de teste para navegação')
    await page.getByRole('button', { name: 'Criar Campanha' }).click()
    await expect(page.getByText('Campanha Teste Navegação')).toBeVisible()
    
    // Aguardar redirecionamento para a página da campanha
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    const campaignUrl = page.url()
    
    // Verificar que estamos na página da campanha
    await expect(page.locator('h2')).toBeVisible()
    
    // Procurar e clicar no link "Movimentos" (visível apenas para mestre)
    const movesButton = page.getByRole('button', { name: 'Movimentos' })
    await expect(movesButton).toBeVisible()
    await movesButton.click()
    
    // Verificar que foi redirecionado para a página de movimentos
    await page.waitForURL(/\/campaigns\/[^/]+\/moves$/)
    await expect(page.getByText('Movimentos')).toBeVisible()
  })

  test('E2E: jogador não vê nem acessa "Movimentos"', async ({ page }) => {
    // Login como jogador
    await loginPlayer(page)
    
    // Tentar acessar diretamente a página de movimentos
    await page.goto('campaigns/c-1/moves')
    
    // O jogador deve ser redirecionado para o dashboard de jogador
    await expect(page).toHaveURL(/\/dashboard\/player$/)
  })

  test('E2E: jogador não vê botão "Movimentos" na campanha', async ({ page }) => {
    // Login como jogador
    await loginPlayer(page)
    
    // Acessar uma campanha como jogador
    await page.goto('campaigns/c-1')
    await page.waitForURL(/\/campaigns\/c-1$/)
    
    // Verificar que o botão "Movimentos" não está visível para o jogador
    const movesButton = page.getByRole('button', { name: 'Movimentos' })
    await expect(movesButton).not.toBeVisible()
  })

  test('E2E: mensagem de acesso negado para jogador tentando acessar movimentos', async ({ page }) => {
    // Login como jogador
    await loginPlayer(page)
    
    // Tentar acessar diretamente a página de movimentos
    await page.goto('campaigns/c-1/moves')
    
    // Verificar mensagem de acesso negado
    await expect(page.getByText('Acesso Negado')).toBeVisible()
    await expect(page.getByText('Você não tem permissão para acessar esta página. Apenas mestres podem gerenciar movimentos.')).toBeVisible()
    await expect(page.getByText('Você será redirecionado para o dashboard em instantes...')).toBeVisible()
    
    // Verificar que foi redirecionado para o dashboard do jogador
    await expect(page).toHaveURL(/\/dashboard\/player$/)
  })
})