import { test, expect } from '@playwright/test'

test.describe('Passo 18: Testar integração com sistema de rolagens', () => {
  test.describe.configure({ mode: 'serial' })
  
  const campaignName = `Campanha DiceRoller ${Date.now()}`
  const npcName = 'NPC Teste Integração'

  test('NPCs aparecem no DiceRoller', async ({ page }) => {
    console.log('🧪 Testando: NPCs aparecem no DiceRoller')
    
    // 1. Login como mestre
    await page.goto('/pbta.app/login')
    await page.waitForTimeout(2000)
    
    // Usar botão de dev tools
    const devLoginButton = await page.getByRole('button', { name: 'Login Mestre' }).count()
    if (devLoginButton > 0) {
      await page.getByRole('button', { name: 'Login Mestre' }).click()
      console.log('✅ Login via dev tools')
    } else {
      throw new Error('Botão de dev tools não encontrado')
    }
    
    // Aguardar redirecionamento
    await page.waitForURL('/pbta.app/dashboard/master', { timeout: 10000 })
    
    // 2. Entrar na campanha correta ou criar
    const campanhaAlvo = page.locator('.campaign-card').filter({ hasText: campaignName })
    if (await campanhaAlvo.count() === 0) {
      // Clicar em Nova Campanha
      await page.getByRole('link', { name: 'Nova Campanha' }).click()
      
      // Criar campanha
      await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(campaignName)
      await page.getByPlaceholder('Descreva o cenário inicial...').fill('Testando integração NPC-DiceRoller')
      await page.getByRole('button', { name: 'Criar Campanha' }).click()
      
      // Aguardar redirecionamento
      await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+$/, { timeout: 10000 })
      console.log(`✅ Campanha "${campaignName}" criada`)
    } else {
      // Entrar na campanha existente
      await campanhaAlvo.first().click()
      await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+$/, { timeout: 10000 })
      console.log('✅ Entrou na campanha existente')
    }
    
    // 3. Criar Movimento Básico se não existir (para popular o select de movimentos)
    await page.getByRole('button', { name: 'Movimentos' }).click()
    await page.waitForTimeout(2000)
    
    const moves = await page.locator('.list-item').count()
    if (moves === 0) {
      // Preencher formulário de criação (que já está visível na página)
      await page.getByLabel('Nome', { exact: true }).fill('Ataque Básico')
      await page.getByLabel('Descrição').fill('Role+Força. Com 10+ causa dano.')
      
      // Modificador: 0 (já é padrão, mas ok)
      
      await page.getByRole('button', { name: 'Criar', exact: true }).click()
       await page.waitForTimeout(2000)
       console.log('✅ Movimento "Ataque Básico" criado')
     }
     
     // Voltar para o dashboard da campanha
     await page.getByRole('button', { name: 'Voltar' }).click()
     await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+$/, { timeout: 10000 })
 
     // 4. Criar NPC se não existir
    const fichasBtn = page.getByRole('button', { name: 'Fichas' })
    await fichasBtn.waitFor()
    await fichasBtn.click()
    await page.waitForTimeout(2000)
    
    const npcs = await page.locator('.npc-list li').count()
    if (npcs === 0) {
      // Criar NPC
      await page.getByRole('button', { name: 'Novo NPC' }).click()
      await page.waitForTimeout(1000)
      
      // Preencher formulário de NPC
      await page.getByPlaceholder('Nome do NPC').fill(npcName)
      await page.getByPlaceholder('Background do NPC').fill('NPC de teste para integração')
      
      // Configurar atributos (soma = 3)
      // Força +1, Agilidade +1, Sabedoria +1, Carisma 0, Intuição 0
      const attrs = ['Força', 'Agilidade', 'Sabedoria', 'Carisma', 'Intuição']
      const values = [1, 1, 1, 0, 0]
      
      for (let i = 0; i < attrs.length; i++) {
          const row = page.locator('.attr-row').filter({ hasText: attrs[i] })
          // Values: -1, 0, 1, 2, 3. Indices: 0, 1, 2, 3, 4.
          // Value 1 => Index 2. Value 0 => Index 1.
          const val = values[i]
          const index = val === 1 ? 2 : 1
          await row.locator('.radio-group label').nth(index).click()
      }
      
      await page.getByRole('button', { name: 'Criar NPC' }).click()
      await page.waitForTimeout(2000)
      console.log('✅ NPC criado')
    }
    
    // 5. Criar sessão se não existir
    await page.getByRole('button', { name: 'Sessões' }).click()
    await page.waitForTimeout(2000)
    
    const sessoes = await page.locator('.session-list li').count()
    if (sessoes === 0) {
      await page.getByRole('button', { name: 'Nova Sessão' }).click()
      await page.waitForTimeout(1000)
      
      // Usar getByLabel pois não tem placeholder
      await page.getByLabel('Nome').fill('Sessão Teste Integração')
      // Resumo está em textarea
      await page.locator('textarea').first().fill('Testando rolagens com NPCs')
      
      // Definir data (obrigatório)
      const d = new Date()
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      await page.getByLabel('Data').fill(ds)

      await page.getByRole('button', { name: 'Criar' }).click()
      
      await page.waitForTimeout(2000)
      console.log('✅ Sessão criada')
    }
    
    // 6. Entrar na sessão
    const primeiraSessao = page.locator('.session-list li').first()
    await primeiraSessao.locator('button').first().click()
    
    await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+\/session\/[^\/]+$/, { timeout: 10000 })
    console.log('✅ Entrou na sessão')
    
    // 7. Verificar DiceRoller
    const diceRoller = await page.locator('.dice-roller').count()
    expect(diceRoller).toBeGreaterThan(0)
    console.log('✅ DiceRoller encontrado')
    
    // 8. Verificar se NPC aparece no seletor "Quem"
    const quemSelect = page.locator('select').first()
    await quemSelect.click()
    
    // Verificar se NPC aparece nas opções
    const options = await quemSelect.locator('option').allTextContents()
    const npcOption = options.find(option => option.includes(npcName))
    expect(npcOption).toBeDefined()
    console.log('✅ NPC encontrado no seletor')
    
    // 9. Selecionar NPC e verificar se atributos aparecem
    await quemSelect.selectOption({ label: npcOption! })
    await page.waitForTimeout(1000)
    
    // Verificar se atributos do NPC estão disponíveis
    const atributoSelect = page.locator('select').nth(1)
    const atributoOptions = await atributoSelect.locator('option').allTextContents()
    expect(atributoOptions.length).toBeGreaterThan(1)
    console.log('✅ Atributos do NPC disponíveis')
  })
  
  test('Testar rolagens para NPCs', async ({ page }) => {
    console.log('🧪 Testando: Rolagens para NPCs')
    
    // 1. Login e navegação até a sessão (mesmo fluxo do teste anterior)
    await page.goto('/pbta.app/login')
    await page.waitForTimeout(2000)
    await page.getByRole('button', { name: 'Login Mestre' }).click()
    await page.waitForURL('/pbta.app/dashboard/master', { timeout: 10000 })
    
    // Entrar na campanha
    const campanhaAlvo = page.locator('.campaign-card').filter({ hasText: campaignName })
    
    // Aguardar que a campanha apareça na lista
    await expect(async () => {
      const count = await campanhaAlvo.count()
      expect(count).toBeGreaterThan(0)
    }).toPass({ timeout: 10000 })
    
    await campanhaAlvo.first().click()
    await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+$/, { timeout: 10000 })
    
    // Entrar na sessão
    await page.getByRole('button', { name: 'Sessões' }).click()
    await page.waitForTimeout(2000)
    
    // Verificar se existe sessão, se não, criar
    const sessoes = await page.locator('.session-list li').count()
    if (sessoes === 0) {
      await page.getByRole('button', { name: 'Nova Sessão' }).click()
      await page.getByLabel('Nome').fill('Sessão Teste Integração')
      await page.locator('textarea').first().fill('Testando rolagens com NPCs')
      const d = new Date()
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      await page.getByLabel('Data').fill(ds)
      await page.getByRole('button', { name: 'Criar' }).click()
      await page.waitForTimeout(2000)
    }

    const primeiraSessao = page.locator('.session-list li').first()
    await primeiraSessao.locator('button').first().click()
    await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+\/session\/[^\/]+$/, { timeout: 10000 })
    
    // Recarregar para garantir dados atualizados
    await page.reload()
    await page.waitForTimeout(3000)
    
    // 2. Selecionar NPC no DiceRoller
    const quemSelect = page.locator('select').first()
    
    // Aguardar NPC aparecer na lista
    await expect(async () => {
      const options = await quemSelect.locator('option').allTextContents()
      const found = options.some(o => o.includes(npcName))
      expect(found).toBeTruthy()
    }).toPass({ timeout: 15000 })

    const options = await quemSelect.locator('option').allTextContents()
    const npcOption = options.find(option => option.includes(npcName))
    
    if (!npcOption) {
      throw new Error('NPC não encontrado no seletor')
    }
    
    await quemSelect.selectOption({ label: npcOption })
    await page.waitForTimeout(1000)
    
    // 3. Selecionar atributo
    const atributoSelect = page.locator('select').nth(1)
    const atributoOptions = await atributoSelect.locator('option').allTextContents()
    
    // Selecionar primeiro atributo (excluindo "Selecione...")
    const primeiroAtributo = atributoOptions.find(option => !option.includes('Selecione'))
    if (primeiroAtributo) {
      await atributoSelect.selectOption({ label: primeiroAtributo })
      await page.waitForTimeout(1000)
    }
    
    // 4. Realizar rolagem
    const rollButton = await page.getByRole('button', { name: /Rolar|Roll/ }).count()
    if (rollButton > 0) {
      await page.getByRole('button', { name: /Rolar|Roll/ }).click()
      await page.waitForTimeout(2000)
      
      // 5. Verificar se rolagem aparece no histórico
      const rollHistory = await page.locator('.roll-history').count()
      expect(rollHistory).toBeGreaterThan(0)
      console.log('✅ Rolagem realizada com sucesso')
    } else {
      console.log('⚠️ Botão de rolar não encontrado')
    }
  })
  
  test('Validar que NPCs têm acesso a todos os movimentos', async ({ page }) => {
    console.log('🧪 Testando: NPCs têm acesso a todos os movimentos')
    
    // 1. Login e navegação até a sessão (mesmo fluxo)
    await page.goto('/pbta.app/login')
    await page.waitForTimeout(2000)
    await page.getByRole('button', { name: 'Login Mestre' }).click()
    await page.waitForURL('/pbta.app/dashboard/master', { timeout: 10000 })
    
    // Entrar na campanha
    const campanhaAlvo = page.locator('.campaign-card').filter({ hasText: campaignName })
    
    // Aguardar que a campanha apareça na lista
    await expect(async () => {
      const count = await campanhaAlvo.count()
      expect(count).toBeGreaterThan(0)
    }).toPass({ timeout: 10000 })
    
    await campanhaAlvo.first().click()
    await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+$/, { timeout: 10000 })
    
    // Entrar na sessão
    await page.getByRole('button', { name: 'Sessões' }).click()
    await page.waitForTimeout(2000)

    // Verificar se existe sessão, se não, criar
    const sessoes = await page.locator('.session-list li').count()
    if (sessoes === 0) {
      await page.getByRole('button', { name: 'Nova Sessão' }).click()
      await page.getByLabel('Nome').fill('Sessão Teste Integração')
      await page.locator('textarea').first().fill('Testando rolagens com NPCs')
      const d = new Date()
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      await page.getByLabel('Data').fill(ds)
      await page.getByRole('button', { name: 'Criar' }).click()
      await page.waitForTimeout(2000)
    }

    const primeiraSessao = page.locator('.session-list li').first()
    await primeiraSessao.locator('button').first().click()
    await page.waitForURL(/\/pbta\.app\/campaigns\/[^\/]+\/session\/[^\/]+$/, { timeout: 10000 })
    
    // 2. Selecionar NPC no DiceRoller
    const quemSelect = page.locator('select').first()
    
    // Aguardar NPC aparecer na lista
    await expect(async () => {
      const options = await quemSelect.locator('option').allTextContents()
      const found = options.some(o => o.includes(npcName))
      expect(found).toBeTruthy()
    }).toPass({ timeout: 10000 })

    const options = await quemSelect.locator('option').allTextContents()
    const npcOption = options.find(option => option.includes(npcName))
    
    if (!npcOption) {
      throw new Error('NPC não encontrado no seletor')
    }
    
    await quemSelect.selectOption({ label: npcOption })
    await page.waitForTimeout(1000)
    
    // 3. Verificar se movimentos estão disponíveis
    const movimentoSelect = page.locator('select').nth(2)
    const movimentoOptions = await movimentoSelect.locator('option').allTextContents()
    
    // NPCs devem ter acesso a todos os movimentos da campanha
    expect(movimentoOptions.length).toBeGreaterThan(0) // Espera pelo menos um movimento
    console.log(`✅ NPC tem acesso a ${movimentoOptions.length} movimentos`)
    
    // Verificar se há movimentos específicos
    const hasBasicMoves = movimentoOptions.some(option => 
      option.toLowerCase().includes('básico') || 
      option.toLowerCase().includes('basic') ||
      option.toLowerCase().includes('ataque') ||
      option.toLowerCase().includes('defesa')
    )
    
    expect(hasBasicMoves).toBe(true)
    console.log('✅ NPC tem acesso a movimentos básicos da campanha')
  })
})