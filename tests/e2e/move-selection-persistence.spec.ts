import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(async () => {
      localStorage.clear()
      sessionStorage.clear()
      try {
          const dbs = await window.indexedDB.databases()
          dbs.forEach(db => window.indexedDB.deleteDatabase(db.name!))
      } catch (e) { console.error(e) }
  })
  await page.reload()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 20000 })
  await expect(page.getByRole('link', { name: 'Nova Campanha' })).toBeVisible({ timeout: 20000 })
}

async function loginPlayer(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(async () => {
      localStorage.clear()
      sessionStorage.clear()
      try {
          const dbs = await window.indexedDB.databases()
          dbs.forEach(db => window.indexedDB.deleteDatabase(db.name!))
      } catch (e) { console.error(e) }
  })
  await page.reload()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Login Jogador' }).click()
  await page.waitForURL(/\/dashboard\/player$/, { timeout: 20000 })
}

test.describe('Testes de Persistência de Seleção de Movimentos', () => {
  
  test('E2E: jogador seleciona movimentos, salva e vê persistência após reload', async ({ page }) => {
    test.setTimeout(90000)
    page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`)
        await dialog.accept().catch(() => {})
    })

    // Login como mestre para primeiro configurar movimentos na campanha
    await loginMaster(page)
    
    // Criar uma campanha de teste
    await page.goto('/pbta.app/dashboard/master')
    await page.getByRole('link', { name: 'Nova Campanha' }).click()
    await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Teste Movimentos')
    await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha de teste para persistência de movimentos')
    await page.getByRole('button', { name: 'Criar Campanha' }).click()
    await expect(page.getByText('Campanha Teste Movimentos')).toBeVisible()
    
    // Aguardar redirecionamento para a página da campanha 
    await page.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 20000 })
    const campaignUrl = page.url()
    const campaignId = campaignUrl.split('/campaigns/')[1].split('/')[0].split('?')[0]
    
    // Configurar movimentos na campanha
    await page.getByRole('button', { name: 'Movimentos' }).click()
    await page.waitForURL(/\/campaigns\/[^/]+\/moves$/)
    
    // Adicionar movimentos de teste
    const createMoveDiv = page.locator('div').filter({ hasText: 'Criar Movimento' })
    
    await createMoveDiv.locator('input').first().fill('Ataque Preciso')
    await createMoveDiv.locator('textarea').first().fill('Um ataque com precisão cirúrgica')
    await createMoveDiv.locator('select').first().selectOption('1')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.locator('.list-item input[value="Ataque Preciso"]')).toBeVisible()
    
    await createMoveDiv.locator('input').first().fill('Defesa Rápida')
    await createMoveDiv.locator('textarea').first().fill('Uma defesa ágil e rápida')
    await createMoveDiv.locator('select').first().selectOption('1')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.locator('.list-item input[value="Defesa Rápida"]')).toBeVisible()
    
    await createMoveDiv.locator('input').first().fill('Investigação')
    await createMoveDiv.locator('textarea').first().fill('Investigar pistas e encontrar respostas')
    await createMoveDiv.locator('select').first().selectOption('2')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.locator('.list-item input[value="Investigação"]')).toBeVisible({ timeout: 10000 })
    
    // Voltar para o dashboard da campanha para gerar convite
    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    
    // Gerar convite
    await page.getByRole('button', { name: 'Gerar Convite' }).click()
    await expect(page.locator('.invite-box')).toBeVisible()
    const inviteUrl = await page.locator('.invite-box input').inputValue()
    
    // Voltar para o dashboard antes de fazer logout
    await page.goto('/pbta.app/dashboard/master')
    
    // Logout do mestre (simulado via navegação para garantir)
    await page.goto('/pbta.app/home')
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    
    // Login como jogador
    await loginPlayer(page)
    
    // Aceitar convite via URL direta
    await page.goto(inviteUrl)
    
    let acceptBtn = page.getByRole('button', { name: 'Aceitar convite' })
    try {
        await acceptBtn.waitFor({ state: 'visible', timeout: 10000 })
        await acceptBtn.click()
    } catch {
        console.log('Botão Aceitar não apareceu, verificando se já foi aceito...')
        // Se o botão não aparecer, pode ser que o token já tenha sido consumido ou o usuário já esteja na campanha
        // Tentar navegar direto para a campanha se falhar
    }
    
    // Tentar clicar em Abrir campanha, ou verificar erro
    const openBtn = page.getByRole('button', { name: 'Abrir campanha' })
    try {
        if (await openBtn.isVisible()) {
            await openBtn.click()
        }
    } catch (e) {
        console.log('Botão Abrir campanha não clicável ou erro ao clicar')
    }
    
    // Acessar a campanha como jogador (redirecionamento automático ou via URL direta)
    // Se falhar o fluxo normal, forçamos a ida para a campanha
    try {
        await page.waitForURL(new RegExp(`campaigns/${campaignId}`), { timeout: 5000 })
    } catch {
        console.log('Redirecionamento automático falhou, forçando navegação...')
        await page.goto(`/pbta.app/campaigns/${campaignId}`)
    }
    
    // Criar ficha do personagem
    await page.getByRole('button', { name: 'Minha Ficha' }).click()
    await page.getByRole('button', { name: 'Criar Ficha' }).click()
    await page.waitForURL(`campaigns/${campaignId}/sheet`)
    
    // Preencher dados básicos da ficha
    await page.fill('input[placeholder="Nome do Personagem"]', 'Herói de Teste')
    await page.fill('textarea[placeholder="História, medos, objetivos..."]', 'Um herói criado para testar persistência de movimentos')
    
    // Distribuir atributos (soma deve ser 3)
    await page.locator('.attr-row').filter({ hasText: 'Forca' }).getByText('1', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).getByText('1', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).getByText('1', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Carisma' }).getByText('0', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Intuicao' }).getByText('0', { exact: true }).click()
    
    // Verificar que os movimentos estão disponíveis
    // Debug: Imprimir conteúdo da lista de movimentos se falhar
    try {
        await expect(page.getByText('Ataque Preciso')).toBeVisible({ timeout: 5000 })
    } catch (e) {
        const content = await page.locator('.moves-list').textContent()
        console.log('Conteúdo da lista de movimentos:', content)
        throw e
    }
    await expect(page.getByText('Defesa Rápida')).toBeVisible()
    await expect(page.getByText('Investigação')).toBeVisible()
    
    // Selecionar movimentos
    await page.locator('label').filter({ hasText: 'Ataque Preciso' }).locator('input[type="checkbox"]').check()
    await page.locator('label').filter({ hasText: 'Defesa Rápida' }).locator('input[type="checkbox"]').check()
    
    // Verificar que os movimentos foram selecionados
    await expect(page.locator('label').filter({ hasText: 'Ataque Preciso' }).locator('input[type="checkbox"]')).toBeChecked()
    await expect(page.locator('label').filter({ hasText: 'Defesa Rápida' }).locator('input[type="checkbox"]')).toBeChecked()
    await expect(page.locator('label').filter({ hasText: 'Investigação' }).locator('input[type="checkbox"]')).not.toBeChecked()
    
    // Salvar ficha
    await page.getByRole('button', { name: 'Salvar Ficha' }).click()
    
    // Verificar mensagem de sucesso
    await expect(page.getByText('Ficha criada com sucesso!')).toBeVisible()
    
    // Recarregar a página
    await page.reload()
    await page.waitForURL(`campaigns/${campaignId}/sheet`)
    
    // Verificar que os movimentos ainda estão selecionados após reload
    await expect(page.locator('label').filter({ hasText: 'Ataque Preciso' }).locator('input[type="checkbox"]')).toBeChecked()
    await expect(page.locator('label').filter({ hasText: 'Defesa Rápida' }).locator('input[type="checkbox"]')).toBeChecked()
    await expect(page.locator('label').filter({ hasText: 'Investigação' }).locator('input[type="checkbox"]')).not.toBeChecked()
    
    // Verificar que os dados básicos também persistiram
    await expect(page.locator('input[placeholder="Nome do Personagem"]')).toHaveValue('Herói de Teste')
    await expect(page.locator('.attr-row').filter({ hasText: 'Forca' }).getByLabel('1', { exact: true })).toBeChecked()
  })

  test('E2E: validação move_not_active quando mestre desativa movimento selecionado', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`))
    test.setTimeout(90000)
    // Login como mestre
    await loginMaster(page)
    
    // Criar uma campanha de teste
    await page.goto('/pbta.app/dashboard/master')
    await page.getByRole('link', { name: 'Nova Campanha' }).click()
    await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Teste Validação')
    await page.getByPlaceholder('Descreva o cenário inicial...').fill('Campanha de teste para validação move_not_active')
    await page.getByRole('button', { name: 'Criar Campanha' }).click()
    await expect(page.getByText('Campanha Teste Validação')).toBeVisible()
    
    // Aguardar redirecionamento para a página da campanha
    await page.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 20000 })
    const campaignUrl = page.url()
    const campaignId = campaignUrl.split('/campaigns/')[1].split('/')[0].split('?')[0]
    
    // Configurar movimentos na campanha
    await page.getByRole('button', { name: 'Movimentos' }).click()
    await page.waitForURL(/\/campaigns\/[^/]+\/moves$/)
    
    // Adicionar movimento de teste
    await page.locator('div').filter({ hasText: 'Criar Movimento' }).locator('input').first().fill('Movimento Teste')
    await page.locator('div').filter({ hasText: 'Criar Movimento' }).locator('textarea').first().fill('Um movimento que será desativado')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.locator('.list-item input[value="Movimento Teste"]')).toBeVisible()
    
    // Voltar para o dashboard da campanha para gerar convite
    await page.getByRole('button', { name: 'Voltar' }).click()
    await page.waitForURL(/\/campaigns\/[^/]+$/)
    
    // Gerar convite
    await page.getByRole('button', { name: 'Gerar Convite' }).click()
    await expect(page.locator('.invite-box')).toBeVisible()
    const inviteUrl = await page.locator('.invite-box input').inputValue()
    
    // Voltar para o dashboard antes de fazer logout
    await page.goto('/pbta.app/dashboard/master')
    
    // Logout do mestre
    await page.goto('/pbta.app/home')
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    
    // Login como jogador
    await loginPlayer(page)
    
    // Aceitar convite via URL direta
    await page.goto(inviteUrl)
    
    let acceptBtn = page.getByRole('button', { name: 'Aceitar convite' })
    try {
        await acceptBtn.waitFor({ state: 'visible', timeout: 10000 })
    } catch {
        console.log('Botão Aceitar não apareceu, tentando reload...')
        await page.reload()
        acceptBtn = page.getByRole('button', { name: 'Aceitar convite' })
        await acceptBtn.waitFor({ state: 'visible', timeout: 15000 })
    }
    await acceptBtn.click()
    
    // Tentar clicar em Abrir campanha, ou verificar erro
    const openBtn = page.getByRole('button', { name: 'Abrir campanha' })
    try {
        await openBtn.waitFor({ state: 'visible', timeout: 5000 })
        await openBtn.click()
    } catch (e) {
        // Verificar erros na tela
        const bodyText = await page.locator('body').textContent()
        console.log(`Conteúdo da página de convite após clique: ${bodyText}`)
        const errorMsg = await page.locator('p').filter({ hasText: /inválido|expirado|limite/i }).textContent().catch(() => null)
        if (errorMsg) throw new Error(`Erro no convite: ${errorMsg}`)
    }
    
    // Acessar a campanha como jogador (redirecionamento automático ou após clique)
    await page.waitForURL(new RegExp(`campaigns/${campaignId}`), { timeout: 20000 })
    
    // Criar ficha do personagem e selecionar o movimento
    await page.getByRole('button', { name: 'Minha Ficha' }).click()
    await page.getByRole('button', { name: 'Criar Ficha' }).click()
    await page.waitForURL(`campaigns/${campaignId}/sheet`)
    
    // Preencher dados básicos da ficha
    await page.fill('input[placeholder="Nome do Personagem"]', 'Personagem Teste')
    await page.fill('textarea[placeholder="História, medos, objetivos..."]', 'Testando validação de movimentos inativos')
    
    // Distribuir atributos (soma deve ser 3)
    await page.locator('.attr-row').filter({ hasText: 'Forca' }).getByText('1', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).getByText('1', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).getByText('1', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Carisma' }).getByText('0', { exact: true }).click()
    await page.locator('.attr-row').filter({ hasText: 'Intuicao' }).getByText('0', { exact: true }).click()
    
    // Selecionar o movimento
    await page.locator('label').filter({ hasText: 'Movimento Teste' }).locator('input[type="checkbox"]').check()
    await expect(page.locator('label').filter({ hasText: 'Movimento Teste' }).locator('input[type="checkbox"]')).toBeChecked()
    
    // Salvar ficha
    await page.getByRole('button', { name: 'Salvar Ficha' }).click()
    await expect(page.getByText('Ficha criada com sucesso!')).toBeVisible()
    
    // Voltar para o dashboard antes de fazer logout
    await page.goto('/pbta.app/dashboard/player')
    
    // Logout do jogador
    await page.goto('/pbta.app/home')
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    
    // Login como mestre novamente
    await loginMaster(page)
    
    // Desativar o movimento na campanha
    await page.goto(`campaigns/${campaignId}/moves`)
    await page.waitForURL(`campaigns/${campaignId}/moves`)
    
    // Localizar e desativar o movimento
    const moveItem = page.locator('.list-item').filter({ has: page.locator('input[value="Movimento Teste"]') })
    await moveItem.locator('label').filter({ hasText: 'Ativo' }).locator('input[type="checkbox"]').uncheck()
    await expect(moveItem.locator('label').filter({ hasText: 'Ativo' }).locator('input[type="checkbox"]')).not.toBeChecked()
    
    // Salvar as alterações
    await moveItem.getByRole('button', { name: 'Salvar' }).click()
    
    // Aguardar persistência (opcional: reload para garantir)
    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForURL(/\/campaigns\/[^/]+\/moves$/)
    const moveItemReloaded = page.locator('.list-item').filter({ has: page.locator('input[value="Movimento Teste"]') })
    await expect(moveItemReloaded.locator('label').filter({ hasText: 'Ativo' }).locator('input[type="checkbox"]')).not.toBeChecked()
    
    // Voltar para o dashboard antes de fazer logout
    await page.goto('/pbta.app/dashboard/master')
    
    // Logout do mestre
    await page.goto('/pbta.app/home')
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    
    // Login como jogador novamente
    await loginPlayer(page)
    
    // Acessar a ficha
    await page.goto(`campaigns/${campaignId}/sheet`)
    await page.waitForURL(`campaigns/${campaignId}/sheet`)
    
    // O movimento desativado agora fica visível mas desabilitado
    // Verificar que o movimento está visível mas desabilitado
    await expect(page.getByText('Movimento Teste')).toBeVisible()
    
    // Verificar que o checkbox do movimento desativado está desabilitado
    const disabledCheckbox = page.locator('label').filter({ hasText: 'Movimento Teste' }).locator('input[type="checkbox"][disabled]')
    await expect(disabledCheckbox).toBeVisible()
    
    // Verificar que aparece a indicação de "desativado"
    await expect(page.getByText('(desativado)')).toBeVisible()
    
    // Verificar que o aviso sobre movimentos desativados aparece
    await expect(page.getByText('⚠️ Você tem movimentos desativados selecionados. Eles não serão salvos.')).toBeVisible()
    
    // Tentar salvar a ficha (o movimento desativado não será salvo)
    await page.getByRole('button', { name: 'Salvar Ficha' }).click()
    
    // Aguardar um momento para o salvamento
    await page.waitForTimeout(2000)
    
    // Recarregar a página para verificar a persistência
    await page.reload()
    await page.waitForURL(/campaigns\/[^/]+\/sheet/)
    
    // Verificar que o movimento desativado NÃO está marcado após reload
    // Ele deve aparecer como desabilitado e não marcado
    const disabledCheckboxReload = page.locator('label').filter({ hasText: 'Movimento Teste' }).locator('input[type="checkbox"]')
    await expect(disabledCheckboxReload).toBeDisabled()
    await expect(disabledCheckboxReload).not.toBeChecked()
  })
})