import { useState } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Input } from '../common'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNavigate } from 'react-router-dom'
import { createCampaign } from '../../services/campaign.service'

export default function CampaignForm() {
  const { user } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ruleSet, setRuleSet] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = !!user && name.trim().length > 0 && ruleSet.trim().length > 0 && !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!canSave) return
    setSaving(true)
    try {
      await createCampaign({ name: name.trim(), description: description.trim(), ruleSet: ruleSet.trim(), players: [] }, user.uid)
      push('Campanha criada')
      navigate('/master/campaigns')
    } catch (err) {
      push('Erro ao criar campanha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <span>Nova Campanha</span>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required disabled={saving} />
              <Input label="Regra/Rule Set" value={ruleSet} onChange={e => setRuleSet(e.target.value)} required disabled={saving} />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descrição"
                style={{ width: '100%', minHeight: 120, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }}
                disabled={saving}
              />
            </div>
          </form>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button onClick={() => navigate('/master/campaigns')} variant="ghost">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!canSave}>{saving ? 'Salvando...' : 'Criar campanha'}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}