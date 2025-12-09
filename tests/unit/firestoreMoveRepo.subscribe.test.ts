import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createFirestoreMoveRepo } from '../../src/moves/firestoreMoveRepo'
import type { Firestore } from 'firebase/firestore'

// Mock Firebase Firestore
const mockCollection = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockOnSnapshot = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => {
    const result = mockCollection(...args)
    return result || { id: 'moves' }
  },
  query: (...args: any[]) => {
    const result = mockQuery(...args)
    return result || { id: 'query' }
  },
  where: (...args: any[]) => {
    const result = mockWhere(...args)
    return result || { fieldPath: 'campaignId', opStr: '==', value: args[2] }
  },
  onSnapshot: (...args: any[]) => {
    const result = mockOnSnapshot(...args)
    return mockUnsubscribe
  }
}))

describe('firestoreMoveRepo.subscribe', () => {
  let repo: ReturnType<typeof createFirestoreMoveRepo>
  let mockDb: Firestore
  let unsubscribe: () => void

  beforeEach(() => {
    mockDb = {} as Firestore
    repo = createFirestoreMoveRepo(mockDb)
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup default mock behavior
    mockOnSnapshot.mockImplementation((query, onNext, onError) => {
      // Simulate immediate callback with empty snapshot
      const mockSnapshot = {
        docs: []
      }
      onNext(mockSnapshot)
      return mockUnsubscribe
    })
  })

  afterEach(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  it('deve configurar subscription com query correta', () => {
    const campaignId = 'test-campaign-123'
    const callback = vi.fn()

    unsubscribe = repo.subscribe(campaignId, callback)

    // Verify collection was called with correct path
    expect(mockCollection).toHaveBeenCalledWith(mockDb, 'moves')
    
    // Verify where clause was called with correct parameters
    expect(mockWhere).toHaveBeenCalledWith('campaignId', '==', campaignId)
    
    // Verify query was called
    expect(mockQuery).toHaveBeenCalled()
    
    // Verify onSnapshot was called
    expect(mockOnSnapshot).toHaveBeenCalled()
  })

  it('deve chamar callback com movimentos ordenados', () => {
    const campaignId = 'test-campaign-123'
    const callback = vi.fn()
    
    const mockMoves = [
      { id: 'move1', campaignId, name: 'Move 1', createdAt: 1000 },
      { id: 'move2', campaignId, name: 'Move 2', createdAt: 2000 },
      { id: 'move3', campaignId, name: 'Move 3', createdAt: 500 }
    ]

    mockOnSnapshot.mockImplementation((query, onNext, onError) => {
      const mockSnapshot = {
        docs: mockMoves.map(move => ({
          id: move.id,
          data: () => move
        }))
      }
      onNext(mockSnapshot)
      return mockUnsubscribe
    })

    unsubscribe = repo.subscribe(campaignId, callback)

    // Verify callback was called with sorted moves (newest first)
    expect(callback).toHaveBeenCalledWith([
      { id: 'move2', campaignId, name: 'Move 2', createdAt: 2000 }, // newest
      { id: 'move1', campaignId, name: 'Move 1', createdAt: 1000 },
      { id: 'move3', campaignId, name: 'Move 3', createdAt: 500 }  // oldest
    ])
  })

  it('deve atualizar cache interno após receber dados', () => {
    const campaignId = 'test-campaign-123'
    const callback = vi.fn()
    
    const mockMoves = [
      { id: 'move1', campaignId, name: 'Move 1', createdAt: 1000 }
    ]

    mockOnSnapshot.mockImplementation((query, onNext, onError) => {
      const mockSnapshot = {
        docs: mockMoves.map(move => ({
          id: move.id,
          data: () => move
        }))
      }
      onNext(mockSnapshot)
      return mockUnsubscribe
    })

    unsubscribe = repo.subscribe(campaignId, callback)

    // Verify that listByCampaign returns the cached data
    const cachedMoves = repo.listByCampaign(campaignId)
    expect(cachedMoves).toEqual([
      { id: 'move1', campaignId, name: 'Move 1', createdAt: 1000 }
    ])
  })

  it('deve retornar função unsubscribe', () => {
    const campaignId = 'test-campaign-123'
    const callback = vi.fn()

    unsubscribe = repo.subscribe(campaignId, callback)

    expect(unsubscribe).toBe(mockUnsubscribe)
  })

  it('deve tratar erros no onSnapshot', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const campaignId = 'test-campaign-123'
    const callback = vi.fn()
    const testError = new Error('Firestore error')

    mockOnSnapshot.mockImplementation((query, onNext, onError) => {
      // Simulate error callback
      onError(testError)
      return mockUnsubscribe
    })

    unsubscribe = repo.subscribe(campaignId, callback)

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Error in moves subscription:', testError)
    
    consoleSpy.mockRestore()
  })
})