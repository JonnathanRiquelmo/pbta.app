import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotes, Note } from '../hooks/useNotes'
import Input from '../components/common/input/Input'
import Button from '../components/common/button/Button'
import { Card, CardHeader, CardBody } from '../components/common/card/Card'
import EmptyState from '../components/common/empty-state/EmptyState'
import { createNote, updateNote, deleteNote } from '../services/notes.service'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

export default function Notes() {
  const { user } = useAuth()
  const { items, loading } = useNotes()
  const { online } = useNetworkStatus()

  const [type, setType] = useState<'character' | 'session' | 'global'>('global')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)

  const canSave = useMemo(() => {
    return !!user?.uid && (title.trim().length > 0 || content.trim().length > 0)
  }, [user?.uid, title, content])

  useEffect(() => {
    if (!editing) return
    setType(editing.type)
    setTitle(editing.title ?? '')
    setContent(editing.content ?? '')
  }, [editing])

  const resetForm = () => {
    setType('global')
    setTitle('')
    setContent('')
    setEditing(null)
  }

  type Draft = { id?: string; ownerUid: string; type: 'character' | 'session' | 'global'; title: string; content: string }

  const readDrafts = useCallback((): Draft[] => {
    try {
      const raw = localStorage.getItem('drafts:notes')
      return raw ? (JSON.parse(raw) as Draft[]) : []
    } catch {
      return []
    }
  }, [])

  function writeDrafts(items: Draft[]) {
    localStorage.setItem('drafts:notes', JSON.stringify(items))
  }

  const onSubmit = async () => {
    if (!user?.uid || !canSave) return
    if (!online) {
      const drafts = readDrafts()
      if (editing) {
        drafts.push({ id: editing.id, ownerUid: user.uid, type, title, content })
      } else {
        drafts.push({ ownerUid: user.uid, type, title, content })
      }
      writeDrafts(drafts)
      resetForm()
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateNote(editing.id, { type, title, content, tags: editing.tags })
      } else {
        await createNote({ ownerUid: user.uid, type, title, content })
      }
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    setSaving(true)
    try {
      await deleteNote(id)
      if (editing?.id === id) resetForm()
    } finally {
      setSaving(false)
    }
  }

  const pendingDrafts = useMemo(() => {
    return readDrafts().filter(d => d.ownerUid === user?.uid)
  }, [readDrafts, user?.uid])

  const syncDrafts = async () => {
    if (!user?.uid || !online) return
    const drafts = readDrafts()
    const mine = drafts.filter(d => d.ownerUid === user.uid)
    if (mine.length === 0) return
    setSaving(true)
    try {
      for (const d of mine) {
        if (d.id) {
          await updateNote(d.id, { type: d.type, title: d.title, content: d.content })
        } else {
          await createNote({ ownerUid: user.uid, type: d.type, title: d.title, content: d.content })
        }
      }
      const remaining = drafts.filter(d => d.ownerUid !== user.uid)
      writeDrafts(remaining)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 'var(--space-4)' }}>
      <h1>Notas Pessoais</h1>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {!online && (
          <Card>
            <CardBody>
              Você está offline. As alterações serão salvas como rascunho.
            </CardBody>
          </Card>
        )}
        {online && pendingDrafts.length > 0 && (
          <Card>
            <CardHeader>Rascunhos</CardHeader>
            <CardBody>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>{pendingDrafts.length} rascunho(s) pendente(s)</div>
                <Button onClick={syncDrafts} loading={saving}>Sincronizar</Button>
              </div>
            </CardBody>
          </Card>
        )}
        <Card>
          <CardHeader>{editing ? 'Editar Nota' : 'Nova Nota'}</CardHeader>
          <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div className="field">
              <label className="field-label">Tipo</label>
              <select
                className="field-input"
                value={type}
                onChange={e => setType(e.target.value as 'character' | 'session' | 'global')}
              >
                <option value="global">Global</option>
                <option value="character">Personagem</option>
                <option value="session">Sessão</option>
              </select>
            </div>
            <Input label="Título" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="field">
              <label className="field-label" htmlFor="note-content">Conteúdo</label>
              <textarea
                id="note-content"
                className="field-input"
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Button onClick={onSubmit} loading={saving} disabled={!canSave}>
                {editing ? 'Salvar Alterações' : 'Criar Nota'}
              </Button>
              {editing && (
                <Button variant="secondary" onClick={resetForm} disabled={saving}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Minhas Notas</CardHeader>
          <CardBody>
            {loading ? (
              <div>Carregando…</div>
            ) : items.length === 0 ? (
              <EmptyState title="Sem notas" description="Crie sua primeira nota pessoal." />
            ) : (
              <ul style={{ display: 'grid', gap: 'var(--space-2)', padding: 0, listStyle: 'none' }}>
                {items.map(n => (
                  <li key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <div className="list-item-main">
                      <div className="muted">{n.type}</div>
                      <div className="strong">{n.title || '(Sem título)'}</div>
                      <div>{n.content || ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(n)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onDelete(n.id)}>
                        Excluir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}