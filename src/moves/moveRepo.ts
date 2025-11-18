import type { Move } from './types'

export type CreateMoveInput = {
  name: string
  description: string
  modifier: -1 | 0 | 1 | 2 | 3
  active?: boolean
}

export type UpdateMovePatch = Partial<{
  name: string
  description: string
  modifier: -1 | 0 | 1 | 2 | 3
  active: boolean
}>

export type MoveRepo = {
  listByCampaign: (campaignId: string) => Move[]
  create: (campaignId: string, createdBy: string, data: CreateMoveInput) => { ok: true; move: Move } | { ok: false; message: string }
  update: (campaignId: string, id: string, patch: UpdateMovePatch) => { ok: true; move: Move } | { ok: false; message: string }
  remove: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
}