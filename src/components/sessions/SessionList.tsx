import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, EmptyState, Spinner } from '../common'
import { useSessionsForCampaign } from '../../hooks/useSessionsForCampaign'
import { deleteSession } from '../../services/sessions.service'
import { useToast } from '../common'

export default function SessionList() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const sessions = useSessionsForCampaign(id)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sessions.items
    return sessions.items.filter(s => (
      (s.title ?? '').toLowerCase().includes(q) || (s.summary ?? '').toLowerCase().includes(q)
    ))
  }, [sessions.items, query])

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteSession(id)
      push('Sessão excluída')
    } catch {
      push('Erro ao excluir sessão')
    } finally {
      setDeletingId(null)
    }
  }

  if (sessions.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (sessions.error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar sessões</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 1024, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span>Sessões da Campanha</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Input value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder="Buscar por título/resumo" />
              <Button onClick={() => navigate(`/master/campaigns/${id}/sessions/new`)}>Nova Sessão</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState title="Nenhuma sessão" description="Crie a primeira sessão para começar." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {filtered.map(s => (
                <Card key={s.id}>
                  <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                      <span>{s.title && s.title.trim().length > 0 ? s.title : 'Sessão'}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{s.date}</span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div style={{ color: 'var(--color-neutral-700)' }}>{s.summary ?? ''}</div>
                  </CardBody>
                  <CardFooter>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <Button onClick={() => navigate(`/master/campaigns/${id}/sessions/${s.id}`)}>Editar</Button>
                      <Button onClick={() => handleDelete(s.id)} variant="ghost" disabled={deletingId === s.id}>Excluir</Button>
                      <Button onClick={() => navigate(`/campaigns/${id}/sessions/${s.id}`)} variant="ghost">Ver como jogador</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
        <CardFooter />
      </Card>
    </div>
  )
}