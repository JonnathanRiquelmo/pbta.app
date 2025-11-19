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
  attributeRef?: keyof Attributes
  attributeModifier?: AttributeScore
  moveRef?: string
  moveModifier?: AttributeScore
  totalModifier: number
  total: number
  outcome: RollOutcome
  who: RollWho
  isPDM?: boolean
  createdAt: number
  createdBy: string
}

export type CreateRollInput = {
  who: RollWho
  campaignId: string
  isPDM?: boolean
  attributeRef?: keyof Attributes
  attributeModifier?: AttributeScore
  moveRef?: string
  moveModifier?: AttributeScore
  dice: number[]
  usedDice: number[]
  baseSum: number
  totalModifier: number
  total: number
  outcome: RollOutcome
}
