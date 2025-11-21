import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore'
import type { CharacterRepo, CreatePlayerSheetInput, UpdatePlayerSheetPatch, ValidateResult } from './characterRepo'
import type { PlayerSheet } from './types'

function sumAbsAttributes(attrs: PlayerSheet['attributes']): number {
  return (
    Math.abs(attrs.forca) +
    Math.abs(attrs.agilidade) +
    Math.abs(attrs.sabedoria) +
    Math.abs(attrs.carisma) +
    Math.abs(attrs.intuicao)
  )
}

export function createFirestoreCharacterRepo(db: any): CharacterRepo {
  const cacheByCampaignUser = new Map<string, PlayerSheet>()

  return {
    getByCampaignAndUser: (campaignId: string, userId: string) => {
      const key = `${campaignId}:${userId}`
      return cacheByCampaignUser.get(key)
    },
    create: (campaignId: string, userId: string, data: CreatePlayerSheetInput) => {
      const now = Date.now()
      const sheet: Omit<PlayerSheet, 'id'> = {
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
      void (async () => {
        const ref = collection(db, 'characters')
        const d = await addDoc(ref, sheet)
        const key = `${campaignId}:${userId}`
        cacheByCampaignUser.set(key, { id: d.id, ...sheet })
      })()
      return { ok: true, sheet: { id: '', ...sheet } as PlayerSheet }
    },
    update: (campaignId: string, userId: string, patch: UpdatePlayerSheetPatch) => {
      const key = `${campaignId}:${userId}`
      const existing = cacheByCampaignUser.get(key)
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
      void (async () => {
        await updateDoc(doc(db, 'characters', existing.id), {
          name: updated.name,
          background: updated.background,
          attributes: updated.attributes,
          equipment: updated.equipment,
          notes: updated.notes,
          moves: updated.moves,
          updatedAt: updated.updatedAt
        })
        cacheByCampaignUser.set(key, updated)
      })()
      return { ok: true, sheet: updated }
    },
    validateServerSide: async (sheet: PlayerSheet): Promise<ValidateResult> => {
      if (sumAbsAttributes(sheet.attributes) !== 3) return { ok: false, message: 'invalid_attributes_sum' }
      // Optional: validate moves exist and active
      try {
        const q = query(collection(db, 'moves'), where('campaignId', '==', sheet.campaignId))
        const snap = await getDocs(q)
        const names = new Set<string>()
        snap.forEach(d => {
          const m = d.data() as { name: string; active: boolean }
          if (m.active) names.add(m.name)
        })
        const allValid = (sheet.moves || []).every(n => names.has(n))
        if (!allValid) return { ok: false, message: 'move_not_active' }
      } catch (err) { void err }
      return { ok: true }
    }
  }
}
