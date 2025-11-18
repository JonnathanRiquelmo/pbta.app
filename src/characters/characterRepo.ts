import type { PlayerSheet } from './types'

export type CreatePlayerSheetInput = {
  name: string
  background: string
  attributes: PlayerSheet['attributes']
  equipment: string
  notes: string
  moves: string[]
}

export type UpdatePlayerSheetPatch = Partial<CreatePlayerSheetInput>

export type ValidateResult = { ok: true } | { ok: false; message: string }

export type CharacterRepo = {
  getByCampaignAndUser: (campaignId: string, userId: string) => PlayerSheet | undefined
  create: (campaignId: string, userId: string, data: CreatePlayerSheetInput) => { ok: true; sheet: PlayerSheet } | { ok: false; message: string }
  update: (campaignId: string, userId: string, patch: UpdatePlayerSheetPatch) => { ok: true; sheet: PlayerSheet } | { ok: false; message: string }
  validateServerSide: (sheet: PlayerSheet) => Promise<ValidateResult>
}