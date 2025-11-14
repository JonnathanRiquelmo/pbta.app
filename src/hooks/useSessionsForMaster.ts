import { useEffect, useMemo, useState } from 'react'
import { useOwnedCampaigns } from './useOwnedCampaigns'

type SessionsSummary = {
  count: number
  loading: boolean
  error: Error | null
}

export function useSessionsForMaster(): SessionsSummary {
  const campaigns = useOwnedCampaigns()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const computed = useMemo(() => {
    if (campaigns.error) return { count: 0, loading: false, error: campaigns.error }
    const total = campaigns.items.reduce((acc, c) => {
      const s = Array.isArray(c.sessions) ? c.sessions.length : 0
      return acc + s
    }, 0)
    return { count: total, loading: campaigns.loading, error: null }
  }, [campaigns.items, campaigns.loading, campaigns.error])

  useEffect(() => {
    setCount(computed.count)
    setLoading(computed.loading)
    setError(computed.error)
  }, [computed.count, computed.loading, computed.error])

  return { count, loading, error }
}