import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Spinner } from '../common'
import { createMove, updateMove } from '../../services/moves.service'
import { useToast } from '../common'

type Results = {
  on10Plus?: string
  on7to9?: string
  onMiss?: string
}

type MoveData = {
  id?: string
  campaignId: string
  name: string
  description?: string
  trigger?: string
  rollFormula?: string
  results?: Results
}

type MovesEditorProps = {
  campaignId: string
  move?: MoveData | null
  onClose?: () => void
}

export default function MovesEditor({ campaignId, move, onClose }: MovesEditorProps) {
  const { push } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState('')
  const [rollFormula, setRollFormula] = useState('')
  const [r10, setR10] = useState('')
  const [r79, setR79] = useState('')
  const [rMiss, setRMiss] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(move?.name ?? '')
    setDescription(move?.description ?? '')
    setTrigger(move?.trigger ?? '')
    setRollFormula(move?.rollFormula ?? '')
    setR10(move?.results?.on10Plus ?? '')
    setR79(move?.results?.on7to9 ?? '')
    setRMiss(move?.results?.onMiss ?? '')
  }, [move])

  const canSave = name.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const payload = {
        campaignId,
        name: name.trim(),
        description: description,
        trigger: trigger,
        rollFormula: rollFormula,
        results: { on10Plus: r10, on7to9: r79, onMiss: rMiss }
      }
      if (move?.id) {
        await updateMove(move.id, payload)
        push('Move atualizado')
      } else {
        await createMove(payload)
        push('Move criado')
      }
      onClose?.()
    } catch (e) {
      push('Erro ao salvar move')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <span>{move?.id ? 'Editar Move' : 'Novo Move'}</span>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Nome" />
            <Input value={trigger} onChange={e => setTrigger(e.currentTarget.value)} placeholder="Gatilho (quando...)" />
            <Input value={rollFormula} onChange={e => setRollFormula(e.currentTarget.value)} placeholder="Fórmula de rolagem (ex: 2d6 + stat)" />
            <textarea
              value={description}
              onChange={e => setDescription(e.currentTarget.value)}
              placeholder="Descrição"
              style={{ width: '100%', minHeight: 120, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <textarea value={r10} onChange={e => setR10(e.currentTarget.value)} placeholder="Resultado 10+" style={{ width: '100%', minHeight: 100, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }} />
              <textarea value={r79} onChange={e => setR79(e.currentTarget.value)} placeholder="Resultado 7–9" style={{ width: '100%', minHeight: 100, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }} />
              <textarea value={rMiss} onChange={e => setRMiss(e.currentTarget.value)} placeholder="Resultado 6-" style={{ width: '100%', minHeight: 100, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }} />
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button onClick={onClose} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave}>{saving ? <Spinner /> : (move?.id ? 'Salvar' : 'Criar')}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}