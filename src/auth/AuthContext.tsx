import { useEffect, createContext, useContext, ReactNode, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '../firebase/client'
import { mapUser } from './firebase'
import { useAppStore } from '@shared/store/appStore'

type AuthContextType = {
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({ loading: true })

export function useAuthContext() {
    return useContext(AuthContext)
}

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
