import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, arrayUnion, getDocs } from 'firebase/firestore'
import type { Campaign, CampaignPlayer, Invite, ValidateInviteResult } from './types'
import type { CampaignRepo, InviteRepo, Repos, GenerateInviteOptions } from './inviteRepo'
import { createUUIDv4 } from './inviteRepo'

export function createFirestoreRepos(db: any): Repos {
    // In-memory caches
    let campaignsCache: Map<string, Campaign[]> = new Map()
    let campaignsByPlayerCache: Map<string, Campaign[]> = new Map()
    let invitesCache: Map<string, Invite[]> = new Map()
    let playersCache: Map<string, CampaignPlayer[]> = new Map()

    const campaigns: CampaignRepo = {
        createCampaign: (data) => {
            const now = Date.now()
            const campaign: Campaign = {
                id: '', // Will be set by Firestore
                name: data.name,
                plot: data.plot,
                ownerId: data.ownerId,
                createdAt: now
            }

                // Async operation - fire and forget
                ; (async () => {
                    const ref = collection(db, 'campaigns')
                    const docRef = await addDoc(ref, {
                        name: data.name,
                        plot: data.plot,
                        ownerId: data.ownerId,
                        createdAt: now
                    })
                    campaign.id = docRef.id
                })()

            return campaign
        },

        listCampaignsByOwner: (ownerId) => {
            const cached = campaignsCache.get(ownerId)
            if (cached) return cached
            ;(async () => {
                try {
                    const ref = collection(db, 'campaigns')
                    const q = query(ref, where('ownerId', '==', ownerId))
                    const snap = await getDocs(q)
                    const items: Campaign[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign))
                    campaignsCache.set(ownerId, items)
                } catch (e) {
                    console.error('Error listing campaigns by owner', e)
                }
            })()
            return []
        },

        addPlayer: (campaignId, player) => {
            // Async operation - fire and forget
            ; (async () => {
                const campaignRef = doc(db, 'campaigns', campaignId)
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
            const ref = collection(db, 'campaigns')
            const q = query(ref, where('ownerId', '==', ownerId))

            const unsubscribe = onSnapshot(q, snapshot => {
                const campaigns: Campaign[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Campaign))

                campaignsCache.set(ownerId, campaigns)
                callback(campaigns)
            }, error => {
                console.error('Error in campaigns subscription:', error)
            })

            return unsubscribe
        },
        listCampaignsByPlayer: (userId: string) => {
            return campaignsByPlayerCache.get(userId) || []
        },
        subscribeByPlayer: (userId: string, callback: (items: Campaign[]) => void) => {
            const ref = collection(db, 'campaigns')
            const q = query(ref, where('playersUids', 'array-contains', userId))
            const unsubscribe = onSnapshot(q, snapshot => {
                const items: Campaign[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign))
                campaignsByPlayerCache.set(userId, items)
                callback(items)
            }, error => {
                console.error('Error in campaigns by player subscription:', error)
            })
            return unsubscribe
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
                usesCount: 0
            }

                // Async operation - fire and forget
                ; (async () => {
                    const ref = collection(db, 'invites')
                    const payload: any = {
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
                if (inv.usesLimit && inv.usesCount >= inv.usesLimit) return { valid: false, reason: 'limit_reached' } as ValidateInviteResult
                return { valid: true, invite: inv, remainingUses: inv.usesLimit ? inv.usesLimit - inv.usesCount : Infinity } as ValidateInviteResult
            }
            const cached = Array.from(invitesCache.values()).flat().find(inv => inv.token === token)
            if (cached) return validateFields(cached)
            const ref = collection(db, 'invites')
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
                const ref = collection(db, 'invites')
                const q = query(ref, where('token', '==', token))
                const snapshot = await getDocs(q)
                if (snapshot.empty) return { success: false, error: 'invalid' }
                const d = snapshot.docs[0]
                const inv = { id: d.id, ...d.data() } as Invite
                const now = Date.now()
                if (inv.expiresAt && inv.expiresAt < now) return { success: false, error: 'expired' }
                if (inv.usesLimit && (inv.usesCount || 0) >= inv.usesLimit) return { success: false, error: 'limit_reached' }
                const campaignRef = doc(db, 'campaigns', inv.campaignId)
                await updateDoc(campaignRef, { playersUids: arrayUnion(player.userId) })
                const inviteRef = doc(db, 'invites', inv.id)
                await updateDoc(inviteRef, { usesCount: (inv.usesCount || 0) + 1 })
                const ownerInvites = invitesCache.get(inv.createdBy) || []
                invitesCache.set(inv.createdBy, [...ownerInvites.filter(x => x.id !== inv.id), inv])
                return { success: true, campaignId: inv.campaignId }
            } catch (e: any) {
                return { success: false, error: 'permission_denied' }
            }
        }
    }

    return { campaigns, invites }
}
