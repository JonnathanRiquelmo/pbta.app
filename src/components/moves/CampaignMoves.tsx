import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardBody, CardFooter, Tabs, EmptyState, Spinner } from '../common'
import { useMovesForCampaign } from '../../hooks/useMovesForCampaign'
import { useCharacters } from '../../hooks/useCharacters'
import MoveCard from './MoveCard'

export default function CampaignMoves() {
  const { id } = useParams()
  const moves = useMovesForCampaign(id)
  const chars = useCharacters()
  const [tab, setTab] = useState('all')

  const myCharacter = useMemo(() => {
    return chars.items.find(c => c.campaignId === id && c.isNPC === false) || null
  }, [chars.items, id])

  const assignedMoveIds = useMemo(() => {
    const list = (myCharacter && (myCharacter as { moves?: string[] }).moves) ?? []
    return Array.isArray(list) ? list : []
  }, [myCharacter])

  const assignedMoves = useMemo(() => {
    const list = moves.items.filter(m => assignedMoveIds.includes(m.id))
    if (tab === 'withTrigger') return list.filter(m => (m.trigger ?? '').trim().length > 0)
    if (tab === 'withoutTrigger') return list.filter(m => !(m.trigger ?? '').trim().length)
    return list
  }, [moves.items, assignedMoveIds, tab])

  if (moves.loading || chars.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <Spinner />
      </div>
    )
  }

  if (moves.error || chars.error) {
    return <div style={{ color: 'var(--color-danger-600)', padding: 'var(--space-4)' }}>Erro ao carregar moves do jogador</div>
  }

  return (
    <div style={{ padding: 'var(--space-4)', maxWidth: 1024, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <Card>
        <CardHeader>
          <span>Moves do Jogador</span>
        </CardHeader>
        <CardBody>
          <Tabs
            items={[
              { id: 'all', label: 'Todos', content: null },
              { id: 'withTrigger', label: 'Com Gatilho', content: null },
              { id: 'withoutTrigger', label: 'Sem Gatilho', content: null }
            ]}
            value={tab}
            onChange={id => setTab(id)}
          />
          {assignedMoves.length === 0 ? (
            <EmptyState title="Nenhum move atribuído" description="Solicite ao mestre atribuir moves à sua ficha." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {assignedMoves.map(m => (
                <MoveCard key={m.id} name={m.name} trigger={m.trigger} description={m.description} results={m.results} />
              ))}
            </div>
          )}
        </CardBody>
        <CardFooter />
      </Card>
    </div>
  )
}