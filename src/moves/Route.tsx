import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Move } from './types'
import BackButton from '@shared/components/BackButton'
import { getErrorMessage } from '@shared/utils/errorMessages'

function rangeModifiers(): Array<-1 | 0 | 1 | 2 | 3> {
  return [-1, 0, 1, 2, 3]
}

type Editable = Move & { _dirty?: boolean }

export default function MovesRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const campaignId = id || ''
  const user = useAppStore(s => s.user)
  const role = useAppStore(s => s.role)
  const listMoves = useAppStore(s => s.listMoves)
  const subscribeMoves = useAppStore(s => s.subscribeMoves)
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
  const [accessDenied, setAccessDenied] = useState(false)

  // Verificar acesso - apenas mestre pode acessar movimentos
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (role !== 'master') {
      setAccessDenied(true)
      // Redirecionar após mostrar a mensagem
      setTimeout(() => {
        navigate('/dashboard/player')
      }, 2000)
      return
    }
  }, [user, role, navigate])

  const existing = useMemo(() => listMoves(campaignId), [campaignId, listMoves])

  // Subscribe to moves for real-time updates
  useEffect(() => {
    if (!campaignId || role !== 'master') return
    
    const unsubscribe = subscribeMoves(campaignId, (moves) => {
      setItems(moves.map(m => ({ ...m, _dirty: false })))
    })
    
    return () => {
      unsubscribe()
    }
  }, [campaignId, role, subscribeMoves])

  useEffect(() => {
    setItems(existing.map(m => ({ ...m, _dirty: false })))
  }, [existing])

  

  async function onCreate() {
    setError(null)
    setSuccess(null)
    const res = await createMove(campaignId, { name, description, modifier, active })
    if (!res.ok) {
      setError(getErrorMessage(res.message))
      return
    }
    setName('')
    setDescription('')
    setModifier(0)
    setActive(true)
    setSuccess('Movimento criado com sucesso!')
    const updated = listMoves(campaignId)
    setItems(updated.map(m => ({ ...m, _dirty: false })))
  }

  async function onSave(id: string) {
    setError(null)
    setSuccess(null)
    const item = items.find(m => m.id === id)
    if (!item) return
    const res = await updateMove(campaignId, id, {
      name: item.name,
      description: item.description,
      modifier: item.modifier,
      active: item.active
    })
    if (!res.ok) {
      setError(getErrorMessage(res.message))
      return
    }
    setSuccess('Movimento atualizado com sucesso!')
    const updated = listMoves(campaignId)
    setItems(updated.map(m => ({ ...m, _dirty: false })))
  }

  async function onDelete(id: string) {
    setError(null)
    setSuccess(null)
    const res = await deleteMove(campaignId, id)
    if (!res.ok) {
      setError(getErrorMessage(res.message))
      return
    }
    setSuccess('Movimento removido com sucesso!')
    const updated = listMoves(campaignId)
    setItems(updated.map(m => ({ ...m, _dirty: false })))
  }

  // Se acesso negado, mostrar mensagem
  if (accessDenied) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 16 }}>
            <BackButton />
            <h2 style={{ margin: 0 }}>Acesso Negado</h2>
          </div>
          <div className="error">
            Você não tem permissão para acessar esta página. Apenas mestres podem gerenciar movimentos.
          </div>
          <p>Você será redirecionado para o dashboard em instantes...</p>
        </div>
      </div>
    )
  }

  // Se não for mestre, não renderizar o conteúdo
  if (role !== 'master') {
    return null
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 16 }}>
          <BackButton />
          <h2 style={{ margin: 0 }}>Movimentos</h2>
        </div>
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
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
        <div>
          <h3>Lista</h3>
          {items.length === 0 && <div>Nenhum movimento</div>}
          {items.map(m => (
            <div key={m.id} className="list-item">
              <div>
                <label>
                  Nome
                  <input name="name" value={m.name} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, name: e.target.value, _dirty: true } : x))} />
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
                <button onClick={() => onDelete(m.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
