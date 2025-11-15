import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Spinner } from '../common'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { updateCharacter } from '../../services/characters.service'

type CharacterDoc = {
  id: string
  ownerUid: string
  name?: string
  playbook?: string
}

export default function SheetEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()

  const [sheet, setSheet] = useState<CharacterDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [playbook, setPlaybook] = useState('')

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')
  useEffect(() => {
    if (!id) return
    setLoading(true)
    if (bypass) {
      const raw = localStorage.getItem('bypass:characters')
      const all = raw ? JSON.parse(raw) as CharacterDoc[] : []
      const found = all.find(c => c.id === id) ?? null
      setSheet(found)
      setName(found?.name ?? '')
      setPlaybook(found?.playbook ?? '')
      setLoading(false)
      return
    }
    const ref = doc(db, 'characters', id)
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) {
        setSheet(null)
        setLoading(false)
        return
      }
      const data = snap.data() as Omit<CharacterDoc, 'id'>
      const docData: CharacterDoc = { id: snap.id, ...data }
      setSheet(docData)
      setName(docData.name ?? '')
      setPlaybook(docData.playbook ?? '')
      setLoading(false)
    })
    return () => unsub()
  }, [id, bypass])

  const isOwner = !!user && !!sheet && sheet.ownerUid === user.uid
  const canSave = !!id && !!user && isOwner && online && !saving && name.trim().length > 0

  const handleSave = async () => {
    if (!canSave || !id || !user) return
    setSaving(true)
    try {
      await updateCharacter(id, { name: name.trim(), playbook: playbook.trim() }, user.uid)
      push('Ficha salva com sucesso')
    } catch (err) {
      push('Você não tem permissão para editar esta ficha')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (!sheet) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Ficha não encontrada</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>Editar Ficha</CardHeader>
        <CardBody>
          {!isOwner && (
            <div style={{ color: 'var(--color-danger-600)', marginBottom: 'var(--space-3)' }}>
              Você não tem permissão para editar esta ficha.
            </div>
          )}
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Nome" required disabled={!isOwner} />
            <Input value={playbook} onChange={e => setPlaybook(e.currentTarget.value)} placeholder="Playbook" disabled={!isOwner} />
          </div>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate(-1)} variant="ghost">Voltar</Button>
            <Button onClick={handleSave} disabled={!canSave}>Salvar</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}