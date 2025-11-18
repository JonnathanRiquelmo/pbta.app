import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalCharacterRepo } from '../localCharacterRepo'

describe('localCharacterRepo attributes sum', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  it('rejects when sum != 3', () => {
    const repo = createLocalCharacterRepo()
    const res = repo.create('c-1', 'u-1', {
      name: 'Jogador',
      background: 'Teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 0, carisma: 0, intuicao: 0 },
      equipment: '',
      notes: '',
      moves: []
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.message).toBe('invalid_attributes_sum')
  })
  it('accepts when sum == 3', () => {
    const repo = createLocalCharacterRepo()
    const res = repo.create('c-1', 'u-1', {
      name: 'Jogador',
      background: 'Teste',
      attributes: { forca: 1, agilidade: 1, sabedoria: 1, carisma: 0, intuicao: 0 },
      equipment: '',
      notes: '',
      moves: []
    })
    expect(res.ok).toBe(true)
  })
})