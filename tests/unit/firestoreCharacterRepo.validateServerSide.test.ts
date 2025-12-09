import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFirestoreCharacterRepo } from '../../src/characters/firestoreCharacterRepo'
import type { Firestore } from 'firebase/firestore'

// Mock Firebase Firestore
const mockCollection = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()
const mockGetDocs = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => {
    const result = mockCollection(...args)
    return result || { id: 'characters' }
  },
  query: (...args: any[]) => {
    const result = mockQuery(...args)
    return result || { id: 'query' }
  },
  where: (...args: any[]) => {
    const result = mockWhere(...args)
    return result || { fieldPath: 'campaignId', opStr: '==', value: args[2] }
  },
  getDocs: (...args: any[]) => {
    const result = mockGetDocs(...args)
    return result || Promise.resolve({ 
      docs: [],
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })
  }
}))

describe('firestoreCharacterRepo.validateServerSide', () => {
  let repo: ReturnType<typeof createFirestoreCharacterRepo>
  let mockDb: Firestore

  beforeEach(() => {
    mockDb = {} as Firestore
    repo = createFirestoreCharacterRepo(mockDb)
    
    // Reset mocks
    vi.clearAllMocks()
  })

  it('deve validar com sucesso quando todos os movimentos estão ativos', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: ['Ataque Preciso', 'Defesa Rápida'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Mock documentos de movimentos ativos
    const mockDocs = [
      { data: () => ({ name: 'Ataque Preciso', active: true }) },
      { data: () => ({ name: 'Defesa Rápida', active: true }) },
      { data: () => ({ name: 'Investigação', active: true }) }
    ]

    mockGetDocs.mockResolvedValue({ 
      docs: mockDocs,
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })

    const result = await repo.validateServerSide(mockSheet)

    expect(result).toEqual({ ok: true })
    expect(mockCollection).toHaveBeenCalledWith(mockDb, 'moves')
    expect(mockWhere).toHaveBeenCalledWith('campaignId', '==', 'campaign123')
    expect(mockGetDocs).toHaveBeenCalled()
  })

  it('deve falhar quando um movimento não está ativo', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: ['Ataque Preciso', 'Defesa Rápida', 'Movimento Inativo'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Mock documentos - apenas movimentos ativos são adicionados ao Set
    // Como 'Movimento Inativo' não está ativo, ele não será adicionado ao Set
    const mockDocs = [
      { data: () => ({ name: 'Ataque Preciso', active: true }) },
      { data: () => ({ name: 'Defesa Rápida', active: true }) }
      // Movimento Inativo não está na lista de movimentos ativos
    ]

    mockGetDocs.mockResolvedValue({ 
      docs: mockDocs,
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })

    const result = await repo.validateServerSide(mockSheet)

    expect(result).toEqual({ ok: false, message: 'move_not_active' })
  })

  it('deve falhar quando um movimento não existe no Firestore', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: ['Ataque Preciso', 'Movimento Inexistente'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Mock documentos - apenas um dos movimentos existe
    const mockDocs = [
      { data: () => ({ name: 'Ataque Preciso', active: true }) }
      // Movimento Inexistente não está na lista
    ]

    mockGetDocs.mockResolvedValue({ 
      docs: mockDocs,
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })

    const result = await repo.validateServerSide(mockSheet)

    expect(result).toEqual({ ok: false, message: 'move_not_active' })
  })

  it('deve validar com sucesso quando não há movimentos selecionados', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const mockDocs = [
      { data: () => ({ name: 'Ataque Preciso', active: true }) }
    ]

    mockGetDocs.mockResolvedValue({ 
      docs: mockDocs,
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })

    const result = await repo.validateServerSide(mockSheet)

    expect(result).toEqual({ ok: true })
  })

  it('deve falhar quando a soma dos atributos não é 3', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 2, agilidade: 2, sabedoria: 2, carisma: 0, intuicao: 0 }, // Soma = 6, inválida
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: ['Ataque Preciso'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const result = await repo.validateServerSide(mockSheet)

    expect(result).toEqual({ ok: false, message: 'invalid_attributes_sum' })
    expect(mockGetDocs).not.toHaveBeenCalled() // Não deve checar movimentos se atributos forem inválidos
  })

  it('deve retornar ok: true quando ocorre erro no Firestore (fallback)', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: ['Ataque Preciso'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Simular erro no Firestore
    mockGetDocs.mockRejectedValue(new Error('Erro de conexão'))

    const result = await repo.validateServerSide(mockSheet)

    // Em caso de erro, deve retornar ok: true como fallback
    expect(result).toEqual({ ok: true })
  })

  it('deve validar corretamente com movimentos undefined', async () => {
    const mockSheet = {
      id: 'sheet123',
      campaignId: 'campaign123',
      userId: 'user123',
      name: 'Personagem Teste',
      background: 'Background teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: 'Equipamento teste',
      notes: 'Notas teste',
      moves: undefined as unknown as string[], // undefined
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const mockDocs = [
      { data: () => ({ name: 'Ataque Preciso', active: true }) }
    ]

    mockGetDocs.mockResolvedValue({ 
      docs: mockDocs,
      forEach: function(callback: (doc: any) => void) {
        this.docs.forEach(callback)
      }
    })

    const result = await repo.validateServerSide(mockSheet)

    expect(result).toEqual({ ok: true })
  })
})