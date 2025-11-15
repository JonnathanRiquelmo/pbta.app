import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, EmptyState, Spinner } from '../common'
import { useMovesForCampaign } from '../../hooks/useMovesForCampaign'
import { deleteMove } from '../../services/moves.service'
import MovesEditor from './MovesEditor'
import MoveCard from './MoveCard'
import { useToast } from '../common'

export default function MasterMoves() {
  const { id } = useParams()
  const { push } = useToast()
  const moves = useMovesForCampaign(id)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return moves.items
    return moves.items.filter(m => (
      (m.name ?? '').toLowerCase().includes(q) || (m.trigger ?? '').toLowerCase().includes(q)
    ))
  }, [moves.items, query])

  const current = editingId ? moves.items.find(m => m.id === editingId) ?? null : null

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteMove(id)
      push('Move excluído')
    } catch (e) {
      push('Erro ao excluir move')
    } finally {
      setDeletingId(null)
    }
  }

  // Editor overlay
  if (creating || editingId) {
    return (
      <MovesEditor
        campaignId={id ?? ''}
        move={current ? { ...current } : null}
        onClose={() => { setCreating(false); setEditingId(null) }}
      />
    )
  }

  if (moves.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (moves.error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar moves</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 1024, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span>Moves da Campanha</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Input value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder="Buscar por nome/gatilho" />
              <Button onClick={() => setCreating(true)}>Novo Move</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum move" description="Crie o primeiro move para começar." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {filtered.map(m => (
                <div key={m.id}>
                  <MoveCard name={m.name} trigger={m.trigger} description={m.description} results={m.results} />
                  <div style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-2) 0' }}>
                    <Button onClick={() => setEditingId(m.id)}>Editar</Button>
                    <Button onClick={() => handleDelete(m.id)} variant="ghost" disabled={deletingId === m.id}>Excluir</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
        <CardFooter />
      </Card>
    </div>
  )
}