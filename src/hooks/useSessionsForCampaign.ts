import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'

export type Session = {
  id: string
  campaignId: string
  date: string
  summary?: string
  gmNotes?: string
  publicNotes?: string
  title?: string
}

type SessionList = {
  items: Session[]
  count: number
  loading: boolean
  error: Error | null
}

export function useSessionsForCampaign(campaignId?: string): SessionList {
  const [items, setItems] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const q = useMemo(() => {
    if (bypass) return null
    if (!campaignId) return null
    return query(collection(db, 'sessions'), where('campaignId', '==', campaignId))
  }, [campaignId, bypass])

  useEffect(() => {
    if (bypass) {
      try {
        const raw = localStorage.getItem('bypass:sessions')
        const all = raw ? JSON.parse(raw) as Session[] : []
        const list = campaignId ? all.filter(s => s.campaignId === campaignId) : []
        setItems(list)
        setLoading(false)
      } catch (e) {
        setError(e as Error)
        setLoading(false)
      }
      return
    }
    if (!q) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = onSnapshot(
      q,
      snap => {
        const list: Session[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Session, 'id'>
          list.push({ id: doc.id, ...data })
        })
        setItems(list)
        setLoading(false)
      },
      err => {
        setError(err as Error)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [q, campaignId, bypass])

  return { items, count: items.length, loading, error }
}