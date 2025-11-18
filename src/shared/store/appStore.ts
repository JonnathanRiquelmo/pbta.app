import { create } from 'zustand'
import type { User } from '@auth/types'
import type { Campaign, CampaignPlayer } from '@campaigns/types'
import { createLocalRepos } from '@campaigns/localInviteRepo'

type State = {
  user: User | null
  role: User['role'] | null
  currentCampaign: string | null
}

type Actions = {
  setUser: (user: User) => void
  logout: () => void
  setCurrentCampaign: (id: string | null) => void
  createCampaign: (data: { name: string; plot: string }) => Campaign
  listMyCampaigns: () => Campaign[]
  listPlayers: (campaignId: string) => CampaignPlayer[]
  generateInvite: (campaignId: string, options?: { expiresAt?: number; usesLimit?: number }) => { token: string; link: string }
  validateInvite: (token: string) => { ok: boolean; reason?: 'invalid' | 'expired' | 'limit_reached'; campaignId?: string; remainingUses?: number }
  acceptInvite: (token: string) => { ok: boolean; error?: string; campaignId?: string }
}

const repos = createLocalRepos()

export const useAppStore = create<State & Actions>((set, get) => ({
  user: null,
  role: null,
  currentCampaign: null,
  setUser: user => set({ user, role: user.role }),
  logout: () => set({ user: null, role: null, currentCampaign: null }),
  setCurrentCampaign: id => set({ currentCampaign: id }),
  createCampaign: ({ name, plot }) => {
    const user = get().user
    if (!user) throw new Error('not_authenticated')
    const campaign = repos.campaigns.createCampaign({ name, plot, ownerId: user.uid })
    return campaign
  },
  listMyCampaigns: () => {
    const user = get().user
    if (!user) return []
    return repos.campaigns.listCampaignsByOwner(user.uid)
  },
  listPlayers: (campaignId: string) => {
    return repos.campaigns.listPlayers(campaignId)
  },
  generateInvite: (campaignId, options) => {
    const user = get().user
    if (!user) throw new Error('not_authenticated')
    const invite = repos.invites.generateInvite(campaignId, user.id, options)
    const link = `/?invite=${invite.token}`
    return { token: invite.token, link }
  },
  validateInvite: (token: string) => {
    const res = repos.invites.validateInvite(token)
    if (!res.valid) {
      return { ok: false, reason: res.reason }
    }
    return { ok: true, campaignId: res.invite.campaignId, remainingUses: res.remainingUses }
  },
  acceptInvite: (token: string) => {
    const user = get().user
    if (!user) return { ok: false, error: 'not_authenticated' }
    const player: CampaignPlayer = {
      userId: user.uid,
      displayName: user.displayName,
      status: 'accepted',
      joinedAt: Date.now()
    }
    const res = repos.invites.acceptInvite(token, player)
    if (!res.success) {
      return { ok: false, error: res.error }
    }
    return { ok: true, campaignId: res.campaignId }
  }
}))