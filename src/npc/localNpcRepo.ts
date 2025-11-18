import type { NpcRepo, CreateNpcSheetInput, UpdateNpcSheetPatch } from './npcRepo'
import type { NpcSheet } from './types'

const STORAGE_KEY = 'pbta_npcs'

type PersistCampaignNpcs = Record<string, NpcSheet>
type PersistRoot = Record<string, PersistCampaignNpcs>

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

function upsertCampaign(root: PersistRoot, campaignId: string): PersistCampaignNpcs {
  const existing = root[campaignId]
  if (existing) return existing
  const created: PersistCampaignNpcs = {}
  root[campaignId] = created
  return created
}

function sumAbsAttributes(attrs: NpcSheet['attributes']): number {
  return (
    Math.abs(attrs.forca) +
    Math.abs(attrs.agilidade) +
    Math.abs(attrs.sabedoria) +
    Math.abs(attrs.carisma) +
    Math.abs(attrs.intuicao)
  )
}

export function createLocalNpcRepo(): NpcRepo {
  return {
    listByCampaign: (campaignId: string) => {
      const root = load()
      const npcs = root[campaignId]
      if (!npcs) return []
      return Object.values(npcs)
    },
    createMany: (campaignId: string, createdBy: string, inputs: CreateNpcSheetInput[], moves: string[]) => {
      const root = load()
      const npcs = upsertCampaign(root, campaignId)
      const now = Date.now()
      const created: NpcSheet[] = []
      for (const data of inputs) {
        const sheet: NpcSheet = {
          id: `npc-${now}-${Math.random().toString(36).slice(2, 8)}`,
          campaignId,
          createdBy,
          type: 'npc',
          name: data.name,
          background: data.background,
          attributes: data.attributes,
          equipment: data.equipment,
          notes: data.notes,
          moves: moves,
          createdAt: now,
          updatedAt: now
        }
        if (sumAbsAttributes(sheet.attributes) !== 3) {
          return { ok: false, message: 'invalid_attributes_sum' }
        }
        npcs[sheet.id] = sheet
        created.push(sheet)
      }
      save(root)
      return { ok: true, created }
    },
    update: (campaignId: string, id: string, patch: UpdateNpcSheetPatch) => {
      const root = load()
      const npcs = root[campaignId]
      const existing = npcs ? npcs[id] : undefined
      if (!existing) return { ok: false, message: 'not_found' }
      const updated: NpcSheet = {
        ...existing,
        ...patch,
        attributes: patch.attributes ? patch.attributes : existing.attributes,
        updatedAt: Date.now()
      }
      if (sumAbsAttributes(updated.attributes) !== 3) {
        return { ok: false, message: 'invalid_attributes_sum' }
      }
      npcs![id] = updated
      save(root)
      return { ok: true, sheet: updated }
    }
  }
}