import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Spinner } from '../common'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { updateCharacter, generatePublicShareId } from '../../services/characters.service'
import { useTitle } from '../../contexts/TitleContext'

type CharacterDoc = {
  id: string
  ownerUid: string
  name?: string
  playbook?: string
  publicShareId?: string
}

export default function SheetEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()
  const { setTitle, setActions } = useTitle()

  const [sheet, setSheet] = useState<CharacterDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [playbook, setPlaybook] = useState('')
  const [shareToken, setShareToken] = useState<string | null>(null)

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
      setShareToken(found?.publicShareId ?? null)
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
      setShareToken(docData.publicShareId ?? null)
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

  useEffect(() => {
    const t = sheet?.name?.trim() ?? ''
    setTitle(t.length > 0 ? t : 'Editar Ficha')
    setActions([{ label: 'Salvar', iconLeft: <span aria-hidden>💾</span>, onClick: handleSave, disabled: !canSave }])
    return () => setActions([])
  }, [sheet?.name, canSave])

  const [generatingLink, setGeneratingLink] = useState(false)
  const handleGenerateLink = async () => {
    if (!id || !user || !isOwner || generatingLink) return
    setGeneratingLink(true)
    try {
      const token = await generatePublicShareId(id, user.uid)
      setShareToken(token)
      const url = `${location.origin}${location.pathname}#` + `/public/character/${token}`
      await navigator.clipboard.writeText(url)
      push('Link público copiado para a área de transferência')
    } catch {
      push('Erro ao gerar link público')
    } finally {
      setGeneratingLink(false)
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
          {isOwner && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {!shareToken ? (
                <Button onClick={handleGenerateLink} disabled={!online || generatingLink}>Gerar link público</Button>
              ) : (
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--color-neutral-700)' }}>Link público pronto</span>
                  <Button onClick={async () => { await navigator.clipboard.writeText(`#` + `/public/character/${shareToken}`); push('Link público copiado'); }} variant="ghost">Copiar</Button>
                </div>
              )}
            </div>
          )}
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