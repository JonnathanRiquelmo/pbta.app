import type { RollOutcome } from './types'

export type RollMode = 'normal' | 'advantage' | 'disadvantage'

export function computeOutcome(total: number): RollOutcome {
  if (total >= 10) return 'success'
  if (total >= 7) return 'partial'
  return 'fail'
}

export function pickUsedDice(mode: RollMode, dice: number[]): number[] {
  if (mode === 'normal') return dice.slice(0, 2)
  const sorted = [...dice].sort((a, b) => b - a)
  if (mode === 'advantage') return sorted.slice(0, 2)
  const asc = [...dice].sort((a, b) => a - b)
  return asc.slice(0, 2)
}

function randomD6(count: number): number[] {
  const arr = new Uint32Array(count)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(n => (n % 6) + 1)
}

export function performRoll(input: {
  mode: RollMode
  attributeModifier?: number
  moveModifier?: number
  extraModifier?: number
}): { dice: number[]; usedDice: number[]; baseSum: number; totalModifier: number; total: number; outcome: RollOutcome } {
  const count = input.mode === 'normal' ? 2 : 3
  const dice = randomD6(count)
  const usedDice = pickUsedDice(input.mode, dice)
  const baseSum = usedDice.reduce((acc, n) => acc + n, 0)
  const totalModifier = (input.attributeModifier || 0) + (input.moveModifier || 0) + (input.extraModifier || 0)
  const total = baseSum + totalModifier
  const outcome = computeOutcome(total)
  return { dice, usedDice, baseSum, totalModifier, total, outcome }
}