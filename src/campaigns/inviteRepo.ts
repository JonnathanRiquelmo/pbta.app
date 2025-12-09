import type { Campaign, CampaignPlayer, Invite, ValidateInviteResult } from './types'

export type GenerateInviteOptions = {
  expiresAt?: number
  usesLimit?: number
}

export interface CampaignRepo {
  createCampaign: (data: Omit<Campaign, 'id' | 'createdAt'>) => Campaign
  listCampaignsByOwner: (ownerId: string) => Campaign[]
  addPlayer: (campaignId: string, player: CampaignPlayer) => void
  listPlayers: (campaignId: string) => CampaignPlayer[]
  subscribe?: (ownerId: string, callback: (campaigns: Campaign[]) => void) => () => void
  subscribeByPlayer?: (userId: string, callback: (campaigns: Campaign[]) => void) => () => void
  remove?: (id: string) => { ok: true } | { ok: false; message: string }
  update?: (id: string, patch: { name?: string; plot?: string; masterNotes?: string }) => { ok: true } | { ok: false; message: string }
}

export interface InviteRepo {
  generateInvite: (campaignId: string, createdBy: string, options?: GenerateInviteOptions) => Invite
  validateInvite: (token: string) => Promise<ValidateInviteResult>
  acceptInvite: (token: string, player: CampaignPlayer) => Promise<{ success: boolean; campaignId?: string; error?: string }>
}

export type Repos = { campaigns: CampaignRepo; invites: InviteRepo }

export function createUUIDv4(): string {
  // RFC4122 version 4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >>> 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
