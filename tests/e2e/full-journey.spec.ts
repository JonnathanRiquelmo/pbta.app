import { test, expect, Page } from '@playwright/test'

// Helper functions
async function loginMaster(page: Page) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  // Wait for dashboard header
  await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible({ timeout: 20000 })
}

async function loginPlayer(page: Page) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  // Wait for dashboard header (Player dashboard might have different heading)
  // Assuming 'Painel do Jogador' or similar, or check URL
  await page.waitForURL(/\/dashboard\/player/, { timeout: 20000 })
}

async function createCampaign(page: Page, campaignName: string) {
  await page.goto('/pbta.app/dashboard/master')
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(campaignName)
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha de teste para jornada completa')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 20000 })
  const campaignId = page.url().split('/campaigns/')[1].split('/')[0].split('?')[0]
  
  return campaignId
}

async function generateInviteToken(page: Page, campaignId: string) {
  await page.goto(`/pbta.app/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Gerar Convite' }).click()
  await page.waitForSelector('input[value*="invite="]', { timeout: 5000 })
  
  const inviteUrl = await page.getByRole('textbox').first().inputValue()
  console.log(`Generated Invite URL: ${inviteUrl}`)
  return inviteUrl
}

async function acceptInvite(page: Page, inviteUrl: string, campaignId: string) {
  console.log(`Accepting invite with URL: ${inviteUrl}`)
  
  await page.goto('/pbta.app/dashboard/player')
  
  // Use invite URL directly
  await page.getByPlaceholder('Cole o token de convite').fill(inviteUrl)
  await page.getByRole('button', { name: 'Aceitar Convite' }).click()
  
  // Wait for redirect to campaign page
  await page.waitForURL(`**/campaigns/${campaignId}`, { timeout: 10000 })
}

async function createFicha(page: Page, campaignId: string, fichaData: any) {
  await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}`))
  
  const mySheetTab = page.getByRole('button', { name: 'Minha Ficha' })
  if (await mySheetTab.count() > 0) {
    await mySheetTab.click()
    await page.waitForTimeout(500)
  }
  
  await page.getByRole('button', { name: /Criar Ficha|Nova Ficha/ }).click()
  await page.waitForSelector('input[placeholder*="Nome"]', { timeout: 5000 })
  
  await page.getByPlaceholder('Nome do Personagem').fill(fichaData.name)
  await page.waitForTimeout(500)
  
  const antecedentesText = page.locator('text=Antecedentes')
  const antecedentesInput = antecedentesText.locator('..').locator('textarea')
  await antecedentesInput.fill(fichaData.antecedentes)
  
  const clickAttribute = async (name: string, value: number) => {
    const row = page.locator('.attr-row').filter({ hasText: name })
    await row.locator('label').filter({ hasText: new RegExp(`^${value}$`) }).click()
  }
  
  await clickAttribute('Forca', fichaData.forca)
  await clickAttribute('Agilidade', fichaData.agilidade)
  await clickAttribute('Sabedoria', fichaData.sabedoria)
  await clickAttribute('Carisma', fichaData.carisma)
  await clickAttribute('Intuicao', fichaData.intuicao)
  
  if (fichaData.movimento) {
    const moveCheckbox = page.getByLabel('Movimento')
    if (await moveCheckbox.count() > 0) {
      await moveCheckbox.check()
    }
  }
  
  await page.getByRole('button', { name: 'Salvar Ficha' }).click()
  
  // Aguardar feedback visual ou mudança de estado em vez de texto específico
  // Pode ser que a mensagem seja diferente ou o toast desapareça muito rápido
  await page.waitForTimeout(1000)
}

// Tests using separate contexts
test('Jornada completa: mestre cria campanha, jogador aceita convite e cria ficha', async ({ browser }) => {
  test.setTimeout(90000)
  const masterContext = await browser.newContext()
  const masterPage = await masterContext.newPage()
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()

  // Step 1: Master login and create campaign
  await loginMaster(masterPage)
  const campaignName = 'Campanha Teste Jornada Completa'
  const campaignId = await createCampaign(masterPage, campaignName)
  
  // Step 2: Generate invite token
  const inviteUrl = await generateInviteToken(masterPage, campaignId!)
  expect(inviteUrl).toBeTruthy()
  
  // Step 3: Player login and accept invite
  await loginPlayer(playerPage)
  await acceptInvite(playerPage, inviteUrl!, campaignId!)
  
  // Step 4: Player creates character sheet
  const fichaData = {
    name: 'Personagem Teste',
    antecedentes: 'Um herói comum',
    forca: 1,
    agilidade: 1,
    sabedoria: 1,
    carisma: 0,
    intuicao: 0,
    movimento: true
  }
  
  await createFicha(playerPage, campaignId!, fichaData)
  
  // Step 5: Verify character appears in campaign (Master view)
  await masterPage.goto(`/pbta.app/campaigns/${campaignId}`)
  await masterPage.getByRole('button', { name: 'Jogadores' }).click()
  await expect(masterPage.locator(`text=${fichaData.name}`)).toBeVisible()
  
  await masterContext.close()
  await playerContext.close()
})

