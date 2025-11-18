import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Move } from './types'

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
      <h2>Movimentos</h2>
      <div style={{ marginBottom: 16 }}>
        <h3>Criar Movimento</h3>
        <div>
          <label>
            Nome
            <input value={name} onChange={e => { setName(e.target.value); setSuccess(null); setError(null) }} />
          </label>
        </div>
        <div>
          <label>
            Descrição
            <textarea value={description} onChange={e => { setDescription(e.target.value); setSuccess(null); setError(null) }} />
          </label>
        </div>
        <div>
          <label>
            Modificador
            <select value={modifier} onChange={e => setModifier(Number(e.target.value) as -1 | 0 | 1 | 2 | 3)}>
              {rangeModifiers().map(v => (
                <option key={`mod-${v}`} value={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Ativo
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          </label>
        </div>
        <div>
          <button onClick={onCreate} disabled={!name.trim()}>Criar</button>
        </div>
      </div>
      <div>
        <h3>Lista</h3>
        {items.length === 0 && <div>Nenhum movimento</div>}
        {items.map(m => (
          <div key={m.id} className="list-item">
            <div>
              <label>
                Nome
                <input value={m.name} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, name: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                Descrição
                <textarea value={m.description} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, description: e.target.value, _dirty: true } : x))} />
              </label>
            </div>
            <div>
              <label>
                Modificador
                <select value={m.modifier} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, modifier: Number(e.target.value) as -1 | 0 | 1 | 2 | 3, _dirty: true } : x))}>
                  {rangeModifiers().map(v => (
                    <option key={`mod-${m.id}-${v}`} value={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Ativo
                <input type="checkbox" checked={m.active} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, active: e.target.checked, _dirty: true } : x))} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onSave(m.id)} disabled={!m._dirty}>Salvar</button>
              <button onClick={() => onDelete(m.id)}>Deletar</button>
            </div>
          </div>
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      {success && <div>{success}</div>}
    </div>
  )
}