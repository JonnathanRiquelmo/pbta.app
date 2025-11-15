export type PbtaRollResult = 'miss' | 'hit-7-9' | 'hit-10+'

export function roll2d6(mod: number = 0): {
  dice: [number, number]
  total: number
  result: PbtaRollResult
} {
  const d1 = Math.floor(Math.random() * 6) + 1
  const d2 = Math.floor(Math.random() * 6) + 1
  const total = d1 + d2 + (mod || 0)
  const result: PbtaRollResult = total >= 10 ? 'hit-10+' : total >= 7 ? 'hit-7-9' : 'miss'
  return { dice: [d1, d2], total, result }
}