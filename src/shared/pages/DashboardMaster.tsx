import { useMemo, useState } from 'react'
import { useAppStore } from '@shared/store/appStore'
import { useTranslation } from 'react-i18next'

export default function DashboardMaster() {
  const listMyCampaigns = useAppStore(s => s.listMyCampaigns)
  const createCampaign = useAppStore(s => s.createCampaign)
  const generateInvite = useAppStore(s => s.generateInvite)
  const campaigns = useMemo(() => listMyCampaigns(), [listMyCampaigns])
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [plot, setPlot] = useState('')
  const [lastInvite, setLastInvite] = useState<string>('')

  function onCreateCampaign() {
    if (!name.trim()) return
    const c = createCampaign({ name: name.trim(), plot })
    setName('')
    setPlot('')
    alert(`${t('master.create.title')}: ${c.name} (#${c.id})`)
  }

  async function onGenerateInvite(campaignId: string) {
    const { link } = generateInvite(campaignId)
    setLastInvite(link)
    try {
      await navigator.clipboard.writeText(link)
      alert(t('invite.copied'))
    } catch {
      alert(`${t('invite.valid')}: ${link}`)
    }
  }

  return (
    <div>
      <h2>{t('master.title')}</h2>

      <div className="card">
        <strong>{t('master.create.title')}</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label htmlFor="campaign-name">{t('master.create.name')}</label>
          <input id="campaign-name" value={name} onChange={e => setName(e.target.value)} />
          <label htmlFor="campaign-plot">{t('master.create.plot')}</label>
          <input id="campaign-plot" value={plot} onChange={e => setPlot(e.target.value)} />
          <button type="button" onClick={onCreateCampaign}>{t('master.create.submit')}</button>
        </div>
        {lastInvite && (
          <div style={{ marginTop: 8, color: 'var(--muted)' }}>{t('master.create.last_invite')}: {lastInvite}</div>
        )}
      </div>

      <div className="card">
        <strong>{t('master.my_campaigns')}</strong>
        <ul>
          {campaigns.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{c.name}</span>
              <span style={{ color: 'var(--muted)' }}>#{c.id}</span>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => onGenerateInvite(c.id)}>
                {t('master.generate_invite')}
              </button>
              <button type="button" disabled>
                {t('common.open')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}