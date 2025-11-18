import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'

export default function InviteAcceptPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => params.get('invite') ?? '', [params])
  const validateInvite = useAppStore(s => s.validateInvite)
  const acceptInvite = useAppStore(s => s.acceptInvite)

  const [status, setStatus] = useState<'idle' | 'invalid' | 'expired' | 'limit' | 'valid' | 'accepted'>('idle')
  const [campaignId, setCampaignId] = useState<string>('')

  useEffect(() => {
    if (!token) return
    const v = validateInvite(token)
    if (!v.ok) {
      setStatus(v.reason === 'expired' ? 'expired' : v.reason === 'limit_reached' ? 'limit' : 'invalid')
      return
    }
    setCampaignId(v.campaignId!)
    setStatus('valid')
  }, [token])

  function onAccept() {
    const res = acceptInvite(token)
    if (!res.ok) {
      setStatus(res.error === 'expired' ? 'expired' : res.error === 'limit_reached' ? 'limit' : 'invalid')
      return
    }
    setStatus('accepted')
  }

  function goToCampaign() {
    if (campaignId) navigate(`/campaigns/${campaignId}`)
  }

  return (
    <div>
      <h2>Aceitar convite</h2>
      {!token && <p>Nenhum token de convite na URL.</p>}
      {token && status === 'idle' && <p>Validando convite...</p>}
      {status === 'invalid' && <p>Token inválido.</p>}
      {status === 'expired' && <p>Convite expirado.</p>}
      {status === 'limit' && <p>Limite de usos atingido.</p>}
      {status === 'valid' && (
        <div className="card">
          <strong>Convite válido</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onAccept}>Aceitar convite</button>
          </div>
        </div>
      )}
      {status === 'accepted' && (
        <div className="card">
          <strong>Convite aceito!</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={goToCampaign}>Abrir campanha</button>
          </div>
        </div>
      )}
    </div>
  )}