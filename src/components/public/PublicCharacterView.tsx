import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, Badge, Spinner } from '../common'
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useTitle } from '../../contexts/TitleContext'

type CharacterDoc = {
  id: string
  ownerUid: string
  name?: string
  playbook?: string
  stats?: Record<string, number>
  moves?: string[]
  publicShareId?: string
  isNPC?: boolean
}

export default function PublicCharacterView() {
  const { publicShareId } = useParams()
  const [sheet, setSheet] = useState<CharacterDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const { setTitle, setActions } = useTitle()

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

  const q = useMemo(() => {
    if (bypass) return null
    if (!publicShareId) return null
    return query(
      collection(db, 'characters'),
      where('publicShareId', '==', publicShareId),
      where('isNPC', '==', false),
      limit(1)
    )
  }, [publicShareId, bypass])

  useEffect(() => {
    setLoading(true)
    if (bypass) {
      try {
        const raw = localStorage.getItem('bypass:characters')
        const all = raw ? JSON.parse(raw) as CharacterDoc[] : []
        const found = all.find(c => c.publicShareId === publicShareId && c.isNPC === false) ?? null
        setSheet(found)
      } finally {
        setLoading(false)
      }
      return
    }
    if (!q) {
      setSheet(null)
      setLoading(false)
      return
    }
    const unsub = onSnapshot(q, snap => {
      if (snap.empty) {
        setSheet(null)
        setLoading(false)
        return
      }
      const d = snap.docs[0]
      const data = d.data() as Omit<CharacterDoc, 'id'>
      setSheet({ id: d.id, ...data })
      setLoading(false)
      console.info('page_view_public_character')
    }, () => setLoading(false))
    return () => unsub()
  }, [q, publicShareId, bypass])

  useEffect(() => {
    const name = sheet?.name?.trim() ?? ''
    setTitle(name.length > 0 ? name : 'Ficha Pública')
    setActions([{ label: 'Copiar link', iconLeft: <span aria-hidden>🔗</span>, onClick: async () => { try { await navigator.clipboard.writeText(location.href) } catch { void 0 } } }])
    return () => setActions([])
  }, [sheet?.name, setTitle, setActions])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (!sheet) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Ficha pública não encontrada</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <span>{sheet.name ?? 'Sem nome'}</span>
            {sheet.playbook && <Badge>{sheet.playbook}</Badge>}
          </div>
        </CardHeader>
        <CardBody>
          {sheet.stats && Object.keys(sheet.stats).length > 0 && (
            <div style={{ display: 'grid', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <strong>Atributos</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-2)' }}>
                {Object.entries(sheet.stats).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-neutral-700)' }}>{key}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sheet.moves && sheet.moves.length > 0 && (
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              <strong>Moves</strong>
              <ul style={{ margin: 0, paddingLeft: 'var(--space-3)' }}>
                {sheet.moves.map((m, idx) => (
                  <li key={idx} style={{ color: 'var(--color-neutral-700)' }}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}