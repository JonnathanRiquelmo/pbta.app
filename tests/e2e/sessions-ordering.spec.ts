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
  
  // Verificar se o papel do usuário foi definido corretamente
  await page.waitForTimeout(2000) // Aguardar o estado ser atualizado
  const userRole = await page.evaluate(() => {
    // Acessar o store Zustand para verificar o papel
    const pbtaUser = localStorage.getItem('pbta_user')
    if (pbtaUser) {
      try {
        const user = JSON.parse(pbtaUser)
        return user.role || 'unknown'
      } catch (e) {
        return 'unknown'
      }
    }
    return 'unknown'
  })
  console.log('Papel do usuário após login:', userRole)
  
  if (userRole !== 'master') {
    throw new Error(`Usuário não é mestre após login. Papel atual: ${userRole}`)
  }
}

test('Sessões são listadas da mais recente para a mais antiga', async ({ page }) => {
  await loginMaster(page)
  
  console.log('Criando campanha...')
  // Clicar no botão de criar campanha
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  
  // Aguardar navegação para a página de criação
  await page.waitForTimeout(3000)
  
  // Verificar se estamos na página correta
  console.log('URL atual:', page.url())
  
  // Preencher o nome da campanha
  await page.getByPlaceholder('Ex: A Sombra do Dragão').waitFor({ state: 'visible', timeout: 10000 })
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Ordenação')
  
  // Preencher o plot inicial (campo obrigatório)
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste de ordenação de sessões')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
   
   // Aguardar redirecionamento para a página da campanha
   await page.waitForTimeout(3000)
   
   console.log('URL após criação:', page.url())
   
   // Extrair o ID da campanha da URL
  const url = page.url()
  const campaignId = url.split('/').pop()
  console.log('ID da campanha:', campaignId)
  
  // Clicar em Sessões
  console.log('Clicando em Sessões...')
  await page.getByRole('button', { name: 'Sessões' }).click()
  await page.waitForTimeout(3000)
  
  console.log('URL após clicar em Sessões:', page.url())
  
  // Verificar se o usuário ainda é mestre na página da campanha
  const userRole = await page.evaluate(() => {
    const pbtaUser = localStorage.getItem('pbta_user')
    if (pbtaUser) {
      try {
        const user = JSON.parse(pbtaUser)
        return user.role || 'unknown'
      } catch (e) {
        return 'unknown'
      }
    }
    return 'unknown'
  })
  console.log('Papel do usuário na página da campanha:', userRole)
  
  if (userRole !== 'master') {
    throw new Error(`Usuário não é mestre na página da campanha. Papel atual: ${userRole}`)
  }
  
  // Aguardar o formulário de criação de sessões aparecer
  console.log('Aguardando formulário de sessões...')
  
  // Clicar em Nova Sessão para abrir o formulário
  console.log('Clicando em Nova Sessão...')
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  
  // Aguardar o formulário aparecer
  await page.waitForTimeout(2000)
  
  // Verificar o conteúdo da página após clicar em Nova Sessão
  console.log('Verificando conteúdo da página após Nova Sessão...')
  const content = await page.textContent('body')
  console.log('Conteúdo da página:', content?.substring(0, 500))
  
  // Verificar se os campos do formulário estão presentes
  const inputs = await page.locator('input').count()
  console.log('Número de inputs encontrados:', inputs)
  
  // Aguardar um pouco mais para garantir que o formulário esteja totalmente renderizado
  await page.waitForTimeout(3000)
  
  // Agora o formulário deve estar visível (modal overlay)
  console.log('Aguardando formulário de criação de sessão no modal...')
  
  // Aguardar o modal aparecer e os campos ficarem visíveis
  await page.waitForTimeout(2000) // Aguardar animação do modal
  
  // Localizar os campos do formulário no modal (h4 "Criar Sessão" indica o modal)
  await page.getByRole('heading', { name: 'Criar Sessão' }).waitFor({ state: 'visible', timeout: 10000 })

  function dateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const d1 = new Date(Date.now() - 86400000 * 2)
  const d2 = new Date(Date.now() - 86400000)
  const d3 = new Date(Date.now())

  // Criar três sessões
  console.log('Criando sessões no modal...')
  
  // Localizar os campos do formulário no modal (usando labels)
  const nameInput = page.locator('label').filter({ hasText: 'Nome' }).locator('input').first()
  const dateInput = page.locator('label').filter({ hasText: 'Data' }).locator('input[type="date"]').first()
  
  // Verificar se os campos estão visíveis
  console.log('Verificando se os campos do modal estão visíveis...')
  await nameInput.waitFor({ state: 'visible', timeout: 5000 })
  await dateInput.waitFor({ state: 'visible', timeout: 5000 })
  console.log('Campos do modal encontrados e visíveis!')
  
  // Criar primeira sessão
  await nameInput.fill('S1')
  await dateInput.fill(dateStr(d1))
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.waitForTimeout(1000)
  
  // Criar segunda sessão (clicar em Nova Sessão novamente)
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  await page.waitForTimeout(2000) // Aguardar modal abrir novamente
  await page.getByRole('heading', { name: 'Criar Sessão' }).waitFor({ state: 'visible', timeout: 10000 })
  
  await nameInput.fill('S2')
  await dateInput.fill(dateStr(d2))
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.waitForTimeout(1000)
  
  // Criar terceira sessão (clicar em Nova Sessão novamente)
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  await page.waitForTimeout(2000) // Aguardar modal abrir novamente
  await page.getByRole('heading', { name: 'Criar Sessão' }).waitFor({ state: 'visible', timeout: 10000 })
  
  await nameInput.fill('S3')
  await dateInput.fill(dateStr(d3))
  await page.getByRole('button', { name: 'Criar' }).click()
  await page.waitForTimeout(1000)

  // Coleta ordem dos itens
  console.log('Verificando ordem das sessões...')
  const items = page.locator('.session-list li')
  await items.first().waitFor({ state: 'visible', timeout: 10000 })
  const topName = await items.first().locator('span').first().textContent()
  expect(topName).toBe('S3')
})
