import { describe, it, expect } from 'vitest'
import { performRoll } from '../../src/rolls/service'

describe('rolls.service.performRoll', () => {
  it('deve calcular corretamente o totalModifier (atributo + movimento)', () => {
    const result = performRoll({
      mode: 'normal',
      attributeModifier: 2,
      moveModifier: 1
    })

    expect(result.totalModifier).toBe(3)
    expect(result.total).toBe(result.baseSum + 3)
  })

  it('deve calcular corretamente quando apenas atributo é fornecido', () => {
    const result = performRoll({
      mode: 'normal',
      attributeModifier: 2
    })

    expect(result.totalModifier).toBe(2)
    expect(result.total).toBe(result.baseSum + 2)
  })

  it('deve calcular corretamente quando apenas movimento é fornecido', () => {
    const result = performRoll({
      mode: 'normal',
      moveModifier: 1
    })

    expect(result.totalModifier).toBe(1)
    expect(result.total).toBe(result.baseSum + 1)
  })

  it('deve lidar com modificadores negativos', () => {
    const result = performRoll({
      mode: 'normal',
      attributeModifier: -1,
      moveModifier: -1
    })

    expect(result.totalModifier).toBe(-2)
    expect(result.total).toBe(result.baseSum - 2)
  })

  it('deve retornar outcome correto para sucesso (10+)', () => {
    // Mock randomD6 logic is internal, but we can infer outcome logic
    // Ideally we should mock randomD6, but it is not exported.
    // However, we can verify the relationship between total and outcome.
    // Or check if we can force the result? No, performRoll calls randomD6 internally.
    // We can just test computeOutcome separately if it was exported, OR check the result properties.
    
    // Since we can't control dice, we verify consistent logic:
    const result = performRoll({ mode: 'normal', attributeModifier: 100 }) // Force success
    expect(result.outcome).toBe('success')
    expect(result.total).toBeGreaterThanOrEqual(10)
  })

  it('deve retornar outcome correto para falha (6-)', () => {
    const result = performRoll({ mode: 'normal', attributeModifier: -100 }) // Force fail
    expect(result.outcome).toBe('fail')
    expect(result.total).toBeLessThan(7)
  })
})
