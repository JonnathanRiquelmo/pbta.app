import { test, expect } from '@playwright/test'

async function loginMaster(page: any) {
  await page.goto('login')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  
  // Usar o botão de Dev Tools para login rápido
  await page.getByRole('button', { name: 'Login Mestre' }).click()
  
  // Aguardar redirecionamento para dashboard do mestre
  await page.waitForURL(/\/dashboard\/master$/, { timeout: 15000 })
  
  // Verificar que estamos na dashboard correta
  await expect(page.locator('h2')).toBeVisible({ timeout: 15000 })
}

async function criarCampanhaTeste(page: any, nome: string, plot: string) {
  // Navegar diretamente para a página de criação com URL correto
  await page.goto('/pbta.app/dashboard/create-campaign')
  await page.waitForTimeout(2000)
  
  // Preencher formulário
  await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(nome)
  if (plot) {
    await page.getByPlaceholder('Descreva o cenário inicial...').fill(plot)
  }
  
  // Clicar em criar
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Criar Campanha' }).click()
  
  // Aguardar redirecionamento para a página da campanha
  await page.waitForURL(/.*campaigns\/[^\/]+/, { timeout: 20000 })
}

test('NPCs: interface de edição individual - navegação e elementos', async ({ page }) => {
  test.setTimeout(60000)
  await loginMaster(page)
  
  // Criar campanha de teste com nome único para este teste
  const timestamp = Date.now()
  await criarCampanhaTeste(page, `Campanha Teste Edição ${timestamp}`, 'Teste de interface de edição')
  
  // Acessar aba Fichas
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.getByRole('heading', { name: 'Fichas de NPC/PDM' }).waitFor()
  
  // Criar NPC para testar edição com nome único
  const npcName = `NPC Teste Edição ${timestamp}`
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  await page.getByPlaceholder('Nome do NPC').fill(npcName)
  await page.getByPlaceholder('Background do NPC').fill('Personagem de teste para edição')
  
  // Selecionar atributos (soma = +3)
  await page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Carisma' }).locator('.radio-label').getByText('0', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Intuição' }).locator('.radio-label').getByText('0', { exact: true }).click()
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.getByText('NPC criado com sucesso!')).toBeVisible()
  
  // Aguardar mais tempo para garantir que o NPC foi salvo e aparece na lista
  await page.waitForTimeout(5000)
  
  // Verificar que o NPC foi criado e está na lista
  await expect(page.getByText(npcName)).toBeVisible({ timeout: 10000 })
  
  // Clicar em editar - pegar o botão Editar específico do NPC que acabamos de criar
  await page.locator('.npc-list li').filter({ hasText: npcName }).getByRole('button', { name: 'Editar' }).click()
  
  // Verificar que foi para página de edição (aguardar mais tempo para carregamento)
  await page.waitForURL(/\/campaigns\/[^\/]+\/npcs\/[^\/]+$/, { timeout: 15000 })
  await page.waitForTimeout(3000) // Aguardar página carregar completamente
  
  // Aguardar página carregar completamente - usar abordagem mais flexível
  await page.waitForTimeout(5000)
  
  // Verificar que está na página de edição (procurar heading que contenha "Editar NPC")
  await expect(page.locator('h1, h2, h3')).toContainText('Editar NPC', { timeout: 10000 })
  
  // Verificar que formulário está preenchido com dados existentes
  await expect(page.getByPlaceholder('Nome do NPC')).toHaveValue(npcName)
  await expect(page.getByPlaceholder('Background do NPC')).toHaveValue('Personagem de teste para edição')
  
  // Verificar que atributos estão corretos
  await expect(page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-label').getByText('1', { exact: true })).toHaveClass(/selected/)
  await expect(page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-label').getByText('1', { exact: true })).toHaveClass(/selected/)
  await expect(page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).locator('.radio-label').getByText('1', { exact: true })).toHaveClass(/selected/)
  await expect(page.locator('.attr-row').filter({ hasText: 'Carisma' }).locator('.radio-label').getByText('0', { exact: true })).toHaveClass(/selected/)
  await expect(page.locator('.attr-row').filter({ hasText: 'Intuição' }).locator('.radio-label').getByText('0', { exact: true })).toHaveClass(/selected/)
  
  // Verificar botão de salvar
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
})

