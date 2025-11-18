import { useState } from 'react'
import { useAppStore } from '@shared/store/appStore'
import { useTranslation } from 'react-i18next'

export default function DashboardPlayer() {
  const [token, setToken] = useState('')
  const validateInvite = useAppStore(s => s.validateInvite)
  const acceptInvite = useAppStore(s => s.acceptInvite)
  const { t: tr } = useTranslation()

  async function onUseToken() {
    const tok = token.trim()
    if (!tok) return
    const v = validateInvite(tok)
    if (!v.ok) {
      const msg = v.reason === 'expired' ? tr('invite.expired') : v.reason === 'limit_reached' ? tr('invite.limit') : tr('invite.invalid')
      alert(msg)
      return
    }
    const res = acceptInvite(tok)
    if (!res.ok) {
      alert(`${tr('invite.accept_failed')}: ${res.error}`)
      return
    }
    alert(tr('invite.accepted'))
    setToken('')
  }

  const acceptedCampaigns = []
  const hasCharacter = false

  return (
    <div>
      <h2>{tr('player.title')}</h2>

      <div className="card">
        <strong>{tr('player.invite.token')}</strong>
        <label htmlFor="invite-token" className="sr-only">{tr('player.invite.token')}</label>
        <input id="invite-token" placeholder={tr('player.invite.input_placeholder')} value={token} onChange={e => setToken(e.target.value)} />
        <button type="button" onClick={onUseToken}>{tr('player.invite.use_token')}</button>
      </div>

      <div className="card">
        <strong>{tr('player.my_campaigns')}</strong>
        <ul>
          {acceptedCampaigns.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{c.name}</span>
              <span style={{ color: 'var(--muted)' }}>#{c.id}</span>
              <div style={{ flex: 1 }} />
              <button type="button" disabled aria-disabled="true">{tr('common.open')}</button>
            </li>
          ))}
        </ul>
      </div>

      {!hasCharacter && (
        <div className="card">
          <strong>{tr('player.no_sheet')}</strong>
          <button type="button">{tr('player.create_sheet')}</button>
        </div>
      )}
    </div>
  )
}