import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 15000 })
}

async function loginPlayer(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  await page.waitForURL(/\/dashboard\/player$/, { timeout: 15000 })
}

test('Player Character Creation Flow', async ({ browser }) => {
  // 1. Master Context: Create Campaign and Invite
  const masterContext = await browser.newContext()
  const masterPage = await masterContext.newPage()
  
  console.log('🎭 Master: Login...')
  await loginMaster(masterPage)
  
  console.log('🎭 Master: Criando campanha...')
  await masterPage.getByRole('link', { name: 'Nova Campanha' }).click()
  await masterPage.waitForURL(/\/dashboard\/create-campaign$/)
  
  await masterPage.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Personagem Jogador')
  await masterPage.getByPlaceholder('Descreva o cenário inicial...').fill('Teste de criação de ficha')
  await masterPage.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await masterPage.waitForURL(/\/campaigns\/[^/]+$/)
  const campaignUrl = masterPage.url()
  const campaignId = campaignUrl.split('/').pop()
  console.log(`✅ Master: Campanha criada: ${campaignId}`)
  
  // Generate invite
  await masterPage.getByRole('button', { name: 'Gerar Convite' }).click()
  await masterPage.waitForTimeout(1000)
  const inviteInput = masterPage.locator('input').first()
  const inviteUrl = await inviteInput.inputValue()
  console.log(`✅ Master: Convite gerado: ${inviteUrl}`)
  
  // 2. Player Context: Accept Invite and Create Character
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()
  
  console.log('👤 Player: Login...')
  await loginPlayer(playerPage)
  
  console.log('👤 Player: Aceitando convite...')
  await playerPage.goto(inviteUrl)
  
  // Verificar página de convite
  await expect(playerPage.getByRole('heading', { name: 'Aceitar convite' })).toBeVisible()
  await playerPage.getByRole('button', { name: 'Aceitar convite' }).click()
  
  // Aguardar sucesso e clicar em Abrir Campanha
  await expect(playerPage.getByText('Convite aceito!')).toBeVisible()
  await playerPage.getByRole('button', { name: 'Abrir campanha' }).click()
  
  // Aguardar redirecionamento para campanha
  // O fluxo pode ser: Invite -> Aceita -> Redireciona para Campanha
  await playerPage.waitForURL(/\/campaigns\/[^/]+$/)
  console.log('✅ Player: Entrou na campanha')
  
  // 3. Character Creation
  console.log('👤 Player: Criando ficha...')
  
  // Aba Minha Ficha
  await playerPage.getByRole('button', { name: 'Minha Ficha' }).click()
  
  // Botão Criar Ficha
  await playerPage.getByRole('button', { name: 'Criar Ficha' }).click()
  
  // Preencher formulário
  await playerPage.getByPlaceholder('Nome do Personagem').fill('Herói de Teste')
  await playerPage.getByPlaceholder('História, medos, objetivos...').fill('Um herói criado para testar o sistema')
  
  // Atributos (soma = 3)
  // Força = 2 (No CharacterSheet, o texto é gerado da chave 'forca' -> 'Forca')
  // Usando regex para garantir match de Forca/Força
  await playerPage.locator('.attr-row').filter({ hasText: /^For[cç]a/i }).getByText('2', { exact: true }).click()
  
  // Agilidade = 1
  await playerPage.locator('.attr-row').filter({ hasText: /^Agilidade/i }).getByText('1', { exact: true }).click()
  
  // Outros = 0
  await playerPage.locator('.attr-row').filter({ hasText: /^Sabedoria/i }).getByText('0', { exact: true }).click()
  await playerPage.locator('.attr-row').filter({ hasText: /^Carisma/i }).getByText('0', { exact: true }).click()
  // Intuição -> Intuicao
  await playerPage.locator('.attr-row').filter({ hasText: /^Intui[cç][aã]o/i }).getByText('0', { exact: true }).click()
  
  // Debug: Verificar estado do botão
   const buttons = await playerPage.getByRole('button').allInnerTexts()
   console.log('Buttons found:', buttons)
   
   const btn = playerPage.getByRole('button', { name: 'Salvar Ficha' })
   await expect(btn).toBeVisible()
   // Verificar se está habilitado (não tem atributo disabled)
   await expect(btn).toBeEnabled()
    
   // Salvar
   await btn.click()
  
  // Verificar sucesso
  await expect(playerPage.getByText('Ficha criada com sucesso!')).toBeVisible()
  await expect(playerPage.getByPlaceholder('Nome do Personagem')).toHaveValue('Herói de Teste')
  console.log('✅ Player: Ficha criada com sucesso!')
  
  // Cleanup contexts
  await masterContext.close()
  await playerContext.close()
})
