import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../contexts/AuthContext'

type Pdm = {
  id: string
  name?: string
  ownerUid: string
  isNPC: boolean
  isPrivateToMaster?: boolean
  campaignId?: string
}

type PdmList = {
  items: Pdm[]
  count: number
  loading: boolean
  error: Error | null
}

export function usePdmsForUser(uid?: string): PdmList {
  const [items, setItems] = useState<Pdm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const q = useMemo(() => {
    if (!uid) return null
    return query(
      collection(db, 'characters'),
      where('ownerUid', '==', uid),
      where('isNPC', '==', true)
    )
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
        const list: Pdm[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Pdm, 'id'>
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

export function usePdms(): PdmList {
  const { user } = useAuth()
  return usePdmsForUser(user?.uid)
}