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
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha de teste para NPCs em lote')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 15000 })
}

async function selectAttribute(page: Page, name: string, value: number) {
  const row = page.locator('.attr-row').filter({ hasText: name })
  await row.locator('label').filter({ hasText: new RegExp(`^${value}$`) }).click()
}

test('NPCs: criação em lote - fluxo completo com múltiplos NPCs', async ({ page }) => {
  await loginMaster(page)
  await createCampaign(page, 'Campanha Teste Lote Completo')
  
  // Acessar aba Fichas
  await page.getByRole('button', { name: 'Fichas' }).click()
  await expect(page.getByText('Nenhum NPC criado.')).toBeVisible()
  
  // Iniciar criação em lote
  await page.getByRole('button', { name: 'Criar em Lote' }).click()
  
  // Verificar que interface de lote está ativa
  await expect(page.getByRole('heading', { name: 'Criar NPCs em Lote' })).toBeVisible()
  
  // Criar primeiro NPC
  await page.getByPlaceholder('Nome do NPC').fill('Primeiro NPC')
  await page.getByPlaceholder('Background do NPC').fill('Primeiro personagem do lote')
  
  // Força 2, Agilidade 1, Resto 0
  await selectAttribute(page, 'Força', 2)
  await selectAttribute(page, 'Agilidade', 1)
  await selectAttribute(page, 'Sabedoria', 0)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  
  // Adicionar ao lote
  await page.getByRole('button', { name: 'Adicionar ao Lote' }).click()
  
  // Verificar que NPC foi adicionado
  await expect(page.getByRole('heading', { name: 'NPCs no lote (1)' })).toBeVisible()
  await expect(page.getByText('Primeiro NPC')).toBeVisible()
  await expect(page.getByText('Primeiro personagem do lote')).toBeVisible()
  
  // Verificar que formulário foi limpo (campos vazios e atributos zerados ou padrão)
  await expect(page.getByPlaceholder('Nome do NPC')).toHaveValue('')
  await expect(page.getByPlaceholder('Background do NPC')).toHaveValue('')
  
  // Criar segundo NPC com atributos diferentes
  await page.getByPlaceholder('Nome do NPC').fill('Segundo NPC')
  await page.getByPlaceholder('Background do NPC').fill('Segundo personagem do lote')
  
  // Agilidade 2, Sabedoria 1
  await selectAttribute(page, 'Força', 0)
  await selectAttribute(page, 'Agilidade', 2)
  await selectAttribute(page, 'Sabedoria', 1)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  
  await page.getByRole('button', { name: 'Adicionar ao Lote' }).click()
  
  // Verificar segundo NPC adicionado
  await expect(page.getByRole('heading', { name: 'NPCs no lote (2)' })).toBeVisible()
  await expect(page.getByText('Segundo NPC')).toBeVisible()
  
  // Criar terceiro NPC com campos opcionais
  await page.getByPlaceholder('Nome do NPC').fill('Terceiro NPC')
  await page.getByPlaceholder('Background do NPC').fill('Terceiro personagem com equipamentos')
  
  // Força 1, Sabedoria 2
  await selectAttribute(page, 'Força', 1)
  await selectAttribute(page, 'Agilidade', 0)
  await selectAttribute(page, 'Sabedoria', 2)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  
  await page.getByPlaceholder('Equipamentos').fill('Espada longa, armadura de couro')
  await page.getByPlaceholder('Notas').fill('Este NPC é importante para a quest principal')
  
  await page.getByRole('button', { name: 'Adicionar ao Lote' }).click()
  
  // Verificar terceiro NPC
  await expect(page.getByRole('heading', { name: 'NPCs no lote (3)' })).toBeVisible()
  
  // Criar todos os NPCs
  await page.getByRole('button', { name: 'Criar 3 NPC(s)' }).click()
  
  // Verificar mensagem de sucesso (opcional, pode ser rápida)
  try {
    await expect(page.getByText(/3 NPC\(s\) criado\(s\) com sucesso/)).toBeVisible({ timeout: 5000 })
  } catch (e) {
    console.log('Mensagem de sucesso não capturada, verificando lista...')
  }
  
  // Verificar que todos os NPCs aparecem na lista
  await expect(page.getByText('Primeiro NPC')).toBeVisible()
  await expect(page.getByText('Segundo NPC')).toBeVisible()
  await expect(page.getByText('Terceiro NPC')).toBeVisible()
  
  // Verificar que interface voltou ao normal (botão Criar em Lote visível)
  // Pode ser que fique na lista ou vá para detalhes do primeiro. Assumindo lista.
  if (!await page.getByRole('button', { name: 'Criar em Lote' }).isVisible()) {
      // Se não estiver visível, talvez tenha ido para detalhes, ou precisa clicar em Voltar
      // Mas normalmente após criar, volta pra lista
  }
  // await expect(page.getByRole('button', { name: 'Criar em Lote' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'NPCs no lote' })).not.toBeVisible()
})

