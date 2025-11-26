import { useState } from 'react'
import type { CreateNpcSheetInput } from './npcRepo'
import type { Attributes } from '@characters/types'

interface NpcFormProps {
  onSubmit: (npc: CreateNpcSheetInput) => void
  onCancel: () => void
  onBatchSubmit?: (npcs: CreateNpcSheetInput[]) => void
  batchMode?: boolean
  initialData?: CreateNpcSheetInput
}

export default function NpcForm({ onSubmit, onCancel, onBatchSubmit, batchMode = false, initialData }: NpcFormProps) {
  const [form, setForm] = useState<CreateNpcSheetInput>(initialData || {
    name: '',
    background: '',
    attributes: {
      forca: 0,
      agilidade: 0,
      sabedoria: 0,
      carisma: 0,
      intuicao: 0
    },
    equipment: '',
    notes: ''
  })
  const [npcBatch, setNpcBatch] = useState<CreateNpcSheetInput[]>([])

  const currentSum = Math.abs(form.attributes.forca) +
    Math.abs(form.attributes.agilidade) +
    Math.abs(form.attributes.sabedoria) +
    Math.abs(form.attributes.carisma) +
    Math.abs(form.attributes.intuicao)

  const remaining = 3 - currentSum
  const canSubmit = form.name.trim() && form.background.trim() && remaining === 0

  const handleAttributeChange = (attr: keyof Attributes, value: string) => {
    const numValue = parseInt(value) || 0
    setForm(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: numValue
      }
    }))
  }

  const resetForm = () => {
    setForm({
      name: '',
      background: '',
      attributes: {
        forca: 0,
        agilidade: 0,
        sabedoria: 0,
        carisma: 0,
        intuicao: 0
      },
      equipment: '',
      notes: ''
    })
  }

  const addToBatch = () => {
    if (!canSubmit) return
    setNpcBatch(prev => [...prev, form])
    resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    
    if (batchMode && onBatchSubmit) {
      if (npcBatch.length === 0) {
        alert('Adicione pelo menos um NPC ao lote')
        return
      }
      onBatchSubmit(npcBatch)
      setNpcBatch([])
    } else {
      onSubmit(form)
      resetForm()
    }
  }

  const removeFromBatch = (index: number) => {
    setNpcBatch(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {batchMode && npcBatch.length > 0 && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          border: '1px solid var(--border)', 
          borderRadius: '4px',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>NPCs no lote ({npcBatch.length})</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {npcBatch.map((npc, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.5rem',
                borderBottom: index < npcBatch.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <span>{npc.name} ({npc.background})</span>
                <button 
                  type="button" 
                  onClick={() => removeFromBatch(index)}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    fontSize: '0.8rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="npc-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome do NPC</label>
        <input
          id="npc-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nome do NPC"
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="npc-background" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Background</label>
        <input
          id="npc-background"
          type="text"
          value={form.background}
          onChange={(e) => setForm(prev => ({ ...prev, background: e.target.value }))}
          placeholder="Background do NPC"
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Atributos (soma deve ser 3)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Força</strong>
            <div className="radio-group">
              {[-2, -1, 0, 1, 2, 3].map((value) => (
                <label key={`forca-${value}`} className={`radio-label ${form.attributes.forca === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="forca"
                    checked={form.attributes.forca === value}
                    onChange={() => handleAttributeChange('forca', value.toString())}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Agilidade</strong>
            <div className="radio-group">
              {[-2, -1, 0, 1, 2, 3].map((value) => (
                <label key={`agilidade-${value}`} className={`radio-label ${form.attributes.agilidade === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="agilidade"
                    checked={form.attributes.agilidade === value}
                    onChange={() => handleAttributeChange('agilidade', value.toString())}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Sabedoria</strong>
            <div className="radio-group">
              {[-2, -1, 0, 1, 2, 3].map((value) => (
                <label key={`sabedoria-${value}`} className={`radio-label ${form.attributes.sabedoria === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sabedoria"
                    checked={form.attributes.sabedoria === value}
                    onChange={() => handleAttributeChange('sabedoria', value.toString())}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Carisma</strong>
            <div className="radio-group">
              {[-2, -1, 0, 1, 2, 3].map((value) => (
                <label key={`carisma-${value}`} className={`radio-label ${form.attributes.carisma === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="carisma"
                    checked={form.attributes.carisma === value}
                    onChange={() => handleAttributeChange('carisma', value.toString())}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Intuição</strong>
            <div className="radio-group">
              {[-2, -1, 0, 1, 2, 3].map((value) => (
                <label key={`intuicao-${value}`} className={`radio-label ${form.attributes.intuicao === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="intuicao"
                    checked={form.attributes.intuicao === value}
                    onChange={() => handleAttributeChange('intuicao', value.toString())}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.5rem', 
          borderRadius: '4px',
          backgroundColor: remaining === 0 ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
          color: remaining === 0 ? '#28a745' : '#dc3545',
          fontSize: '0.9rem',
          textAlign: 'center',
          border: remaining === 0 ? '1px solid rgba(40, 167, 69, 0.3)' : '1px solid rgba(220, 53, 69, 0.3)'
        }}>
          {remaining === 0 ? '✓ Atributos válidos' : `Faltam ${remaining} pontos`}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="npc-equipment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Equipamentos (opcional)</label>
        <textarea
          id="npc-equipment"
          value={form.equipment}
          onChange={(e) => setForm(prev => ({ ...prev, equipment: e.target.value }))}
          placeholder="Equipamentos do NPC"
          rows={2}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="npc-notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Notas (opcional)</label>
        <textarea
          id="npc-notes"
          value={form.notes}
          onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notas sobre o NPC"
          rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          Cancelar
        </button>
        {batchMode ? (
          <>
            <button 
              type="button" 
              onClick={addToBatch}
              disabled={!canSubmit}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: canSubmit ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >
              Adicionar ao Lote
            </button>
            <button 
              type="submit" 
              disabled={npcBatch.length === 0}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: npcBatch.length > 0 ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: npcBatch.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              Criar {npcBatch.length} NPC(s)
            </button>
          </>
        ) : (
          <button type="submit" disabled={!canSubmit} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            Criar NPC
          </button>
        )}
      </div>
    </form>
  )
}