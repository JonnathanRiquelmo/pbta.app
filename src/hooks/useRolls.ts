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
  timestamp?: Date
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
  const BYPASS = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const q = useMemo(() => {
    if (!uid) return null
    return query(collection(db, 'rolls'), where('rollerUid', '==', uid))
  }, [uid])

  useEffect(() => {
    if (BYPASS) {
      const readBypass = () => {
        const raw = localStorage.getItem('bypass:rolls')
        const all = raw ? (JSON.parse(raw) as (Omit<Roll, 'id'> & { id: string })[]) : []
        const filtered = uid ? all.filter(r => r.rollerUid === uid) : []
        setItems(filtered)
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
  }, [q, BYPASS, uid])

  return { items, count: items.length, loading, error }
}

export function useRolls(): RollList {
  const { user } = useAuth()
  return useRollsForUser(user?.uid)
}