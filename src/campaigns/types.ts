export type Campaign = {
  id: string
  name: string
  plot: string
  ownerId: string
  createdAt: number
  players?: CampaignPlayer[]
  playersUids?: string[]
}

export type CampaignPlayer = {
  userId: string
  displayName: string
  email: string
  status: 'accepted'
  joinedAt: number
}

export type InviteUsedBy = {
  userId: string
  joinedAt: number
}

export type Invite = {
  id: string
  token: string
  campaignId: string
  createdBy: string
  createdAt: number
  expiresAt?: number
  usesLimit?: number
  usedBy: InviteUsedBy[]
}

export type ValidateInviteResult =
  | { valid: true; invite: Invite; remainingUses: number }
  | { valid: false; reason: 'invalid' | 'expired' | 'limit_reached' }
