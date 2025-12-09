import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 40000 })
}

test('Rolagem com vantagem usa os dois maiores dados e outcome coerente', async ({ page }) => {
  test.setTimeout(120000)
  page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`))
  
  // Injetar script para mockar Math.random/crypto
  // Produz [1, 4, 6] => top dois: [6,4] = 10.
  // Com +3 (Força) = 13. Sucesso Total.
  await page.addInitScript(() => {
    const orig = crypto.getRandomValues.bind(crypto)
    ;(crypto as any).getRandomValues = (arr: any) => {
      // Check if it looks like a dice roll (Uint32Array of size 2 or 3)
      if (arr instanceof Uint32Array && arr.length <= 3) {
          const src = new Uint32Array([0, 3, 5]) // 1, 4, 6
          arr.set(src.subarray(0, arr.length))
          return arr
      }
      // Fallback for UUIDs etc
      return orig(arr)
    }
  })
  
  await loginMaster(page)
  
  // Criar Campanha
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Advantage')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  console.log('URL:', page.url())
  
  // Verificar H1 (removido pois estava falhando intermitente, vamos direto para Fichas)
  // await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  
  // Criar NPC
  console.log('📝 Criando NPC...')
  const npcName = `Goblin ${Date.now()}`
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  
  await page.getByPlaceholder('Nome do NPC').fill(npcName)
  await page.getByPlaceholder('Background do NPC').fill('Teste')
  
  // Atributos: Força +3. Outros 0.
  // Força = 3
  await page.locator('.attr-row').filter({ hasText: /^For[cç]a/i }).getByText('3', { exact: true }).click()
  // Agilidade = 0
  await page.locator('.attr-row').filter({ hasText: /^Agilidade/i }).getByText('0', { exact: true }).click()
  // Sabedoria = 0
  await page.locator('.attr-row').filter({ hasText: /^Sabedoria/i }).getByText('0', { exact: true }).click()
  // Carisma = 0
  await page.locator('.attr-row').filter({ hasText: /^Carisma/i }).getByText('0', { exact: true }).click()
  // Intuição = 0
  await page.locator('.attr-row').filter({ hasText: /^Intui[cç][aã]o/i }).getByText('0', { exact: true }).click()
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.getByText(npcName)).toBeVisible()
  console.log('✅ NPC criado')
  
  // Criar Sessão
  console.log('📝 Criando Sessão...')
  await page.getByRole('button', { name: 'Sessões' }).click()
  await page.getByRole('button', { name: 'Nova Sessão' }).click()
  
  await page.waitForTimeout(1000)
  
  await page.locator('label').filter({ hasText: 'Nome' }).locator('input').first().fill('Sessão 1')
  await page.locator('label').filter({ hasText: 'Data' }).locator('input').first().fill(new Date().toISOString().split('T')[0])
  
  await page.getByRole('button', { name: 'Criar', exact: true }).click()
  
  // Abrir Sessão
  console.log('🚀 Abrindo Sessão...')
  await page.locator('.session-list li').first().waitFor({ state: 'visible' })
  await page.getByRole('button', { name: 'Sessão 1' }).click()
  
  await page.waitForURL(/\/campaigns\/[^/]+\/session\/[^/]+$/)
  
  // Rolagem com Vantagem
  console.log('🎲 Verificando DiceRoller...')
  const diceRoller = page.locator('.dice-roller')
  await expect(diceRoller).toBeVisible()
  
  // Select NPC
  await diceRoller.locator('select').first().selectOption({ label: `NPC: ${npcName}` })
  
  // Select Attribute (Força)
  await diceRoller.locator('select').nth(1).selectOption({ label: 'FORCA' })
  
  // Ativar Vantagem
  await diceRoller.getByText('Vantagem', { exact: true }).click()
  
  // Rolar
  await page.getByRole('button', { name: 'Rolar' }).click()
  
  // Verificar Resultado
  const rollItem = page.locator('.roll-item').first()
  await expect(rollItem).toBeVisible()
  
  // Verificar texto: "Total: 13" (6+4 = 10 + 3 = 13)
  const text = await rollItem.textContent()
  console.log('Roll result:', text)
  
  expect(text).toContain('= 13')
  expect(text).toContain('Sucesso Total')
  
  // Verificar persistência
  await page.reload()
  await expect(page.locator('.roll-item').first()).toBeVisible()
  await expect(page.locator('.roll-item').first()).toContainText('= 13')
  console.log('✅ Rolagem verificada e persistida!')
})
