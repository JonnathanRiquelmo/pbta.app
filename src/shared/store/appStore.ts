// src/shared/store/appStore.ts - Zustand store for PBTA app
import { create } from 'zustand'
import type { User } from '@auth/types'
import type { Campaign, CampaignPlayer } from '@campaigns/types'
import { createFirestoreRepos } from '@campaigns/firestoreCampaignRepo'
import type { CampaignRepo, Repos } from '@campaigns/inviteRepo'
import type { PlayerSheet } from '@characters/types'
import type { NpcSheet } from '@npc/types'
import type { CreatePlayerSheetInput, UpdatePlayerSheetPatch, ValidateResult } from '@characters/characterRepo'
import type { NpcRepo, CreateNpcSheetInput, UpdateNpcSheetPatch } from '@npc/npcRepo'
import { createFirestoreCharacterRepo } from '@characters/firestoreCharacterRepo'
import { createFirestoreNpcRepo } from '@npc/firestoreNpcRepo'
import { createFirestoreMoveRepo } from '@moves/firestoreMoveRepo'
import type { Move } from '@moves/types'
import type { MoveRepo, CreateMoveInput, UpdateMovePatch } from '@moves/moveRepo'
import { createFirestoreSessionRepo } from '@sessions/firestoreSessionRepo'
import type { SessionRepo } from '@sessions/sessionRepo'
import type { Session, CreateSessionInput, UpdateSessionPatch } from '@sessions/types'
import { createFirestoreRollRepo } from '@rolls/firestoreRollRepo'
import { hasFirebaseConfig, getDb } from '@fb/client'
import type { Roll, CreateRollInput } from '@rolls/types'
import { performRoll, computeOutcome } from '@rolls/service'
import { collection, query, where, getDocs } from 'firebase/firestore'
import type { RollRepo } from '@rolls/rollRepo'
import type { RollMode } from '@rolls/service'
import type { Attributes, AttributeScore } from '@characters/types'

// Helper function to compare arrays
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, index) => val === sortedB[index])
}

