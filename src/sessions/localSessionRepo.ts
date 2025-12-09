import type { Session } from './types'
import type { SessionRepo } from './sessionRepo'
import type { CreateSessionInput, UpdateSessionPatch } from './types'

const STORAGE_KEY = 'pbta_sessions'

type PersistCampaignSessions = Record<string, Session>
type PersistRoot = Record<string, PersistCampaignSessions>

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

function upsertCampaign(root: PersistRoot, campaignId: string): PersistCampaignSessions {
  const existing = root[campaignId]
  if (existing) return existing
  const created: PersistCampaignSessions = {}
  root[campaignId] = created
  return created
}

function isValidDate(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function createLocalSessionRepo(): SessionRepo {
  return {
    listByCampaign: (campaignId: string) => {
      const root = load()
      const sessions = root[campaignId]
      if (!sessions) return []
      return Object.values(sessions)
        .filter(s => !s.deleted)
        .sort((a, b) => {
          const ad = a.date || a.createdAt
          const bd = b.date || b.createdAt
          return bd - ad
        })
    },
    getById: (id: string) => {
      const root = load()
      for (const campaignId of Object.keys(root)) {
        const sessions = root[campaignId]
        if (sessions && sessions[id]) return sessions[id]
      }
      return undefined
    },
    create: (campaignId: string, createdBy: string, data: CreateSessionInput) => {
      const name = data.name?.trim()
      if (!name) return { ok: false, message: 'invalid_name' }
      const date = data.date
      if (!isValidDate(date)) return { ok: false, message: 'invalid_date' }
      const root = load()
      const sessions = upsertCampaign(root, campaignId)
      const now = Date.now()
      const id = `ss-${now}-${Math.random().toString(36).slice(2, 8)}`
      const session: Session = {
        id,
        campaignId,
        name,
        date,
        masterNotes: data.masterNotes || '',
        summary: data.summary || '',
        createdAt: now,
        createdBy,
        updatedAt: now
      }
      sessions[id] = session
      save(root)
      return { ok: true, session }
    },
    update: (campaignId: string, id: string, patch: UpdateSessionPatch) => {
      const root = load()
      const sessions = root[campaignId]
      const existing = sessions ? sessions[id] : undefined
      if (!existing) return { ok: false, message: 'not_found' }
      const name = patch.name !== undefined ? patch.name.trim() : existing.name
      if (!name) return { ok: false, message: 'invalid_name' }
      const date = patch.date !== undefined ? patch.date : existing.date
      if (!isValidDate(date)) return { ok: false, message: 'invalid_date' }
      const updated: Session = {
        ...existing,
        ...patch,
        name,
        date,
        updatedAt: Date.now()
      }
      sessions![id] = updated
      save(root)
      return { ok: true, session: updated }
    },
    remove: (campaignId: string, id: string, deletedBy?: string) => {
      const root = load()
      const sessions = root[campaignId]
      const existing = sessions ? sessions[id] : undefined
      if (!existing) return { ok: false, message: 'not_found' }
      
      // Soft delete para manter compatibilidade
      const updated: Session = {
        ...existing,
        deleted: true,
        deletedAt: Date.now(),
        deletedBy: deletedBy
      }
      sessions![id] = updated
      save(root)
      return { ok: true }
    }
  }
}