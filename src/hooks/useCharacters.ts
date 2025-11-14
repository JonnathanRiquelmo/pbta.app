import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../contexts/AuthContext'

type Character = {
  id: string
  name?: string
  ownerUid: string
  campaignId?: string
  isNPC?: boolean
}

type CharacterList = {
  items: Character[]
  count: number
  loading: boolean
  error: Error | null
}

export function useCharactersForUser(uid?: string): CharacterList {
  const [items, setItems] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const q = useMemo(() => {
    if (!uid) return null
    return query(
      collection(db, 'characters'),
      where('ownerUid', '==', uid),
      where('isNPC', '==', false)
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
        const list: Character[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Character, 'id'>
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

export function useCharacters(): CharacterList {
  const { user } = useAuth()
  return useCharactersForUser(user?.uid)
}