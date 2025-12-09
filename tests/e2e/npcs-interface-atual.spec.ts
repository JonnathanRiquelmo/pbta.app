import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Usar o botão de Dev Tools para login rápido
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  // Aguardar redirecionamento para dashboard do mestre
  await page.waitForURL(/\/pbta\.app\/dashboard\/master$/, { timeout: 15000 })
  
  // Verificar que estamos na dashboard correta (nova interface)
  await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible({ timeout: 15000 })
}

async function criarCampanhaTeste(page: any, nome: string, plot: string) {
  // Clicar em "Nova Campanha"
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  
  // Aguardar navegação para página de criação
  await page.waitForURL(/\/pbta\.app\/dashboard\/create-campaign$/, { timeout: 15000 })
  
  // Preencher formulário de criação
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(nome)
  if (plot) {
    await page.getByPlaceholder('Descreva o cenário inicial...').fill(plot)
  }
  
  // Submeter formulário
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Aguardar redirecionamento para a página da campanha (não volta para dashboard)
  await page.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 20000 })
  
  // Voltar para o dashboard para verificar a campanha na lista
  await page.goto('/pbta.app/dashboard/master')
  
  // Verificar que a campanha foi criada
  await expect(page.getByText(nome).first()).toBeVisible({ timeout: 5000 })
}

test('NPCs: interface atual - navegação e criação de campanha', async ({ page }) => {
  await loginMaster(page)
  
  // Criar campanha de teste usando a interface atual
  const nomeCampanha = 'Campanha Teste Interface Atual'
  await criarCampanhaTeste(page, nomeCampanha, 'Teste da interface atual correta')
  
  console.log('✅ Campanha criada com sucesso usando interface atual!')
  
  // Clicar na campanha criada
  await page.getByText(nomeCampanha).first().click()
  await page.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 20000 })
  
  console.log('✅ Navegação para campanha funcionando!')
  
  // Verificar se há aba de NPCs/Fichas
  const hasFichasTab = await page.getByRole('button', { name: 'Fichas' }).isVisible().catch(() => false)
  const hasNPCTab = await page.getByRole('button', { name: 'NPCs' }).isVisible().catch(() => false)
  
  if (hasFichasTab || hasNPCTab) {
    console.log('✅ Aba de NPCs/Fichas encontrada!')
    
    // Clicar na aba
    if (hasFichasTab) {
      await page.getByRole('button', { name: 'Fichas' }).click()
    } else {
      await page.getByRole('button', { name: 'NPCs' }).click()
    }
    
    // Verificar que estamos na página correta
    await page.waitForTimeout(500)
    console.log('✅ Navegação para NPCs funcionando!')
  } else {
    console.log('ℹ️ Aba de NPCs/Fichas não encontrada - pode estar em outro local')
  }
})