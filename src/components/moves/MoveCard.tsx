import { Card, CardHeader, CardBody, CardFooter, Badge } from '../common'

type MoveCardProps = {
  name: string
  trigger?: string
  description?: string
  results?: {
    on10Plus?: string
    on7to9?: string
    onMiss?: string
  }
}

export default function MoveCard({ name, trigger, description, results }: MoveCardProps) {
  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span>{name}</span>
          {trigger && <Badge tone="soft" variant="neutral">{trigger}</Badge>}
        </div>
      </CardHeader>
      <CardBody>
        {description && (
          <div style={{ marginBottom: 'var(--space-3)', color: 'var(--color-neutral-700)' }}>{description}</div>
        )}
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {results?.on10Plus && (
            <div>
              <div style={{ fontWeight: 600 }}>10+</div>
              <div style={{ color: 'var(--color-neutral-700)' }}>{results.on10Plus}</div>
            </div>
          )}
          {results?.on7to9 && (
            <div>
              <div style={{ fontWeight: 600 }}>7–9</div>
              <div style={{ color: 'var(--color-neutral-700)' }}>{results.on7to9}</div>
            </div>
          )}
          {results?.onMiss && (
            <div>
              <div style={{ fontWeight: 600 }}>6-</div>
              <div style={{ color: 'var(--color-neutral-700)' }}>{results.onMiss}</div>
            </div>
          )}
        </div>
      </CardBody>
      <CardFooter />
    </Card>
  )
}