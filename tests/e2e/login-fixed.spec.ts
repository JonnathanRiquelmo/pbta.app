import { test, expect } from '@playwright/test'

async function loginMasterFixed(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Clicar no botão Login Mestre dos Dev Tools
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  // Aguardar redirecionamento para dashboard do mestre
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 15000 })
  
  // Verificar que estamos na dashboard correta
  await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible({ timeout: 15000 })
  
  // Verificar que há a opção de criar campanha (isso confirma que estamos logados como mestre)
  await expect(page.getByRole('link', { name: 'Nova Campanha' })).toBeVisible({ timeout: 5000 })
}

test('Teste de login corrigido - usando verificação correta', async ({ page }) => {
  await loginMasterFixed(page)
  
  console.log('✅ Login realizado com sucesso como mestre!')
  
  // Agora podemos testar funcionalidades de mestre
  await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible()
  
  // Se quiser testar criação de campanha, podemos fazer isso agora
  console.log('Criando campanha...')
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  
  const campanhaNome = `Campanha Teste ${Date.now()}`
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(campanhaNome)
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste de campanha')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Verificar que a campanha foi criada
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  
  console.log('✅ Campanha criada com sucesso!')
})