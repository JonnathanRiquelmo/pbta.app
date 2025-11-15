import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../contexts/AuthContext'

type Campaign = {
  id: string
  name?: string
  description?: string
  ownerUid?: string
  players?: string[]
  ruleSet?: string
}

type CampaignList = {
  items: Campaign[]
  count: number
  loading: boolean
  error: Error | null
}

export function useMasterCampaignsForOwner(ownerUid?: string): CampaignList {
  const [items, setItems] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const q = useMemo(() => {
    if (!ownerUid) return null
    return query(collection(db, 'campaigns'), where('ownerUid', '==', ownerUid))
  }, [ownerUid])

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
        const list: Campaign[] = []
        snap.forEach(doc => {
          const data = doc.data() as Omit<Campaign, 'id'>
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

export function useMasterCampaigns(): CampaignList {
  const { user } = useAuth()
  return useMasterCampaignsForOwner(user?.uid)
}