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

  useEffect(() => {
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
  }, [])

  return { items, count: items.length, loading, error }
}