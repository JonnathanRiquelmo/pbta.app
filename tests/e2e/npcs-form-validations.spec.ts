import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Usar o botão de Dev Tools para login rápido
  const devLoginButton = await page.getByRole('button', { name: 'Login Mestre' }).count()
  if (devLoginButton > 0) {
    await page.getByRole('button', { name: 'Login Mestre' }).click()
  }
  
  // Aguardar redirecionamento para dashboard do mestre
  await page.waitForURL(/\/pbta\.app\/dashboard\/master$/, { timeout: 15000 })
  
  // Verificar que estamos na dashboard correta
  await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible({ timeout: 15000 })
}

async function criarCampanhaTeste(page: any, nome: string, plot: string) {
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/pbta\.app\/dashboard\/create-campaign$/, { timeout: 15000 })
  
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(nome)
  if (plot) {
    await page.getByPlaceholder('Descreva o cenário inicial...').fill(plot)
  }
  
  // Não há dialog no novo fluxo, apenas navegação direta
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  await page.waitForURL(/\/pbta\.app\/campaigns\/[^/]+$/, { timeout: 15000 })
  
  // Voltar para o dashboard para verificar a campanha na lista (opcional, mas boa prática para garantir persistência)
  await page.goto('/pbta.app/dashboard/master')
  // Usar filter para evitar ambiguidade se houver múltiplas campanhas com mesmo nome
  await expect(page.locator('.campaign-card').filter({ hasText: nome }).first()).toBeVisible({ timeout: 5000 })
}

async function selectAttribute(page: any, name: string, value: number) {
  const row = page.locator('.attr-row').filter({ hasText: name })
  // Values: -1, 0, 1, 2, 3. Indices: 0, 1, 2, 3, 4.
  // Value -1 => Index 0
  // Value 0 => Index 1
  // Value 1 => Index 2
  // Value 2 => Index 3
  // Value 3 => Index 4
  const index = value + 1
  await row.locator('.radio-group label').nth(index).click()
}

test.describe('NPCs: Validações de Formulário', () => {
  test.describe.configure({ mode: 'serial' })
  
  const campaignName = `Campanha Validações ${Date.now()}`

  test('NPCs: validação de soma de atributos - cenários diversos', async ({ page }) => {
    await loginMaster(page)
    
    // Criar campanha de teste
    await criarCampanhaTeste(page, campaignName, 'Teste de validação de somas')
    
    await page.goto('dashboard/master')
    await page.locator('.campaign-card').filter({ hasText: campaignName }).first().click()
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    
    await page.getByRole('button', { name: 'Fichas' }).click()
    await page.getByRole('button', { name: 'Novo NPC' }).click()
    
    // Preencher campos obrigatórios
    await page.getByPlaceholder('Nome do NPC').fill('Teste Somas')
    await page.getByPlaceholder('Background do NPC').fill('Testando somas')
    
    // Teste 1: Soma = 0 (inválida) (tudo 0)
    await selectAttribute(page, 'Força', 0)
    await selectAttribute(page, 'Agilidade', 0)
    await selectAttribute(page, 'Sabedoria', 0)
    await selectAttribute(page, 'Carisma', 0)
    await selectAttribute(page, 'Intuição', 0)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 2: Soma = 1 (inválida) (Força 1, resto 0)
    await selectAttribute(page, 'Força', 1)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 3: Soma = 2 (inválida) (Força 1, Agilidade 1, resto 0)
    await selectAttribute(page, 'Agilidade', 1)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 4: Soma = 3 (válida) (Força 1, Agilidade 1, Sabedoria 1, resto 0)
    await selectAttribute(page, 'Sabedoria', 1)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeEnabled()
    
    // Teste 5: Soma = 4 (inválida) (Força 1, Agilidade 1, Sabedoria 1, Carisma 1)
    await selectAttribute(page, 'Carisma', 1)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 6: Soma = 5 (inválida)
    await selectAttribute(page, 'Intuição', 1)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Voltar para soma válida
    await selectAttribute(page, 'Carisma', 0)
    await selectAttribute(page, 'Intuição', 0)
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeEnabled()
  })

  test('NPCs: validação de valores negativos', async ({ page }) => {
    await loginMaster(page)
    
    // Entrar na campanha existente (reaproveitar)
    await page.goto('dashboard/master')
    await page.locator('.campaign-card').filter({ hasText: campaignName }).first().click()
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    
    await page.getByRole('button', { name: 'Fichas' }).click()
    
    // Verificar se o botão Novo NPC está visível
    await page.getByRole('button', { name: 'Novo NPC' }).click()
    
    // Preencher campos obrigatórios
    await page.getByPlaceholder('Nome do NPC').fill('Teste Negativos')
    await page.getByPlaceholder('Background do NPC').fill('Testando negativos')
    
    // Testar combinação que soma -3 (inválida pela soma algébrica)
    await selectAttribute(page, 'Força', -1)
    await selectAttribute(page, 'Agilidade', -1)
    await selectAttribute(page, 'Sabedoria', -1)
    await selectAttribute(page, 'Carisma', 0)
    await selectAttribute(page, 'Intuição', 0)
    
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Testar combinação mista válida (soma algébrica = 3)
    // 2, 2, -1, 0, 0 => Sum = 3. Válido.
    await selectAttribute(page, 'Força', 2)
    await selectAttribute(page, 'Agilidade', 2)
    await selectAttribute(page, 'Sabedoria', -1)
    
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeEnabled()
    
    // Testar combinação mista inválida
    // 2, 2, 2, -1, 0 => Sum = 5. Inválido.
    await selectAttribute(page, 'Sabedoria', 2)
    await selectAttribute(page, 'Carisma', -1)
    
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
  })

  test('NPCs: validação de campos obrigatórios', async ({ page }) => {
    await loginMaster(page)
    
    await page.goto('dashboard/master')
    await page.locator('.campaign-card').filter({ hasText: campaignName }).first().click()
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    
    await page.getByRole('button', { name: 'Fichas' }).click()
    await page.getByRole('button', { name: 'Novo NPC' }).click()
    
    // Configurar atributos válidos primeiro
    await selectAttribute(page, 'Força', 1)
    await selectAttribute(page, 'Agilidade', 1)
    await selectAttribute(page, 'Sabedoria', 1)
    await selectAttribute(page, 'Carisma', 0)
    await selectAttribute(page, 'Intuição', 0)
    
    // Teste 1: Sem nome (botão deve estar desabilitado)
    await page.getByPlaceholder('Background do NPC').fill('Teste')
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 2: Com nome mas sem background (botão deve estar desabilitado)
    await page.getByPlaceholder('Nome do NPC').fill('NPC Teste')
    await page.getByPlaceholder('Background do NPC').fill('')
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 3: Com nome e background (botão deve estar habilitado)
    await page.getByPlaceholder('Background do NPC').fill('Background de teste')
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeEnabled()
    
    // Teste 4: Nome apenas com espaços (botão deve estar desabilitado)
    await page.getByPlaceholder('Nome do NPC').fill('   ')
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
    
    // Teste 5: Background apenas com espaços (botão deve estar desabilitado)
    await page.getByPlaceholder('Nome do NPC').fill('NPC Válido')
    await page.getByPlaceholder('Background do NPC').fill('   ')
    await expect(page.getByRole('button', { name: 'Criar NPC' })).toBeDisabled()
  })
})
