import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'

export default function DashboardPlayer() {
  const [token, setToken] = useState('')
  const acceptInvite = useAppStore(s => s.acceptInvite)
  const user = useAppStore(s => s.user)
  const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
  const listAcceptedCampaigns = useAppStore(s => s.listAcceptedCampaigns)
  const navigate = useNavigate()

  async function onUseToken() {
    const t = token.trim()
    if (!t) return
    const res = acceptInvite(t)
    if (!res.ok) {
      alert(`Falha ao aceitar convite: ${res.error}`)
      return
    }
    alert('Convite aceito!')
    setToken('')
  }

  const acceptedCampaigns = useMemo(() => {
    if (!user) return []
    return listAcceptedCampaigns()
  }, [user, listAcceptedCampaigns])
  const hasCharacter = useMemo(() => {
    if (!user) return false
    return acceptedCampaigns.some(c => Boolean(getMyPlayerSheet(c.id)))
  }, [acceptedCampaigns, user, getMyPlayerSheet])

  function openCampaign(id: string) {
    navigate(`/campaigns/${id}`)
  }

  function onCreateSheet() {
    if (acceptedCampaigns.length === 0) return
    const target = acceptedCampaigns[0]
    navigate(`/characters/${target.id}`)
  }

  return (
    <div>
      <h2>Dashboard do Jogador</h2>

      <div className="card">
        <strong>Token de convite</strong>
        <input placeholder="Cole o token de convite" value={token} onChange={e => setToken(e.target.value)} />
        <button type="button" onClick={onUseToken}>Aceitar Convite</button>
      </div>

      <div className="card">
        <strong>Suas campanhas</strong>
        <ul>
          {acceptedCampaigns.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{c.name}</span>
              <span style={{ color: 'var(--muted)' }}>#{c.id}</span>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => openCampaign(c.id)}>Abrir</button>
            </li>
          ))}
        </ul>
      </div>

      {!hasCharacter && (
        <div className="card">
          <strong>Você ainda não tem ficha</strong>
          <button type="button" onClick={onCreateSheet} disabled={acceptedCampaigns.length === 0}>Criar sua Ficha</button>
        </div>
      )}
    </div>
  )
}
