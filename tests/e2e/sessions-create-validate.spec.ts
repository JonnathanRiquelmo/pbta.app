import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Usar o botão de login mestre dos Dev Tools (mais confiável para emuladores)
  console.log('Clicando em Login Mestre...')
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  console.log('Aguardando redirecionamento...')
  await expect(page).toHaveURL(/\/dashboard\/master$/)
  console.log('Redirecionado para dashboard/master')
}

test('Sessões: criar, salvar, deletar e validações de nome/data', async ({ page }) => {
  await loginMaster(page)
  await page.waitForTimeout(5000)
  
  // Verificar o que realmente existe na página
  const bodyText = await page.locator('body').textContent()
  console.log('Texto da página:', bodyText?.substring(0, 1000))
  console.log('URL atual:', page.url())
  
  // Se já estivermos em uma página de campanha, usar a campanha existente
  if (page.url().includes('/campaigns/')) {
    console.log('Já estamos em uma página de campanha, usando a campanha existente')
    // Continuar com o fluxo de sessões
  } else if (bodyText?.includes('Nova Campanha')) {
    console.log('Estamos no dashboard, criando nova campanha')
    // Estamos no dashboard com link para Nova Campanha
    await page.getByRole('link', { name: 'Nova Campanha' }).click()
    await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Sessões')
    await page.getByPlaceholder('Descreva o cenário inicial...').fill('Fluxo de Sessões')
    await page.getByRole('button', { name: 'Criar Campanha' }).click()
  } else {
    // Estamos no dashboard master atual
    console.log('Estamos no dashboard master atual')
    await page.locator('input[placeholder="Nome"]').first().fill('Campanha Sessões')
    await page.getByPlaceholder('Plot (opcional)').fill('Fluxo de Sessões')
    await page.getByRole('button', { name: 'Criar' }).click()
  }
  // Aguardar a criação da campanha e redirecionamento
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  const url = page.url()
  const campaignId = url.split('/').pop() || ''
  console.log('Criada campanha com ID:', campaignId)
  
  // Voltar para o dashboard para clicar na campanha
  await page.goto('/pbta.app/dashboard/master')
  console.log('Voltado para dashboard')
  
  // Clicar na campanha criada
  await page.locator('.campaign-card', { hasText: 'Campanha Sessões' }).first().click()
  console.log('Clicado na campanha')
  
  // Aguardar carregamento da página da campanha
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  console.log('Na página da campanha:', page.url())
  
  // Clicar na aba Sessões
  await page.getByRole('button', { name: 'Sessões' }).click()
  console.log('Clicado na aba Sessões')
  
  // Aguardar carregamento da página de sessões - esperar por elemento específico
  await page.waitForTimeout(2000) // Espera fixa para carregamento
  
  // Verificar se estamos na página de sessões
  const sessionsBodyText = await page.locator('body').textContent()
  console.log('Texto da página de sessões:', sessionsBodyText?.substring(0, 500))
  
  await page.getByRole('heading', { name: 'Sessões' }).first().waitFor()
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  await page.getByRole('heading', { name: 'Criar Sessão' }).waitFor()
  await page.waitForTimeout(500)
  const afterClick = await page.locator('body').textContent()
  console.log('Sessões body após abrir form:', afterClick?.substring(0, 500))

  await expect(page.getByRole('button', { name: 'Criar' }).first()).toBeDisabled()
  const uniqueName = `Sessão ${Date.now()}`
  await page.getByLabel('Nome').first().fill(uniqueName)
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByLabel('Resumo').fill('Resumo da sessão')
  await page.getByLabel('Notas do Mestre').fill('Notas iniciais')
  await expect(page.getByRole('button', { name: 'Criar' }).first()).toBeEnabled()
  await page.getByRole('button', { name: 'Criar' }).first().click()

  const sessionButton = page.locator('.session-list').locator('button', { hasText: uniqueName }).first()
  await expect(sessionButton).toBeVisible()
  await sessionButton.click()
  await page.getByText('Detalhes da Sessão').waitFor()
  console.log('URL sessão:', page.url())
  await page.locator('.form-group', { hasText: 'Nome' }).locator('input').fill('Sessão A Editada 2')
  await page.locator('.form-group', { hasText: 'Resumo' }).locator('textarea').fill('Resumo editado')
  await page.locator('.form-group', { hasText: 'Data' }).locator('input[type="date"]').fill(ds)
  const saveBtn = page.getByRole('button', { name: 'Salvar Alterações' })
  await saveBtn.click()
  
  // Aguardar o salvamento completar
  await page.waitForTimeout(2000)

  const sessionIdOnView = page.url().split('/').pop() || ''
  
  // Voltar para a página da campanha
  await page.getByRole('button', { name: 'Voltar' }).click()
  
  // Aguardar um pouco para a navegação completar
  await page.waitForTimeout(2000)
  
  // Clicar em Sessões novamente
  await page.getByRole('button', { name: 'Sessões' }).click()
  
  // Aguardar a lista de sessões carregar
  await page.waitForTimeout(2000)
  const listDeleteBtn = page.locator(`[data-testid="list-delete-${sessionIdOnView}"]`)
  await expect(listDeleteBtn).toBeVisible()
  await listDeleteBtn.click()
  await expect(page.locator('.session-list').getByText(uniqueName)).toHaveCount(0)

  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  await page.getByRole('heading', { name: 'Criar Sessão' }).waitFor()
  const uniqueName2 = `Sessão ${Date.now()}-2`
  await page.getByLabel('Nome').first().fill(uniqueName2)
  await page.getByLabel('Data').fill(ds)
  await page.getByLabel('Resumo').fill('Resumo da sessão 2')
  await page.getByLabel('Notas do Mestre').fill('Notas iniciais 2')
  await page.getByRole('button', { name: 'Criar' }).first().click()

  const sessionButton2 = page.locator('.session-list').locator('button', { hasText: uniqueName2 }).first()
  await sessionButton2.click()
  await page.getByText('Detalhes da Sessão').waitFor()
  await page.locator('[data-testid="btn-delete-session"]').click()
  await page.locator('[data-testid="modal-delete-session"]').getByRole('button', { name: 'Excluir' }).click()
  await page.getByRole('button', { name: 'Sessões' }).click()
  await expect(page.locator('.session-list').getByText(uniqueName2)).toHaveCount(0)
})
