import { useState } from 'react'
import type { PlayerSheet } from './types'
import type { Attributes } from '@characters/types'

interface PlayerCharacterFormProps {
  onSubmit: (sheet: Omit<PlayerSheet, 'id' | 'userId' | 'campaignId' | 'type'>) => void
  onCancel: () => void
  initialData?: Partial<PlayerSheet>
  movesEnabled: string[]
}

function rangeScores(): number[] {
  return [-1, 0, 1, 2, 3]
}

function sumTotal(a: number[]): number {
  return a.reduce((acc, v) => acc + v, 0)
}

export default function PlayerCharacterForm({ onSubmit, onCancel, initialData, movesEnabled }: PlayerCharacterFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [background, setBackground] = useState(initialData?.background || '')
  const [attributes, setAttributes] = useState<Attributes>({
    forca: initialData?.attributes?.forca ?? 0,
    agilidade: initialData?.attributes?.agilidade ?? 0,
    sabedoria: initialData?.attributes?.sabedoria ?? 0,
    carisma: initialData?.attributes?.carisma ?? 0,
    intuicao: initialData?.attributes?.intuicao ?? 0
  })
  const [equipment, setEquipment] = useState(initialData?.equipment || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [selectedMoves, setSelectedMoves] = useState<string[]>(initialData?.moves || [])
  const [error, setError] = useState<string | null>(null)

  const currentSum = sumTotal([
    attributes.forca,
    attributes.agilidade,
    attributes.sabedoria,
    attributes.carisma,
    attributes.intuicao
  ])
  const remaining = 3 - currentSum
  const canSubmit = name.trim().length > 0 && background.trim().length > 0 && remaining === 0

  function changeAttr(key: keyof Attributes, value: number) {
    setAttributes(prev => ({ ...prev, [key]: value }))
    setError(null)
  }

  function toggleMove(m: string) {
    setSelectedMoves(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    if (remaining !== 0) {
      setError(remaining > 0 ? 'A soma dos atributos deve ser 3. Faltam pontos positivos.' : 'A soma dos atributos deve ser 3. Reduza pontos negativos.')
      return
    }

    const payload = {
      name: name.trim(),
      background: background.trim(),
      attributes,
      equipment: equipment.trim(),
      notes: notes.trim(),
      moves: selectedMoves,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="character-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Nome do Personagem
        </label>
        <input
          id="character-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do seu personagem"
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="character-background" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Antecedentes
        </label>
        <textarea
          id="character-background"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="História, medos, objetivos..."
          required
          rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Atributos (soma deve ser +3)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Força</strong>
            <div className="radio-group">
              {rangeScores().map((value) => (
                <label key={`forca-${value}`} className={`radio-label ${attributes.forca === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="forca"
                    checked={attributes.forca === value}
                    onChange={() => changeAttr('forca', value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Agilidade</strong>
            <div className="radio-group">
              {rangeScores().map((value) => (
                <label key={`agilidade-${value}`} className={`radio-label ${attributes.agilidade === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="agilidade"
                    checked={attributes.agilidade === value}
                    onChange={() => changeAttr('agilidade', value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Sabedoria</strong>
            <div className="radio-group">
              {rangeScores().map((value) => (
                <label key={`sabedoria-${value}`} className={`radio-label ${attributes.sabedoria === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sabedoria"
                    checked={attributes.sabedoria === value}
                    onChange={() => changeAttr('sabedoria', value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Carisma</strong>
            <div className="radio-group">
              {rangeScores().map((value) => (
                <label key={`carisma-${value}`} className={`radio-label ${attributes.carisma === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="carisma"
                    checked={attributes.carisma === value}
                    onChange={() => changeAttr('carisma', value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
          <div className="attr-row">
            <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>Intuição</strong>
            <div className="radio-group">
              {rangeScores().map((value) => (
                <label key={`intuicao-${value}`} className={`radio-label ${attributes.intuicao === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="intuicao"
                    checked={attributes.intuicao === value}
                    onChange={() => changeAttr('intuicao', value)}
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
          {remaining === 0 ? '✅ Atributos válidos' : '❌ Atributos inválidos'}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Movimentos
        </label>
        <div className="moves-list">
          {movesEnabled.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Nenhum movimento disponível na campanha.</p>
          ) : (
            movesEnabled.map((move) => (
              <label key={move} style={{ display: 'block', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={selectedMoves.includes(move)}
                  onChange={() => toggleMove(move)}
                  style={{ marginRight: '0.5rem' }}
                />
                {move}
              </label>
            ))
          )}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="character-equipment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Equipamentos
        </label>
        <textarea
          id="character-equipment"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Itens, armas, armaduras..."
          rows={2}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="character-notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Notas
        </label>
        <textarea
          id="character-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Informações adicionais..."
          rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      {error && (
        <div style={{ 
          padding: '0.75rem', 
          borderRadius: '4px', 
          backgroundColor: 'rgba(220, 53, 69, 0.2)', 
          color: '#dc3545', 
          border: '1px solid rgba(220, 53, 69, 0.3)',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn"
          style={{ padding: '0.5rem 1rem' }}
        >
          Voltar para Campanha
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn btn-primary"
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: canSubmit ? undefined : '#6c757d',
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
        >
          {initialData ? 'Salvar Ficha' : 'Criar Ficha'}
        </button>
      </div>
    </form>
  )
}
