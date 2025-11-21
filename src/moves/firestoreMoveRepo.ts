import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { MoveRepo, CreateMoveInput, UpdateMovePatch } from './moveRepo'
import type { Move } from './types'

function isValidModifier(v: number): v is -1 | 0 | 1 | 2 | 3 {
  return v >= -1 && v <= 3
}

export function createFirestoreMoveRepo(db: any): MoveRepo {
  const cacheByCampaign = new Map<string, Move[]>()

  return {
    listByCampaign: (campaignId: string) => {
      return (cacheByCampaign.get(campaignId) || []).sort((a, b) => b.createdAt - a.createdAt)
    },
    create: (campaignId: string, createdBy: string, data: CreateMoveInput) => {
      const name = data.name?.trim()
      if (!name) return { ok: false, message: 'invalid_name' }
      if (!isValidModifier(data.modifier)) return { ok: false, message: 'invalid_modifier' }
      const now = Date.now()
      const move: Omit<Move, 'id'> = {
        campaignId,
        name,
        description: data.description || '',
        modifier: data.modifier,
        active: data.active ?? true,
        createdAt: now,
        updatedAt: now
      }
      ;(async () => {
        const ref = collection(db, 'moves')
        const d = await addDoc(ref, move)
        const arr = cacheByCampaign.get(campaignId) || []
        arr.push({ id: d.id, ...move })
        cacheByCampaign.set(campaignId, arr)
      })()
      return { ok: true, move: { id: '', ...move } as Move }
    },
    update: (campaignId: string, id: string, patch: UpdateMovePatch) => {
      const list = cacheByCampaign.get(campaignId) || []
      const existing = list.find(m => m.id === id)
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
      ;(async () => {
        await updateDoc(doc(db, 'moves', id), {
          name: updated.name,
          description: updated.description,
          modifier: updated.modifier,
          active: updated.active,
          updatedAt: updated.updatedAt
        })
        const next = list.map(m => (m.id === id ? updated : m))
        cacheByCampaign.set(campaignId, next)
      })()
      return { ok: true, move: updated }
    },
    remove: (campaignId: string, id: string) => {
      const list = cacheByCampaign.get(campaignId) || []
      if (!list.find(m => m.id === id)) return { ok: false, message: 'not_found' }
      ;(async () => {
        await deleteDoc(doc(db, 'moves', id))
        const next = list.filter(m => m.id !== id)
        cacheByCampaign.set(campaignId, next)
      })()
      return { ok: true }
    }
  }
}
