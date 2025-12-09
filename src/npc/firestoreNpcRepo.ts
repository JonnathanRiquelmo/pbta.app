import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, query, where, onSnapshot } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { NpcRepo, CreateNpcSheetInput, UpdateNpcSheetPatch } from './npcRepo'
import type { NpcSheet } from './types'
import { logger } from '@shared/utils/logger'

function sumAbsAttributes(attrs: NpcSheet['attributes']): number {
  return (
    Math.abs(attrs.forca) +
    Math.abs(attrs.agilidade) +
    Math.abs(attrs.sabedoria) +
    Math.abs(attrs.carisma) +
    Math.abs(attrs.intuicao)
  )
}

export function createFirestoreNpcRepo(db: unknown): NpcRepo {
  const _db = db as Firestore
  const cacheByCampaign = new Map<string, NpcSheet[]>()

  return {
    listByCampaign: (campaignId: string) => {
      return cacheByCampaign.get(campaignId) || []
    },
    subscribe: (campaignId: string, cb: (sheets: NpcSheet[]) => void) => {
        const q = query(collection(_db, 'npcs'), where('campaignId', '==', campaignId))
        return onSnapshot(q, (snap) => {
            const sheets: NpcSheet[] = []
            snap.forEach(d => {
                sheets.push({ id: d.id, ...d.data() } as NpcSheet)
            })
            cacheByCampaign.set(campaignId, sheets)
            cb(sheets)
        }, (err) => {
            logger.error('Erro ao subscrever NPCs:', err)
        })
    },
    getById: async (campaignId: string, id: string): Promise<NpcSheet | null> => {
      try {
        const docRef = doc(_db, 'npcs', id)
        const docSnap = await getDoc(docRef)
        
        if (!docSnap.exists()) {
          return null
        }
        
        const data = docSnap.data() as Omit<NpcSheet, 'id'>
        
        // Verificar se o NPC pertence à campanha correta
        if (data.campaignId !== campaignId) {
          return null
        }
        
        return { id: docSnap.id, ...data }
      } catch (error) {
        logger.error('Erro ao buscar NPC:', error)
        return null
      }
    },
    createMany: (campaignId: string, createdBy: string, inputs: CreateNpcSheetInput[], moves: string[]) => {
      const now = Date.now()
      const created: NpcSheet[] = []
      for (const data of inputs) {
        const sheet: Omit<NpcSheet, 'id'> = {
          campaignId,
          createdBy,
          type: 'npc',
          name: data.name,
          background: data.background,
          attributes: data.attributes,
          equipment: data.equipment,
          notes: data.notes,
          moves,
          createdAt: now,
          updatedAt: now
        }
        if (sumAbsAttributes(sheet.attributes) !== 3) {
          return { ok: false, message: 'invalid_attributes_sum' }
        }
        void (async () => {
          try {
            const ref = collection(_db, 'npcs')
             const d = await addDoc(ref, sheet)
             logger.info('NPC criado no Firestore:', d.id)
             const arr = cacheByCampaign.get(campaignId) || []
            arr.push({ id: d.id, ...sheet })
            cacheByCampaign.set(campaignId, arr)
          } catch (err) {
            logger.error('Erro ao criar NPC no Firestore:', err)
          }
        })()
        created.push({ id: '', ...sheet } as NpcSheet)
      }
      return { ok: true, created }
    },
    update: (campaignId: string, id: string, patch: UpdateNpcSheetPatch) => {
      const list = cacheByCampaign.get(campaignId) || []
      const existing = list.find(n => n.id === id)
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
      void (async () => {
        await updateDoc(doc(_db, 'npcs', id), {
          name: updated.name,
          background: updated.background,
          attributes: updated.attributes,
          equipment: updated.equipment,
          notes: updated.notes,
          updatedAt: updated.updatedAt
        })
        const next = list.map(n => (n.id === id ? updated : n))
        cacheByCampaign.set(campaignId, next)
      })()
      return { ok: true, sheet: updated }
    },
    delete: (campaignId: string, id: string) => {
      const list = cacheByCampaign.get(campaignId) || []
      const existing = list.find(n => n.id === id)
      if (!existing) return { ok: false, message: 'not_found' }
      
      void (async () => {
        await deleteDoc(doc(_db, 'npcs', id))
        const next = list.filter(n => n.id !== id)
        cacheByCampaign.set(campaignId, next)
      })()
      
      return { ok: true }
    }
  }
}
