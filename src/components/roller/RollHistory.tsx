import { Card, CardHeader, CardBody, Spinner, EmptyState } from '../common'
import { useRolls } from '../../hooks/useRolls'

export default function RollHistory() {
  const { items, loading, error } = useRolls()

  if (loading) return <Spinner />
  if (error) return <div style={{ color: 'var(--color-danger-600)' }}>Erro ao carregar</div>
  if (items.length === 0) return <EmptyState title="Sem rolagens" description="Faça sua primeira rolagem." />

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {items.map(r => (
        <Card key={r.id}>
          <CardHeader>Roll #{r.id.slice(-6)}</CardHeader>
          <CardBody>{`Total: ${r.total ?? '-'} | Quando: ${String(r.timestamp ?? '')}`}</CardBody>
        </Card>
      ))}
    </div>
  )
}