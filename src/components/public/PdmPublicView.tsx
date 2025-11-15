import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, Spinner } from '../common'
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore'
import { db } from '../../../firebase/config'

type PdmDoc = {
  id: string
  ownerUid: string
  name?: string
  publicShareId?: string
  isNPC?: boolean
}

export default function PdmPublicView() {
  const { publicShareId } = useParams()
  const [pdm, setPdm] = useState<PdmDoc | null>(null)
  const [loading, setLoading] = useState(true)

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const q = useMemo(() => {
    if (bypass) return null
    if (!publicShareId) return null
    return query(
      collection(db, 'characters'),
      where('publicShareId', '==', publicShareId),
      where('isNPC', '==', true),
      limit(1)
    )
  }, [publicShareId, bypass])

  useEffect(() => {
    setLoading(true)
    if (bypass) {
      try {
        const raw = localStorage.getItem('bypass:characters')
        const all = raw ? JSON.parse(raw) as PdmDoc[] : []
        const found = all.find(c => c.publicShareId === publicShareId && c.isNPC === true) ?? null
        setPdm(found)
      } finally {
        setLoading(false)
      }
      return
    }
    if (!q) {
      setPdm(null)
      setLoading(false)
      return
    }
    const unsub = onSnapshot(q, snap => {
      if (snap.empty) {
        setPdm(null)
        setLoading(false)
        return
      }
      const d = snap.docs[0]
      const data = d.data() as Omit<PdmDoc, 'id'>
      setPdm({ id: d.id, ...data })
      setLoading(false)
      console.info('page_view_public_pdm')
    }, () => setLoading(false))
    return () => unsub()
  }, [q, publicShareId, bypass])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (!pdm) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>PDM público não encontrado</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <span>{pdm.name ?? 'Sem nome'}</span>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ color: 'var(--color-neutral-700)' }}>NPC</div>
        </CardBody>
      </Card>
    </div>
  )
}