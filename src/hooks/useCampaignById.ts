import { useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

type Campaign = {
  id: string
  name?: string
  description?: string
  ownerUid?: string
  players?: string[]
  ruleSet?: string
  plot?: string
}

type CampaignState = {
  campaign: Campaign | null
  loading: boolean
  error: Error | null
}

export function useCampaignById(id?: string): CampaignState {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const ref = useMemo(() => {
    if (!id) return null
    return doc(db, 'campaigns', id)
  }, [id])

  useEffect(() => {
    if (!ref) {
      setCampaign(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = onSnapshot(
      ref,
      snap => {
        if (!snap.exists()) {
          setCampaign(null)
          setLoading(false)
          return
        }
        const data = snap.data() as Omit<Campaign, 'id'>
        setCampaign({ id: snap.id, ...data })
        setLoading(false)
      },
      err => {
        setError(err as Error)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [ref])

  return { campaign, loading, error }
}