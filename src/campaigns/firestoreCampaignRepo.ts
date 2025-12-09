import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, arrayUnion, getDocs, deleteDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Campaign, CampaignPlayer, Invite, ValidateInviteResult } from './types'
import type { CampaignRepo, InviteRepo, Repos } from './inviteRepo'
import { createUUIDv4 } from './inviteRepo'
import { logger } from '@shared/utils/logger'

export function createFirestoreRepos(db: unknown): Repos {
    const _db = db as Firestore
    // In-memory caches
    const campaignsCache: Map<string, Campaign[]> = new Map()
    const campaignsByPlayerCache: Map<string, Campaign[]> = new Map()
    const invitesCache: Map<string, Invite[]> = new Map()
    const playersCache: Map<string, CampaignPlayer[]> = new Map()

    const campaigns: CampaignRepo = {
        createCampaign: (data) => {
            const now = Date.now()
            const campaign: Campaign = {
                id: '', // Will be set by addDoc
                ownerId: data.ownerId,
                name: data.name,
                plot: data.plot,
                createdAt: now,
                players: [],
                playersUids: []
            }

            // Async operation - fire and forget
            void (async () => {
                try {
                    const ref = collection(_db, 'campaigns')
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...data } = campaign
                    await addDoc(ref, data)
                } catch (err) {
                    logger.error('Erro ao criar campanha:', err)
                }
            })()

            return campaign
        },

        listCampaignsByOwner: (ownerId) => {
            const cached = campaignsCache.get(ownerId)
            if (cached) return cached
            void (async () => {
                try {
                    const ref = collection(_db, 'campaigns')
                    const q = query(ref, where('ownerId', '==', ownerId))
                    const snap = await getDocs(q)
                    const items: Campaign[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign))
                    campaignsCache.set(ownerId, items)
                } catch (e) {
                    logger.error('Error listing campaigns by owner', e)
                }
            })()
            return []
        },

        addPlayer: (campaignId, player) => {
            // Async operation - fire and forget
            void (async () => {
                const campaignRef = doc(_db, 'campaigns', campaignId)
                await updateDoc(campaignRef, {
                    players: arrayUnion(player),
                    playersUids: arrayUnion(player.userId)
                })
            })()
        },

        listPlayers: (campaignId) => {
            return playersCache.get(campaignId) || []
        },

        subscribe: (ownerId, callback) => {
            const ref = collection(_db, 'campaigns')
            const q = query(ref, where('ownerId', '==', ownerId))

            const unsubscribe = onSnapshot(q, snapshot => {
                const campaigns: Campaign[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign))

                campaignsCache.set(ownerId, campaigns)
                campaigns.forEach(c => {
                    const players = (c as { players?: CampaignPlayer[] }).players || []
                    playersCache.set(c.id, players)
                })
                callback(campaigns)
            }, error => {
                logger.error('Error in campaigns subscription:', error)
            })

            return unsubscribe
        },
        subscribeByPlayer: (userId: string, callback: (items: Campaign[]) => void) => {
            const ref = collection(_db, 'campaigns')
            const q = query(ref, where('playersUids', 'array-contains', userId))
            const unsubscribe = onSnapshot(q, snapshot => {
                const items: Campaign[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign))
                campaignsByPlayerCache.set(userId, items)
                items.forEach(c => {
                    const players = (c as { players?: CampaignPlayer[] }).players || []
                    playersCache.set(c.id, players)
                })
                callback(items)
            }, error => {
                logger.error('Error in campaigns by player subscription:', error)
                void (async () => {
                    try {
                        const snap = await getDocs(q)
                        const fallbackItems: Campaign[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign))
                        campaignsByPlayerCache.set(userId, fallbackItems)
                        callback(fallbackItems)
                    } catch (e) {
                        logger.warn('Fallback getDocs for player campaigns failed', e)
                    }
                })()
            })
            return unsubscribe
        },
        remove: (id: string) => {
            void (async () => {
                try {
                    await deleteDoc(doc(_db, 'campaigns', id))
                } catch (err) {
                    logger.error('Error deleting campaign', err)
                }
            })()
            return { ok: true }
        },
        update: (id: string, patch: { name?: string; plot?: string; masterNotes?: string }) => {
            void (async () => {
                try {
                    const ref = doc(_db, 'campaigns', id)
                    const payload: Partial<{ name: string; plot: string; masterNotes: string }> = {}
                    if (patch.name !== undefined) payload.name = patch.name
                    if (patch.plot !== undefined) payload.plot = patch.plot
                    if (patch.masterNotes !== undefined) payload.masterNotes = patch.masterNotes
                    await updateDoc(ref, payload)
                } catch (err) {
                    logger.error('Error updating campaign', err)
                }
            })()
            return { ok: true }
        }
    }

    const invites: InviteRepo = {
        generateInvite: (campaignId, createdBy, options) => {
            const now = Date.now()
            const token = createUUIDv4()
            const invite: Invite = {
                id: '',
                token,
                campaignId,
                createdBy,
                createdAt: now,
                expiresAt: options?.expiresAt,
                usesLimit: options?.usesLimit,
                usesCount: 0,
                usedBy: []
            }

                // Async operation - fire and forget
                void (async () => {
                    const ref = collection(_db, 'invites')
                    const payload: { token: string; campaignId: string; createdBy: string; createdAt: number; usesCount: number; expiresAt?: number; usesLimit?: number } = {
                        token,
                        campaignId,
                        createdBy,
                        createdAt: now,
                        usesCount: 0
                    }
                    if (options && options.expiresAt !== undefined) payload.expiresAt = options.expiresAt
                    if (options && options.usesLimit !== undefined) payload.usesLimit = options.usesLimit
                    const docRef = await addDoc(ref, payload)
                    invite.id = docRef.id
                })()

            return invite
        },

        validateInvite: async (token) => {
            const now = Date.now()
            const validateFields = (inv: Invite) => {
                if (inv.expiresAt && inv.expiresAt < now) return { valid: false, reason: 'expired' } as ValidateInviteResult
                if (inv.usesLimit && (inv.usesCount || 0) >= inv.usesLimit) return { valid: false, reason: 'limit_reached' } as ValidateInviteResult
                return { valid: true, invite: inv, remainingUses: inv.usesLimit ? inv.usesLimit - (inv.usesCount || 0) : Infinity } as ValidateInviteResult
            }
            const cached = Array.from(invitesCache.values()).flat().find(inv => inv.token === token)
            if (cached) return validateFields(cached)
            const ref = collection(_db, 'invites')
            const q = query(ref, where('token', '==', token))
            const snapshot = await getDocs(q)
            if (snapshot.empty) return { valid: false, reason: 'invalid' }
            const d = snapshot.docs[0]
            const inv = { id: d.id, ...d.data() } as Invite
            const ownerInvites = invitesCache.get(inv.createdBy) || []
            invitesCache.set(inv.createdBy, [...ownerInvites.filter(x => x.id !== inv.id), inv])
            return validateFields(inv)
        },

        acceptInvite: async (token, player) => {
            try {
                const ref = collection(_db, 'invites')
                const q = query(ref, where('token', '==', token))
                const snapshot = await getDocs(q)
                if (snapshot.empty) return { success: false, error: 'invalid' }
                const d = snapshot.docs[0]
                const inv = { id: d.id, ...d.data() } as Invite
                const now = Date.now()
                if (inv.expiresAt && inv.expiresAt < now) return { success: false, error: 'expired' }
                if (inv.usesLimit && (inv.usesCount || 0) >= inv.usesLimit) return { success: false, error: 'limit_reached' }
                const campaignRef = doc(_db, 'campaigns', inv.campaignId)
                await updateDoc(campaignRef, { playersUids: arrayUnion(player.userId) })
                const inviteRef = doc(_db, 'invites', inv.id)
                await updateDoc(inviteRef, { usesCount: (inv.usesCount || 0) + 1 })
                const ownerInvites = invitesCache.get(inv.createdBy) || []
                invitesCache.set(inv.createdBy, [...ownerInvites.filter(x => x.id !== inv.id), inv])
                return { success: true, campaignId: inv.campaignId }
            } catch {
                return { success: false, error: 'permission_denied' }
            }
        }
    }

    return { campaigns, invites }
}
