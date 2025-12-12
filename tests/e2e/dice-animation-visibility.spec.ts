import { test, expect } from '@playwright/test'

test('Verificar visibilidade e animação do DiceBox 3D', async ({ page }) => {
  test.setTimeout(120000);
  // Login como Mestre
  await page.goto('/pbta.app/login')
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master/)

  // Criar Campanha Temporária
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Dice Test')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  await page.waitForURL(/.*campaigns\/[^\/]+/)
  
  // Criar NPC para habilitar rolagens
  const campaignId = page.url().split('/').pop()
  await page.goto(`/pbta.app/campaigns/${campaignId}`)
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  await page.getByPlaceholder('Nome do NPC').fill('NPC Dice Tester')
  
  // Selecionar atributo Força +2 (index 3)
  const forcaRow = page.locator('.attr-row').filter({ hasText: 'Força' })
  await forcaRow.locator('.radio-group label').nth(3).click()
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.locator('.success-message')).toBeVisible()

  // Ir para Sessões e Criar Sessão
  await page.goto(`/pbta.app/campaigns/${campaignId}/sessions`)
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  await page.getByLabel('Nome').fill('Sessão Dice')
  const d = new Date()
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  await page.getByLabel('Data').fill(ds)
  await page.getByRole('button', { name: 'Criar' }).click()
  
  // Entrar na sessão
  await page.locator('.session-list a').filter({ hasText: 'Abrir' }).first().click()
  
  // Verificar se o container do DiceBox existe
  const diceBox = page.locator('#dice-box')
  await expect(diceBox).toBeAttached()
  
  // Verificar estado inicial (deve estar invisível mas presente no DOM)
  await expect(diceBox).toHaveCSS('opacity', '0')
  await expect(diceBox).toHaveCSS('pointer-events', 'none')
  
  // Verificar se o Canvas foi criado (significa que a lib inicializou)
  // Nota: A lib cria um canvas dentro do container
  const canvas = diceBox.locator('canvas')
  await expect(canvas).toBeAttached({ timeout: 10000 })
  
  // Fazer uma rolagem
  // Selecionar NPC
  await page.locator('select').nth(0).selectOption({ label: 'NPC: NPC Dice Tester' })
  await page.locator('select').nth(1).selectOption({ value: 'forca' })
  
  // Clicar em Rolar
  await page.getByRole('button', { name: 'Rolar' }).click()
  
  // Verificar se o DiceBox se torna visível durante a rolagem
  // A animação dura alguns segundos, então verificamos logo após o clique
  await expect(diceBox).toHaveCSS('opacity', '1', { timeout: 2000 })
  await expect(diceBox).toHaveCSS('pointer-events', 'all')
  
  // Verificar se o canvas tem dimensões válidas
  const boxBox = await diceBox.boundingBox()
  expect(boxBox?.width).toBeGreaterThan(0)
  expect(boxBox?.height).toBeGreaterThan(0)
  
  // Aguardar a rolagem terminar (container volta a ficar invisível ou log de sucesso aparece)
  await expect(page.locator('.roll-item').first()).toBeVisible({ timeout: 15000 })
  
  // Após a rolagem, deve voltar a ficar transparente (se clicado ou após timeout, dependendo da imp)
  // O comportamento atual é clicar para limpar ou esperar? O código do DiceBox3D tem onClick={handleClear}
  // Vamos clicar para garantir limpeza
  await diceBox.click()
  await expect(diceBox).toHaveCSS('opacity', '0')
})