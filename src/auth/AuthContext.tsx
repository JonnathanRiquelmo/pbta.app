import { useEffect, createContext, useContext, ReactNode, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '../firebase/client'
import { getDb } from '@fb/client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { mapUser } from './firebase'
import { useAppStore } from '@shared/store/appStore'

type AuthContextType = {
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({ loading: true })

export function useAuthContext() {
    return useContext(AuthContext)
}

import type { Campaign } from '@campaigns/types'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true)
    const setUser = useAppStore(s => s.setUser)
    const logout = useAppStore(s => s.logout)

    useEffect(() => {
        const auth = getFirebaseAuth()
        if (!auth) {
            setLoading(false)
            return
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const user = mapUser(firebaseUser)
                setUser(user)
                useAppStore.getState().initSubscriptions(user.uid)
                if (user.role === 'player') {
                    void (async () => {
                        const dbi = getDb()
                        if (dbi) {
                            try {
                                const ref = collection(dbi, 'campaigns')
                                const qy = query(ref, where('playersUids', 'array-contains', user.uid))
                                const snap = await getDocs(qy)
                                const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign))
                                useAppStore.setState({ acceptedCampaigns: items, acceptedCampaignsLoading: false })
                            } catch (e) {
                                console.warn('player initial fetch failed', e)
                                useAppStore.setState({ acceptedCampaignsLoading: false })
                            }
                        }
                    })()
                }
            } else {
                // Cleanup subscriptions on logout
                useAppStore.getState().cleanupSubscriptions()
                logout()
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [setUser, logout])

    return (
        <AuthContext.Provider value={{ loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
