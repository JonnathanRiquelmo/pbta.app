import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Spinner, Tabs } from '../common'
import { createSession, updateSession } from '../../services/sessions.service'
import { useSessionById } from '../../hooks/useSessionById'
import { useToast } from '../common'
import StickyCTA from '../layout/StickyCTA'
import { useTitle } from '../../contexts/TitleContext'

export default function SessionEditor() {
  const { id, sessionId } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const { session, loading } = useSessionById(sessionId)
  const { setTitle, setActions } = useTitle()

  const [title, setTitleState] = useState('')
  const [date, setDate] = useState('')
  const [summary, setSummary] = useState('')
  const [gmNotes, setGmNotes] = useState('')
  const [publicNotes, setPublicNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = (date.trim().length > 0) && !saving && (id ?? '')

  const handleSave = useCallback(async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const payload = {
        campaignId: id ?? '',
        date: date.trim(),
        summary: summary,
        gmNotes: gmNotes,
        publicNotes: publicNotes,
        title: title
      }
      if (session?.id) {
        await updateSession(session.id, payload)
        push('Sessão atualizada')
      } else {
        await createSession(payload)
        push('Sessão criada')
      }
      navigate(`/master/campaigns/${id}/sessions`)
    } catch {
      push('Erro ao salvar sessão')
    } finally {
      setSaving(false)
    }
  }, [canSave, id, date, summary, gmNotes, publicNotes, title, session?.id, push, navigate])

  useEffect(() => {
    setTitle(session?.title ?? (session?.id ? 'Editar Sessão' : 'Nova Sessão'))
    setActions([{ label: session?.id ? 'Salvar' : 'Criar', iconLeft: <span aria-hidden>💾</span>, onClick: handleSave, disabled: !canSave }])
    setDate(session?.date ?? '')
    setSummary(session?.summary ?? '')
    setGmNotes(session?.gmNotes ?? '')
    setPublicNotes(session?.publicNotes ?? '')
    return () => setActions([])
  }, [session, setTitle, setActions, handleSave, canSave])

 

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <span>{session?.id ? 'Editar Sessão' : 'Nova Sessão'}</span>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input value={title} onChange={e => setTitleState(e.currentTarget.value)} placeholder="Título/Número da sessão" />
            <Input value={date} onChange={e => setDate(e.currentTarget.value)} placeholder="Data (YYYY-MM-DD)" />
            <textarea
              value={summary}
              onChange={e => setSummary(e.currentTarget.value)}
              placeholder="Resumo"
              style={{ width: '100%', minHeight: 120, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }}
            />
            <Tabs
              items={[
                {
                  id: 'public',
                  label: 'Notas públicas',
                  content: (
                    <textarea
                      value={publicNotes}
                      onChange={e => setPublicNotes(e.currentTarget.value)}
                      placeholder="Notas públicas"
                      style={{ width: '100%', minHeight: 160, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }}
                    />
                  )
                },
                {
                  id: 'gm',
                  label: 'Notas do mestre',
                  content: (
                    <textarea
                      value={gmNotes}
                      onChange={e => setGmNotes(e.currentTarget.value)}
                      placeholder="Notas privadas do mestre"
                      style={{ width: '100%', minHeight: 160, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }}
                    />
                  )
                }
              ]}
            />
          </div>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button onClick={() => navigate(-1)} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave}>{saving ? <Spinner /> : (session?.id ? 'Salvar' : 'Criar')}</Button>
          </div>
        </CardFooter>
      </Card>
      <StickyCTA
        primaryLabel={session?.id ? 'Salvar' : 'Criar'}
        onPrimaryClick={handleSave}
        primaryDisabled={!canSave}
        secondary={[{ label: 'Cancelar', onClick: () => navigate(-1) }]}
      />
    </div>
  )
}