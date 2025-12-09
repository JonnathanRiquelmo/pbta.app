import { test, expect } from '@playwright/test'

async function logout(page: any) {
  // First check if we're on a campaign page and need to go back
  const currentUrl = page.url()
  if (currentUrl.includes('/campaigns/')) {
    // Try to find and click the back button (using aria-label)
    try {
      const backButton = page.getByRole('button', { name: 'Voltar' })
      if (await backButton.count() > 0) {
        await backButton.click()
        // Wait a moment for navigation
        await page.waitForTimeout(1000)
      }
    } catch {
      // If no back button, try going directly to dashboard
      await page.goto('/pbta.app/dashboard/master')
    }
  }

  try {
    // Try to find logout button directly on current page
    const logoutButton = page.getByRole('button', { name: 'Sair' })
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      await page.waitForURL(/\/home$/)
      return
    }
  } catch {
    // If no logout button on current page, try dashboards
  }

  // Try master dashboard
  try {
    await page.goto('/pbta.app/dashboard/master')
    const logoutButton = page.getByRole('button', { name: 'Sair' })
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      await page.waitForURL(/\/home$/)
      return
    }
  } catch {
    // Ignore error
  }

  // Try player dashboard
  try {
    await page.goto('/pbta.app/dashboard/player')
    const logoutButton = page.getByRole('button', { name: 'Sair' })
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      await page.waitForURL(/\/home$/)
      return
    }
  } catch {
    // Ignore error, probably already logged out
  }
}

test('Teste simples: aceitar convite', async ({ page }) => {
  // Passo 1: Login como mestre e criar campanha
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master/, { timeout: 15000 })

  // Criar campanha
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  const campaignName = 'Campanha Teste Convite'
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(campaignName)
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Plot inicial de teste')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Aguardar redirecionamento e obter ID
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 15000 })
  const campaignId = page.url().split('/').pop()!
  
  // Gerar token de convite
  await page.getByRole('button', { name: 'Gerar Convite' }).click()
  await page.waitForSelector('input[value*="invite="]', { timeout: 5000 })
  
  const inviteUrl = await page.getByRole('textbox').first().inputValue()
  // Extract just the token part if needed, but the new UI might accept full URL
  // Based on other tests, it seems to accept the full URL or token
  
  console.log('Campaign ID:', campaignId)
  console.log('Invite URL:', inviteUrl)
  
  // Passo 2: Fazer logout e limpar sessão
  await logout(page)
  
  // Passo 3: Login como jogador
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  
  // Retry loop for login
  let loggedIn = false
  for (let i = 0; i < 3; i++) {
      console.log(`Login attempt ${i+1}`)
      const loginBtn = page.getByRole('button', { name: 'Login Jogador' })
      
      if (await loginBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('Login button found, clicking...')
          await loginBtn.click()
          try {
              await page.waitForURL(/\/dashboard\/player/, { timeout: 10000 })
              loggedIn = true
              break
          } catch {
              console.log(`Attempt ${i+1} failed to redirect, retrying...`)
          }
      } else {
          console.log('Login button not visible')
          
          // Check for Sair (Logged in)
          const sairBtn = page.getByRole('button', { name: 'Sair' })
          if (await sairBtn.count() > 0 && await sairBtn.isVisible()) {
              console.log('Found Sair button, clicking to logout...')
              await sairBtn.click()
              await page.waitForLoadState('domcontentloaded')
              continue
          }

          // Check for Acessar Sistema (Home page)
          const acessarBtn = page.getByRole('button', { name: 'Acessar Sistema' })
          if (await acessarBtn.count() > 0 && await acessarBtn.isVisible()) {
              console.log('Found Acessar Sistema button, clicking...')
              await acessarBtn.click()
              await page.waitForLoadState('domcontentloaded')
              continue
          }
          
          // Debug: list all buttons
          const buttons = await page.getByRole('button').all()
          console.log(`Found ${buttons.length} buttons:`)
          for (const btn of buttons) {
              console.log(`- "${await btn.textContent()}"`)
          }
          
          if (page.url().includes('/dashboard/player')) {
             console.log('Already on player dashboard')
             loggedIn = true
             break
          }
          
          console.log('Reloading...')
          await page.reload()
          await page.waitForLoadState('domcontentloaded')
      }
  }
  
  if (!loggedIn) {
      // Fallback check
      try {
        await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 })
      } catch {
        throw new Error('Failed to login as player after 3 attempts')
      }
  }
  
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 })
  
  // Passo 4: Aceitar convite
  console.log('Navegando para URL do convite...')
  await page.goto(inviteUrl)
  
  console.log('Clicando em Aceitar Convite...')
  await page.getByRole('button', { name: 'Aceitar Convite' }).click()
  
  // Aguardar botão de abrir campanha (novo fluxo)
  console.log('Aguardando botão Abrir Campanha...')
  const openBtn = page.getByRole('button', { name: 'Abrir campanha' })
  await openBtn.waitFor({ state: 'visible', timeout: 15000 })
  await openBtn.click()
  
  // Aguardar redirecionamento
  console.log('Aguardando redirecionamento...')
  await page.waitForURL(`**/campaigns/${campaignId}`, { timeout: 10000 })
  
  console.log('Redirecionamento completo!')
  await expect(page.locator('h2')).toContainText(campaignName)
})