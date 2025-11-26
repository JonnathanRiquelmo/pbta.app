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
    create: (sessionId: string, createdBy: string, data: CreateRollInput) => {
      const now = Date.now()
      const payload: Omit<Roll, 'id'> = {
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
      void (async () => {
        try {
          const ref = collection(db, 'rolls')
          await addDoc(ref, payload)
        } catch (e: unknown) {
          // ignore
        }
      })()
      return { ok: true, roll: { id: `tmp-${now}`, ...payload } as Roll }
    },
    remove: (sessionId: string, id: string) => {
      void (async () => {
        try {
          await deleteDoc(doc(db, 'rolls', id))
        } catch (e: unknown) {
          // swallow errors to maintain sync signature
        }
      })()
      return { ok: true }
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
