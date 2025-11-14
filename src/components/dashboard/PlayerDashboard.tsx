import { useMemo } from 'react'
import { Card, CardHeader, CardBody, CardFooter, Badge, EmptyState, Button } from '../common'
import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useCharacters } from '../../hooks/useCharacters'
import { useRolls } from '../../hooks/useRolls'

export default function PlayerDashboard() {
  const navigate = useNavigate()
  const campaigns = useCampaigns()
  const characters = useCharacters()
  const rolls = useRolls()

  const cards = useMemo(
    () => [
      {
        title: 'Campanhas',
        count: campaigns.count,
        loading: campaigns.loading,
        error: campaigns.error,
        actions: [
          { label: 'Ver campanhas', to: '/campaigns' }
        ]
      },
      {
        title: 'Fichas',
        count: characters.count,
        loading: characters.loading,
        error: characters.error,
        actions: [
          { label: 'Ver fichas', to: '/sheets' },
          { label: 'Criar ficha', to: '/sheets/new' }
        ]
      },
      {
        title: 'Rolagens',
        count: rolls.count,
        loading: rolls.loading,
        error: rolls.error,
        actions: [
          { label: 'Rolar dados', to: '/roller' },
          { label: 'Ver histórico', to: '/profile' }
        ]
      }
    ], [campaigns, characters, rolls]
  )

  return (
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
  )
}