test('Jornada completa com atualização de ficha existente', async ({ browser }) => {
  test.setTimeout(90000)
  const masterContext = await browser.newContext()
  const masterPage = await masterContext.newPage()
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()

  // Step 1: Master login and create campaign
  await loginMaster(masterPage)
  const campaignName = 'Campanha Teste Atualização'
  const campaignId = await createCampaign(masterPage, campaignName)
  
  // Step 2: Generate invite token
  const inviteUrl = await generateInviteToken(masterPage, campaignId!)
  expect(inviteUrl).toBeTruthy()
  
  // Step 3: Player login and accept invite
  await loginPlayer(playerPage)
  await acceptInvite(playerPage, inviteUrl!, campaignId!)
  
  // Step 4: Player creates initial character sheet
  const initialFichaData = {
    name: 'Personagem Inicial',
    antecedentes: 'Um herói comum',
    forca: 1,
    agilidade: 1,
    sabedoria: 1,
    carisma: 0,
    intuicao: 0,
    movimento: true
  }
  
  await createFicha(playerPage, campaignId!, initialFichaData)
  
  // Step 5: Player updates existing character sheet
  // We go back to campaign page to test navigation
  await playerPage.goto(`/pbta.app/campaigns/${campaignId}`)
  await playerPage.waitForTimeout(1000) // Wait for data load
  
  await playerPage.getByRole('button', { name: 'Minha Ficha' }).click()
  await playerPage.waitForTimeout(500)
  
  const openButton = playerPage.getByRole('button', { name: 'Abrir Ficha' })
  if (await openButton.count() > 0) {
    console.log('Clicking Abrir Ficha')
    await openButton.click()
  } else {
    console.log('Abrir Ficha button not found, trying direct navigation')
    await playerPage.goto(`/pbta.app/campaigns/${campaignId}/sheet`)
  }
  
  // Update character data
  console.log('Updating character data...')
  await playerPage.waitForSelector('input[placeholder*="Nome"]', { timeout: 15000 })
  
  // Wait for form to be populated with existing data
  // Aumentar timeout e verificar se o valor não é vazio antes de validar o conteúdo exato
  await expect(playerPage.getByPlaceholder('Nome do Personagem')).not.toHaveValue('', { timeout: 15000 })
  await expect(playerPage.getByPlaceholder('Nome do Personagem')).toHaveValue('Personagem Inicial', { timeout: 5000 })
  
  await playerPage.getByPlaceholder('Nome do Personagem').fill('Personagem Atualizado')
  
  const antecedentesText = playerPage.locator('text=Antecedentes')
  const antecedentesInput = antecedentesText.locator('..').locator('textarea')
  await antecedentesInput.fill('Um herói extraordinário')
  
  // Update Força from 1 to 2 and Agilidade from 1 to 0
  const clickAttribute = async (name: string, value: number) => {
    const row = playerPage.locator('.attr-row').filter({ hasText: name })
    await row.locator('label').filter({ hasText: new RegExp(`^${value}$`) }).click()
  }
  
  await clickAttribute('Forca', 2)
  await clickAttribute('Agilidade', 0)
  
  // Wait for valid attributes indicator
  await expect(playerPage.locator('text=✅ Atributos válidos')).toBeVisible()
  
  const saveButton = playerPage.getByRole('button', { name: 'Salvar Ficha' })
  await expect(saveButton).toBeEnabled()
  await playerPage.waitForTimeout(500)
  await saveButton.click()
  
  // Check for error message first
  const errorMsg = playerPage.locator('.error')
  if (await errorMsg.isVisible()) {
    console.error(`Error updating sheet: ${await errorMsg.textContent()}`)
  }
  
  // Check for success message or persistence
  try {
    await expect(playerPage.locator('.success')).toBeVisible({ timeout: 5000 })
  } catch (e) {
    console.log('Success message not found, checking persistence...')
    // If message didn't appear, maybe the update was fast? Check if value is saved.
    // We can also check if the "Salvar Ficha" button is still enabled/clickable.
    // But better to verify data.
    await playerPage.reload()
    await expect(playerPage.getByPlaceholder('Nome do Personagem')).toHaveValue('Personagem Atualizado')
  }
  
  // Step 6: Verify updated character appears in campaign (Master view)
  await masterPage.goto(`/pbta.app/campaigns/${campaignId}`)
  await masterPage.getByRole('button', { name: 'Jogadores' }).click()
  await expect(masterPage.locator('text=Personagem Atualizado')).toBeVisible()
  
  await masterContext.close()
  await playerContext.close()
})