import { describe, it, expect, vi } from 'vitest'
import { roll2d6 } from '../pbta'

describe('roll2d6', () => {
  it('classifica miss quando total < 7', () => {
    const spy = vi.spyOn(Math, 'random')
    spy.mockReturnValueOnce((3 - 1) / 6) // d1 = 3
    spy.mockReturnValueOnce((3 - 1) / 6) // d2 = 3
    const r = roll2d6(0)
    expect(r.total).toBe(6)
    expect(r.result).toBe('miss')
    spy.mockRestore()
  })

  it('classifica hit-7-9 quando total 7..9', () => {
    const spy = vi.spyOn(Math, 'random')
    spy.mockReturnValueOnce((3 - 1) / 6) // d1 = 3
    spy.mockReturnValueOnce((4 - 1) / 6) // d2 = 4
    const r = roll2d6(0)
    expect(r.total).toBe(7)
    expect(r.result).toBe('hit-7-9')
    spy.mockRestore()
  })

  it('classifica hit-10+ quando total >= 10', () => {
    const spy = vi.spyOn(Math, 'random')
    spy.mockReturnValueOnce((5 - 1) / 6) // d1 = 5
    spy.mockReturnValueOnce((5 - 1) / 6) // d2 = 5
    const r = roll2d6(0)
    expect(r.total).toBe(10)
    expect(r.result).toBe('hit-10+')
    spy.mockRestore()
  })

  it('aplica modificador e mantém estrutura do retorno', () => {
    const spy = vi.spyOn(Math, 'random')
    spy.mockReturnValueOnce((2 - 1) / 6) // d1 = 2
    spy.mockReturnValueOnce((5 - 1) / 6) // d2 = 5
    const r = roll2d6(3)
    expect(r.dice).toHaveLength(2)
    expect(r.total).toBe(2 + 5 + 3)
    expect(['miss', 'hit-7-9', 'hit-10+']).toContain(r.result)
    spy.mockRestore()
  })

  it('com modificador negativo grande resulta miss', () => {
    const spy = vi.spyOn(Math, 'random')
    spy.mockReturnValueOnce((6 - 1) / 6) // d1 = 6
    spy.mockReturnValueOnce((6 - 1) / 6) // d2 = 6
    const r = roll2d6(-7) // 6 + 6 - 7 = 5
    expect(r.total).toBe(5)
    expect(r.result).toBe('miss')
    spy.mockRestore()
  })
})