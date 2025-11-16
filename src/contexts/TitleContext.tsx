import { createContext, useContext, useMemo, useState, ReactNode } from 'react'

type HeaderAction = { label: string; onClick: () => void; iconLeft?: React.ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }

type TitleContextValue = {
  title: string
  setTitle: (t: string) => void
  actions: HeaderAction[]
  setActions: (a: HeaderAction[]) => void
}

const TitleContext = createContext<TitleContextValue>({ title: '', setTitle: () => {}, actions: [], setActions: () => {} })

export function TitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('')
  const [actions, setActions] = useState<HeaderAction[]>([])
  const value = useMemo(() => ({ title, setTitle, actions, setActions }), [title, actions])
  return <TitleContext.Provider value={value}>{children}</TitleContext.Provider>
}

export function useTitle() {
  return useContext(TitleContext)
}