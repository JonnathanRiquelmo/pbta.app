import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

type Roll = {
  id: string
  rollerUid: string
  campaignId?: string
  characterId?: string
  total?: number
  timestamp?: unknown
}

type RollList = {
  items: Roll[]
  count: number
  loading: boolean
  error: Error | null
}

export function useRollsAll(): RollList {
  const [items, setItems] = useState<Roll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const BYPASS = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  useEffect(() => {
    if (BYPASS) {
      const readBypass = () => {
        const raw = localStorage.getItem('bypass:rolls')
        const all = raw ? (JSON.parse(raw) as (Omit<Roll, 'id'> & { id: string })[]) : []
        setItems(all)
        setLoading(false)
      }
      setLoading(true)
      readBypass()
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'bypass:rolls') readBypass()
      }
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    }
    setLoading(true)
    const unsub = onSnapshot(
      collection(db, 'rolls'),
      snap => {
        const list: Roll[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Roll, 'id'>
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
  }, [BYPASS])

  return { items, count: items.length, loading, error }
}