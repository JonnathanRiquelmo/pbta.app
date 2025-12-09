import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { MoveRepo, CreateMoveInput, UpdateMovePatch } from './moveRepo'
import type { Move } from './types'
import { logger } from '@shared/utils/logger'

function isValidModifier(v: number): v is -1 | 0 | 1 | 2 | 3 {
  return v >= -1 && v <= 3
}

export function createFirestoreMoveRepo(db: unknown): MoveRepo {
  const _db = db as Firestore
  const cacheByCampaign = new Map<string, Move[]>()

  return {
    listByCampaign: (campaignId: string) => {
      return (cacheByCampaign.get(campaignId) || []).sort((a, b) => b.createdAt - a.createdAt)
    },
    create: async (campaignId: string, createdBy: string, data: CreateMoveInput) => {
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
      try {
        const ref = collection(_db, 'moves')
        const d = await addDoc(ref, move)
        const arr = cacheByCampaign.get(campaignId) || []
        // Evitar duplicatas se a subscrição já tiver atualizado o cache
        if (!arr.some(m => m.id === d.id)) {
          const newMove = { id: d.id, ...move } as Move
          arr.push(newMove)
          cacheByCampaign.set(campaignId, arr)
        }
        return { ok: true, move: { id: d.id, ...move } as Move }
      } catch (err) {
        logger.error('Error creating move:', err)
        return { ok: false, message: 'create_failed' }
      }
    },
    update: async (campaignId: string, id: string, patch: UpdateMovePatch) => {
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
      try {
        await updateDoc(doc(_db, 'moves', id), {
          name: updated.name,
          description: updated.description,
          modifier: updated.modifier,
          active: updated.active,
          updatedAt: updated.updatedAt
        })
        const next = list.map(m => (m.id === id ? updated : m))
        cacheByCampaign.set(campaignId, next)
        return { ok: true, move: updated }
      } catch (err) {
        logger.error('Error updating move:', err)
        return { ok: false, message: 'update_failed' }
      }
    },
    remove: async (campaignId: string, id: string) => {
      const list = cacheByCampaign.get(campaignId) || []
      if (!list.find(m => m.id === id)) return { ok: false, message: 'not_found' }
      try {
        await deleteDoc(doc(_db, 'moves', id))
        const next = list.filter(m => m.id !== id)
        cacheByCampaign.set(campaignId, next)
        return { ok: true }
      } catch (err) {
        logger.error('Error removing move:', err)
        return { ok: false, message: 'remove_failed' }
      }
    },
    subscribe: (campaignId: string, callback: (moves: Move[]) => void) => {
      const ref = collection(_db, 'moves')
      const q = query(ref, where('campaignId', '==', campaignId))

      const unsubscribe = onSnapshot(q, snapshot => {
        const moves: Move[] = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Move))
        
        // Ordenar por createdAt (mais recente primeiro)
        const sortedMoves = moves.sort((a, b) => b.createdAt - a.createdAt)
        
        // Atualizar cache
        cacheByCampaign.set(campaignId, sortedMoves)
        
        // Chamar callback com dados ordenados
        callback(sortedMoves)
      }, error => {
        logger.error('Error in moves subscription:', error)
      })

      return unsubscribe
    }
  }
}
