import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 40000 })
}

async function loginPlayer(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  await page.waitForURL(/\/dashboard\/player$/, { timeout: 40000 })
}

test('Jogador não pode rolar para NPC; move inativo não aparece', async ({ browser }) => {
  test.setTimeout(120000)
  
  // 1. Master Setup
  const masterContext = await browser.newContext()
  const masterPage = await masterContext.newPage()
  
  console.log('🎭 Master: Login...')
  await loginMaster(masterPage)
  
  console.log('🎭 Master: Criando campanha...')
  await masterPage.getByRole('link', { name: 'Nova Campanha' }).click()
  await masterPage.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Permissões')
  await masterPage.getByPlaceholder('Descreva o cenário inicial...').fill('Teste de permissões')
  await masterPage.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await masterPage.waitForURL(/\/campaigns\/[^/]+$/)
  const campaignUrl = masterPage.url()
  const campaignId = campaignUrl.split('/').pop()
  
  // Gerar Convite
  await masterPage.getByRole('button', { name: 'Gerar Convite' }).click()
  await masterPage.waitForTimeout(1000)
  const inviteUrl = await masterPage.locator('input').first().inputValue()
  
  // Criar NPC
  console.log('🎭 Master: Criando NPC...')
  await masterPage.getByRole('button', { name: 'Fichas' }).click()
  await masterPage.getByRole('button', { name: 'Novo NPC' }).click()
  await masterPage.getByPlaceholder('Nome do NPC').fill('NPC Perm')
  await masterPage.getByPlaceholder('Background do NPC').fill('Teste')
  
  // Atributos NPC (3,0,0,0,0)
  await masterPage.locator('.attr-row').filter({ hasText: /^For[cç]a/i }).getByText('3', { exact: true }).click()
  await masterPage.locator('.attr-row').filter({ hasText: /^Agilidade/i }).getByText('0', { exact: true }).click()
  await masterPage.locator('.attr-row').filter({ hasText: /^Sabedoria/i }).getByText('0', { exact: true }).click()
  await masterPage.locator('.attr-row').filter({ hasText: /^Carisma/i }).getByText('0', { exact: true }).click()
  await masterPage.locator('.attr-row').filter({ hasText: /^Intui[cç][aã]o/i }).getByText('0', { exact: true }).click()
  
  await masterPage.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(masterPage.getByText('NPC Perm')).toBeVisible()
  
  // Criar Movimento Inativo
  console.log('🎭 Master: Criando Movimento Inativo...')
  await masterPage.getByRole('button', { name: 'Movimentos' }).click()
  await masterPage.waitForURL(/\/moves$/)
  
  await masterPage.getByLabel('Nome').fill('Move Inativo')
  await masterPage.getByLabel('Descrição').fill('Deve ficar inativo')
  await masterPage.getByLabel('Modificador').selectOption('1')
  
  // Desmarcar 'Ativo'
  const activeCheckbox = masterPage.getByRole('checkbox', { name: 'Ativo' })
  if (await activeCheckbox.isChecked()) {
      await activeCheckbox.uncheck()
  }
  
  await masterPage.getByRole('button', { name: 'Criar' }).click()
  await expect(masterPage.getByText('Movimento criado com sucesso!')).toBeVisible()
  
  // Criar Sessão
  console.log('🎭 Master: Criando Sessão...')
  await masterPage.getByRole('button', { name: 'Voltar' }).click()
  await masterPage.waitForURL(/\/campaigns\/[^/]+$/)
  
  await masterPage.getByRole('button', { name: 'Sessões' }).click()
  await masterPage.getByRole('button', { name: 'Nova Sessão' }).click()
  await masterPage.waitForTimeout(1000)
  
  await masterPage.locator('label').filter({ hasText: 'Nome' }).locator('input').first().fill('Sessão Perm')
  await masterPage.locator('label').filter({ hasText: 'Data' }).locator('input').first().fill(new Date().toISOString().split('T')[0])
  await masterPage.getByRole('button', { name: 'Criar', exact: true }).click()
  
  // Abrir Sessão para pegar URL (opcional, mas útil para debug)
  await masterPage.locator('.session-list li').first().waitFor({ state: 'visible' })
  await masterPage.getByRole('button', { name: 'Sessão Perm' }).click()
  await masterPage.waitForURL(/\/session\/[^/]+$/)
  const sessionUrl = masterPage.url()
  console.log(`✅ Sessão criada: ${sessionUrl}`)
  
  // 2. Player Context
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()
  
  console.log('👤 Player: Login e Join...')
  await loginPlayer(playerPage)
  await playerPage.goto(inviteUrl)
  await expect(playerPage.getByRole('heading', { name: 'Aceitar convite' })).toBeVisible()
  await playerPage.getByRole('button', { name: 'Aceitar convite' }).click()
  await expect(playerPage.getByText('Convite aceito!')).toBeVisible()
  await playerPage.getByRole('button', { name: 'Abrir campanha' }).click()
  await playerPage.waitForURL(/\/campaigns\/[^/]+$/)
  
  // Criar Ficha
  console.log('👤 Player: Criando Ficha...')
  await playerPage.getByRole('button', { name: 'Minha Ficha' }).click()
  await playerPage.getByRole('button', { name: 'Criar Ficha' }).click()
  
  await playerPage.getByPlaceholder('Nome do Personagem').fill('Jogador Perm')
  await playerPage.getByPlaceholder('História, medos, objetivos...').fill('Teste de permissões')
  
  // Atributos Player (2,1,0,0,0)
  await playerPage.locator('.attr-row').filter({ hasText: /^For[cç]a/i }).getByText('2', { exact: true }).click()
  await playerPage.locator('.attr-row').filter({ hasText: /^Agilidade/i }).getByText('1', { exact: true }).click()
  await playerPage.locator('.attr-row').filter({ hasText: /^Sabedoria/i }).getByText('0', { exact: true }).click()
  await playerPage.locator('.attr-row').filter({ hasText: /^Carisma/i }).getByText('0', { exact: true }).click()
  await playerPage.locator('.attr-row').filter({ hasText: /^Intui[cç][aã]o/i }).getByText('0', { exact: true }).click()
  
  await playerPage.getByRole('button', { name: 'Salvar Ficha' }).click()
  await expect(playerPage.getByText('Ficha criada com sucesso!')).toBeVisible()
  console.log('URL after save:', playerPage.url())
  console.log('Buttons:', await playerPage.getByRole('button').allInnerTexts())
  
  // Voltar para dashboard da campanha para ver as abas
  await playerPage.getByRole('button', { name: 'Voltar' }).first().click()
  await playerPage.waitForURL(/\/campaigns\/[^/]+$/)
  
  // Ir para Sessão
  console.log('👤 Player: Acessando Sessão...')
  await playerPage.getByRole('button', { name: 'Sessões' }).click()
  await playerPage.locator('.session-list li').first().waitFor({ state: 'visible' })
  await playerPage.getByRole('button', { name: 'Sessão Perm' }).click()
  await playerPage.waitForURL(/\/session\/[^/]+$/)
  
  // Verificar DiceRoller
  console.log('🎲 Player: Verificando DiceRoller...')
  const diceRoller = playerPage.locator('.dice-roller')
  await expect(diceRoller).toBeVisible()
  
  // 1. Verificar "Quem" (Who options)
  // Jogador só deve ver a si mesmo ("Eu (...)")
  const whoSelect = diceRoller.locator('select').first()
  const whoOptions = await whoSelect.locator('option').allInnerTexts()
  console.log('Player Who Options:', whoOptions)
  
  expect(whoOptions.some(o => o.includes('Eu (Jogador Perm)'))).toBeTruthy()
  expect(whoOptions.some(o => o.includes('NPC: NPC Perm'))).toBeFalsy() // Não deve ver NPC
  
  // Selecionar a si mesmo (já deve estar selecionado por padrão se for única opção)
  // Mas vamos garantir
  await whoSelect.selectOption({ label: 'Eu (Jogador Perm)' })
  
  // 2. Verificar Movimentos
  // Move Inativo NÃO deve aparecer
  const moveSelect = diceRoller.locator('label', { hasText: 'Movimento' }).locator('..').locator('select')
  // Se houver apenas 1 movimento (nenhum ativo), o select pode nem aparecer ou estar vazio/desabilitado?
  // O componente renderiza select com options.
  
  if (await moveSelect.isVisible()) {
      const moveOptions = await moveSelect.locator('option').allInnerTexts()
      console.log('Player Move Options:', moveOptions)
      expect(moveOptions.some(o => o.includes('Move Inativo'))).toBeFalsy()
  } else {
      console.log('Select de movimentos não visível (provavelmente sem movimentos ativos)')
  }
  
  console.log('✅ Validações de permissão concluídas com sucesso!')
  
  await masterContext.close()
  await playerContext.close()
})
