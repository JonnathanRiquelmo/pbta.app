import { describe, it, expect } from 'vitest'
import { validateSheetUpdate } from '../src/utils/validators'

describe('Security Validators', () => {
  it('deve impedir atualização de ficha por usuário não proprietário', () => {
    const userId = 'user123'
    const sheet = { ownerUid: 'user456' }
    expect(() => validateSheetUpdate(userId, sheet)).toThrow('Unauthorized')
  })

  it('deve permitir atualização para proprietário', () => {
    const userId = 'user123'
    const sheet = { ownerUid: 'user123' }
    expect(() => validateSheetUpdate(userId, sheet)).not.toThrow()
  })
})