import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../contexts/AuthContext'

type Roll = {
  id: string
  rollerUid: string
  campaignId?: string
  characterId?: string
  total?: number
  timestamp?: any
}

type RollList = {
  items: Roll[]
  count: number
  loading: boolean
  error: Error | null
}

export function useRollsForUser(uid?: string): RollList {
  const [items, setItems] = useState<Roll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const q = useMemo(() => {
    if (!uid) return null
    return query(collection(db, 'rolls'), where('rollerUid', '==', uid))
  }, [uid])

  useEffect(() => {
    if (!q) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = onSnapshot(
      q,
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
  }, [q])

  return { items, count: items.length, loading, error }
}

export function useRolls(): RollList {
  const { user } = useAuth()
  return useRollsForUser(user?.uid)
}