import { useAppStore } from '@shared/store/appStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function CampaignList() {
    const role = useAppStore(s => s.user?.role)
    const masterCampaigns = useAppStore(s => s.campaigns)
    const playerCampaigns = useAppStore(s => s.acceptedCampaigns)
    const campaigns = role === 'master' ? masterCampaigns : playerCampaigns
    const deleteCampaign = useAppStore(s => s.deleteCampaign)
    const navigate = useNavigate()
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

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
                                        setConfirmDelete(c.id)
                                    }}
                                >Apagar</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {confirmDelete && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', zIndex: 1000 }} onClick={() => setConfirmDelete(null)}>
                    <div className="card" style={{ width: '100%', maxWidth: 420, padding: '1rem' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Excluir Campanha</h3>
                        <p>Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                            <button className="btn btn-danger" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }} onClick={() => {
                                deleteCampaign(confirmDelete)
                                setConfirmDelete(null)
                            }}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