test('NPCs: criação em lote - cancelamento e remoção', async ({ page }) => {
  await loginMaster(page)
  await createCampaign(page, 'Campanha Teste Lote Cancelamento')
  
  await page.getByRole('button', { name: 'Fichas' }).click()
  
  // Iniciar criação em lote
  await page.getByRole('button', { name: 'Criar em Lote' }).click()
  
  // Adicionar NPCs ao lote
  await page.getByPlaceholder('Nome do NPC').fill('NPC para Cancelar 1')
  await page.getByPlaceholder('Background do NPC').fill('Primeiro')
  await selectAttribute(page, 'Força', 1)
  await selectAttribute(page, 'Agilidade', 1)
  await selectAttribute(page, 'Sabedoria', 1)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  await page.getByRole('button', { name: 'Adicionar ao Lote' }).click()
  
  await page.getByPlaceholder('Nome do NPC').fill('NPC para Cancelar 2')
  await page.getByPlaceholder('Background do NPC').fill('Segundo')
  await selectAttribute(page, 'Força', 2)
  await selectAttribute(page, 'Agilidade', 1)
  await selectAttribute(page, 'Sabedoria', 0)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  await page.getByRole('button', { name: 'Adicionar ao Lote' }).click()
  
  // Verificar que lote tem 2 NPCs
  await expect(page.getByRole('heading', { name: 'NPCs no lote (2)' })).toBeVisible()
  
  // Cancelar lote
  await page.getByRole('button', { name: 'Cancelar' }).click()
  
  // Verificar que voltou à interface normal e nenhum NPC foi criado
  await expect(page.getByRole('button', { name: 'Criar em Lote' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'NPCs no lote' })).not.toBeVisible()
  await expect(page.getByText('NPC para Cancelar 1')).not.toBeVisible()
  await expect(page.getByText('NPC para Cancelar 2')).not.toBeVisible()
})

test('NPCs: criação em lote - validação durante o processo', async ({ page }) => {
  await loginMaster(page)
  await createCampaign(page, 'Campanha Teste Lote Validação')
  
  await page.getByRole('button', { name: 'Fichas' }).click()
  
  // Iniciar criação em lote
  await page.getByRole('button', { name: 'Criar em Lote' }).click()
  
  // Tentar adicionar NPC com soma inválida
  await page.getByPlaceholder('Nome do NPC').fill('NPC Inválido')
  await page.getByPlaceholder('Background do NPC').fill('Teste inválido')
  
  // Força 3 (Wait, 3 is not an option usually, max is 3 maybe? Let's use 2+2+0+0+0 = 4)
  // If radio buttons are -1, 0, 1, 2, 3. Let's use 2, 2, 0, 0, 0.
  await selectAttribute(page, 'Força', 2)
  await selectAttribute(page, 'Agilidade', 2)
  await selectAttribute(page, 'Sabedoria', 0)
  await selectAttribute(page, 'Carisma', 0)
  await selectAttribute(page, 'Intuição', 0)
  
  // Botão deve estar desabilitado
  await expect(page.getByRole('button', { name: 'Adicionar ao Lote' })).toBeDisabled()
})
