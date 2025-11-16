import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button, Input } from '../common'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { createPdm } from '../../services/characters.service'
import { useNavigate } from 'react-router-dom'
import { useTitle } from '../../contexts/TitleContext'

export default function PdmForm() {
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()
  const navigate = useNavigate()
  const { setTitle, setActions } = useTitle()

  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)

  const canSave = !!user && online && name.trim().length > 0 && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      const id = await createPdm({ name: name.trim(), isPrivateToMaster: isPrivate }, user!.uid)
      push('PDM criado com sucesso')
      navigate(`/master/pdms/${id}`)
    } catch {
      push('Erro ao criar PDM')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    setTitle('Novo PDM')
    setActions([{ label: 'Salvar', iconLeft: <span aria-hidden>💾</span>, onClick: handleSave, disabled: !canSave }])
    return () => setActions([])
  }, [canSave])

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 720, margin: '0 auto' }}>
      <Card>
        <CardHeader>Novo PDM</CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <Input value={name} onChange={e => setName(e.currentTarget.value)} placeholder="Nome" required />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.currentTarget.checked)} />
              <span>Privado ao Mestre</span>
            </div>
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