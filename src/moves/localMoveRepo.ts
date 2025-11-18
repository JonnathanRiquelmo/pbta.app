import type { Move } from './types'
import type { MoveRepo, CreateMoveInput, UpdateMovePatch } from './moveRepo'

const STORAGE_KEY = 'pbta_moves'

type PersistCampaignMoves = Record<string, Move>
type PersistRoot = Record<string, PersistCampaignMoves>

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

function upsertCampaign(root: PersistRoot, campaignId: string): PersistCampaignMoves {
  const existing = root[campaignId]
  if (existing) return existing
  const created: PersistCampaignMoves = {}
  root[campaignId] = created
  return created
}

function isValidModifier(v: number): v is -1 | 0 | 1 | 2 | 3 {
  return v >= -1 && v <= 3
}

export function createLocalMoveRepo(): MoveRepo {
  return {
    listByCampaign: (campaignId: string) => {
      const root = load()
      const moves = root[campaignId]
      if (!moves) return []
      return Object.values(moves).sort((a, b) => b.createdAt - a.createdAt)
    },
    create: (campaignId: string, createdBy: string, data: CreateMoveInput) => {
      const name = data.name?.trim()
      if (!name) return { ok: false, message: 'invalid_name' }
      if (!isValidModifier(data.modifier)) return { ok: false, message: 'invalid_modifier' }
      const root = load()
      const moves = upsertCampaign(root, campaignId)
      const now = Date.now()
      const id = `mv-${now}-${Math.random().toString(36).slice(2, 8)}`
      const move: Move = {
        id,
        campaignId,
        name,
        description: data.description || '',
        modifier: data.modifier,
        active: data.active ?? true,
        createdAt: now,
        updatedAt: now
      }
      moves[id] = move
      save(root)
      return { ok: true, move }
    },
    update: (campaignId: string, id: string, patch: UpdateMovePatch) => {
      const root = load()
      const moves = root[campaignId]
      const existing = moves ? moves[id] : undefined
      if (!existing) return { ok: false, message: 'not_found' }
      const name = patch.name !== undefined ? patch.name.trim() : existing.name
      if (!name) return { ok: false, message: 'invalid_name' }
      const modifier = patch.modifier !== undefined ? patch.modifier : existing.modifier
      if (!isValidModifier(modifier)) return { ok: false, message: 'invalid_modifier' }
      const updated: Move = {
        ...existing,
        ...patch,
        name,
        modifier,
        updatedAt: Date.now()
      }
      moves![id] = updated
      save(root)
      return { ok: true, move: updated }
    },
    remove: (campaignId: string, id: string) => {
      const root = load()
      const moves = root[campaignId]
      if (!moves || !moves[id]) return { ok: false, message: 'not_found' }
      delete moves[id]
      save(root)
      return { ok: true }
    }
  }
}