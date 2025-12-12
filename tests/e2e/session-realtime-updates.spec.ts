import { test, expect } from '@playwright/test'

test('Atualizações em tempo real: rolagens aparecem/exclusões refletem entre mestre e jogador', async ({ browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext()
  const master = await context.newPage()
  const player = await context.newPage()

  await master.goto('/pbta.app/login')
  await master.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Login Mestre via DevTools (mais rápido)
  const devLogin = master.getByRole('button', { name: 'Login Mestre' })
  if (await devLogin.isVisible()) {
    await devLogin.click()
  } else {
    await master.fill('input[placeholder="email"]', 'master.teste@pbta.dev')
    await master.fill('input[placeholder="senha"]', 'Test1234!')
    await master.getByRole('button', { name: 'Entrar com Email' }).click()
  }
  
  await master.waitForURL(/\/pbta\.app\/dashboard\/master/, { timeout: 15000 })
  
  // Criar campanha
  await master.getByRole('link', { name: 'Nova Campanha' }).click()
  await master.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Realtime')
  await master.waitForTimeout(1000)
  await master.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Aguardar redirecionamento e pegar ID da URL
  await master.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 40000 })
  const campaignId = master.url().split('/campaigns/')[1].split('/')[0].split('?')[0]
  console.log(`Campanha criada com ID: ${campaignId}`)

  // Gerar convite
  await master.goto(`/pbta.app/dashboard/master`)
  await master.getByRole('button', { name: 'Gerar convite' }).click()
  const lastInviteText = await master.locator('.card').filter({ hasText: 'Criar campanha' }).locator('div', { hasText: 'Último convite:' }).textContent()
  const token = (lastInviteText || '').split('invite=').pop()!.trim()
  
  // Cria NPC via UI e sessão
  await master.goto(`/pbta.app/campaigns/${campaignId}`)
  await master.getByRole('button', { name: 'Fichas' }).click()
  const npcCard = master.locator('.card').filter({ hasText: 'Criar NPCs' })
  await npcCard.getByPlaceholder('Nome').fill('NPC RT')
  await npcCard.getByPlaceholder('Antecedentes').fill('Teste')
  const selects = npcCard.locator('select')
  await selects.nth(0).selectOption('1')
  await selects.nth(1).selectOption('1')
  await selects.nth(2).selectOption('1')
  await npcCard.getByRole('button', { name: 'Adicionar à lista' }).click()
  await npcCard.getByRole('button', { name: 'Criar NPCs' }).click()

  // Cria sessão
  
  await master.goto(`/pbta.app/campaigns/${campaignId}/sessions`)
  await master.getByLabel('Nome').fill('Sessão RT')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await master.getByLabel('Data').fill(ds)
  await master.getByRole('button', { name: 'Criar' }).click()
  const firstLink = master.locator('.list-item').first().locator('a', { hasText: 'Abrir' })
  const href = await firstLink.getAttribute('href')
  const sessionId = (href || '').split('/').pop() || ''

  // Jogador entra, aceita convite e cria ficha
  await player.goto('/pbta.app/login')
  await player.evaluate(() => { localStorage.removeItem('pbta_user') })
  
  const playerDevLogin = player.getByRole('button', { name: 'Login Jogador' })
  if (await playerDevLogin.isVisible()) {
      await playerDevLogin.click()
  } else {
      await player.fill('input[placeholder="email"]', 'player.teste@pbta.dev')
      await player.fill('input[placeholder="senha"]', 'Test1234!')
      await player.getByRole('button', { name: 'Entrar com Email' }).click()
  }
  
  await player.waitForURL(/\/pbta\.app\/dashboard\/player/, { timeout: 15000 })
  
  // Usar token
  await player.goto('/pbta.app/dashboard/player')
  const tokenInput = player.getByPlaceholder('Cole o token de convite')
  if (await tokenInput.isVisible()) {
      await tokenInput.fill(token)
      await player.getByRole('button', { name: 'Usar token' }).click()
  } else {
      // Se não tiver input de token, pode ser que já esteja na campanha ou tenha um botão "Aceitar Convite"
      // Mas o teste assume fluxo de token. Vamos tentar navegar direto pro link de convite se falhar.
      console.log('Input de token não visível, tentando link direto...')
      await player.goto(`/pbta.app/invite?token=${token}`)
      await player.getByRole('button', { name: 'Aceitar convite' }).click()
  }
  await player.goto(`/pbta.app/campaigns/${campaignId}/sheet`)
  await player.getByText('Minha Ficha').waitFor()
  await player.getByLabel('Nome').fill('Jogador RT')
  await player.getByLabel('Antecedentes').fill('Teste')
  await player.getByRole('group', { name: 'Força' }).getByLabel('1', { exact: true }).click()
  await player.getByRole('group', { name: 'Agilidade' }).getByLabel('1', { exact: true }).click()
  await player.getByRole('group', { name: 'Sabedoria' }).getByLabel('1', { exact: true }).click()
  await player.getByRole('button', { name: 'Criar Ficha' }).click()

  await master.goto(`/pbta.app/sessions/${sessionId}`)
  await master.reload()
  await player.goto(`/pbta.app/sessions/${sessionId}`)
  await master.getByText('Rolagens PBtA').waitFor()
  await player.getByText('Rolagens PBtA').waitFor()
  const initialCount = await player.locator('text=Dados:').count()
  await master.getByLabel('Quem').selectOption({ label: 'NPC: NPC RT' })
  await master.getByRole('button', { name: 'Rolar' }).click()
  await expect(player.locator('text=Dados:')).toHaveCount(initialCount + 1)

  // Mestre exclui; jogador deve ver histórico diminuir
  const before = await player.locator('text=Dados:').count()
  await master.getByRole('button', { name: 'Deletar' }).first().click()
  await expect(player.locator('text=Dados:')).toHaveCount(before - 1)

  // Jogador cria rolagem via storage e mestre vê histórico aumentar
  const masterCountBefore = await master.locator('text=Dados:').count()
  await player.getByLabel('Quem').selectOption({ label: 'Jogador: Jogador RT' })
  await player.getByRole('button', { name: 'Rolar' }).click()
  await expect(master.locator('text=Dados:')).toHaveCount(masterCountBefore + 1)

  await context.close()
})
