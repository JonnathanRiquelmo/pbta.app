import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'

export default function CampaignRoute() {
  const { id } = useParams()
  const setCurrentCampaign = useAppStore(s => s.setCurrentCampaign)
  const listPlayers = useAppStore(s => s.listPlayers)
  if (id) setCurrentCampaign(id)
  const players = useMemo(() => (id ? listPlayers(id) : []), [id, listPlayers])
  return (
    <div>
      <h2>Campanha {id}</h2>
      <div className="card">
        <strong>Jogadores</strong>
        {players.length === 0 ? (
          <p>Nenhum jogador aceito ainda.</p>
        ) : (
          <ul>
            {players.map(p => (
              <li key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{p.displayName}</span>
                <span style={{ color: 'var(--muted)' }}>#{p.userId}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}