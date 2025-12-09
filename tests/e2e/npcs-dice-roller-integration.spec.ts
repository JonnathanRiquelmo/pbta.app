import { test, expect, Page } from '@playwright/test'

async function loginMaster(page: Page) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master/, { timeout: 20000 })
  await expect(page.getByRole('link', { name: 'Nova Campanha' })).toBeVisible({ timeout: 20000 })
}

async function createCampaign(page: Page, name: string) {
  await page.goto('/pbta.app/dashboard/master')
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(name)
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha de teste para NPCs e DiceRoller')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 15000 })
}

async function createNPC(page: Page, name: string) {
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  
  await page.getByPlaceholder('Nome do NPC').fill(name)
  await page.getByPlaceholder('Background do NPC').fill('Background de teste')
  
  // Attributes: 2, 1, 0, 0, 0
  await selectAttribute(page, 'Força', 2)
  await selectAttribute(page, 'Agilidade', 1)
  await selectAttribute(page, 'Sabedoria', 0)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.getByText('NPC criado com sucesso!')).toBeVisible()
}

async function selectAttribute(page: Page, name: string, value: number) {
  const row = page.locator('.attr-row').filter({ hasText: name })
  await row.locator('label').filter({ hasText: new RegExp(`^${value}$`) }).click()
}

async function createMove(page: Page, name: string) {
  // Assuming we are on Moves page
  await page.getByLabel('Nome').fill(name)
  await page.getByLabel('Descrição').fill(`Descrição de ${name}`)
  await page.getByRole('button', { name: 'Criar', exact: true }).click()
  await expect(page.getByText('Movimento criado com sucesso')).toBeVisible()
  
  // Toggle to active if needed (default is active)
}

test.describe('Integração NPCs com Sistema de Rolagens', () => {
  test('NPCs aparecem no DiceRoller e podem realizar rolagens', async ({ page }) => {
    await loginMaster(page)
    
    const timestamp = Date.now()
    const campanhaNome = `Campanha DiceRoller ${timestamp}`
    await createCampaign(page, campanhaNome)
    
    // 1. Criar Movimentos (para ter o que rolar)
    // Navigate to Moves page
    await page.getByRole('button', { name: 'Movimentos' }).click()
    await page.waitForURL(/\/campaigns\/[^/]+\/moves$/)
    
    // Form is already visible
    await page.getByLabel('Nome').fill('Ataque Básico')
    await page.getByLabel('Descrição').fill('Ataque simples')
    await page.getByRole('button', { name: 'Criar', exact: true }).click()
    
    // Wait for success or item in list
    await expect(page.getByText('Movimento criado com sucesso!')).toBeVisible()
    
    // Voltar para a campanha
    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    
    // 2. Criar NPCs
    await page.getByRole('button', { name: 'Fichas' }).click()
    await page.getByRole('button', { name: 'Novo NPC' }).click()
    
    const npcNome1 = `Guerreiro ${timestamp}`
    await page.getByPlaceholder('Nome do NPC').fill(npcNome1)
    await page.getByPlaceholder('Background do NPC').fill('Guerreiro')
    await selectAttribute(page, 'Força', 2)
    await selectAttribute(page, 'Agilidade', 1)
    await selectAttribute(page, 'Sabedoria', 0)
    await selectAttribute(page, 'Carisma', 0)
    await selectAttribute(page, 'Intuição', 0)
    await page.getByRole('button', { name: 'Criar NPC' }).click()
    await expect(page.getByText('NPC criado com sucesso!')).toBeVisible()
    
    await page.getByRole('button', { name: 'Novo NPC' }).click()
    const npcNome2 = `Mago ${timestamp}`
    await page.getByPlaceholder('Nome do NPC').fill(npcNome2)
    await page.getByPlaceholder('Background do NPC').fill('Mago')
    await selectAttribute(page, 'Força', 0)
    await selectAttribute(page, 'Agilidade', 0)
    await selectAttribute(page, 'Sabedoria', 2)
    await selectAttribute(page, 'Carisma', 1)
    await selectAttribute(page, 'Intuição', 0)
    await page.getByRole('button', { name: 'Criar NPC' }).click()
    await expect(page.getByText('NPC criado com sucesso!')).toBeVisible()
    
    // 3. Criar Sessão
    await page.getByRole('button', { name: 'Sessões' }).click()
    await expect(page.getByRole('heading', { name: 'Sessões' })).toBeVisible()
    
    await page.getByRole('button', { name: 'Nova Sessão' }).click()
    
    // Wait for form
    await expect(page.getByRole('heading', { name: 'Criar Sessão' })).toBeVisible()
    
    const hoje = new Date().toISOString().split('T')[0]
    await page.getByLabel('Nome').fill('Sessão 1')
    // Using locator for date input directly to avoid label issues
    await page.locator('input[type="date"]').fill(hoje)
    // await page.getByLabel('Data').fill(hoje)
    
    await page.getByRole('button', { name: 'Criar', exact: true }).click()
    
    // Wait for session creation
    await expect(page.getByText('Sessão criada com sucesso!')).toBeVisible()
    
    // 4. Entrar na Sessão
    // Click on the session button which contains the session name
    await page.getByRole('button', { name: 'Sessão 1' }).click()
    
    await page.waitForURL(/\/campaigns\/[^/]+\/session\/[^/]+$/)
    
    // 5. Verificar DiceRoller
    await expect(page.getByText('Rolador de Dados')).toBeVisible()
    
    // Select "Quem" (First select in DiceRoller)
    // Note: getByLabel might fail if label is not properly associated
    await page.locator('.dice-roller select').nth(0).selectOption({ label: `NPC: ${npcNome1}` })

    // Select Attribute (Second select)
    // Wait for options to populate (attribute list depends on selected NPC)
    await expect(page.locator('.dice-roller select').nth(1).locator('option').nth(1)).not.toHaveText('Nenhum', { timeout: 5000 })
    await page.locator('.dice-roller select').nth(1).selectOption({ label: 'FORCA' })
    
    // Select Move (Third select)
    await page.locator('.dice-roller select').nth(2).selectOption({ label: 'Ataque Básico' })
    
    // Roll
    await page.getByRole('button', { name: 'Rolar 2d6' }).click()
    
    // Check result
    await expect(page.getByText('Rolagem realizada!')).toBeVisible()
    
    // Check history
    const lastRoll = page.locator('.roll-item').first()
    await expect(lastRoll).toContainText(npcNome1)
    await expect(lastRoll).toContainText('Ataque Básico')
    await expect(lastRoll).toContainText('forca')
    await expect(lastRoll).toContainText('+2') // Strength 2
  })
})
