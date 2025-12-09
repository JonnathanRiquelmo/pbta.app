import type { Roll } from './types'
import type { RollRepo } from './rollRepo'
import type { CreateRollInput } from './types'
import { getDb } from '@fb/client'
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { logger } from '@shared/utils/logger'

export function createFirestoreRollRepo(): RollRepo & { subscribe: (sessionId: string, campaignId: string, cb: (items: Roll[]) => void) => () => void } {
  const db = getDb()!
  return {
    listBySession: async () => [], // Not used in firestore mode (subscription only)
    create: async (sessionId: string, data: CreateRollInput) => {
      const db = getDb()
      if (!db) return { ok: false, message: 'no_db' }
      const now = Date.now()
      
      const ref = collection(db, 'rolls')
      const docRef = doc(ref) // Sync ID
      
      const roll: Roll = {
        id: docRef.id,
        sessionId,
        campaignId: data.campaignId,
        dice: data.dice,
        usedDice: data.usedDice,
        baseSum: data.baseSum,
        attributeRef: data.attributeRef || null,
        attributeModifier: data.attributeModifier || 0,
        moveRef: data.moveRef || null,
        moveModifier: data.moveModifier || 0,
        totalModifier: data.totalModifier,
        total: data.total,
        outcome: data.outcome,
        who: data.who,
        isPDM: data.isPDM,
        createdAt: Date.now(),
        createdBy: data.who.name
      }
      
      const payload = { ...roll } as any
      delete payload.id // remove id from payload if we want, or keep it. Firestore stores document data, usually id is separate but can be in data too.
      // Let's strictly follow what was there: Omit<Roll, 'id'>
      const { id, ...payloadToSave } = roll

      void (async () => {
        try {
          await setDoc(docRef, payloadToSave)
        } catch (e: unknown) {
          logger.error('Error creating roll:', e)
        }
      })()
      return { ok: true, roll }
    },
    remove: async (sessionId: string, id: string) => {
      const db = getDb()
      if (!db) return { ok: false, message: 'no_db' }
      try {
        await deleteDoc(doc(db, 'rolls', id))
      } catch (e: unknown) {
        // swallow errors to maintain sync signature
      }
      return { ok: true }
    },
    subscribe: (sessionId: string, campaignId: string, cb: (items: Roll[]) => void) => {
      const q = query(collection(db, 'rolls'), where('sessionId', '==', sessionId), where('campaignId', '==', campaignId))
      return onSnapshot(q, snap => {
        const items: Roll[] = []
        snap.forEach(d => {
          const data = d.data() as unknown as Omit<Roll, 'id'>
          items.push({ id: d.id, ...data })
        })
        // logger.info(`[FirestoreRollRepo] Snapshot for ${sessionId}: ${items.length} items`)
        items.sort((a, b) => b.createdAt - a.createdAt)
        cb(items)
      })
    }
  }
}
