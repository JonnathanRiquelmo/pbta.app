import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Move } from './types'
import { useTranslation } from 'react-i18next'

function rangeModifiers(): Array<-1 | 0 | 1 | 2 | 3> {
  return [-1, 0, 1, 2, 3]
}

type Editable = Move & { _dirty?: boolean }

export default function MovesRoute() {
  const { id } = useParams()
  const campaignId = id || ''
  const listMoves = useAppStore(s => s.listMoves)
  const createMove = useAppStore(s => s.createMove)
  const updateMove = useAppStore(s => s.updateMove)
  const deleteMove = useAppStore(s => s.deleteMove)

  const [items, setItems] = useState<Editable[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [modifier, setModifier] = useState<-1 | 0 | 1 | 2 | 3>(0)
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { t } = useTranslation()

  const existing = useMemo(() => listMoves(campaignId), [campaignId, listMoves])

  useEffect(() => {
    setItems(existing.map(m => ({ ...m, _dirty: false })))
  }, [existing])

  function markDirty(id: string) {
    setItems(prev => prev.map(m => (m.id === id ? { ...m, _dirty: true } : m)))
    setSuccess(null)
    setError(null)
  }

  async function onCreate() {
    setError(null)
    setSuccess(null)
    const res = createMove(campaignId, { name, description, modifier, active })
    if (!res.ok) {
      setError(res.message)
      return
    }
    setName('')
    setDescription('')
    setModifier(0)
    setActive(true)
    setSuccess('created')
    const updated = listMoves(campaignId)
    setItems(updated.map(m => ({ ...m, _dirty: false })))
  }

  async function onSave(id: string) {
    setError(null)
    setSuccess(null)
    const item = items.find(m => m.id === id)
    if (!item) return
    const res = updateMove(campaignId, id, {
      name: item.name,
      description: item.description,
      modifier: item.modifier,
      active: item.active
    })
    if (!res.ok) {
      setError(res.message)
      return
    }
    setSuccess('saved')
    const updated = listMoves(campaignId)
    setItems(updated.map(m => ({ ...m, _dirty: false })))
  }

  async function onDelete(id: string) {
    setError(null)
    setSuccess(null)
    const res = deleteMove(campaignId, id)
    if (!res.ok) {
      setError(res.message)
      return
    }
    setSuccess('deleted')
    const updated = listMoves(campaignId)
    setItems(updated.map(m => ({ ...m, _dirty: false })))
  }

  return (
    <div className="card">
      <h2>{t('moves.title')}</h2>
      <div style={{ marginBottom: 16 }}>
        <h3>{t('moves.create.title')}</h3>
        <div>
          <label>
            {t('moves.create.name')}
            <input value={name} onChange={e => { setName(e.target.value); setSuccess(null); setError(null) }} />
          </label>
        </div>
        <div>
          <label>
            {t('moves.create.description')}
            <textarea value={description} onChange={e => { setDescription(e.target.value); setSuccess(null); setError(null) }} />
          </label>
        </div>
        <div>
          <label>
            {t('moves.create.modifier')}
            <select value={modifier} onChange={e => setModifier(Number(e.target.value) as -1 | 0 | 1 | 2 | 3)}>
              {rangeModifiers().map(v => (
                <option key={`mod-${v}`} value={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            {t('moves.create.active')}
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          </label>
        </div>
        <div>
          <button onClick={onCreate} disabled={!name.trim()}>{t('actions.create')}</button>
        </div>
      </div>
      <div>
        <h3>{t('moves.list.title')}</h3>
        {items.length === 0 && <div>{t('moves.none')}</div>}
        {items.map(m => (
          <div key={m.id} className="list-item">
            <div>
              <label>
                {t('moves.create.name')}
                <input value={m.name} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, name: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                {t('moves.create.description')}
                <textarea value={m.description} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, description: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                {t('moves.create.modifier')}
                <select value={m.modifier} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, modifier: Number(e.target.value) as -1 | 0 | 1 | 2 | 3, _dirty: true } : x))}>
                  {rangeModifiers().map(v => (
                    <option key={`mod-${m.id}-${v}`} value={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                {t('moves.create.active')}
                <input type="checkbox" checked={m.active} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, active: e.target.checked, _dirty: true } : x))} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onSave(m.id)} disabled={!m._dirty}>{t('actions.save')}</button>
              <button onClick={() => onDelete(m.id)}>{t('actions.delete')}</button>
            </div>
          </div>
        ))}
      </div>
      {error && <div className="error" role="alert" aria-live="assertive">{t(`error.${error}`)}</div>}
      {success && <div role="status" aria-live="polite">{t(`success.${success}`)}</div>}
    </div>
  )
}