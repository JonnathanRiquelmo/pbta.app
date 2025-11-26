import type { NpcSheet } from './types'

export type CreateNpcSheetInput = {
  name: string
  background: string
  attributes: NpcSheet['attributes']
  equipment?: string
  notes?: string
}

export type UpdateNpcSheetPatch = Partial<{
  name: string
  background: string
  attributes: NpcSheet['attributes']
  equipment?: string
  notes?: string
}>

export type NpcRepo = {
  listByCampaign: (campaignId: string) => NpcSheet[]
  createMany: (
    campaignId: string,
    createdBy: string,
    inputs: CreateNpcSheetInput[],
    moves: string[]
  ) => { ok: true; created: NpcSheet[] } | { ok: false; message: string }
  update: (
    campaignId: string,
    id: string,
    patch: UpdateNpcSheetPatch
  ) => { ok: true; sheet: NpcSheet } | { ok: false; message: string }
  delete: (
    campaignId: string,
    id: string
  ) => { ok: true } | { ok: false; message: string }
}