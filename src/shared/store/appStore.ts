// src/shared/store/appStore.ts - Zustand store for PBTA app
import { create } from 'zustand'
import type { User } from '@auth/types'
import type { Campaign, CampaignPlayer } from '@campaigns/types'
import { createFirestoreRepos } from '@campaigns/firestoreCampaignRepo'
import type { CampaignRepo } from '@campaigns/inviteRepo'
import type { PlayerSheet } from '@characters/types'
import type { NpcSheet } from '@npc/types'
import type { CreatePlayerSheetInput, UpdatePlayerSheetPatch } from '@characters/characterRepo'
import type { CreateNpcSheetInput, UpdateNpcSheetPatch } from '@npc/npcRepo'
import { createFirestoreCharacterRepo } from '@characters/firestoreCharacterRepo'
import { createFirestoreNpcRepo } from '@npc/firestoreNpcRepo'
import { createFirestoreMoveRepo } from '@moves/firestoreMoveRepo'
import type { Move } from '@moves/types'
import type { CreateMoveInput, UpdateMovePatch } from '@moves/moveRepo'
import { createFirestoreSessionRepo } from '@sessions/firestoreSessionRepo'
import type { Session } from '@sessions/types'
import type { CreateSessionInput, UpdateSessionPatch } from '@sessions/types'
import { createFirestoreRollRepo } from '@rolls/firestoreRollRepo'
import { hasFirebaseConfig, getDb } from '@fb/client'
import type { Roll } from '@rolls/types'
import type { CreateRollInput } from '@rolls/types'
import { performRoll } from '@rolls/service'
import type { RollRepo } from '@rolls/rollRepo'
import type { RollMode } from '@rolls/service'
import type { Attributes, AttributeScore } from '@characters/types'

// State definition
type State = {
  user: User | null
  role: User['role'] | null
  currentCampaign: string | null
  campaigns: Campaign[]
  acceptedCampaigns: Campaign[]
  unsubscribers: Array<() => void>
}

// Actions definition
type Actions = {
  setUser: (user: User) => void
  logout: () => void
  setCurrentCampaign: (id: string | null) => void
  createCampaign: (data: { name: string; plot: string }) => Campaign
  listMyCampaigns: () => Campaign[]
  listAcceptedCampaigns: () => Campaign[]
  listPlayers: (campaignId: string) => CampaignPlayer[]
  generateInvite: (campaignId: string, options?: { expiresAt?: number; usesLimit?: number }) => { token: string; link: string }
  validateInvite: (token: string) => Promise<{ ok: boolean; reason?: 'invalid' | 'expired' | 'limit_reached'; campaignId?: string; remainingUses?: number }>
  acceptInvite: (token: string) => Promise<{ ok: boolean; error?: string; campaignId?: string }>
  updateCampaignNotes: (id: string, notes: string) => { ok: true } | { ok: false; message: string }
  deleteCampaign: (id: string) => { ok: true } | { ok: false; message: string }
  getMyPlayerSheet: (campaignId: string) => PlayerSheet | undefined
  createMyPlayerSheet: (campaignId: string, data: CreatePlayerSheetInput) => { ok: true; sheet: PlayerSheet } | { ok: false; message: string }
  updateMyPlayerSheet: (campaignId: string, patch: UpdatePlayerSheetPatch) => { ok: true; sheet: PlayerSheet } | { ok: false; message: string }
  listCampaignMoves: (campaignId: string) => string[]
  listNpcSheets: (campaignId: string) => NpcSheet[]
  createNpcSheets: (campaignId: string, inputs: CreateNpcSheetInput[]) => { ok: true; created: NpcSheet[] } | { ok: false; message: string }
  updateNpcSheet: (campaignId: string, id: string, patch: UpdateNpcSheetPatch) => { ok: true; sheet: NpcSheet } | { ok: false; message: string }
  listMoves: (campaignId: string) => Move[]
  createMove: (campaignId: string, data: CreateMoveInput) => { ok: true; move: Move } | { ok: false; message: string }
  updateMove: (campaignId: string, id: string, patch: UpdateMovePatch) => { ok: true; move: Move } | { ok: false; message: string }
  deleteMove: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
  listSessions: (campaignId: string) => Session[]
  getSession: (id: string) => Session | undefined
  createSession: (campaignId: string, data: CreateSessionInput) => { ok: true; session: Session } | { ok: false; message: string }
  updateSession: (campaignId: string, id: string, patch: UpdateSessionPatch) => { ok: true; session: Session } | { ok: false; message: string }
  deleteSession: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
  listRolls: (sessionId: string) => Roll[]
  createRoll: (sessionId: string, data: { who: { kind: 'player' | 'npc'; sheetId: string; name: string }; attributeRef?: keyof Attributes; moveRef?: string; mode: RollMode }) => { ok: true; roll: Roll } | { ok: false; message: string }
  deleteRoll: (sessionId: string, rollId: string) => { ok: true } | { ok: false; message: string }
  subscribeRolls: (sessionId: string, cb: (items: Roll[]) => void) => () => void
  subscribeSessions: (campaignId: string, cb: (sessions: Session[]) => void) => () => void
  initSubscriptions: (userId: string) => void
  cleanupSubscriptions: () => void
}

