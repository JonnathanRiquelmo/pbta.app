import type { CharacterRepo, CreatePlayerSheetInput, UpdatePlayerSheetPatch } from './characterRepo'
import type { PlayerSheet } from './types'

const STORAGE_KEY = 'pbta_characters'

type PersistCampaignSheets = Record<string, PlayerSheet>
type PersistRoot = Record<string, PersistCampaignSheets>

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

function upsertCampaign(root: PersistRoot, campaignId: string): PersistCampaignSheets {
  const existing = root[campaignId]
  if (existing) return existing
  const created: PersistCampaignSheets = {}
  root[campaignId] = created
  return created
}

function sumAbsAttributes(attrs: PlayerSheet['attributes']): number {
  return Math.abs(attrs.forca) + Math.abs(attrs.agilidade) + Math.abs(attrs.sabedoria) + Math.abs(attrs.carisma) + Math.abs(attrs.intuicao)
}

export function createLocalCharacterRepo(): CharacterRepo {
  return {
    getByCampaignAndUser: (campaignId, userId) => {
      const root = load()
      const sheets = root[campaignId]
      if (!sheets) return undefined
      return sheets[userId]
    },
    create: (campaignId, userId, data) => {
      const root = load()
      const sheets = upsertCampaign(root, campaignId)
      if (sheets[userId]) {
        return { ok: false, message: 'already_exists' }
      }
      const now = Date.now()
      const id = `ch-${now}`
      const sheet: PlayerSheet = {
        id,
        campaignId,
        userId,
        name: data.name,
        background: data.background,
        attributes: data.attributes,
        equipment: data.equipment,
        notes: data.notes,
        moves: data.moves || [],
        createdAt: now,
        updatedAt: now
      }
      if (sumAbsAttributes(sheet.attributes) !== 3) {
        return { ok: false, message: 'invalid_attributes_sum' }
      }
      sheets[userId] = sheet
      save(root)
      return { ok: true, sheet }
    },
    update: (campaignId, userId, patch) => {
      const root = load()
      const sheets = root[campaignId]
      const existing = sheets ? sheets[userId] : undefined
      if (!existing) return { ok: false, message: 'not_found' }
      const updated: PlayerSheet = {
        ...existing,
        ...patch,
        attributes: patch.attributes ? patch.attributes : existing.attributes,
        moves: patch.moves ? patch.moves : existing.moves,
        updatedAt: Date.now()
      }
      if (sumAbsAttributes(updated.attributes) !== 3) {
        return { ok: false, message: 'invalid_attributes_sum' }
      }
      sheets![userId] = updated
      save(root)
      return { ok: true, sheet: updated }
    },
    validateServerSide: async () => {
      return { ok: true }
    }
  }
}