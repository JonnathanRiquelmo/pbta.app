import type { Roll } from './types'
import type { RollRepo } from './rollRepo'
import type { CreateRollInput } from './types'

const STORAGE_KEY = 'pbta_session_rolls'

type PersistSessionRolls = Record<string, Roll>
type PersistRoot = Record<string, PersistSessionRolls>

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

function upsertSession(root: PersistRoot, sessionId: string): PersistSessionRolls {
  const existing = root[sessionId]
  if (existing) return existing
  const created: PersistSessionRolls = {}
  root[sessionId] = created
  return created
}

export function createLocalRollRepo(): RollRepo {
  return {
    listBySession: (sessionId: string) => {
      const root = load()
      const rolls = root[sessionId]
      if (!rolls) return []
      return Object.values(rolls).sort((a, b) => b.createdAt - a.createdAt)
    },
    create: (sessionId: string, createdBy: string, data: CreateRollInput) => {
      const root = load()
      const sessionRolls = upsertSession(root, sessionId)
      const now = Date.now()
      const id = `rl-${now}-${Math.random().toString(36).slice(2, 8)}`
      const roll: Roll = {
        id,
        sessionId,
        campaignId: data.campaignId,
        dice: data.dice,
        usedDice: data.usedDice,
        baseSum: data.baseSum,
        attributeRef: data.attributeRef,
        attributeModifier: data.attributeModifier,
        moveRef: data.moveRef,
        moveModifier: data.moveModifier,
        totalModifier: data.totalModifier,
        total: data.total,
        outcome: data.outcome,
        who: data.who,
        isPDM: data.isPDM ?? false,
        createdAt: now,
        createdBy
      }
      sessionRolls[id] = roll
      save(root)
      return { ok: true, roll }
    },
    remove: (sessionId: string, id: string) => {
      const root = load()
      const sessionRolls = root[sessionId]
      if (!sessionRolls || !sessionRolls[id]) return { ok: false, message: 'not_found' }
      delete sessionRolls[id]
      save(root)
      return { ok: true }
    }
  }
}
