import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Badge, EmptyState, Spinner } from '../common'
import { useMasterCampaigns } from '../../hooks/useMasterCampaigns'
import { deleteCampaign } from '../../services/campaign.service'
import { useState, useEffect } from 'react'
import StickyCTA from '../layout/StickyCTA'
import { useTitle } from '../../contexts/TitleContext'

export default function CampaignList() {
  const navigate = useNavigate()
  const campaigns = useMasterCampaigns()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { setTitle } = useTitle()
  useEffect(() => { setTitle('Campanhas (Mestre)') }, [setTitle])

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteCampaign(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: 0 }}>Campanhas</h2>
        <Button onClick={() => navigate('/master/campaigns/new')}>Nova campanha</Button>
      </div>

      {campaigns.loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <Spinner />
        </div>
      )}

      {!campaigns.loading && campaigns.count === 0 && !campaigns.error && (
        <EmptyState title="Nenhuma campanha" description="Crie sua primeira campanha para começar." />
      )}

      {campaigns.error && (
        <div style={{ color: 'var(--color-danger-600)' }}>Erro ao carregar campanhas</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {campaigns.items.map(c => (
          <Card key={c.id}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{c.name ?? 'Sem nome'}</span>
                <Badge tone="soft" variant="neutral">{(c.players?.length ?? 0)} jogadores</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div style={{ color: 'var(--color-neutral-700)' }}>{c.description ?? ''}</div>
              <div style={{ marginTop: 'var(--space-2)', fontSize: 12, color: 'var(--color-neutral-600)' }}>RuleSet: {c.ruleSet ?? '-'}</div>
            </CardBody>
            <CardFooter>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Button onClick={() => navigate(`/master/campaigns/${c.id}`)}>Abrir</Button>
                <Button onClick={() => navigate(`/master/campaigns/${c.id}`)} variant="ghost">Editar</Button>
                <Button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} variant="secondary">{deletingId === c.id ? 'Excluindo...' : 'Excluir'}</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <StickyCTA
        primaryLabel="Nova campanha"
        onPrimaryClick={() => navigate('/master/campaigns/new')}
      />
    </div>
  )
}