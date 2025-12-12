import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pickUsedDice, computeOutcome, performRoll } from '../service'

describe('pickUsedDice', () => {
  it('advantage picks top two', () => {
    const res = pickUsedDice('advantage', [1, 5, 3])
    expect(res).toEqual([5, 3])
  })
  it('disadvantage picks bottom two', () => {
    const res = pickUsedDice('disadvantage', [1, 5, 3])
    expect(res).toEqual([1, 3])
  })
  it('normal picks first two', () => {
    const res = pickUsedDice('normal', [6, 2])
    expect(res).toEqual([6, 2])
  })
})

describe('computeOutcome', () => {
  it('returns success for >=10', () => {
    expect(computeOutcome(10)).toBe('success')
  })
  it('returns partial for 7..9', () => {
    expect(computeOutcome(7)).toBe('partial')
    expect(computeOutcome(9)).toBe('partial')
  })
  it('returns fail for <7', () => {
    expect(computeOutcome(6)).toBe('fail')
  })
})

describe('performRoll', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        ...crypto,
        getRandomValues: (arr: Uint32Array) => {
          const data = [5, 3, 1]
          for (let i = 0; i < arr.length; i++) arr[i] = data[i] ?? 5
          return arr
        }
      },
      writable: true
    })
  })
  it('computes with advantage', () => {
    const r = performRoll({ mode: 'advantage', attributeModifier: 1, moveModifier: 0 })
    expect(r.dice.length).toBe(3)
    const top = [...r.dice].sort((a, b) => b - a).slice(0, 2)
    expect(r.usedDice).toEqual(top)
    expect(r.total).toBe(r.baseSum + r.totalModifier)
  })
  it('computes with normal', () => {
    const r = performRoll({ mode: 'normal', attributeModifier: 0, moveModifier: 2 })
    expect(r.dice.length).toBe(2)
    expect(r.usedDice.length).toBe(2)
    expect(r.total).toBe(r.baseSum + r.totalModifier)
  })

  it('uses forcedDice when provided', () => {
    const forced = [1, 2]
    const r = performRoll({ mode: 'normal', forcedDice: forced })
    expect(r.dice).toEqual(forced)
    expect(r.baseSum).toBe(3)
  })

  it('uses forcedDice with advantage', () => {
    const forced = [1, 5, 2]
    const r = performRoll({ mode: 'advantage', forcedDice: forced })
    expect(r.dice).toEqual(forced)
    // Advantage picks top 2: 5, 2 -> sum 7
    expect(r.usedDice).toEqual([5, 2])
    expect(r.baseSum).toBe(7)
  })
})
