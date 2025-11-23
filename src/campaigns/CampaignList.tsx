import { useAppStore } from '@shared/store/appStore'
import { useNavigate } from 'react-router-dom'

export default function CampaignList() {
    const role = useAppStore(s => s.user?.role)
    const masterCampaigns = useAppStore(s => s.campaigns)
    const playerCampaigns = useAppStore(s => s.acceptedCampaigns)
    const campaigns = role === 'master' ? masterCampaigns : playerCampaigns
    const deleteCampaign = useAppStore(s => s.deleteCampaign)
    const navigate = useNavigate()

    return (
        <div className="campaign-list">
            {campaigns.length === 0 ? (
                <div className="card text-center">
                    <p>Nenhuma campanha encontrada.</p>
                </div>
            ) : (
                <ul className="campaign-grid" style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {campaigns.map(c => (
                        <li key={c.id} className="campaign-card card" onClick={() => navigate(`/campaigns/${c.id}`)} style={{ position: 'relative' }}>
                            <h3 className="text-accent">{c.name}</h3>
                            <p>{c.plot.substring(0, 100)}...</p>
                            {role === 'master' && (
                                <button
                                    className="btn"
                                    style={{ position: 'absolute', top: 12, right: 12 }}
                                    onClick={e => {
                                        e.stopPropagation()
                                        const ok = confirm('Tem certeza que deseja apagar esta campanha?')
                                        if (!ok) return
                                        deleteCampaign(c.id)
                                    }}
                                >Apagar</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
