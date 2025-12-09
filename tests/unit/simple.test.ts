import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFirestoreCharacterRepo } from '../../src/characters/firestoreCharacterRepo'
import type { Firestore } from 'firebase/firestore'

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ id: 'moves' })),
  query: vi.fn(() => ({ id: 'query' })),
  where: vi.fn(() => ({ fieldPath: 'campaignId', opStr: '==' })),
  getDocs: vi.fn()
}))

describe('firestoreCharacterRepo.validateServerSide - Simple Test', () => {
  let repo: ReturnType<typeof createFirestoreCharacterRepo>
  let mockDb: Firestore

  beforeEach(() => {
    mockDb = {} as Firestore
    repo = createFirestoreCharacterRepo(mockDb)
    
    // Clear all mocks
    vi.clearAllMocks()
  })

  it('should fail when move does not exist in Firestore', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Test Character',
      background: 'Test background',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Test equipment',
      notes: 'Test notes',
      moves: ['NonExistentMove'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Import mocked functions
    const { getDocs } = await import('firebase/firestore')
    
    // Mock empty result - no moves exist
    getDocs.mockResolvedValue({ 
      docs: [],
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })

    const result = await repo.validateServerSide(mockSheet)

    console.log('Test result:', result)
    console.log('getDocs called:', getDocs.mock.calls.length)
    console.log('getDocs mock:', getDocs.mock)

    expect(result).toEqual({ ok: false, message: 'move_not_active' })
  })
})