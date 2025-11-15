import { useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Input } from '../common'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { createCharacter } from '../../services/characters.service'
import { useNavigate } from 'react-router-dom'

export default function SheetForm() {
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [playbook, setPlaybook] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = !!user && online && name.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const id = await createCharacter({ name: name.trim(), playbook: playbook.trim() }, user!.uid)
      push('Ficha criada com sucesso')
      navigate(`/sheets/${id}`)
    } catch {
      push('Erro ao criar ficha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>Nova Ficha</CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Nome" required />
            <Input value={playbook} onChange={e => setPlaybook(e.currentTarget.value)} placeholder="Playbook" />
          </div>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate(-1)} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave}>Salvar</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}