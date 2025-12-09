import { test, expect } from '@playwright/test'

async function loginMasterFixed(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Clicar no botão Login Mestre dos Dev Tools
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  // Aguardar redirecionamento para dashboard do mestre
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 15000 })
  
  // Verificar que estamos na dashboard correta de várias formas
  console.log('Verificando elementos da dashboard...')
  
  // Tentar diferentes formas de encontrar o texto "Painel do Mestre"
  const headingByRole = page.getByRole('heading', { name: 'Painel do Mestre' })
  const headingByText = page.getByText('Painel do Mestre')
  const h2Element = page.locator('h2')
  
  console.log('Heading por role visível:', await headingByRole.isVisible().catch(() => false))
  console.log('Texto visível:', await headingByText.isVisible().catch(() => false))
  console.log('H2 elemento visível:', await h2Element.isVisible().catch(() => false))
  console.log('Texto do H2:', await h2Element.textContent().catch(() => 'não encontrado'))
  
  // Verificar que há a opção de criar campanha (isso confirma que estamos logados como mestre)
  await expect(page.getByRole('link', { name: 'Nova Campanha' })).toBeVisible({ timeout: 5000 })
  
  console.log('✅ Dashboard do mestre verificada com sucesso!')
}

test('Teste de login com verificações flexíveis', async ({ page }) => {
  await loginMasterFixed(page)
  
  console.log('✅ Login realizado com sucesso como mestre!')
  
  // Verificar elementos principais
  await expect(page.getByRole('link', { name: 'Nova Campanha' })).toBeVisible()
  
  // Navegar para página de criação para verificar inputs
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  // Verificar que os inputs de criação de campanha existem
  await expect(page.getByPlaceholder('Ex: A Sombra do Dragão')).toBeVisible()
  await expect(page.getByPlaceholder('Descreva o cenário inicial...')).toBeVisible()
  
  console.log('✅ Todos os elementos verificados com sucesso!')
})