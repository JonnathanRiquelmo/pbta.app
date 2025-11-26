import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Session } from './types'
import BackButton from '@shared/components/BackButton'

type Editable = Session & { _dirty?: boolean }

function toDateInputValue(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateInputValue(s: string): number {
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : 0
}

export default function CampaignSessionsRoute() {
  const { id } = useParams()
  const campaignId = id || ''
  const role = useAppStore(s => s.role)
  const listSessions = useAppStore(s => s.listSessions)
  const createSession = useAppStore(s => s.createSession)
  const updateSession = useAppStore(s => s.updateSession)
  const deleteSession = useAppStore(s => s.deleteSession)

  const [items, setItems] = useState<Editable[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [summary, setSummary] = useState('')
  const [masterNotes, setMasterNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const existing = useMemo(() => listSessions(campaignId), [campaignId, listSessions])

  useEffect(() => {
    setItems(existing.map(s => ({ ...s, _dirty: false })))
  }, [existing])

  async function onCreate() {
    setError(null)
    setSuccess(null)
    const ts = fromDateInputValue(date)
    const res = createSession(campaignId, { name, date: ts, summary, masterNotes })
    if (!res.ok) {
      setError(res.message)
      return
    }
    setName('')
    setDate('')
    setSummary('')
    setMasterNotes('')
    setSuccess('created')
    const updated = listSessions(campaignId)
    setItems(updated.map(s => ({ ...s, _dirty: false })))
  }

  async function onSave(id: string) {
    setError(null)
    setSuccess(null)
    const item = items.find(s => s.id === id)
    if (!item) return
    const res = updateSession(campaignId, id, {
      name: item.name,
      date: item.date,
      summary: item.summary,
      masterNotes: item.masterNotes
    })
    if (!res.ok) {
      setError(res.message)
      return
    }
    setSuccess('saved')
    const updated = listSessions(campaignId)
    setItems(updated.map(s => ({ ...s, _dirty: false })))
  }

  async function onDelete(id: string) {
    setError(null)
    setSuccess(null)
    const res = deleteSession(campaignId, id)
    if (!res.ok) {
      setError(res.message)
      return
    }
    setSuccess('deleted')
    const updated = listSessions(campaignId)
    setItems(updated.map(s => ({ ...s, _dirty: false })))
  }

  const isMaster = role === 'master'

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 16 }}>
        <BackButton />
        <h2 style={{ margin: 0 }}>Sessões</h2>
      </div>
      {isMaster && (
        <div style={{ marginBottom: 16 }}>
          <h3>Criar Sessão</h3>
          <div>
            <label>
              Nome
              <input value={name} onChange={e => { setName(e.target.value); setSuccess(null); setError(null) }} />
            </label>
          </div>
          <div>
            <label>
              Data
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setSuccess(null); setError(null) }} />
            </label>
          </div>
          <div>
            <label>
              Resumo
              <textarea value={summary} onChange={e => { setSummary(e.target.value); setSuccess(null); setError(null) }} />
            </label>
          </div>
          <div>
            <label>
              Notas do Mestre
              <textarea value={masterNotes} onChange={e => { setMasterNotes(e.target.value); setSuccess(null); setError(null) }} />
            </label>
          </div>
          <div>
            <button onClick={onCreate} disabled={!name.trim() || !date.trim()}>Criar</button>
          </div>
        </div>
      )}
      <div>
        <h3>Lista</h3>
        {items.length === 0 && <div>Nenhuma sessão</div>}
        {items.map(s => (
          <div key={s.id} className="list-item">
            <div>
              <Link to={`/sessions/${s.id}`}>Abrir</Link>
            </div>
            <div>
              <label>
                Nome
                <input value={s.name} disabled={!isMaster} onChange={e => setItems(prev => prev.map(x => x.id === s.id ? { ...x, name: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                Data
                <input type="date" value={toDateInputValue(s.date)} disabled={!isMaster} onChange={e => setItems(prev => prev.map(x => x.id === s.id ? { ...x, date: fromDateInputValue(e.target.value), _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                Resumo
                <textarea value={s.summary} disabled={!isMaster} onChange={e => setItems(prev => prev.map(x => x.id === s.id ? { ...x, summary: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                Notas do Mestre
                <textarea value={s.masterNotes} disabled={!isMaster} onChange={e => setItems(prev => prev.map(x => x.id === s.id ? { ...x, masterNotes: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            {isMaster && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onSave(s.id)} disabled={!s._dirty}>Salvar</button>
                <button onClick={() => onDelete(s.id)}>Deletar</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      {success && <div>{success}</div>}
    </div>
  )
}
