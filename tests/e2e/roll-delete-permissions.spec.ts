import { test, expect } from '@playwright/test'

async function setupSessionWithRoll(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.reload()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 40000 })
  
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Del')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.goto('/pbta.app/dashboard/master')
  await page.locator('.campaign-card').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.campaign-card').first().click()
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 20000 })
  
  const url = page.url()
  const campaignId = url.split('/').pop() || ''
  
  // Criar NPC
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByRole('button', { name: 'Novo NPC' }).waitFor()
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  await page.getByPlaceholder('Nome do NPC').fill('Orc')
  await page.getByPlaceholder('Background do NPC').fill('NPC')
  // Atributos
  await page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-group label').nth(2).click()
  await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-group label').nth(2).click()
  await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).locator('.radio-group label').nth(2).click()
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  
  // Verify NPC is in the list
  await page.getByText('Orc').first().waitFor({ state: 'visible', timeout: 10000 })
  
  await page.waitForTimeout(2000)
  
  // Criar Sessão
  await page.goto(`/pbta.app/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Sessões' }).or(page.getByRole('link', { name: 'Sessões' })).click()
  await page.getByRole('button', { name: 'Nova Sessão' }).waitFor()
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  await page.getByLabel('Nome').fill('Sessão X')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).first().click()
  
  await page.getByRole('button', { name: 'Criar' }).first().waitFor({ state: 'hidden', timeout: 5000 })
  
  // Wait for list to update
  await page.waitForTimeout(3000)
  
  // Tentar recarregar se a lista estiver vazia
  const sessionButtons = page.locator('.session-list button').filter({ hasText: 'Sessão X' })
  if (await sessionButtons.count() === 0) {
      console.log('Lista de sessões vazia, recarregando...')
      await page.reload()
      await page.waitForTimeout(3000)
  }
  
  // Abrir sessão
  await page.locator('.session-list button').filter({ hasText: 'Sessão X' }).first().click({ force: true })
  await page.waitForLoadState('domcontentloaded')
  
  // Garantir que o DiceRoller carregou e tem opções
  await page.waitForTimeout(5000)
  await page.reload()
  await page.waitForTimeout(2000)
  
  await page.getByRole('button', { name: 'Rolar' }).waitFor()
  
  // Loop de retry para opções de rolagem
  const select = page.locator('select').first()
  let options = await select.locator('option').count()
  
  for (let i = 0; i < 3 && options <= 1; i++) {
      console.log(`Tentativa ${i+1}: Opções de rolagem vazias (${options}), recarregando...`)
      await page.reload()
      await page.waitForTimeout(5000)
      await page.getByRole('button', { name: 'Rolar' }).waitFor()
      options = await select.locator('option').count()
  }
  
  if (options > 1) {
      await select.selectOption({ index: 1 })
  } else {
      // Fallback: tentar criar rolagem manual se possível ou falhar com erro claro
      console.log('--- HTML DUMP START ---')
      console.log(await page.content())
      console.log('--- HTML DUMP END ---')
      throw new Error('Não há personagens/NPCs disponíveis para rolagem')
  }
  
  await page.getByRole('button', { name: 'Rolar' }).click()
  
  // Wait for roll to complete and appear in history
  await page.locator('.roll-item').first().waitFor({ state: 'visible', timeout: 10000 })
  
  const currentUrl = page.url()
  return currentUrl
}

test('Mestre consegue excluir rolagem e jogador não vê botão', async ({ page, browser }) => {
  test.setTimeout(120000)
  const sessionUrl = await setupSessionWithRoll(page)
  
  // Mestre deve ver histórico e botão de deletar
  await expect(page.getByText(/Histórico/)).toBeVisible()
  const before = await page.locator('.roll-item').count()
  
  // Clicar no botão de deletar (assumindo que existe um por item)
  // Se houver confirmação, tratar
  page.once('dialog', dialog => dialog.accept())
  await page.locator('.roll-item .delete-btn').first().click()
  
  await page.waitForTimeout(1000)
  const after = await page.locator('.roll-item').count()
  expect(after).toBe(before - 1)
  
  const playerContext = await browser.newContext()
  const playerPage = await playerContext.newPage()
  
  await playerPage.goto('/pbta.app/login')
  await playerPage.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await playerPage.reload()
  await playerPage.waitForTimeout(1000)
  await playerPage.getByRole('button', { name: 'Login Jogador' }).click()
  await playerPage.waitForURL(/\/dashboard\/player$/, { timeout: 40000 })
  
  await playerPage.goto(sessionUrl)
  await expect(playerPage.locator('.roll-item .delete-btn')).toHaveCount(0)
  await playerContext.close()
})
