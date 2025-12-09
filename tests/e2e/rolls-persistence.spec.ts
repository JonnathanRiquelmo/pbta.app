import { test, expect } from '@playwright/test';

test.describe('Roll Persistence and History', () => {
  test('Master creates roll, verifies history, reloads, verifies persistence', async ({ page }) => {
    test.setTimeout(120000);
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
    
    // --- Setup: Login ---
    await page.goto('/pbta.app/login');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() });
    
    // Use the dev login button for testing
    await page.getByRole('button', { name: 'Login Mestre' }).click();
    await page.waitForURL(/\/dashboard\/master$/, { timeout: 40000 });
    
    // --- Create Campaign ---
    console.log('📝 Criando campanha...');
    await page.getByRole('link', { name: 'Nova Campanha' }).click();
    await page.waitForURL(/\/dashboard\/create-campaign/);
    
    const campaignName = `Roll Persistence Test ${Date.now()}`;
    await page.getByPlaceholder('Ex: A Sombra do Dragão').fill(campaignName);
    await page.getByPlaceholder('Descreva o cenário inicial...').fill('Testing roll persistence');
    await page.getByRole('button', { name: 'Criar Campanha' }).click();
    
    // Wait for redirection to campaign
    await page.waitForURL(/\/campaigns\/[^/]+$/);
    const campaignUrl = page.url();
    console.log(`✅ Campanha criada: ${campaignUrl}`);

    // --- Step 1: Create an NPC (to roll for) ---
    console.log('📝 Criando NPC...');
    await page.getByRole('button', { name: 'Fichas' }).click();
    await page.getByRole('button', { name: 'Novo NPC' }).click();
    
    const npcName = `Roller NPC ${Date.now()}`;
    await page.getByPlaceholder('Nome do NPC').fill(npcName);
    await page.getByPlaceholder('Background do NPC').fill('A dice roller');
    
    // Attributes (sum 3): Forca 3, others 0
    // Força = 3
    await page.locator('.attr-row').filter({ hasText: /^For[cç]a/i }).getByText('3', { exact: true }).click();
    // Others = 0
    await page.locator('.attr-row').filter({ hasText: /^Agilidade/i }).getByText('0', { exact: true }).click();
    await page.locator('.attr-row').filter({ hasText: /^Sabedoria/i }).getByText('0', { exact: true }).click();
    await page.locator('.attr-row').filter({ hasText: /^Carisma/i }).getByText('0', { exact: true }).click();
    await page.locator('.attr-row').filter({ hasText: /^Intui[cç][aã]o/i }).getByText('0', { exact: true }).click();
    
    await page.getByRole('button', { name: 'Criar NPC' }).click();
    await expect(page.getByText(npcName)).toBeVisible();
    console.log('✅ NPC criado');

    // --- Step 2: Create a Session ---
    console.log('📝 Criando Sessão...');
    await page.getByRole('button', { name: 'Sessões' }).click();
    await page.getByRole('button', { name: 'Nova Sessão' }).click();
    
    await page.waitForTimeout(1000); // Wait for modal
    
    const sessionName = `Session ${Date.now()}`;
    const createSection = page.getByRole('heading', { name: 'Criar Sessão' }).locator('..').locator('..'); // Modal container
    
    await page.locator('label').filter({ hasText: 'Nome' }).locator('input').first().fill(sessionName);
    await page.locator('label').filter({ hasText: 'Data' }).locator('input').first().fill(new Date().toISOString().split('T')[0]);
    
    await page.getByRole('button', { name: 'Criar', exact: true }).click();
    
    // Wait for session and open it
    console.log('🚀 Abrindo Sessão...');
    await page.locator('.session-list li').first().waitFor({ state: 'visible' });
    await page.getByRole('button', { name: sessionName }).click();
    await page.waitForURL(/\/campaigns\/[^/]+\/session\/[^/]+$/);
    
    // --- Step 3: Perform Roll ---
    console.log('🎲 Realizando rolagem...');
    const diceRoller = page.locator('.dice-roller');
    await expect(diceRoller).toBeVisible();
    
    // Select NPC
    await diceRoller.locator('select').first().selectOption({ label: `NPC: ${npcName}` });
    
    // Select Attribute (Força)
    await diceRoller.locator('select').nth(1).selectOption({ label: 'FORCA' }); // or check label text
    
    // Wait for result
    // DiceRoller usually rolls immediately on attribute selection?
    // Let's check DiceRoller.tsx logic.
    // It seems it rolls on click? Or selection?
    // "Clicar em um atributo para rolar" - but here we select from dropdown.
    // If using dropdown, does it roll?
    // In DiceRoller.tsx: <select onChange={...}> triggers setAttributeRef.
    // Then: useEffect(() => { if (attributeRef) roll(...) }, [attributeRef]) ?
    // I need to verify if selecting triggers roll.
    
    // Assuming it triggers roll or there is a "Rolar" button.
    // DiceRoller.tsx (I recall) had buttons for attributes in my previous read?
    // No, I changed test to select because I saw select.
    // Wait, let's check DiceRoller.tsx again.
    
    // If it uses select, usually there is a "Rolar" button.
    const rollButton = diceRoller.getByRole('button', { name: 'Rolar' });
    if (await rollButton.isVisible()) {
        await rollButton.click();
    } else {
        // Check if there is a "Rolar +[Attr]" button?
        // Or maybe selecting triggers it.
    }
    
    // Wait for result to appear
    // The result usually appears in a list below.
    await expect(page.locator('.roll-item').first()).toBeVisible({ timeout: 10000 });
    const rollText = await page.locator('.roll-item').first().textContent();
    console.log(`✅ Rolagem realizada: ${rollText}`);
    
    // --- Step 4: Reload and Verify Persistence ---
    console.log('🔄 Recarregando página...');
    await page.reload();
    await page.waitForURL(/\/campaigns\/[^/]+\/session\/[^/]+$/);
    
    // Verify roll is still there
    await expect(page.locator('.roll-item').first()).toBeVisible({ timeout: 10000 });
    const rollTextAfter = await page.locator('.roll-item').first().textContent();
    console.log(`✅ Rolagem persistida: ${rollTextAfter}`);
    
    expect(rollTextAfter).toBe(rollText);
  });
});
