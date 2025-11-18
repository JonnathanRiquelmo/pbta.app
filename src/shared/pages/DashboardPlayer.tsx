import { useState } from 'react'
import { useAppStore } from '@shared/store/appStore'

export default function DashboardPlayer() {
  const [token, setToken] = useState('')
  const validateInvite = useAppStore(s => s.validateInvite)
  const acceptInvite = useAppStore(s => s.acceptInvite)

  async function onUseToken() {
    const t = token.trim()
    if (!t) return
    const v = validateInvite(t)
    if (!v.ok) {
      const msg = v.reason === 'expired' ? 'Convite expirado' : v.reason === 'limit_reached' ? 'Limite de usos atingido' : 'Token inválido'
      alert(msg)
      return
    }
    const res = acceptInvite(t)
    if (!res.ok) {
      alert(`Falha ao aceitar convite: ${res.error}`)
      return
    }
    alert('Convite aceito!')
    setToken('')
  }

  const acceptedCampaigns = []
  const hasCharacter = false

  return (
    <div>
      <h2>Dashboard do Jogador</h2>

      <div className="card">
        <strong>Token de convite</strong>
        <input placeholder="Cole o token de convite" value={token} onChange={e => setToken(e.target.value)} />
        <button type="button" onClick={onUseToken}>Usar token</button>
      </div>

      <div className="card">
        <strong>Suas campanhas</strong>
        <ul>
          {acceptedCampaigns.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{c.name}</span>
              <span style={{ color: 'var(--muted)' }}>#{c.id}</span>
              <div style={{ flex: 1 }} />
              <button type="button" disabled>
                Abrir
              </button>
            </li>
          ))}
        </ul>
      </div>

      {!hasCharacter && (
        <div className="card">
          <strong>Você ainda não tem ficha</strong>
          <button type="button">Criar sua Ficha</button>
        </div>
      )}
    </div>
  )
}