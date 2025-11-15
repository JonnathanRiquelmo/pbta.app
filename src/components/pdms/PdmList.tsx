import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Button, Input, EmptyState, Spinner, Badge } from '../common'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { usePdms } from '../../hooks/usePdms'
import { deletePdm } from '../../services/characters.service'

export default function PdmList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push } = useToast()
  const { online } = useNetworkStatus()
  const pdms = usePdms()
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pdms.items
    return pdms.items.filter(c => (c.name ?? '').toLowerCase().includes(q))
  }, [pdms.items, query])

  const handleDelete = async (id: string) => {
    if (!user || !online || deletingId) return
    setDeletingId(id)
    try {
      await deletePdm(id, user.uid)
      push('PDM excluído com sucesso')
    } catch {
      push('Você não tem permissão para excluir este PDM')
    } finally {
      setDeletingId(null)
    }
  }

  if (pdms.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (pdms.error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar PDMs</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 1024, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span>PDMs</span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Input value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder="Buscar por nome" />
              <Button onClick={() => navigate('/master/pdms/new')} disabled={!online}>Novo PDM</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum PDM" description="Crie seu primeiro PDM para começar." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
              {filtered.map(c => (
                <Card key={c.id}>
                  <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                      <span>{c.name ?? 'Sem nome'}</span>
                      {c.isPrivateToMaster && <Badge tone="soft" variant="neutral">Privado</Badge>}
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div style={{ color: 'var(--color-neutral-600)' }}>NPC</div>
                  </CardBody>
                  <CardFooter>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <Button onClick={() => navigate(`/master/pdms/${c.id}`)}>Abrir</Button>
                      <Button onClick={() => handleDelete(c.id)} disabled={!online || deletingId === c.id} variant="ghost">Excluir</Button>
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