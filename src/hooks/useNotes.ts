import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../contexts/AuthContext'

export type Note = {
  id: string
  ownerUid: string
  type: 'character' | 'session' | 'global'
  title?: string
  content?: string
  tags?: string[]
  updatedAt: string | Date
}

type NoteList = {
  items: Note[]
  count: number
  loading: boolean
  error: Error | null
}

export function useNotes(): NoteList {
  const { user } = useAuth()
  const [items, setItems] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const q = useMemo(() => {
    if (bypass) return null
    if (!user?.uid) return null
    return query(
      collection(db, 'notes'),
      where('ownerUid', '==', user.uid)
    )
  }, [user?.uid, bypass])

  useEffect(() => {
    if (bypass) {
      try {
        const raw = localStorage.getItem('bypass:notes')
        const all = raw ? JSON.parse(raw) as Note[] : []
        const list = user?.uid ? all.filter(n => n.ownerUid === user.uid) : []
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
        const list: Note[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Note, 'id'>
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
  }, [q, user?.uid, bypass])

  return { items, count: items.length, loading, error }
}