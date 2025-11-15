import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'

type Mode = 'PLAYER' | 'MASTER'

type ModeContextValue = {
  mode: Mode
  isMaster: (email?: string) => boolean
}

const MASTER_EMAIL = (import.meta.env.VITE_MASTER_EMAIL ?? 'jonnathan.riquelmo@gmail.com').toLowerCase()

const ModeContext = createContext<ModeContextValue>({
  mode: 'PLAYER',
  isMaster: () => false
})

export function ModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const isMaster = useCallback((email?: string) => {
    const e = (email ?? user?.email ?? '').toLowerCase()
    return e === MASTER_EMAIL
  }, [user?.email])

  const mode: Mode = isMaster() ? 'MASTER' : 'PLAYER'

  const value = useMemo(() => ({ mode, isMaster }), [mode, isMaster])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  return useContext(ModeContext)
}
