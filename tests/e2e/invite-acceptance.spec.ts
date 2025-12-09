import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Clicar no botão Login Mestre dos Dev Tools
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  // Aguardar redirecionamento para dashboard do mestre
  await page.waitForURL(/\/dashboard\/master/, { timeout: 15000 })
  
  // Verificar que estamos na dashboard correta
  await expect(page.getByRole('heading', { name: 'Painel do Mestre' })).toBeVisible({ timeout: 15000 })
}

async function logout(page: any) {
  try {
    await page.goto('/pbta.app/dashboard/master')
    const logoutButton = page.getByRole('button', { name: 'Sair' })
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      await page.waitForURL(/\/home$/)
      return
    }
  } catch {}
  
  try {
    await page.goto('/pbta.app/dashboard/player')
    const logoutButton = page.getByRole('button', { name: 'Sair' })
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      await page.waitForURL(/\/home$/)
      return
    }
  } catch {}

  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
}

async function loginPlayer(page: any) {
  console.log('Starting loginPlayer...')
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  
  // Retry loop for login
  for (let i = 0; i < 3; i++) {
      console.log(`Login attempt ${i+1}`)
      const loginBtn = page.getByRole('button', { name: 'Login Jogador' })
      
      if (await loginBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('Login button found, clicking...')
          await loginBtn.click()
          try {
              await page.waitForURL(/\/dashboard\/player/, { timeout: 10000 })
              console.log('Redirected to player dashboard')
              // Aceitar qualquer heading na dashboard do jogador
              await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 })
              return; // Success
          } catch (e) {
              console.log(`Attempt ${i+1} failed to redirect: ${e}`)
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
          
          // Check if we are already logged in?
          if (page.url().includes('/dashboard/player')) {
              console.log('Already on player dashboard')
              return;
          }
          
          console.log('Reloading...')
          await page.reload()
          await page.waitForLoadState('domcontentloaded')
      }
  }
  throw new Error('Failed to login as player after 3 attempts')
}

test('Fluxo convite: mestre gera, jogador aceita e aparece em jogadores', async ({ page, browser }) => {
  await loginMaster(page)
  
  // Navegar para criar campanha
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  const campaignName = `Campanha E2E ${Date.now()}`
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(campaignName)
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste')
  
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Aguardar redirecionamento para a campanha
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 15000 })
  
  const campaignUrl = page.url()
  const campaignId = campaignUrl.split('/campaigns/')[1]?.split('/')[0]
  console.log('Campaign ID:', campaignId)
  
  // Gerar convite
  await page.getByRole('button', { name: 'Gerar Convite' }).click()
  await page.waitForSelector('input[value*="invite="]', { timeout: 5000 })
  
  const inviteUrl = await page.getByRole('textbox').first().inputValue()
  console.log('Invite URL:', inviteUrl)
  
  // Wait for invite to be persisted if needed
  await page.waitForTimeout(2000)
  
  // Logout Mestre
  await logout(page)
  
  // Login Jogador
  await loginPlayer(page)
  
  // Navegar para o link de convite
  await page.goto(inviteUrl)
  
  // Ensure button is clickable
  const acceptBtn = page.getByRole('button', { name: 'Aceitar Convite' })
  
  try {
    await acceptBtn.waitFor({ state: 'visible', timeout: 10000 })
  } catch {
    console.log('Accept button not found, reloading invite page...')
    console.log('Current URL:', page.url())
    console.log('Page content snippet:', (await page.textContent('body'))?.substring(0, 500))
    await page.reload()
    await acceptBtn.waitFor({ state: 'visible', timeout: 15000 })
  }

  await acceptBtn.click({ force: true })
  
  // Aguardar botão de abrir campanha (novo fluxo)
  const openBtn = page.getByRole('button', { name: 'Abrir campanha' })
  await openBtn.waitFor({ state: 'visible', timeout: 15000 })
  await openBtn.click()
  
  // Verificar redirecionamento para a campanha
  try {
    await page.waitForURL(new RegExp(`/campaigns/${campaignId}`), { timeout: 10000 })
  } catch {
    console.log('Wait for campaign URL timeout')
  }
  
  // Verificar que o jogador tem acesso à campanha
  await expect(page.getByRole('heading', { name: campaignName })).toBeVisible()
})
