import { useMemo } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Badge, EmptyState, Button } from '../common'
import { useNavigate } from 'react-router-dom'
import { useOwnedCampaigns } from '../../hooks/useOwnedCampaigns'
import { usePdms } from '../../hooks/usePdms'
import { useSessionsForMaster } from '../../hooks/useSessionsForMaster'
import { useMovesForMaster } from '../../hooks/useMovesForMaster'
import { useRollsAll } from '../../hooks/useRollsAll'

export default function MasterDashboard() {
  const navigate = useNavigate()
  const campaigns = useOwnedCampaigns()
  const pdms = usePdms()
  const sessions = useSessionsForMaster()
  const moves = useMovesForMaster()
  const rolls = useRollsAll()

  const cards = useMemo(
    () => [
      {
        title: 'Campanhas',
        count: campaigns.count,
        loading: campaigns.loading,
        error: campaigns.error,
        actions: [
          { label: 'Ver campanhas', to: '/master/campaigns' },
          { label: 'Criar campanha', to: '/master/campaigns/new' }
        ]
      },
      {
        title: 'PDMs',
        count: pdms.count,
        loading: pdms.loading,
        error: pdms.error,
        actions: [
          { label: 'Ver PDMs', to: '/master/pdms' },
          { label: 'Criar PDM', to: '/master/pdms/new' }
        ]
      },
      {
        title: 'Sessões',
        count: sessions.count,
        loading: sessions.loading,
        error: sessions.error,
        actions: [
          { label: 'Gerenciar sessões', to: '/master/campaigns' }
        ]
      },
      {
        title: 'Moves',
        count: moves.count,
        loading: moves.loading,
        error: moves.error,
        actions: [
          { label: 'Ver/Criar moves', to: '/master/campaigns' }
        ]
      },
      {
        title: 'Rolagens',
        count: rolls.count,
        loading: rolls.loading,
        error: rolls.error,
        actions: [
          { label: 'Ver painel', to: '/master/rolls' }
        ]
      }
    ], [campaigns, pdms, sessions, moves, rolls]
  )

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {cards.map(card => (
          <Card key={card.title}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{card.title}</span>
                <Badge tone="soft" variant="neutral">{card.loading ? '...' : card.count}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              {card.error && (
                <div style={{ color: 'var(--color-danger-600)' }}>Erro ao carregar</div>
              )}
              {!card.loading && card.count === 0 && !card.error && (
                <EmptyState title="Nenhum item" description="Nada por aqui ainda." />
              )}
            </CardBody>
            <CardFooter>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {card.actions.map(a => (
                  <Button key={a.label} onClick={() => navigate(a.to)}>{a.label}</Button>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}