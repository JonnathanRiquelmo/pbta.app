import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

type Session = {
  id: string
  campaignId: string
  date: string
  summary?: string
  gmNotes?: string
  publicNotes?: string
  title?: string
}

type SessionResult = {
  session: Session | null
  loading: boolean
  error: Error | null
}

export function useSessionById(id?: string): SessionResult {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const ref = useMemo(() => {
    if (bypass) return null
    if (!id) return null
    return doc(db, 'sessions', id)
  }, [id, bypass])

  useEffect(() => {
    if (bypass) {
      try {
        const raw = localStorage.getItem('bypass:sessions')
        const all = raw ? JSON.parse(raw) as Session[] : []
        const s = id ? all.find(i => i.id === id) ?? null : null
        setSession(s)
        setLoading(false)
      } catch (e) {
        setError(e as Error)
        setLoading(false)
      }
      return
    }
    if (!ref) {
      setSession(null)
      setLoading(false)
      return
    }
    setLoading(true)
    getDoc(ref)
      .then(snap => {
        if (!snap.exists()) {
          setSession(null)
          setLoading(false)
          return
        }
        const data = snap.data() as Omit<Session, 'id'>
        setSession({ id: snap.id, ...data })
        setLoading(false)
      })
      .catch(e => {
        setError(e as Error)
        setLoading(false)
      })
  }, [ref, id, bypass])

  return { session, loading, error }
}