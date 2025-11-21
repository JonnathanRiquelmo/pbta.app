import { useAppStore } from '@shared/store/appStore'
import { useNavigate } from 'react-router-dom'

export default function CampaignList() {
    const campaigns = useAppStore(s => s.user?.role === 'master' ? s.listMyCampaigns() : s.listAcceptedCampaigns())
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
                        <li key={c.id} className="campaign-card card" onClick={() => navigate(`/campaigns/${c.id}`)}>
                            <h3 className="text-accent">{c.name}</h3>
                            <p>{c.plot.substring(0, 100)}...</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
