import type { Attributes, AttributeScore } from '@characters/types'

export type RollOutcome = 'success' | 'partial' | 'fail'

export type RollWho = {
  kind: 'player' | 'npc'
  sheetId: string
  name: string
}

export type Roll = {
  id: string
  sessionId: string
  campaignId: string
  dice: number[]
  usedDice: number[]
  baseSum: number
  attributeRef?: keyof Attributes | null
  attributeModifier?: AttributeScore
  moveRef?: string | null
  moveModifier?: AttributeScore
  totalModifier: number
  total: number
  outcome: RollOutcome
  who: RollWho
  isPDM?: boolean
  mode?: 'normal' | 'advantage' | 'disadvantage'
  createdAt: number
  createdBy: string
}

export type CreateRollInput = {
  who: RollWho
  campaignId: string
  isPDM?: boolean
  mode?: 'normal' | 'advantage' | 'disadvantage'
  attributeRef?: keyof Attributes | null
  attributeModifier?: AttributeScore
  moveRef?: string | null
  moveModifier?: AttributeScore
  dice: number[]
  usedDice: number[]
  baseSum: number
  totalModifier: number
  total: number
  outcome: RollOutcome
}
