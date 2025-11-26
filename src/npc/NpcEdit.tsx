import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import NpcForm from './NpcForm'
import type { NpcSheet } from './types'
import type { UpdateNpcSheetPatch } from '@npc/npcRepo'
import BackButton from '@shared/components/BackButton'

export default function NpcEdit() {
  const { id: campaignId, npcId } = useParams()
  const navigate = useNavigate()
  const user = useAppStore(s => s.user)
  const listNpcSheets = useAppStore(s => s.listNpcSheets)
  const updateNpcSheet = useAppStore(s => s.updateNpcSheet)
  
  const [npc, setNpc] = useState<NpcSheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId || !npcId) {
      navigate('/dashboard')
      return
    }

    // Carregar NPC existente
    const npcs = listNpcSheets(campaignId)
    const foundNpc = npcs.find(n => n.id === npcId)
    
    if (!foundNpc) {
      setError('NPC não encontrado')
      setLoading(false)
      return
    }

    setNpc(foundNpc)
    setLoading(false)
  }, [campaignId, npcId, listNpcSheets, navigate])

  // Verificar permissões
  if (user?.role !== 'master') {
    return (
      <div className="container">
        <div className="error-message" style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '1rem'
        }}>
          Acesso negado. Apenas mestres podem editar NPCs.
        </div>
        <button 
          onClick={() => navigate(`/campaigns/${campaignId}`)} 
          className="btn"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text)'
          }}
        >
          Voltar para Campanha
        </button>
      </div>
    )
  }

  const handleSubmit = (npcData: any) => {
    if (!campaignId || !npcId || !npc) return

    setError(null)
    setSuccess(null)

    const patch: UpdateNpcSheetPatch = {
      name: npcData.name,
      background: npcData.background,
      attributes: npcData.attributes,
      equipment: npcData.equipment,
      notes: npcData.notes
    }

    const result = updateNpcSheet(campaignId, npcId, patch)
    
    if (result.ok) {
      setSuccess('NPC atualizado com sucesso!')
      setTimeout(() => {
        navigate(`/campaigns/${campaignId}`)
      }, 2000)
    } else {
      setError(getErrorMessage(result.message))
    }
  }

  const handleCancel = () => {
    navigate(`/campaigns/${campaignId}`)
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'not_authenticated':
        return 'Você precisa estar logado para editar NPCs.'
      case 'forbidden':
        return 'Apenas mestres podem editar NPCs.'
      case 'not_found':
        return 'NPC não encontrado.'
      case 'invalid_data':
        return 'Dados inválidos. Verifique os campos.'
      default:
        return 'Erro ao atualizar NPC. Tente novamente.'
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Carregando NPC...
        </div>
      </div>
    )
  }

  if (error && !npc) {
    return (
      <div className="container">
        <div className="error-message" style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
        <button 
          onClick={() => navigate(`/campaigns/${campaignId}`)} 
          className="btn"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text)'
          }}
        >
          Voltar para Campanha
        </button>
      </div>
    )
  }

  if (!npc) {
    return (
      <div className="container">
        <div className="error-message" style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '1rem'
        }}>
          NPC não encontrado.
        </div>
        <button 
          onClick={() => navigate(`/campaigns/${campaignId}`)} 
          className="btn"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text)'
          }}
        >
          Voltar para Campanha
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <BackButton />
        <h2 style={{ margin: 0, color: 'var(--text)' }}>Editar NPC: {npc.name}</h2>
      </header>

      {success && (
        <div className="success-message" style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(40, 167, 69, 0.1)', 
          border: '1px solid rgba(40, 167, 69, 0.3)', 
          borderRadius: '4px', 
          color: '#28a745'
        }}>
          {success}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: '4px', 
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <NpcForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={{
            name: npc.name,
            background: npc.background,
            attributes: npc.attributes,
            equipment: npc.equipment || '',
            notes: npc.notes || ''
          }}
        />
      </div>
    </div>
  )
}
