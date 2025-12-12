import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Move } from './types'
import BackButton from '@shared/components/BackButton'
import ConfirmationModal from '@shared/components/ConfirmationModal'
import { getErrorMessage } from '@shared/utils/errorMessages'
import { LuPlus, LuSave, LuTrash2, LuLock } from 'react-icons/lu'

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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

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
    setConfirmDelete(null)
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
          <div className="error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LuLock size={20} />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <BackButton />
        <h2 style={{ margin: 0 }}>Movimentos</h2>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Criar Movimento</h3>
        <div className="form-group">
          <label>Nome</label>
          <input value={name} onChange={e => { setName(e.target.value); setSuccess(null); setError(null) }} placeholder="Nome do movimento" />
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea value={description} onChange={e => { setDescription(e.target.value); setSuccess(null); setError(null) }} placeholder="O que acontece quando..." />
        </div>
        <div className="flex gap-4">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Modificador</label>
            <select value={modifier} onChange={e => setModifier(Number(e.target.value) as -1 | 0 | 1 | 2 | 3)}>
              {rangeModifiers().map(v => (
                <option key={`mod-${v}`} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
             <label style={{ marginBottom: '0.5rem', display: 'block' }}>Status</label>
             <div className="checkbox-wrapper">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                  <span>Ativo na campanha</span>
                </label>
             </div>
          </div>
        </div>
        <div>
          <button className="btn btn-primary" onClick={onCreate} disabled={!name.trim()}>
            <LuPlus size={18} style={{ marginRight: 8 }} />
            Criar Movimento
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Lista de Movimentos</h3>
        {items.length === 0 && <p className="text-muted">Nenhum movimento cadastrado.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(m => (
            <div key={m.id} className="card" style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label>Nome</label>
                <input 
                  value={m.name} 
                  onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, name: e.target.value, _dirty: true } : x))}
                  style={{ fontWeight: 'bold' }} 
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea 
                  value={m.description} 
                  onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, description: e.target.value, _dirty: true } : x))}
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div className="flex gap-4" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Modificador</label>
                  <select value={m.modifier} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, modifier: Number(e.target.value) as -1 | 0 | 1 | 2 | 3, _dirty: true } : x))}>
                    {rangeModifiers().map(v => (
                      <option key={`mod-${m.id}-${v}`} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>Status</label>
                  <div className="checkbox-wrapper">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={m.active} onChange={e => setItems(prev => prev.map(x => x.id === m.id ? { ...x, active: e.target.checked, _dirty: true } : x))} />
                      <span>Ativo</span>
                    </label>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  className={`btn ${m._dirty ? 'btn-primary' : ''}`} 
                  onClick={() => onSave(m.id)} 
                  disabled={!m._dirty}
                  title="Salvar Alterações"
                >
                  <LuSave size={18} style={{ marginRight: m._dirty ? 8 : 0 }} />
                  {m._dirty && <span>Salvar</span>}
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setConfirmDelete(m.id)}
                  title="Excluir Movimento"
                  style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }}
                >
                  <LuTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!confirmDelete}
        title="Excluir Movimento"
        message="Tem certeza que deseja excluir este movimento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => confirmDelete && onDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
