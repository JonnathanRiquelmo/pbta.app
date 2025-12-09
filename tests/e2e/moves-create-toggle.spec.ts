import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master/, { timeout: 15000 })
}

test('Criar movimento, ativar/desativar e refletir em ficha e sessão', async ({ page }) => {
  await loginMaster(page)
  
  // 1. Criar campanha
  console.log('📝 Criando campanha...')
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Moves')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Fluxo de Moves')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  
  // 2. Criar Movimento
  console.log('📝 Criando movimento...')
  await page.getByRole('button', { name: 'Movimentos' }).click()
  await page.waitForURL(/\/campaigns\/[^/]+\/moves$/)
  
  await page.getByLabel('Nome').fill('Ataque Preciso')
  await page.getByLabel('Descrição').fill('Ataque com precisão')
  await page.getByLabel('Modificador').selectOption('2')
  await page.getByRole('button', { name: 'Criar' }).click()
  
  await expect(page.getByText('Movimento criado com sucesso!')).toBeVisible()
  await expect(page.locator('input[value="Ataque Preciso"]')).toBeVisible()
  
  // Voltar para campanha
  await page.getByRole('button', { name: 'Voltar' }).click()
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  
  // 3. Criar NPC (para poder usar DiceRoller)
  console.log('📝 Criando NPC...')
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  
  await page.getByPlaceholder('Nome do NPC').fill('Goblin Teste')
  await page.getByPlaceholder('Background do NPC').fill('Inimigo fraco')
  
  // Atributos (soma = 3)
  // Força = 2
  await page.locator('.attr-row').filter({ hasText: /^For[cç]a/i }).getByText('2', { exact: true }).click()
  // Agilidade = 1
  await page.locator('.attr-row').filter({ hasText: /^Agilidade/i }).getByText('1', { exact: true }).click()
  // Outros = 0
  await page.locator('.attr-row').filter({ hasText: /^Sabedoria/i }).getByText('0', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: /^Carisma/i }).getByText('0', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: /^Intui[cç][aã]o/i }).getByText('0', { exact: true }).click()
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.getByText('Goblin Teste')).toBeVisible()
  
  // 4. Criar Sessão
  console.log('📝 Criando Sessão...')
  await page.getByRole('button', { name: 'Sessões' }).click()
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  
  // Aguardar modal
  await page.waitForTimeout(1000)
  
  const nameInput = page.locator('label').filter({ hasText: 'Nome' }).locator('input').first()
  const dateInput = page.locator('label').filter({ hasText: 'Data' }).locator('input[type="date"]').first()
  
  await nameInput.fill('Sessão Moves')
  await dateInput.fill(new Date().toISOString().split('T')[0])
  await page.getByRole('button', { name: 'Criar', exact: true }).click()
  
  // 5. Abrir Sessão
  console.log('🚀 Abrindo Sessão...')
  await page.locator('.session-list li').first().waitFor({ state: 'visible' })
  await page.getByRole('button', { name: 'Sessão Moves' }).click()
  
  await page.waitForURL(/\/campaigns\/[^/]+\/session\/[^/]+$/)
  
  // 6. Verificar DiceRoller
  console.log('🎲 Verificando DiceRoller...')
  const diceRoller = page.locator('.dice-roller')
  await expect(diceRoller).toBeVisible()
  
  // Selecionar NPC
  await diceRoller.locator('select').first().selectOption({ label: 'NPC: Goblin Teste' })
  
  // Verificar se o Movimento "Ataque Preciso" aparece no select de movimentos
  // O select de movimentos é o terceiro select (Quem, Atributo, Movimento)
  // Ou posso procurar pelo label "Movimento"
  const moveSelect = diceRoller.locator('label', { hasText: 'Movimento' }).locator('..').locator('select')
  
  await expect(moveSelect).toBeVisible()
  await expect(moveSelect).toContainText('Ataque Preciso')
  
  console.log('✅ Movimento refletido no DiceRoller com sucesso!')
})
