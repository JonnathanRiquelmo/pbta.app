import type { Attributes } from '@characters/types'

export type NpcSheet = {
  id: string
  campaignId: string
  createdBy: string
  type: 'npc'
  name: string
  background: string
  attributes: Attributes
  equipment?: string
  notes?: string
  moves: string[]
  createdAt: number
  updatedAt: number
}