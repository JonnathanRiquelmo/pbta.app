import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Spinner } from '../common'
import { useCampaignById } from '../../hooks/useCampaignById'
import { updateCampaignPlot } from '../../services/campaign.service'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useToast } from '../common'

export default function PlotEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const { campaign, loading, error } = useCampaignById(id)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText(campaign?.plot ?? '')
  }, [campaign?.plot])

  const safeHtml = useMemo(() => {
    const html = marked.parse(text)
    const htmlStr = typeof html === 'string' ? html : ''
    return DOMPurify.sanitize(htmlStr)
  }, [text])

  const canSave = !!id && !saving

  const handleSave = async () => {
    if (!id || !canSave) return
    setSaving(true)
    try {
      await updateCampaignPlot(id, text)
      push('Plot salvo')
      navigate(`/master/campaigns/${id}`)
    } catch (err) {
      push('Erro ao salvar plot')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar campanha</div>
  }

  if (!campaign) {
    return <div style={{ padding: 'var(--space-4)' }}>Campanha não encontrada</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <span>Editar Plot — {campaign.name ?? 'Sem nome'}</span>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ width: '100%', minHeight: 360, padding: 'var(--space-2)', border: '1px solid var(--color-neutral-300)', borderRadius: 8 }}
              placeholder="Markdown do plot"
              disabled={saving}
            />
            <div style={{ border: '1px solid var(--color-neutral-300)', borderRadius: 8, padding: 'var(--space-3)', overflowY: 'auto', maxHeight: 360 }}
              dangerouslySetInnerHTML={{ __html: safeHtml }} />
          </div>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button onClick={() => navigate(`/master/campaigns/${id}`)} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}