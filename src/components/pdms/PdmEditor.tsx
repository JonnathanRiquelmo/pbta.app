import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Spinner } from '../common'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { updatePdm, generatePublicShareId } from '../../services/characters.service'
import { useMode } from '../../contexts/ModeContext'

type PdmDoc = {
  id: string
  ownerUid: string
  name?: string
  isPrivateToMaster?: boolean
  publicShareId?: string
}

export default function PdmEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()
  const { isMaster } = useMode()

  const [pdm, setPdm] = useState<PdmDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)

  const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')
  useEffect(() => {
    if (!id) return
    setLoading(true)
    if (bypass) {
      const raw = localStorage.getItem('bypass:characters')
      const all = raw ? JSON.parse(raw) as PdmDoc[] : []
      const found = all.find(c => c.id === id) ?? null
      setPdm(found)
      setName(found?.name ?? '')
      setIsPrivate(!!found?.isPrivateToMaster)
      setShareToken(found?.publicShareId ?? null)
      setLoading(false)
      return
    }
    const ref = doc(db, 'characters', id)
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) {
        setPdm(null)
        setLoading(false)
        return
      }
      const data = snap.data() as Omit<PdmDoc, 'id'>
      const docData: PdmDoc = { id: snap.id, ...data }
      setPdm(docData)
      setName(docData.name ?? '')
      setIsPrivate(!!docData.isPrivateToMaster)
      setShareToken(docData.publicShareId ?? null)
      setLoading(false)
    })
    return () => unsub()
  }, [id, bypass])

  const isOwner = !!user && !!pdm && pdm.ownerUid === user.uid
  const canSave = !!id && !!user && isOwner && online && !saving && name.trim().length > 0

  const handleSave = async () => {
    if (!canSave || !id || !user) return
    setSaving(true)
    try {
      const payload: Partial<{ name: string; isPrivateToMaster: boolean }> = { name: name.trim() }
      if (isMaster()) payload.isPrivateToMaster = isPrivate
      await updatePdm(id, payload, user.uid)
      push('PDM salvo com sucesso')
    } catch (err) {
      push('Você não tem permissão para editar este PDM')
    } finally {
      setSaving(false)
    }
  }

  const [generatingLink, setGeneratingLink] = useState(false)
  const handleGenerateLink = async () => {
    if (!id || !user || !isOwner || generatingLink) return
    setGeneratingLink(true)
    try {
      const token = await generatePublicShareId(id, user.uid)
      setShareToken(token)
      const url = `${location.origin}${location.pathname}#` + `/public/npc/${token}`
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

  if (!pdm) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>PDM não encontrado</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>Editar PDM</CardHeader>
        <CardBody>
          {!isOwner && (
            <div style={{ color: 'var(--color-danger-600)', marginBottom: 'var(--space-3)' }}>
              Você não tem permissão para editar este PDM.
            </div>
          )}
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Nome" required disabled={!isOwner} />
            {isMaster() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.currentTarget.checked)} disabled={!isOwner} />
                <span>Privado ao Mestre</span>
              </div>
            )}
          </div>
          {isOwner && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {!shareToken ? (
                <Button onClick={handleGenerateLink} disabled={!online || generatingLink}>Gerar link público</Button>
              ) : (
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--color-neutral-700)' }}>Link público pronto</span>
                  <Button onClick={async () => { await navigator.clipboard.writeText(`#` + `/public/npc/${shareToken}`); push('Link público copiado'); }} variant="ghost">Copiar</Button>
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