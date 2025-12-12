import { useAppStore } from '@shared/store/appStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ConfirmationModal from '@shared/components/ConfirmationModal'
import { LuTrash2 } from 'react-icons/lu'

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
                                    className="btn btn-ghost"
                                    style={{ position: 'absolute', top: 12, right: 12, padding: '8px', color: 'var(--fg-muted)' }}
                                    onClick={e => {
                                        e.stopPropagation()
                                        setConfirmDelete(c.id)
                                    }}
                                    title="Excluir Campanha"
                                >
                                    <LuTrash2 size={18} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            
            <ConfirmationModal
                isOpen={!!confirmDelete}
                title="Excluir Campanha"
                message="Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita."
                confirmLabel="Excluir"
                onConfirm={() => {
                    if (confirmDelete) {
                        deleteCampaign(confirmDelete)
                        setConfirmDelete(null)
                    }
                }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    )
}
