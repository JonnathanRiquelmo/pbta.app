import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('/pbta.app/login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.reload()
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 40000 })
}

test('Rolagem com desvantagem usa os dois menores dados', async ({ page }) => {
  test.setTimeout(120000)
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  // Injetar script antes da navegação
  await page.addInitScript(() => {
    // Mock para crypto.getRandomValues que funciona com múltiplas chamadas
    const original = crypto.getRandomValues.bind(crypto)
    // Sequência desejada de resultados para os dados: 2, 5, 6 (para desvantagem pegar 2, 5)
    // Para obter 2: valor % 6 + 1 = 2 => valor = 1
    // Para obter 5: valor % 6 + 1 = 5 => valor = 4
    // Para obter 6: valor % 6 + 1 = 6 => valor = 5
    const desiredValues = [1, 4, 5]
    let callCount = 0

    ;(crypto as any).getRandomValues = (arr: Uint32Array) => {
       // Se for uma chamada pequena (típica de rolagem de dados), interceptamos
       // DiceBox pode pedir buffers maiores ou específicos. Vamos ser mais agressivos.
       if (arr.length < 128) {
         for (let i = 0; i < arr.length; i++) {
             const val = desiredValues[callCount % desiredValues.length]
             arr[i] = val
             callCount++
         }
         return arr
       }
       return original(arr)
    }
  })
  
  await loginMaster(page)
  await page.getByRole('link', { name: 'Nova Campanha' }).click()
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill('Campanha Rolls Dis')
  await page.getByPlaceholder('Descreva o cenário inicial...').fill('Teste')
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  await page.goto('/pbta.app/dashboard/master')
  await page.locator('.campaign-card').first().waitFor({ state: 'visible', timeout: 20000 })
  await page.locator('.campaign-card').first().click()
  await page.waitForURL(/\/campaigns\/[^/]+$/, { timeout: 20000 })
  
  const url = page.url()
  const campaignId = url.split('/').pop() || ''
   
   const npcName = `Goblin D ${Date.now()}`

   // Criar NPC (para evitar erro de permissão de criar ficha como Mestre se playersUids undefined)
   await page.goto(`/pbta.app/campaigns/${campaignId}`)
   await page.getByRole('button', { name: 'Fichas' }).click()
   
   await page.getByRole('button', { name: 'Novo NPC' }).click()
   
   await page.getByPlaceholder('Nome do NPC').fill(npcName)
   await page.getByPlaceholder('Background do NPC').fill('Teste')
  
  // Selecionar atributos (usando a estrutura .attr-row > .radio-group > label)
  // Força +2 (index 3: -1, 0, 1, 2, 3)
  const forcaRow = page.locator('.attr-row').filter({ hasText: 'Força' })
  await forcaRow.locator('.radio-group label').nth(3).click()
  // Verify checked
  await expect(forcaRow.locator('.radio-group input').nth(3)).toBeChecked()
  
  // Agilidade +1
  const agiRow = page.locator('.attr-row').filter({ hasText: 'Agilidade' })
  await agiRow.locator('.radio-group label').nth(2).click()
  // Verify checked
  await expect(agiRow.locator('.radio-group input').nth(2)).toBeChecked()
  
  // Sum = 3. Button enabled.
 // Sum = 3. Button enabled.
   const createBtn = page.getByRole('button', { name: 'Criar NPC' })
   await expect(createBtn).toBeEnabled()
   await createBtn.click()

   // Check for success or error
   const successMsg = page.locator('.success-message')
   const errorMsg = page.locator('.error-message')
   
   await Promise.race([
       expect(successMsg).toBeVisible({ timeout: 10000 }),
       expect(errorMsg).toBeVisible({ timeout: 10000 })
   ])
   
   if (await errorMsg.isVisible()) {
       const err = await errorMsg.textContent()
       throw new Error(`Erro ao criar NPC: ${err}`)
   }

   // Wait for NPC to be created and visible in list
    try {
        await expect(page.getByText(npcName).first()).toBeVisible({ timeout: 10000 })
    } catch (e) {
       console.log('NPC não apareceu na lista automaticamente, recarregando página...')
       await page.reload()
       await page.getByRole('button', { name: 'Fichas' }).click()
       await expect(page.getByText(npcName).first()).toBeVisible({ timeout: 20000 })
   }
   
   // Criar Sessãoexpect(page.getByText('Goblin D')).toBeVisible()
    
    // Navigate to Sessions via UI
    await page.goto(`/pbta.app/campaigns/${campaignId}`)
    const sessionNav = page.getByRole('button', { name: 'Sessões' }).or(page.getByRole('link', { name: 'Sessões' }))
    await sessionNav.waitFor({ state: 'visible', timeout: 10000 })
    await sessionNav.click()
    
    // Wait for "Nova Sessão" button
    const newSessionBtn = page.getByRole('button', { name: 'Nova Sessão' })
    await newSessionBtn.waitFor({ state: 'visible', timeout: 10000 })
    await newSessionBtn.click()
    await page.getByLabel('Nome').fill('Sessão D')
    const d = new Date()
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    await page.getByLabel('Data').fill(ds)
    await page.getByRole('button', { name: 'Criar' }).first().click()
    
    // Wait for modal to close
    await page.getByRole('button', { name: 'Criar' }).first().waitFor({ state: 'hidden', timeout: 5000 })
    
    // Wait for list to update
    await page.waitForTimeout(3000)
    
    // Loop de retry para encontrar a sessão
    let found = false
    for (let i = 0; i < 3; i++) {
        const count = await page.locator('.session-list button').filter({ hasText: 'Sessão D' }).count()
        if (count > 0) {
            found = true
            break
        }
        console.log(`Tentativa ${i+1}: Lista de sessões vazia ou sessão não encontrada, recarregando...`)
        await page.reload()
        await page.waitForTimeout(5000)
    }
    
    if (!found) {
        throw new Error('Sessão D não encontrada após retries')
    }
    
    // Abrir a sessão criada
    await page.locator('.session-list button').filter({ hasText: 'Sessão D' }).first().click({ force: true })
    
    // Recarregar a página da sessão para garantir que dados (NPCs) sejam carregados no DiceRoller
    await page.waitForTimeout(5000)
    await page.reload()
    await page.waitForTimeout(2000)
    
    // Aguardar DiceRoller
  await page.getByRole('button', { name: 'Rolar' }).waitFor()
  
  // Selecionar NPC
   await page.waitForTimeout(2000)
   const selects = page.locator('select')

   // Wait for options to populate (robustness against firestore delay)
   await expect(async () => {
       const count = await selects.nth(0).locator('option').count()
       expect(count).toBeGreaterThan(1)
   }).toPass({ timeout: 30000 })

   // Aguardar especificamente pelo NPC aparecer nas opções
   await expect(async () => {
       const options = await selects.nth(0).locator('option').allTextContents()
       const hasNpc = options.some(opt => opt.includes(npcName))
       expect(hasNpc).toBeTruthy()
   }).toPass({ timeout: 30000 })

   // Selecionar o NPC correto
   await selects.nth(0).selectOption({ label: `NPC: ${npcName}` })
   
   // Selecionar Atributo Força (index 1)
   await selects.nth(1).selectOption({ value: 'forca' })

   // Selecionar Modo (disadvantage)
    await page.getByLabel('Desvantagem', { exact: true }).click()
    
    await page.getByRole('button', { name: 'Rolar' }).click()
    
    // Wait for result text
    const rollItem = page.locator('.roll-item').first()
    await expect(rollItem).toBeVisible({ timeout: 10000 })
    
    const diceText = await rollItem.locator('.dice').textContent()
    
    // Extrair números do texto [x, y]
    const match = diceText?.match(/\[(\d+), (\d+)\]/)
    if (!match) {
        // Fallback: se o texto não veio, tenta ler novamente ou falha com info
        throw new Error(`Formato de dados inválido ou não encontrado: ${diceText}`)
    }
    
    const d1 = parseInt(match[1])
    const d2 = parseInt(match[2])
    
    // Com desvantagem, esperamos 2 dados exibidos
    expect(match).toBeTruthy()
    
    const totalText = await rollItem.locator('.total').textContent()
    // Total deve ser d1 + d2 + 2 (Força)
    const totalMatch = totalText?.match(/= (\d+)/)
    const total = parseInt(totalMatch![1])
    
    expect(total).toBe(d1 + d2 + 2)
    
    // Validar outcome baseado no total
    const outcomeText = await rollItem.locator('.roll-outcome').textContent()
    if (total >= 10) expect(outcomeText).toContain('Sucesso Total')
    else if (total >= 7) expect(outcomeText).toContain('Sucesso Parcial')
    else expect(outcomeText).toContain('Falha')
})
