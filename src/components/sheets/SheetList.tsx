import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, EmptyState, Spinner } from '../common'
import { useCharacters } from '../../hooks/useCharacters'
import { duplicateCharacter } from '../../services/characters.service'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

export default function SheetList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()
  const characters = useCharacters()
  const [query, setQuery] = useState('')
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return characters.items
    return characters.items.filter(c => (c.name ?? '').toLowerCase().includes(q))
  }, [characters.items, query])

  const handleDuplicate = async (id: string) => {
    if (!user || !online || duplicatingId) return
    setDuplicatingId(id)
    try {
      await duplicateCharacter(id, user.uid)
      push('Ficha duplicada com sucesso')
    } catch {
      push('Erro ao duplicar a ficha')
    } finally {
      setDuplicatingId(null)
    }
  }

  if (characters.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (characters.error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar fichas</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 1024, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span>Fichas</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Input value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder="Buscar por nome" />
              <Button onClick={() => navigate('/sheets/new')} disabled={!online}>Nova ficha</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState title="Nenhuma ficha" description="Crie sua primeira ficha para começar." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
              {filtered.map(c => (
                <Card key={c.id}>
                  <CardHeader>{c.name ?? 'Sem nome'}</CardHeader>
                  <CardBody>
                    <div style={{ color: 'var(--color-neutral-600)' }}>Playbook: {c.playbook ?? '—'}</div>
                  </CardBody>
                  <CardFooter>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <Button onClick={() => navigate(`/sheets/${c.id}`)}>Abrir</Button>
                      <Button onClick={() => handleDuplicate(c.id)} disabled={!online || duplicatingId === c.id} variant="ghost">Duplicar</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}