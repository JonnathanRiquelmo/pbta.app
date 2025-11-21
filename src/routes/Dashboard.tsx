import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppStore } from '@shared/store/appStore'
import CampaignList from '@campaigns/CampaignList'
import CreateCampaign from '@campaigns/CreateCampaign'
import { motion } from 'framer-motion'

function MasterDashboard() {
    return (
        <motion.div
            className="dashboard-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="dashboard-header flex justify-between items-center mb-4">
                <h2>Painel do Mestre</h2>
                <Link to="/dashboard/create-campaign" className="btn btn-primary">Nova Campanha</Link>
            </div>
            <CampaignList />
        </motion.div>
    )
}

function PlayerDashboard() {
    const [token, setToken] = useState('')
    const acceptInvite = useAppStore(s => s.acceptInvite)
    const navigate = useNavigate()

    async function onAccept() {
        let t = token.trim()
        if (!t) return
        try {
            if (t.startsWith('http')) {
                const u = new URL(t)
                t = u.searchParams.get('invite') || t
            } else if (t.includes('invite=')) {
                const m = t.match(/invite=([^&]+)/)
                t = (m && m[1]) || t
            }
        } catch {}
        const res = await acceptInvite(t)
        if (!res.ok) {
            alert(`Falha ao aceitar convite: ${res.error}`)
            return
        }
        setToken('')
        if (res.campaignId) navigate(`/campaigns/${res.campaignId}`)
    }

    return (
        <motion.div
            className="dashboard-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="dashboard-header mb-4">
                <h2>Painel do Jogador</h2>
            </div>
            <div className="card" style={{ marginBottom: '1rem' }}>
                <strong>Aceitar convite</strong>
                <div className="flex items-center gap-2" style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="Cole o token de convite" value={token} onChange={e => setToken(e.target.value)} />
                    <button className="btn btn-primary" type="button" onClick={onAccept}>Aceitar Convite</button>
                </div>
            </div>
            <CampaignList />
        </motion.div>
    )
}

export default function Dashboard() {
    const user = useAppStore(s => s.user)
    const logout = useAppStore(s => s.logout)
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/home')
    }

    if (!user) return <Navigate to="/login" />

    return (
        <div className="dashboard-layout">
            <header className="header">
                <div className="container flex justify-between items-center">
                    <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>PBTA System</div>
                    <div className="user-menu flex items-center gap-4">
                        <span className="text-muted">{user.displayName} ({user.role === 'master' ? 'Mestre' : 'Jogador'})</span>
                        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Sair</button>
                    </div>
                </div>
            </header>
            <main className="container mt-4">
                <Routes>
                    <Route path="master" element={user.role === 'master' ? <MasterDashboard /> : <Navigate to="/dashboard/player" />} />
                    <Route path="player" element={<PlayerDashboard />} />
                    <Route path="create-campaign" element={user.role === 'master' ? <CreateCampaign /> : <Navigate to="/dashboard/player" />} />
                    <Route path="*" element={<Navigate to={user.role === 'master' ? "master" : "player"} />} />
                </Routes>
            </main>
        </div>
    )
}
