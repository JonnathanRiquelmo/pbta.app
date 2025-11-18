import type { Campaign, CampaignPlayer, Invite } from './types'
import type { CampaignRepo, InviteRepo, GenerateInviteOptions } from './inviteRepo'
import { createUUIDv4 } from './inviteRepo'

const STORAGE_KEY = 'pbta_campaigns'

type PersistCampaign = Campaign & {
  invites: Record<string, Invite>
  players: CampaignPlayer[]
}

type PersistRoot = Record<string, PersistCampaign>

function load(): PersistRoot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistRoot) : {}
  } catch {
    return {}
  }
}

function save(root: PersistRoot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(root))
}

function upsertCampaign(root: PersistRoot, data: Campaign): PersistCampaign {
  const existing = root[data.id]
  if (existing) {
    root[data.id] = { ...existing, ...data }
    return root[data.id]
  }
  const created: PersistCampaign = { ...data, invites: {}, players: [] }
  root[data.id] = created
  return created
}

export function createLocalRepos(): { campaigns: CampaignRepo; invites: InviteRepo } {
  const campaigns: CampaignRepo = {
    createCampaign: (data) => {
      const id = `c-${Date.now()}`
      const now = Date.now()
      const campaign: Campaign = { id, name: data.name, plot: data.plot, ownerId: data.ownerId, createdAt: now }
      const root = load()
      upsertCampaign(root, campaign)
      save(root)
      return campaign
    },
    listCampaignsByOwner: (ownerId) => {
      const root = load()
      return Object.values(root).filter(c => c.ownerId === ownerId)
    },
    addPlayer: (campaignId, player) => {
      const root = load()
      const pc = root[campaignId]
      if (!pc) return
      // evitar duplicata
      if (!pc.players.find(p => p.userId === player.userId)) {
        pc.players.push(player)
        save(root)
      }
    },
    listPlayers: (campaignId) => {
      const root = load()
      const pc = root[campaignId]
      return pc ? pc.players : []
    }
  }

  const invites: InviteRepo = {
    generateInvite: (campaignId, createdBy, options?: GenerateInviteOptions) => {
      const root = load()
      const pc = root[campaignId]
      if (!pc) throw new Error('Campaign not found')
      const id = `i-${Date.now()}`
      const token = createUUIDv4()
      const invite: Invite = {
        id,
        token,
        campaignId,
        createdBy,
        createdAt: Date.now(),
        expiresAt: options?.expiresAt,
        usesLimit: options?.usesLimit,
        usedBy: []
      }
      pc.invites[id] = invite
      save(root)
      return invite
    },
    validateInvite: (token) => {
      const root = load()
      for (const pc of Object.values(root)) {
        for (const invite of Object.values(pc.invites)) {
          if (invite.token === token) {
            if (invite.expiresAt && Date.now() > invite.expiresAt) {
              return { valid: false, reason: 'expired' }
            }
            if (invite.usesLimit && invite.usedBy.length >= invite.usesLimit) {
              return { valid: false, reason: 'limit_reached' }
            }
            const remainingUses = invite.usesLimit ? Math.max(invite.usesLimit - invite.usedBy.length, 0) : Infinity
            return { valid: true, invite, remainingUses }
          }
        }
      }
      return { valid: false, reason: 'invalid' }
    },
    acceptInvite: (token, player) => {
      const root = load()
      for (const pc of Object.values(root)) {
        for (const invite of Object.values(pc.invites)) {
          if (invite.token === token) {
            if (invite.expiresAt && Date.now() > invite.expiresAt) {
              return { success: false, error: 'expired' }
            }
            if (invite.usesLimit && invite.usedBy.length >= invite.usesLimit) {
              return { success: false, error: 'limit_reached' }
            }
            // evitar duplicata
            const alreadyPlayer = pc.players.find(p => p.userId === player.userId)
            if (!alreadyPlayer) {
              pc.players.push(player)
            }
            // marcar uso
            if (!invite.usedBy.find(u => u.userId === player.userId)) {
              invite.usedBy.push({ userId: player.userId, joinedAt: player.joinedAt })
            }
            save(root)
            return { success: true, campaignId: pc.id }
          }
        }
      }
      return { success: false, error: 'invalid' }
    }
  }

  return { campaigns, invites }
}