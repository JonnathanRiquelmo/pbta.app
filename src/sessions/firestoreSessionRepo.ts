import { collection, addDoc, query, where, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { Session, CreateSessionInput, UpdateSessionPatch } from './types'
import type { SessionRepo } from './sessionRepo'

export function createFirestoreSessionRepo(db: any): SessionRepo {
    // In-memory cache: campaignId -> Session[]
    const sessionsCache = new Map<string, Session[]>()
    const sessionByIdCache = new Map<string, Session>()

    return {
        listByCampaign: (campaignId) => {
            return sessionsCache.get(campaignId) || []
        },

        getById: (id) => {
            return sessionByIdCache.get(id)
        },

        create: (campaignId, createdBy, data) => {
            const now = Date.now()
            const session: Session = {
                id: '', // Will be set by Firestore
                campaignId,
                name: data.name,
                date: data.date,
                masterNotes: data.masterNotes || '',
                summary: data.summary || '',
                createdAt: now,
                createdBy,
                updatedAt: now
            }

                // Async operation - fire and forget
                void (async () => {
                    try {
                        const ref = collection(db, 'sessions')
                        const docRef = await addDoc(ref, {
                            campaignId,
                            name: data.name,
                            date: data.date,
                            masterNotes: data.masterNotes || '',
                            summary: data.summary || '',
                            createdAt: now,
                            createdBy,
                            updatedAt: now
                        })
                        session.id = docRef.id

                        // Update cache
                        sessionByIdCache.set(session.id, session)
                        const campaignSessions = sessionsCache.get(campaignId) || []
                        sessionsCache.set(campaignId, [...campaignSessions, session])
                    } catch (error) {
                        console.error('Error creating session:', error)
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
                        const sessionRef = doc(db, 'sessions', id)
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
                        console.error('Error updating session:', error)
                    }
                })()

            return { ok: true, session: updatedSession }
        },

        remove: (campaignId, id) => {
            // Async operation - fire and forget
            void (async () => {
                try {
                    const sessionRef = doc(db, 'sessions', id)
                    await deleteDoc(sessionRef)

                    // Update cache
                    sessionByIdCache.delete(id)
                    const campaignSessions = sessionsCache.get(campaignId) || []
                    const filteredSessions = campaignSessions.filter(s => s.id !== id)
                    sessionsCache.set(campaignId, filteredSessions)
                } catch (error) {
                    console.error('Error deleting session:', error)
                }
            })()

            return { ok: true }
        },

        subscribe: (campaignId, callback) => {
            const ref = collection(db, 'sessions')
            const q = query(ref, where('campaignId', '==', campaignId))

            const unsubscribe = onSnapshot(q, snapshot => {
                const sessions: Session[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Session))

                sessionsCache.set(campaignId, sessions)

                // Also update by-id cache
                sessions.forEach(session => {
                    sessionByIdCache.set(session.id, session)
                })

                callback(sessions)
            }, error => {
                console.error('Error in sessions subscription:', error)
            })

            return unsubscribe
        }
    }
}