// Helper type for Firestore roll subscription
type SubscribeRollsRepo = { subscribe: (sessionId: string, cb: (items: Roll[]) => void) => () => void }

// Repository initialization (local or Firestore based)
const repos = createFirestoreRepos(getDb())
const characterRepo = createFirestoreCharacterRepo(getDb())
const npcRepo = createFirestoreNpcRepo(getDb())
const moveRepo = createFirestoreMoveRepo(getDb())
const sessionRepo = createFirestoreSessionRepo(getDb())
const rollRepo: RollRepo & Partial<SubscribeRollsRepo> = createFirestoreRollRepo()

function loadPersistedUser(): User | null { return null }

export const useAppStore = create<State & Actions>((set, get) => ({
  user: loadPersistedUser(),
  role: loadPersistedUser()?.role ?? null,
  currentCampaign: null,
  campaigns: [],
  acceptedCampaigns: [],
  unsubscribers: [],
  setUser: user => { set({ user, role: user.role }) },
  logout: () => { set({ user: null, role: null, currentCampaign: null }) },
  setCurrentCampaign: id => set({ currentCampaign: id }),
  createCampaign: ({ name, plot }) => {
    const user = get().user
    if (!user) throw new Error('not_authenticated')
    return repos.campaigns.createCampaign({ name, plot, ownerId: user.uid })
  },
  listMyCampaigns: () => {
    const user = get().user
    if (!user) return []
    return get().campaigns
  },
  listAcceptedCampaigns: () => {
    return get().acceptedCampaigns
  },
  listPlayers: campaignId => repos.campaigns.listPlayers(campaignId),
  updateCampaignNotes: (id, notes) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return repos.campaigns.update?.(id, { masterNotes: notes }) ?? { ok: false, message: 'not_supported' }
  },
  deleteCampaign: id => {
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return repos.campaigns.remove?.(id) ?? { ok: false, message: 'not_supported' }
  },
  generateInvite: (campaignId, options) => {
    const user = get().user
    if (!user) throw new Error('not_authenticated')
    const invite = repos.invites.generateInvite(campaignId, user.uid, options)
    const link = `/?invite=${invite.token}`
    return { token: invite.token, link }
  },
  validateInvite: async token => {
    const res = await repos.invites.validateInvite(token)
    if (!res.valid) return { ok: false, reason: res.reason as 'invalid' | 'expired' | 'limit_reached' }
    return { ok: true, campaignId: res.invite.campaignId, remainingUses: res.remainingUses }
  },
  acceptInvite: async token => {
    const user = get().user
    if (!user) return { ok: false, error: 'not_authenticated' }
    const player: CampaignPlayer = { userId: user.uid, displayName: user.displayName, email: user.email, status: 'accepted', joinedAt: Date.now() }
    const res = await repos.invites.acceptInvite(token, player)
    if (!res.success) return { ok: false, error: res.error }
    return { ok: true, campaignId: res.campaignId }
  },
  getMyPlayerSheet: campaignId => {
    const user = get().user
    if (!user) return undefined
    return characterRepo.getByCampaignAndUser(campaignId, user.uid)
  },
  createMyPlayerSheet: (campaignId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (!data.name.trim() || !data.background.trim()) return { ok: false, message: 'invalid_required_fields' }
    return characterRepo.create(campaignId, user.uid, data)
  },
  updateMyPlayerSheet: (campaignId, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    return characterRepo.update(campaignId, user.uid, patch)
  },
  listCampaignMoves: campaignId => moveRepo.listByCampaign(campaignId).filter(m => m.active).map(m => m.name),
  listNpcSheets: campaignId => npcRepo.listByCampaign(campaignId),
  createNpcSheets: (campaignId, inputs) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    const moves = get().listCampaignMoves(campaignId)
    const allMoves = moves.length ? moves : ['Movimento 1', 'Movimento 2', 'Movimento 3']
    return npcRepo.createMany(campaignId, user.uid, inputs, allMoves)
  },
  updateNpcSheet: (campaignId, id, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return npcRepo.update(campaignId, id, patch)
  },
  listMoves: campaignId => {
    if (get().role !== 'master') return []
    return moveRepo.listByCampaign(campaignId)
  },
  createMove: (campaignId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return moveRepo.create(campaignId, user.uid, data)
  },
  updateMove: (campaignId, id, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return moveRepo.update(campaignId, id, patch)
  },
  deleteMove: (campaignId, id) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return moveRepo.remove(campaignId, id)
  },
  listSessions: campaignId => sessionRepo.listByCampaign(campaignId),
  getSession: id => sessionRepo.getById(id),
  createSession: (campaignId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return sessionRepo.create(campaignId, user.uid, data)
  },
  updateSession: (campaignId, id, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return sessionRepo.update(campaignId, id, patch)
  },
  deleteSession: (campaignId, id) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return sessionRepo.remove(campaignId, id)
  },
  listRolls: sessionId => rollRepo.listBySession(sessionId),
  subscribeRolls: (sessionId, cb) => rollRepo.subscribe!(sessionId, cb),
  subscribeSessions: (campaignId, cb) => {
    if (hasFirebaseConfig() && sessionRepo.subscribe) {
      return sessionRepo.subscribe(campaignId, cb)
    }
    cb(sessionRepo.listByCampaign(campaignId))
    return () => { }
  },
  createRoll: (sessionId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    const session = get().getSession(sessionId)
    if (!session) return { ok: false, message: 'invalid_session' }
    const campaignId = session.campaignId
    const role = get().role
    if (role !== 'master' && data.who.kind !== 'player') return { ok: false, message: 'forbidden' }
    let attributeModifier: AttributeScore | undefined
    if (data.attributeRef) {
      let sheetAttrs: Attributes | null = null
      if (data.who.kind === 'player') {
        const my = get().getMyPlayerSheet(campaignId)
        if (!my || my.id !== data.who.sheetId) return { ok: false, message: 'invalid_sheet' }
        sheetAttrs = my.attributes
      } else {
        const npcs = get().listNpcSheets(campaignId)
        const npc = npcs.find(n => n.id === data.who.sheetId)
        if (!npc) return { ok: false, message: 'invalid_sheet' }
        sheetAttrs = npc.attributes
      }
      const value = sheetAttrs![data.attributeRef]
      if (typeof value !== 'number') return { ok: false, message: 'invalid_attribute' }
      attributeModifier = value
    }
    let moveModifier: AttributeScore | undefined
    if (data.moveRef) {
      let movesOnSheet: string[] = []
      if (data.who.kind === 'player') {
        const my = get().getMyPlayerSheet(campaignId)
        if (!my || my.id !== data.who.sheetId) return { ok: false, message: 'invalid_sheet' }
        movesOnSheet = my.moves || []
      } else {
        const npcs = get().listNpcSheets(campaignId)
        const npc = npcs.find(n => n.id === data.who.sheetId)
        if (!npc) return { ok: false, message: 'invalid_sheet' }
        movesOnSheet = npc.moves || []
      }
      if (!movesOnSheet.includes(data.moveRef)) return { ok: false, message: 'move_not_in_sheet' }
      const campaignMoves = moveRepo.listByCampaign(campaignId)
      const mv = campaignMoves.find(m => m.name === data.moveRef)
      if (!mv || !mv.active) return { ok: false, message: 'move_not_active' }
      moveModifier = mv.modifier as AttributeScore
    }
    const r = performRoll({ mode: data.mode, attributeModifier, moveModifier })
    const payload: CreateRollInput = {
      who: data.who,
      campaignId,
      isPDM: get().role === 'master',
      attributeRef: data.attributeRef,
      attributeModifier,
      moveRef: data.moveRef,
      moveModifier,
      dice: r.dice,
      usedDice: r.usedDice,
      baseSum: r.baseSum,
      totalModifier: r.totalModifier,
      total: r.total,
      outcome: r.outcome,
    }
    return rollRepo.create(sessionId, user.uid, payload)
  },
  deleteRoll: (sessionId, rollId) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return rollRepo.remove(sessionId, rollId)
  },
  initSubscriptions: userId => {
    const campaignRepo: CampaignRepo = repos.campaigns as CampaignRepo
    const unsubs: Array<() => void> = []
    const unsubOwner = campaignRepo.subscribe?.(userId, (items: Campaign[]) => set({ campaigns: items }))
    if (unsubOwner) unsubs.push(unsubOwner)
    const unsubPlayer = campaignRepo.subscribeByPlayer?.(userId, (items: Campaign[]) => set({ acceptedCampaigns: items }))
    if (unsubPlayer) unsubs.push(unsubPlayer)
    set({ unsubscribers: unsubs })
  },
  cleanupSubscriptions: () => {
    const unsubs = get().unsubscribers
    unsubs?.forEach(fn => fn?.())
    set({ unsubscribers: [] })
  },
}))