// State definition
type State = {
  user: User | null
  role: User['role'] | null
  currentCampaign: string | null
  campaigns: Campaign[]
  acceptedCampaigns: Campaign[]
  campaignsLoading: boolean
  acceptedCampaignsLoading: boolean
  unsubscribers: Array<() => void>
  movesCache: Map<string, Move[]>
  movesSubscription: (() => void) | null
  movesSubscriptionCampaignId: string | null
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
  createMyPlayerSheet: (campaignId: string, data: CreatePlayerSheetInput) => Promise<{ ok: true; sheet: PlayerSheet } | { ok: false; message: string }>
  updateMyPlayerSheet: (campaignId: string, patch: UpdatePlayerSheetPatch) => Promise<{ ok: true; sheet: PlayerSheet } | { ok: false; message: string }>
  listCampaignMoves: (campaignId: string) => string[]
  listNpcSheets: (campaignId: string) => NpcSheet[]
  getNpcSheet: (campaignId: string, id: string) => Promise<NpcSheet | null>
  createNpcSheets: (campaignId: string, inputs: CreateNpcSheetInput[]) => { ok: true; created: NpcSheet[] } | { ok: false; message: string }
  updateNpcSheet: (campaignId: string, id: string, patch: UpdateNpcSheetPatch) => { ok: true; sheet: NpcSheet } | { ok: false; message: string }
  deleteNpcSheet: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
  listMoves: (campaignId: string) => Move[]
  createMove: (campaignId: string, data: CreateMoveInput) => Promise<{ ok: true; move: Move } | { ok: false; message: string }>
  updateMove: (campaignId: string, id: string, patch: UpdateMovePatch) => Promise<{ ok: true; move: Move } | { ok: false; message: string }>
  deleteMove: (campaignId: string, id: string) => Promise<{ ok: true } | { ok: false; message: string }>
  subscribeMoves: (campaignId: string, cb: (moves: Move[]) => void) => () => void
  listSessions: (campaignId: string) => Session[]
  getSession: (id: string) => Session | undefined
  createSession: (campaignId: string, data: CreateSessionInput) => { ok: true; session: Session } | { ok: false; message: string }
  updateSession: (campaignId: string, id: string, patch: UpdateSessionPatch) => { ok: true; session: Session } | { ok: false; message: string }
  deleteSession: (campaignId: string, id: string) => { ok: true } | { ok: false; message: string }
  listRolls: (sessionId: string) => Promise<Roll[]>
  createRoll: (sessionId: string, data: { who: { kind: 'player' | 'npc'; sheetId: string; name: string }; attributeRef?: keyof Attributes; moveRef?: string; mode: RollMode; extraModifier?: number; isPDM?: boolean }) => Promise<{ ok: true; roll: Roll } | { ok: false; message: string }>
  deleteRoll: (sessionId: string, rollId: string) => Promise<{ ok: true } | { ok: false; message: string }>
  subscribeRolls: (sessionId: string, campaignId: string, cb: (items: Roll[]) => void) => () => void
  subscribeSessions: (campaignId: string, cb: (sessions: Session[]) => void) => () => void
  subscribeNpcs: (campaignId: string, cb: (sheets: NpcSheet[]) => void) => () => void
  initSubscriptions: (userId: string) => void
  initMovesSubscription: (campaignId: string) => void
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
const rollRepo = createFirestoreRollRepo()

function loadPersistedUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('pbta_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const useAppStore = create<State & Actions>((set, get) => ({
  user: loadPersistedUser(),
  role: loadPersistedUser()?.role ?? null,
  currentCampaign: null,
  campaigns: [],
  acceptedCampaigns: [],
  campaignsLoading: false,
  acceptedCampaignsLoading: false,
  unsubscribers: [],
  movesCache: new Map(),
  movesSubscription: null,
  movesSubscriptionCampaignId: null,
  setUser: user => {
    localStorage.setItem('pbta_user', JSON.stringify(user))
    set({ user, role: user.role })
  },
  logout: () => {
    localStorage.removeItem('pbta_user')
    set({ user: null, role: null, currentCampaign: null, campaigns: [], acceptedCampaigns: [], movesSubscription: null, movesSubscriptionCampaignId: null })
  },
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
    const link = `/invite?invite=${invite.token}`
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
  createMyPlayerSheet: async (campaignId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (!data.name.trim() || !data.background.trim()) return { ok: false, message: 'invalid_required_fields' }
    
    // Validação server-side dos movimentos
    const sheetData = {
      id: '', // ID será gerado pelo repo
      campaignId,
      userId: user.uid,
      name: data.name,
      background: data.background,
      attributes: data.attributes,
      equipment: data.equipment,
      notes: data.notes,
      moves: data.moves,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    const validation = await characterRepo.validateServerSide(sheetData)
    if (!validation.ok) {
      return { ok: false, message: validation.message }
    }
    
    return await characterRepo.create(campaignId, user.uid, data)
  },
  updateMyPlayerSheet: async (campaignId, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    
    // Obter ficha existente
    const existingSheet = characterRepo.getByCampaignAndUser(campaignId, user.uid)
    if (!existingSheet) return { ok: false, message: 'sheet_not_found' }
    
    // Aplicar mudanças à ficha existente para validação
    const updatedSheet = {
      ...existingSheet,
      ...patch,
      // Se moves foi atualizado, usar o novo valor, senão manter o existente
      moves: patch.moves !== undefined ? patch.moves : existingSheet.moves,
      updatedAt: Date.now()
    }
    
    // Validação server-side
    const validation = await characterRepo.validateServerSide(updatedSheet)
    if (!validation.ok) {
      return { ok: false, message: validation.message }
    }
    
    return await characterRepo.update(campaignId, user.uid, patch)
  },
  listCampaignMoves: campaignId => {
    const movesCache = get().movesCache
    let moves: Move[]
    
    if (movesCache && movesCache.has(campaignId)) {
      moves = movesCache.get(campaignId)!
    } else {
      moves = moveRepo.listByCampaign(campaignId)
    }
    
    return moves.filter(m => m.active).map(m => m.name)
  },
  listNpcSheets: campaignId => npcRepo.listByCampaign(campaignId),
  getNpcSheet: (campaignId, id) => npcRepo.getById(campaignId, id),
  createNpcSheets: (campaignId, inputs) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    const moves = get().listCampaignMoves(campaignId)
    return npcRepo.createMany(campaignId, user.uid, inputs, moves)
  },
  updateNpcSheet: (campaignId, id, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return npcRepo.update(campaignId, id, patch)
  },
  deleteNpcSheet: (campaignId, id) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return npcRepo.delete(campaignId, id)
  },
  listMoves: campaignId => {
    if (get().role !== 'master') return []
    const movesCache = get().movesCache
    if (movesCache && movesCache.has(campaignId)) {
      return movesCache.get(campaignId)!
    }
    return moveRepo.listByCampaign(campaignId)
  },
  createMove: async (campaignId, data) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return await moveRepo.create(campaignId, user.uid, data)
  },
  updateMove: async (campaignId, id, patch) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return await moveRepo.update(campaignId, id, patch)
  },
  deleteMove: async (campaignId, id) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return await moveRepo.remove(campaignId, id)
  },
  subscribeMoves: (campaignId, cb) => {
    if (hasFirebaseConfig() && moveRepo.subscribe) {
      return moveRepo.subscribe(campaignId, cb)
    }
    cb(moveRepo.listByCampaign(campaignId))
    return () => { }
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
    return sessionRepo.remove(campaignId, id, user.uid)
  },
  listRolls: async sessionId => {
    const rolls = await rollRepo.listBySession(sessionId)
    return rolls
  },
  subscribeRolls: (sessionId, campaignId, cb) => {
    if (hasFirebaseConfig() && rollRepo.subscribe) {
      return rollRepo.subscribe(sessionId, campaignId, cb)
    }
    // Fallback
    rollRepo.listBySession(sessionId).then(cb)
    return () => {}
  },
  subscribeSessions: (campaignId, cb) => {
    if (hasFirebaseConfig() && sessionRepo.subscribe) {
      return sessionRepo.subscribe(campaignId, cb)
    }
    cb(sessionRepo.listByCampaign(campaignId))
    return () => { }
  },
  subscribeNpcs: (campaignId, cb) => {
    if (hasFirebaseConfig() && npcRepo.subscribe) {
      return npcRepo.subscribe(campaignId, cb)
    }
    cb(npcRepo.listByCampaign(campaignId))
    return () => { }
  },
  createRoll: async (sessionId, data) => {
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
      if (data.who.kind === 'player') {
        const my = get().getMyPlayerSheet(campaignId)
        if (!my || my.id !== data.who.sheetId) return { ok: false, message: 'invalid_sheet' }
        const movesOnSheet = my.moves || []
        if (!movesOnSheet.includes(data.moveRef)) return { ok: false, message: 'move_not_in_sheet' }
      } else {
        const npcs = get().listNpcSheets(campaignId)
        const npc = npcs.find(n => n.id === data.who.sheetId)
        if (!npc) return { ok: false, message: 'invalid_sheet' }
        // NPC pode usar qualquer movimento ativo, ignoramos npc.moves
      }
      
      const campaignMoves = moveRepo.listByCampaign(campaignId)
      const mv = campaignMoves.find(m => m.name === data.moveRef)
      if (!mv || !mv.active) return { ok: false, message: 'move_not_active' }
      moveModifier = mv.modifier as AttributeScore
    }
    const extraModifier = data.extraModifier || 0

    const r = performRoll({
      mode: data.mode,
      attributeModifier,
      moveModifier,
      extraModifier
    })

    const payload: CreateRollInput = {
       who: data.who,
       campaignId,
       isPDM: get().role === 'master',
       attributeRef: data.attributeRef || null,
       attributeModifier: attributeModifier || 0,
       moveRef: data.moveRef || null,
       moveModifier: moveModifier || 0,
       dice: r.dice,
       usedDice: r.usedDice,
       baseSum: r.baseSum,
       totalModifier: r.totalModifier,
       total: r.total,
       outcome: r.outcome
    }
    
    return await rollRepo.create(sessionId, payload)
  },
  deleteRoll: async (sessionId, rollId) => {
    const user = get().user
    if (!user) return { ok: false, message: 'not_authenticated' }
    if (get().role !== 'master') return { ok: false, message: 'forbidden' }
    return await rollRepo.remove(sessionId, rollId)
  },
  initSubscriptions: userId => {
    const campaignRepo: CampaignRepo = repos.campaigns as CampaignRepo
    const unsubs: Array<() => void> = []
    const role = get().role
    set({ campaignsLoading: role === 'master', acceptedCampaignsLoading: role === 'player' })
    if (role === 'master') {
      const unsubOwner = campaignRepo.subscribe?.(userId, (items: Campaign[]) => set({ campaigns: items, campaignsLoading: false }))
      if (unsubOwner) unsubs.push(unsubOwner)
    }
    if (role === 'player') {
      const unsubPlayer = campaignRepo.subscribeByPlayer?.(userId, (items: Campaign[]) => set({ acceptedCampaigns: items, acceptedCampaignsLoading: false }))
      if (unsubPlayer) unsubs.push(unsubPlayer)
    }

    if (hasFirebaseConfig()) {
      const db = getDb()
      if (db) {
        if (role === 'master') {
          void (async () => {
            try {
              const ref = collection(db, 'campaigns')
              const q = query(ref, where('ownerId', '==', userId))
              const snap = await getDocs(q)
              const items: Campaign[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign))
              set({ campaigns: items })
            } finally {
              set({ campaignsLoading: false })
            }
          })()
        }
        if (role === 'player') {
          void (async () => {
            try {
              const ref = collection(db, 'campaigns')
              const q = query(ref, where('playersUids', 'array-contains', userId))
              const snap = await getDocs(q)
              const items: Campaign[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign))
              set({ acceptedCampaigns: items })
            } finally {
              set({ acceptedCampaignsLoading: false })
            }
          })()
        }
      } else {
        set({ campaignsLoading: false, acceptedCampaignsLoading: false })
      }
    } else {
      set({ campaignsLoading: false, acceptedCampaignsLoading: false })
    }
    set({ unsubscribers: unsubs })
  },
  initMovesSubscription: campaignId => {
    const { movesSubscription, movesSubscriptionCampaignId } = get()
    
    // Evitar assinatura duplicada para a mesma campanha
    if (movesSubscription && movesSubscriptionCampaignId === campaignId) {
      return
    }
    
    // Limpar assinatura anterior se existir (troca de campanha)
    if (movesSubscription) {
      movesSubscription()
    }

    const unsubscribe = get().subscribeMoves(campaignId, moves => {
      // Cache local para movimentos assinados
      const currentCache = get().movesCache
      const movesCache = new Map(currentCache)
      movesCache.set(campaignId, moves)
      set({ movesCache })
      
      // Sincronização opcional: atualizar npc.moves quando campanha muda
      // Isso mantém consistência histórica mas permite NPCs usarem qualquer movimento ativo
      if (get().role === 'master') {
        const npcs = get().listNpcSheets(campaignId)
        const activeMoveNames = moves.filter(m => m.active).map(m => m.name)
        
        // Atualizar todos os NPCs para terem todos os movimentos ativos
        // Isso mantém consistência histórica mas não restringe o uso
        npcs.forEach(npc => {
          if (npc.moves && !arraysEqual(npc.moves, activeMoveNames)) {
            // Atualiza silenciosamente para manter histórico, mas não restringe uso
            get().updateNpcSheet(campaignId, npc.id, { moves: activeMoveNames })
          }
        })
      }
    })
    
    set({ movesSubscription: unsubscribe, movesSubscriptionCampaignId: campaignId })
  },
  cleanupSubscriptions: () => {
    const { unsubscribers, movesSubscription } = get()
    unsubscribers?.forEach(fn => fn?.())
    if (movesSubscription) movesSubscription()
    set({ unsubscribers: [], movesSubscription: null, movesSubscriptionCampaignId: null })
  },
}))
