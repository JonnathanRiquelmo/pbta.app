import type { Roll } from './types'
import type { RollRepo } from './rollRepo'
import type { CreateRollInput } from './types'
import { getDb } from '@fb/client'
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'

export function createFirestoreRollRepo(): RollRepo & { subscribe: (sessionId: string, cb: (items: Roll[]) => void) => () => void } {
  const db = getDb()!
  return {
    listBySession: (_sessionId: string) => {
      // synchronous signature; return empty, callers should use subscribe
      return []
    },
    create: async (sessionId: string, createdBy: string, data: CreateRollInput) => {
      try {
        const ref = collection(db, 'rolls')
        const now = Date.now()
        const payload: Omit<Roll, 'id'> = {
          sessionId,
          dice: data.dice,
          usedDice: data.usedDice,
          baseSum: data.baseSum,
          attributeRef: data.attributeRef ?? null,
          attributeModifier: data.attributeModifier ?? 0,
          moveRef: data.moveRef ?? null,
          moveModifier: data.moveModifier ?? 0,
          totalModifier: data.totalModifier,
          total: data.total,
          outcome: data.outcome,
          who: data.who,
          createdAt: now,
          createdBy
        }
        const d = await addDoc(ref, payload)
        return { ok: true, roll: { id: d.id, ...payload } as Roll }
      } catch (e: unknown) {
        return { ok: false, message: 'firestore_error' }
      }
    },
    remove: async (sessionId: string, id: string) => {
      try {
        await deleteDoc(doc(db, 'rolls', id))
        return { ok: true }
      } catch (e: unknown) {
        return { ok: false, message: 'firestore_error' }
      }
    },
    subscribe: (sessionId: string, cb: (items: Roll[]) => void) => {
      const q = query(collection(db, 'rolls'), where('sessionId', '==', sessionId))
      return onSnapshot(q, snap => {
        const items: Roll[] = []
        snap.forEach(d => {
          const data = d.data() as unknown as Omit<Roll, 'id'>
          items.push({ id: d.id, ...data })
        })
        items.sort((a, b) => b.createdAt - a.createdAt)
        cb(items)
      })
    }
  }
}
