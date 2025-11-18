import { create } from 'zustand'
import type { User } from '@auth/types'
import type { Campaign, CampaignPlayer } from '@campaigns/types'
import { createLocalRepos } from '@campaigns/localInviteRepo'
import type { PlayerSheet } from '@characters/types'
import type { NpcSheet } from '@npc/types'
import type { CreatePlayerSheetInput, UpdatePlayerSheetPatch } from '@characters/characterRepo'
import type { CreateNpcSheetInput, UpdateNpcSheetPatch } from '@npc/npcRepo'
import { createLocalCharacterRepo } from '@characters/localCharacterRepo'
import { createLocalNpcRepo } from '@npc/localNpcRepo'
import { createLocalMoveRepo } from '@moves/localMoveRepo'
import type { Move } from '@moves/types'
import type { CreateMoveInput, UpdateMovePatch } from '@moves/moveRepo'
import { createLocalSessionRepo } from '@sessions/localSessionRepo'
import type { Session } from '@sessions/types'
import type { CreateSessionInput, UpdateSessionPatch } from '@sessions/types'

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
  getMyPlayerSheet: (campaignId: string) => PlayerSheet | undefined
  createMyPlayerSheet: (campaignId: string, data: CreatePlayerSheetInput) => { ok: true; sheet: PlayerSheet } | { ok: false; message: string }
  updateMyPlayerSheet: (campaignId: string, patch: UpdatePlayerSheetPatch) => { ok: true; sheet: PlayerSheet } | { ok: false; message: string }
  listCampaignMoves: (campaignId: string) => string[]
  listNpcSheets: (campaignId: string) => NpcSheet[]
  createNpcSheets: (
    campaignId: string,
    inputs: CreateNpcSheetInput[]
  ) => { ok: true; created: NpcSheet[] } | { ok: false; message: string }
  updateNpcSheet: (
    campaignId: string,
    id: string,
    patch: UpdateNpcSheetPatch
  ) => { ok: true; sheet: NpcSheet } | { ok: false; message: string }
  listMoves: (campaignId: string) => Move[]
  createMove: (campaignId: string, data: CreateMoveInput) => { ok: true; move: Move } | { ok: false; message: string }
  updateMove: (campaignId: string, id: string, patch: UpdateMovePatch) => { ok: true; move: Move } | { ok: false; message: string }
  deleteMove: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
  listSessions: (campaignId: string) => Session[]
  getSession: (id: string) => Session | undefined
  createSession: (campaignId: string, data: CreateSessionInput) => { ok: true; session: Session } | { ok: false; message: string }
  updateSession: (campaignId: string, id: string, patch: UpdateSessionPatch) => { ok: true; session: Session } | { ok: false; message: string }
  deleteSession: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
}

const repos = createLocalRepos()
const characterRepo = createLocalCharacterRepo()
const npcRepo = createLocalNpcRepo()
const moveRepo = createLocalMoveRepo()
const sessionRepo = createLocalSessionRepo()

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
  },
  getMyPlayerSheet: (campaignId: string) => {
    const user = get().user
    if (!user) return undefined
    return characterRepo.getByCampaignAndUser(campaignId, user.uid)
  },
  createMyPlayerSheet: (campaignId: string, data: CreatePlayerSheetInput) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (!data.name.trim() || !data.background.trim()) {
      return { ok: false, message: 'invalid_required_fields' }
    }
    const res = characterRepo.create(campaignId, user.uid, data)
    return res
  },
  updateMyPlayerSheet: (campaignId: string, patch: UpdatePlayerSheetPatch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    const res = characterRepo.update(campaignId, user.uid, patch)
    return res
  },
  listCampaignMoves: (campaignId: string) => {
    const moves = moveRepo.listByCampaign(campaignId)
    return moves.filter(m => m.active).map(m => m.name)
  },
  listNpcSheets: (campaignId: string) => {
    return npcRepo.listByCampaign(campaignId)
  },
  createNpcSheets: (campaignId: string, inputs: CreateNpcSheetInput[]) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    const moves = get().listCampaignMoves(campaignId)
    const allMoves = Array.isArray(moves) && moves.length > 0 ? moves : ['Movimento 1', 'Movimento 2', 'Movimento 3']
    const created = npcRepo.createMany(campaignId, user.uid, inputs, allMoves)
    return created
  },
  updateNpcSheet: (campaignId: string, id: string, patch: UpdateNpcSheetPatch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return npcRepo.update(campaignId, id, patch)
  },
  listMoves: (campaignId: string) => {
    const role = get().role
    if (role !== 'master') return []
    return moveRepo.listByCampaign(campaignId)
  },
  createMove: (campaignId: string, data: CreateMoveInput) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return moveRepo.create(campaignId, user.uid, data)
  },
  updateMove: (campaignId: string, id: string, patch: UpdateMovePatch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return moveRepo.update(campaignId, id, patch)
  },
  deleteMove: (campaignId: string, id: string) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return moveRepo.remove(campaignId, id)
  },
  listSessions: (campaignId: string) => {
    return sessionRepo.listByCampaign(campaignId)
  },
  getSession: (id: string) => {
    return sessionRepo.getById(id)
  },
  createSession: (campaignId: string, data: CreateSessionInput) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return sessionRepo.create(campaignId, user.uid, data)
  },
  updateSession: (campaignId: string, id: string, patch: UpdateSessionPatch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return sessionRepo.update(campaignId, id, patch)
  },
  deleteSession: (campaignId: string, id: string) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return sessionRepo.remove(campaignId, id)
  }
}))