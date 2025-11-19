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
import { createLocalRollRepo } from '@rolls/localRollRepo'
import { createFirestoreRollRepo } from '@rolls/firestoreRollRepo'
import { hasFirebaseConfig, getDb } from '@fb/client'
import type { Roll } from '@rolls/types'
import type { CreateRollInput } from '@rolls/types'
import { performRoll } from '@rolls/service'
import type { RollMode } from '@rolls/service'
import type { Attributes } from '@characters/types'

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
  listRolls: (sessionId: string) => Roll[]
  createRoll: (
    sessionId: string,
    data: {
      who: { kind: 'player' | 'npc'; sheetId: string; name: string }
      attributeRef?: keyof Attributes
      moveRef?: string
      mode: RollMode
    }
  ) => { ok: true; roll: Roll } | { ok: false; message: string }
  deleteRoll: (sessionId: string, rollId: string) => { ok: true } | { ok: false; message: string }
  subscribeRolls: (sessionId: string, cb: (items: Roll[]) => void) => () => void
}

type SubscribeRollsRepo = { subscribe: (sessionId: string, cb: (items: Roll[]) => void) => () => void }

const repos = createLocalRepos()
const characterRepo = createLocalCharacterRepo()
const npcRepo = createLocalNpcRepo()
const moveRepo = createLocalMoveRepo()
const sessionRepo = createLocalSessionRepo()
const rollRepo: RollRepo & Partial<SubscribeRollsRepo> = hasFirebaseConfig() && getDb() ? createFirestoreRollRepo() : createLocalRollRepo()

function loadPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem('pbta_user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAppStore = create<State & Actions>((set, get) => ({
  user: loadPersistedUser(),
  role: loadPersistedUser()?.role ?? null,
  currentCampaign: null,
  setUser: user => {
    try { localStorage.setItem('pbta_user', JSON.stringify(user)) } catch { void 0 }
    set({ user, role: user.role })
  },
  logout: () => {
    try { localStorage.removeItem('pbta_user') } catch { void 0 }
    set({ user: null, role: null, currentCampaign: null })
  },
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
    const invite = repos.invites.generateInvite(campaignId, user.uid, options)
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
  },
  listRolls: (sessionId: string) => {
    return rollRepo.listBySession(sessionId)
  },
  subscribeRolls: (sessionId: string, cb: (items: Roll[]) => void) => {
    if (hasFirebaseConfig() && 'subscribe' in rollRepo && typeof rollRepo.subscribe === 'function') {
      return rollRepo.subscribe(sessionId, cb)
    }
    function onStorage(ev: StorageEvent) {
      if (ev.key === 'pbta_session_rolls') cb(rollRepo.listBySession(sessionId))
    }
    window.addEventListener('storage', onStorage)
    cb(rollRepo.listBySession(sessionId))
    return () => window.removeEventListener('storage', onStorage)
  },
  createRoll: (sessionId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    const session = get().getSession(sessionId)
    if (!session) return { ok: false, message: 'invalid_session' }
    const campaignId = session.campaignId
    const role = get().role
    if (role !== 'master' && data.who.kind !== 'player') {
      return { ok: false, message: 'forbidden' }
    }
    let attributeModifier: number | undefined
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
    let moveModifier: number | undefined
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
      moveModifier = mv.modifier
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
      outcome: r.outcome
    }
    return rollRepo.create(sessionId, user.uid, payload)
  },
  deleteRoll: (sessionId, rollId) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return rollRepo.remove(sessionId, rollId)
  }
}))
