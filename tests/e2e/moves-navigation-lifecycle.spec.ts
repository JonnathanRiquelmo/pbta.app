import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master/, { timeout: 20000 })
  await expect(page.getByRole('link', { name: 'Nova Campanha' })).toBeVisible({ timeout: 20000 })
}

test('Navigation lifecycle - cleanup and resubscribe', async ({ page }) => {
  // 1. Login as master
  await loginMaster(page)

  // 2. Create a campaign
  await page.goto('/pbta.app/dashboard/master')
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.waitForURL(/\/dashboard\/create-campaign/)
  
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Lifecycle')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste de ciclo de vida')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.waitForURL(/\/campaigns\/[a-zA-Z0-9]+/)
  const campaignUrl = page.url()
  console.log('Campaign URL:', campaignUrl)
  const movesUrl = `${campaignUrl}/moves`
  
  // 3. Go to Moves page
  await page.getByRole('button', { name: 'Movimentos' }).click()
  await page.waitForURL(/\/moves$/)
  console.log('Moves page loaded')
  
  // Debug role
  const role = await page.evaluate(() => {
    // @ts-ignore
    const state = JSON.parse(localStorage.getItem('pbta_store') || '{}')
    return state.state?.role
  })
  console.log('Role in localStorage:', role)
  
  // Debug all buttons
  const buttons = await page.getByRole('button').allTextContents()
  console.log('Buttons on page:', buttons)

  await expect(page.getByRole('heading', { name: 'Movimentos' })).toBeVisible()

  // 4. Create a move to have some data
  const moveName = `Move Lifecycle ${Date.now()}`
  console.log('Creating move:', moveName)
  
  // Fill form (always visible)
  await page.getByLabel('Nome').fill(moveName)
  await page.getByLabel('Descrição').fill('Desc')
  await page.getByLabel('Modificador').selectOption('1')
  await page.getByRole('button', { name: 'Criar' }).click()
  
  // Check for error
  if (await page.locator('.error').isVisible()) {
    console.log('Error creating move:', await page.locator('.error').textContent())
  }
  
  // Verify creation
  await expect(page.getByText('Movimento criado com sucesso!')).toBeVisible()
  await expect(page.locator(`.list-item input[value="${moveName}"]`)).toBeVisible()

  // 5. Navigate away (to dashboard/campaign details)
  console.log('Navigating away via UI')
  await page.getByRole('button', { name: 'Voltar' }).click()
  await page.waitForURL(new RegExp(campaignUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'))
  
  // 6. Navigate back to Moves
  console.log('Navigating back to Moves via UI')
  await page.getByRole('button', { name: 'Movimentos' }).click()
  await page.waitForURL(/\/moves$/)
  
  // 7. Verify data is still there and no duplicates (by count or text)
  await expect(page.locator(`.list-item input[value="${moveName}"]`)).toBeVisible()
  
  // Count how many times the move appears (should be 1)
  const count = await page.locator(`.list-item input[value="${moveName}"]`).count()
  expect(count).toBe(1)

  // 8. Create another move to verify subscription is active
  const moveName2 = `Move Lifecycle 2 ${Date.now()}`
  
  // Use first() to handle strict mode violation if form inputs are duplicated (though they shouldn't be)
  // Or use more specific locator
  await page.getByLabel('Nome').first().fill(moveName2)
  await page.getByLabel('Descrição').first().fill('Desc 2')
  await page.getByLabel('Modificador').first().selectOption('2')
  await page.getByRole('button', { name: 'Criar' }).click()

  await expect(page.getByText('Movimento criado com sucesso!')).toBeVisible()
  await expect(page.locator(`.list-item input[value="${moveName2}"]`)).toBeVisible()
  
  // Verify both are present
  await expect(page.locator(`.list-item input[value="${moveName}"]`)).toBeVisible()
  await expect(page.locator(`.list-item input[value="${moveName2}"]`)).toBeVisible()
})
