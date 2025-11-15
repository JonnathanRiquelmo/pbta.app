import { Card, CardHeader, CardBody, Spinner, EmptyState } from '../common'
import { useRollsAll } from '../../hooks/useRollsAll'

export default function RollMonitor() {
  const { items, loading, error } = useRollsAll()

  if (loading) return <Spinner />
  if (error) return <div style={{ color: 'var(--color-danger-600)' }}>Erro ao carregar</div>
  if (items.length === 0) return <EmptyState title="Sem rolagens" description="Nenhuma rolagem registrada." />

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {items.map(r => (
        <Card key={r.id}>
          <CardHeader>{`UID: ${r.rollerUid}`}</CardHeader>
          <CardBody>{`Total: ${r.total ?? '-'} | Campaign: ${r.campaignId ?? '-'} | Character: ${r.characterId ?? '-'}`}</CardBody>
        </Card>
      ))}
    </div>
  )
}