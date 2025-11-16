import { useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Badge, Spinner, EmptyState } from '../common'
import { useCampaignById } from '../../hooks/useCampaignById'
import { useMode } from '../../contexts/ModeContext'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useTitle } from '../../contexts/TitleContext'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isMaster } = useMode()
  const { campaign, loading, error } = useCampaignById(id)
  const { setTitle, setActions } = useTitle()

  const safeHtml = useMemo(() => {
    const md = campaign?.plot ?? ''
    const html = marked.parse(md)
    const htmlStr = typeof html === 'string' ? html : ''
    return DOMPurify.sanitize(htmlStr)
  }, [campaign?.plot])

  useEffect(() => {
    const name = campaign?.name?.trim() ?? ''
    if (name.length > 0) setTitle(name)
    if (isMaster() && campaign?.id) {
      setActions([{ label: 'Editar Plot', iconLeft: <span aria-hidden>✏️</span>, onClick: () => navigate(`/master/campaigns/${campaign.id}/plot`) }])
    } else {
      setActions([])
    }
    return () => setActions([])
  }, [campaign?.name, campaign?.id, isMaster, navigate, setTitle, setActions])

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
    return <EmptyState title="Campanha não encontrada" description="Verifique o link ou volte para a lista." />
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 960, margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
            <span>{campaign.name ?? 'Sem nome'}</span>
            <Badge tone="soft" variant="neutral">{(campaign.players?.length ?? 0)} jogadores</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div style={{ color: 'var(--color-neutral-700)' }}>{campaign.description ?? ''}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>RuleSet: {campaign.ruleSet ?? '-'}</div>
            <div>
              <h3 style={{ margin: 'var(--space-3) 0 var(--space-2) 0' }}>Plot</h3>
              {(!campaign.plot || campaign.plot.trim().length === 0) ? (
                <div style={{ color: 'var(--color-neutral-600)' }}>Sem plot definido.</div>
              ) : (
                <div style={{ border: '1px solid var(--color-neutral-300)', borderRadius: 8, padding: 'var(--space-3)' }}
                  dangerouslySetInnerHTML={{ __html: safeHtml }} />
              )}
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate(-1)} variant="ghost">Voltar</Button>
            {null}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}