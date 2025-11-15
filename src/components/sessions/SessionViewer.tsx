import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Spinner, EmptyState, Button } from '../common'
import { useSessionById } from '../../hooks/useSessionById'

export default function SessionViewer() {
  const { sessionId } = useParams()
  const { session, loading, error } = useSessionById(sessionId)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar sessão</div>
  }

  if (!session) {
    return <EmptyState title="Sessão não encontrada" description="Verifique o link ou volte para a campanha." />
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 960, margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
            <span>{session.title && session.title.trim().length > 0 ? session.title : 'Sessão'}</span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{session.date}</span>
          </div>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div>
              <h3 style={{ margin: 'var(--space-3) 0 var(--space-2) 0' }}>Resumo</h3>
              <div style={{ color: 'var(--color-neutral-700)' }}>{session.summary ?? ''}</div>
            </div>
            <div>
              <h3 style={{ margin: 'var(--space-3) 0 var(--space-2) 0' }}>Notas públicas</h3>
              <div style={{ whiteSpace: 'pre-wrap', border: '1px solid var(--color-neutral-300)', borderRadius: 8, padding: 'var(--space-3)', color: 'var(--color-neutral-800)' }}>{session.publicNotes ?? ''}</div>
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="ghost" onClick={() => history.back()}>Voltar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}