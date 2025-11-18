import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import { useTranslation } from 'react-i18next'

export default function InviteAcceptPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useMemo(() => params.get('invite') ?? '', [params])
  const validateInvite = useAppStore(s => s.validateInvite)
  const acceptInvite = useAppStore(s => s.acceptInvite)
  const { t } = useTranslation()

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
      <h2>{t('invite.title')}</h2>
      {!token && <p>{t('invite.none_in_url')}</p>}
      {token && status === 'idle' && <p>{t('invite.validating')}</p>}
      {status === 'invalid' && <p role="alert" aria-live="assertive">{t('invite.invalid')}</p>}
      {status === 'expired' && <p role="alert" aria-live="assertive">{t('invite.expired')}</p>}
      {status === 'limit' && <p role="alert" aria-live="assertive">{t('invite.limit')}</p>}
      {status === 'valid' && (
        <div className="card">
          <strong>{t('invite.valid')}</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onAccept}>{t('invite.accept')}</button>
          </div>
        </div>
      )}
      {status === 'accepted' && (
        <div className="card">
          <strong>{t('invite.accepted')}</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={goToCampaign}>{t('invite.open_campaign')}</button>
          </div>
        </div>
      )}
    </div>
  )}