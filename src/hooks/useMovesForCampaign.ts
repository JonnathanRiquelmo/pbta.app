import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'

export type Move = {
  id: string
  campaignId: string
  name: string
  description?: string
  trigger?: string
  rollFormula?: string
  results?: {
    on10Plus?: string
    on7to9?: string
    onMiss?: string
  }
}

type MoveList = {
  items: Move[]
  count: number
  loading: boolean
  error: Error | null
}

export function useMovesForCampaign(campaignId?: string): MoveList {
  const [items, setItems] = useState<Move[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const q = useMemo(() => {
    if (bypass) return null
    if (!campaignId) return null
    return query(
      collection(db, 'moves'),
      where('campaignId', '==', campaignId)
    )
  }, [campaignId, bypass])

  useEffect(() => {
    if (bypass) {
      try {
        const raw = localStorage.getItem('bypass:moves')
        const all = raw ? JSON.parse(raw) as Move[] : []
        const list = campaignId ? all.filter(m => m.campaignId === campaignId) : []
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
        const list: Move[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Move, 'id'>
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