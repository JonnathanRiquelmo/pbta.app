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
})