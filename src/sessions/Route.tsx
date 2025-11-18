import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Session } from './types'

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

type Editable = Session & { _dirty?: boolean }

export default function SessionRoute() {
  const { id } = useParams()
  const getSession = useAppStore(s => s.getSession)
  const updateSession = useAppStore(s => s.updateSession)
  const role = useAppStore(s => s.role)

  const session = useMemo(() => (id ? getSession(id) : undefined), [id, getSession])
  const [item, setItem] = useState<Editable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setItem(session ? { ...session, _dirty: false } : null)
  }, [session])

  if (!item) return <div className="card">Sessão não encontrada</div>

  const isMaster = role === 'master'

  async function onSave() {
    setError(null)
    setSuccess(null)
    const res = updateSession(item.campaignId, item.id, {
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
    setItem({ ...res.session, _dirty: false })
  }

  return (
    <div className="card">
      <h2>{item.name}</h2>
      <div>
        <label>
          Nome
          <input value={item.name} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, name: e.target.value, _dirty: true } : prev)} />
        </label>
      </div>
      <div>
        <label>
          Data
          <input type="date" value={toDateInputValue(item.date)} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, date: fromDateInputValue(e.target.value), _dirty: true } : prev)} />
        </label>
      </div>
      <div>
        <h3>Resumo</h3>
        <textarea value={item.summary} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, summary: e.target.value, _dirty: true } : prev)} />
      </div>
      <div>
        <h3>Notas do Mestre</h3>
        <textarea value={item.masterNotes} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, masterNotes: e.target.value, _dirty: true } : prev)} />
      </div>
      {isMaster && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!item._dirty}>Salvar</button>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {success && <div>{success}</div>}
    </div>
  )
}