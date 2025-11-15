import { describe, it, expect, beforeEach, vi } from 'vitest'

function seedBypass(items: unknown[]) {
  localStorage.setItem('bypass:characters', JSON.stringify(items))
}

describe('Serviços (bypass) — ACL de propriedade', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updateCharacter deve lançar Unauthorized para não proprietário', async () => {
    vi.stubEnv('VITE_TEST_BYPASS_AUTH', 'true')
    seedBypass([
      { id: 'c1', ownerUid: 'ownerA', isNPC: false, name: 'Old' }
    ])
    const svc = await import('../src/services/characters.service')
    await expect(svc.updateCharacter('c1', { name: 'New' }, 'otherUser')).rejects.toThrow('Unauthorized')
  })

  it('deletePdm deve lançar Unauthorized para não proprietário', async () => {
    vi.stubEnv('VITE_TEST_BYPASS_AUTH', 'true')
    seedBypass([
      { id: 'p1', ownerUid: 'ownerA', isNPC: true, name: 'NPC' }
    ])
    const svc = await import('../src/services/characters.service')
    await expect(svc.deletePdm('p1', 'otherUser')).rejects.toThrow('Unauthorized')
    // Garantir que updatePdm também bloqueia
    seedBypass([{ id: 'p1', ownerUid: 'ownerA', isNPC: true, name: 'NPC' }])
    await expect(svc.updatePdm('p1', { name: 'Updated' }, 'otherUser')).rejects.toThrow('Unauthorized')
  })
})