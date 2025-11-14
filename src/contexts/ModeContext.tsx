import { createContext, useContext, useMemo, ReactNode } from 'react'
import { useAuth } from './AuthContext'

type Mode = 'PLAYER' | 'MASTER'

type ModeContextValue = {
  mode: Mode
  isMaster: (email?: string) => boolean
}

const MASTER_EMAIL = 'jonnathan.riquelmo@gmail.com'

const ModeContext = createContext<ModeContextValue>({
  mode: 'PLAYER',
  isMaster: () => false
})

export function ModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const isMaster = (email?: string) => {
    const e = (email ?? user?.email ?? '').toLowerCase()
    return e === MASTER_EMAIL
  }

  const mode: Mode = isMaster() ? 'MASTER' : 'PLAYER'

  const value = useMemo(() => ({ mode, isMaster }), [mode, user?.email])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  return useContext(ModeContext)
}