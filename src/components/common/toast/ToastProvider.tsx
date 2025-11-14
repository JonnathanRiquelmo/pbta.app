import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import './toast.css'
import { useNetworkStatus } from '../../../hooks/useNetworkStatus'

type Toast = { id: number; message: string }

type ToastCtx = {
  toasts: Toast[]
  push: (message: string) => void
  remove: (id: number) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { online } = useNetworkStatus()
  const value = useMemo<ToastCtx>(() => ({
    toasts,
    push: (message: string) => {
      setToasts((t) => {
        if (t.some((x) => x.message === message)) return t
        const id = Date.now() + Math.random()
        setTimeout(() => {
          setToasts((cur) => cur.filter((x) => x.id !== id))
        }, 4000)
        return [...t, { id, message }]
      })
    },
    remove: (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
  }), [toasts])

  const lastOnline = useRef<boolean | null>(null)
  useEffect(() => {
    if (lastOnline.current === online) return
    if (lastOnline.current === null) {
      if (!online) value.push('Sem conexão com a internet')
      lastOnline.current = online
      return
    }
    value.push(online ? 'Conexão restaurada' : 'Sem conexão com a internet')
    lastOnline.current = online
  }, [online])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => value.remove(t.id)} aria-label="Fechar">×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('ToastProvider ausente')
  return ctx
}