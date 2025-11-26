import { useState } from 'react'
import { useAppStore } from '@shared/store/appStore'

export default function DashboardMaster() {
  const campaigns = useAppStore(s => s.campaigns)
  const campaignsLoading = useAppStore(s => s.campaignsLoading)
  const createCampaign = useAppStore(s => s.createCampaign)
  const generateInvite = useAppStore(s => s.generateInvite)

  const [name, setName] = useState('')
  const [plot, setPlot] = useState('')
  const [lastInvite, setLastInvite] = useState<string>('')

  function onCreateCampaign() {
    if (!name.trim()) return
    const c = createCampaign({ name: name.trim(), plot })
    setName('')
    setPlot('')
    alert(`Campanha criada: ${c.name} (#${c.id})`)
  }

  async function onGenerateInvite(campaignId: string) {
    const { link } = generateInvite(campaignId)
    setLastInvite(link)
    try {
      await navigator.clipboard.writeText(link)
      alert('Link de convite copiado!')
    } catch {
      alert(`Convite: ${link}`)
    }
  }

  return (
    <div>
      <h2>Dashboard do Mestre</h2>

      <div className="card">
        <strong>Criar campanha</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Plot (opcional)" value={plot} onChange={e => setPlot(e.target.value)} />
          <button type="button" onClick={onCreateCampaign}>Criar</button>
        </div>
        {lastInvite && (
          <div style={{ marginTop: 8, color: 'var(--muted)' }}>Último convite: {lastInvite}</div>
        )}
      </div>

      <div className="card">
        <strong>Suas campanhas</strong>
        {campaignsLoading ? (
          <p className="text-muted">Carregando...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-muted">Nenhuma campanha encontrada.</p>
        ) : (
          <ul>
            {campaigns.map(c => (
              <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{c.name}</span>
                <span style={{ color: 'var(--muted)' }}>#{c.id}</span>
                <div style={{ flex: 1 }} />
                <button type="button" onClick={() => onGenerateInvite(c.id)}>
                  Gerar convite
                </button>
                <button type="button" disabled>
                  Abrir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
