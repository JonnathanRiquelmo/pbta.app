import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { Session } from './types'
import type { SessionRepo } from './sessionRepo'
import { logger } from '@shared/utils/logger'

export function createFirestoreSessionRepo(db: unknown): SessionRepo {
    const _db = db as Firestore
    // In-memory cache: campaignId -> Session[]
    const sessionsCache = new Map<string, Session[]>()
    const sessionByIdCache = new Map<string, Session>()

    return {
        listByCampaign: (campaignId) => {
            const sessions = sessionsCache.get(campaignId) || []
            return sessions.filter(s => !s.deleted)
        },

        getById: (id) => {
            return sessionByIdCache.get(id)
        },

        create: (campaignId, createdBy, data) => {
            const now = Date.now()
            const ref = collection(_db, 'sessions')
            const docRef = doc(ref) // Sync ID generation

            const session: Session = {
                id: docRef.id,
                campaignId,
                name: data.name,
                date: data.date,
                masterNotes: data.masterNotes || '',
                summary: data.summary || '',
                createdAt: now,
                createdBy,
                updatedAt: now
            }

            // Update cache
            sessionByIdCache.set(session.id, session)
            const campaignSessions = sessionsCache.get(campaignId) || []
            sessionsCache.set(campaignId, [...campaignSessions, session])

            // Async operation - fire and forget
            void (async () => {
                try {
                    await setDoc(docRef, {
                        campaignId,
                        name: data.name,
                        date: data.date,
                        masterNotes: data.masterNotes || '',
                        summary: data.summary || '',
                        createdAt: now,
                        createdBy,
                        updatedAt: now
                    })
                } catch (error) {
                    logger.error('Error creating session:', error)
                }
            })()

            return { ok: true, session }
        },

        update: (campaignId, id, patch) => {
            const existingSession = sessionByIdCache.get(id)
            if (!existingSession) {
                return { ok: false, message: 'Session not found' }
            }

            const now = Date.now()
            const updatedSession: Session = {
                ...existingSession,
                ...patch,
                updatedAt: now
            }

                // Async operation - fire and forget
                void (async () => {
                    try {
                        const sessionRef = doc(_db, 'sessions', id)
                        await updateDoc(sessionRef, {
                            ...patch,
                            updatedAt: now
                        })

                        // Update cache
                        sessionByIdCache.set(id, updatedSession)
                        const campaignSessions = sessionsCache.get(campaignId) || []
                        const updatedSessions = campaignSessions.map(s => s.id === id ? updatedSession : s)
                        sessionsCache.set(campaignId, updatedSessions)
                    } catch (error) {
                        logger.error('Error updating session:', error)
                    }
                })()

            return { ok: true, session: updatedSession }
        },

        remove: (campaignId, id, deletedBy) => {
            // Soft delete - marca como deletada em vez de excluir fisicamente
            void (async () => {
                try {
                    const sessionRef = doc(_db, 'sessions', id)
                    const now = Date.now()
                    await updateDoc(sessionRef, {
                        deleted: true,
                        deletedAt: now,
                        deletedBy: deletedBy
                    })

                    // Update cache - marca como deletada
                    const existingSession = sessionByIdCache.get(id)
                    if (existingSession) {
                        const updatedSession = {
                            ...existingSession,
                            deleted: true,
                            deletedAt: now,
                            deletedBy: deletedBy
                        }
                        sessionByIdCache.set(id, updatedSession)
                        
                        const campaignSessions = sessionsCache.get(campaignId) || []
                        const updatedSessions = campaignSessions.map(s => s.id === id ? updatedSession : s)
                        sessionsCache.set(campaignId, updatedSessions)
                    }
                } catch (error) {
                    logger.error('Error deleting session:', error)
                }
            })()

            return { ok: true }
        },

        subscribe: (campaignId, callback) => {
            const ref = collection(_db, 'sessions')
            const q = query(ref, where('campaignId', '==', campaignId))

            const unsubscribe = onSnapshot(q, snapshot => {
                const sessions: Session[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Session))

                // Filtrar sessões deletadas antes de armazenar no cache
                const activeSessions = sessions.filter(s => !s.deleted)
                sessionsCache.set(campaignId, activeSessions)

                // Also update by-id cache (incluindo deletadas para referência)
                sessions.forEach(session => {
                    sessionByIdCache.set(session.id, session)
                })

                callback(activeSessions)
            }, error => {
                logger.error('Error in sessions subscription:', error)
            })

            return unsubscribe
        }
    }
}