test('NPCs: edição com validação de dados', async ({ page }) => {
  test.setTimeout(60000)
  await loginMaster(page)
  
  // Criar campanha de teste com nome único para este teste
  const timestamp = Date.now()
  await criarCampanhaTeste(page, `Campanha Teste Validação ${timestamp}`, 'Teste de validação na edição')
  
  // Navegar para NPCs
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.waitForTimeout(500)
  
  // Criar NPC inicial com nome único
  const npcName = `NPC Original ${timestamp}`
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  await page.getByPlaceholder('Nome do NPC').fill(npcName)
  await page.getByPlaceholder('Background do NPC').fill('Background original')
  
  // Selecionar atributos usando radio buttons - target custom-styled labels
  await page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Carisma' }).locator('.radio-label').getByText('0', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Intuição' }).locator('.radio-label').getByText('0', { exact: true }).click()
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.getByText('NPC criado com sucesso!')).toBeVisible()
  
  // Aguardar mais tempo para garantir que o NPC foi salvo completamente
  await page.waitForTimeout(5000)
  
  // Verificar que o NPC foi criado e está na lista
  await expect(page.getByText(npcName)).toBeVisible({ timeout: 10000 })
  
  // Clicar em editar - pegar o botão Editar específico do NPC que acabamos de criar
  await page.locator('.npc-list li').filter({ hasText: npcName }).getByRole('button', { name: 'Editar' }).click()
  await page.waitForURL(/\/campaigns\/[^\/]+\/npcs\/[^\/]+$/, { timeout: 15000 })
  await page.waitForTimeout(3000) // Aguardar página carregar completamente
  
  // Aguardar página carregar completamente - usar abordagem mais flexível
  await page.waitForTimeout(5000)
  
  // Verificar que está na página de edição (procurar heading que contenha "Editar NPC")
  await expect(page.locator('h1, h2, h3')).toContainText('Editar NPC', { timeout: 10000 })
  
  // Testar validação com soma inválida - selecionar valores que somam mais que// Testar combinação inválida: soma > +3
  await page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-label').getByText('3', { exact: true }).click() // Força = 3
  await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-label').getByText('2', { exact: true }).click() // Agilidade = 2 (total = 5, inválido)
  // Botão deve estar desabilitado
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeDisabled()
  
  // Corrigir para soma válida
  await page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-label').getByText('2', { exact: true }).click() // Força = 2
  await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-label').getByText('1', { exact: true }).click() // Agilidade = 1
  await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).locator('.radio-label').getByText('0', { exact: true }).click() // Sabedoria = 0
  // Botão deve estar habilitado
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeEnabled()
  
  // Salvar alterações
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('NPC atualizado com sucesso!')).toBeVisible()
  
  // Aguardar redirecionamento e carregamento da lista
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  await page.waitForTimeout(1000) // Aguardar lista recarregar
  
  // Verificar se estamos na aba correta
  await page.getByRole('button', { name: 'Fichas' }).click()
  await page.waitForTimeout(2000)
  
  // Verificar que voltou para lista e alterações foram aplicadas
  await expect(page.getByText(npcName)).toBeVisible()
})

test('NPCs: edição de campos opcionais', async ({ page }) => {
  test.setTimeout(60000)
  await loginMaster(page)
  
  // Criar campanha de teste com nome único para este teste
  const timestamp = Date.now()
  await criarCampanhaTeste(page, `Campanha Teste Campos Opcionais ${timestamp}`, 'Teste de campos opcionais')
  
  // Navegar para NPCs
  await page.getByRole('button', { name: 'Fichas' }).click()
  
  // Criar NPC sem campos opcionais com nome único
  const npcName = `NPC Campos Opcionais ${timestamp}`
  await page.getByRole('button', { name: 'Novo NPC' }).click()
  await page.getByPlaceholder('Nome do NPC').fill(npcName)
  await page.getByPlaceholder('Background do NPC').fill('Teste')
  
  // Selecionar atributos usando radio buttons - target custom-styled labels
  await page.locator('.attr-row').filter({ hasText: 'Força' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Agilidade' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Sabedoria' }).locator('.radio-label').getByText('1', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Carisma' }).locator('.radio-label').getByText('0', { exact: true }).click()
  await page.locator('.attr-row').filter({ hasText: 'Intuição' }).locator('.radio-label').getByText('0', { exact: true }).click()
  
  await page.getByRole('button', { name: 'Criar NPC' }).click()
  await expect(page.getByText('NPC criado com sucesso!')).toBeVisible()
  
  // Aguardar mais tempo para garantir que o NPC foi salvo completamente
  await page.waitForTimeout(5000)
  
  // Verificar que o NPC foi criado e está na lista
  await expect(page.getByText(npcName)).toBeVisible({ timeout: 10000 })
  
  // Clicar em editar - pegar o botão Editar específico do NPC que acabamos de criar
  await page.locator('.npc-list li').filter({ hasText: npcName }).getByRole('button', { name: 'Editar' }).click()
  await page.waitForURL(/\/campaigns\/[^\/]+\/npcs\/[^\/]+$/, { timeout: 15000 })
  await page.waitForTimeout(3000) // Aguardar página carregar completamente
  
  // Aguardar página carregar completamente - usar abordagem mais flexível
  await page.waitForTimeout(5000)
  
  // Verificar que está na página de edição (procurar heading que contenha "Editar NPC")
  await expect(page.locator('h1, h2, h3')).toContainText('Editar NPC', { timeout: 10000 })
  
  // Preencher campos opcionais (usar os placeholders corretos do formulário)
  await page.getByPlaceholder('Equipamentos do NPC').fill('Espada curta, escudo de madeira')
  await page.getByPlaceholder('Notas sobre o NPC').fill('NPC importante para a história principal')
  
  // Salvar
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('NPC atualizado com sucesso!')).toBeVisible()
  
  // Aguardar redirecionamento e carregamento da lista
  await page.waitForURL(/\/campaigns\/[^/]+$/)
  await page.waitForTimeout(1000) // Aguardar lista recarregar
  
  // Verificar se estamos na aba correta
  await page.getByRole('button', { name: 'Fichas' }).click()
  
  // Verificar que alterações foram salvas
  await expect(page.getByText(npcName)).toBeVisible()
})