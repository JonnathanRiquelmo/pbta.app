import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { getDb } from '@fb/client'
import type { Campaign } from '@campaigns/types'
import type { PlayerSheet } from '@characters/types'

export default function CampaignDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const setCurrentCampaign = useAppStore(s => s.setCurrentCampaign)
    const user = useAppStore(s => s.user)
    const generateInvite = useAppStore(s => s.generateInvite)
    const listSessions = useAppStore(s => s.listSessions)
    const subscribeSessions = useAppStore(s => s.subscribeSessions)
    const createSession = useAppStore(s => s.createSession)
    const updateCampaignNotes = useAppStore(s => s.updateCampaignNotes)

    const [campaign, setCampaign] = useState<Campaign | null>(null)

    const [activeTab, setActiveTab] = useState<'plot' | 'notes' | 'players' | 'sessions' | 'sheet'>('plot')
    const [inviteLink, setInviteLink] = useState('')
    const [sessions, setSessions] = useState(id ? listSessions(id) : [])
    const [notesValue, setNotesValue] = useState('')
    const [mySheet, setMySheet] = useState<PlayerSheet | undefined>(undefined)

    const players = useMemo(() => (campaign?.players ? campaign.players : []), [campaign])

    useEffect(() => {
        if (!id) return
        setCurrentCampaign(id)
        const unsubSessions = subscribeSessions(id, (updated) => { setSessions(updated) })
        const db = getDb()
        if (!db) return () => unsubSessions()
        const ref = doc(db, 'campaigns', id)
        const unsubCampaign = onSnapshot(ref, snap => {
            if (snap.exists()) {
                const data = snap.data() as Omit<Campaign, 'id'>
                setCampaign({ id: snap.id, ...data })
                setNotesValue(data.masterNotes || '')
            } else {
                setCampaign(null)
                setNotesValue('')
            }
        })
        return () => { unsubSessions(); unsubCampaign() }
    }, [id, setCurrentCampaign, subscribeSessions])

    useEffect(() => {
        const db = getDb()
        if (!db || !id || !user) return
        const ref = collection(db, 'characters')
        const qy = query(ref, where('campaignId', '==', id), where('userId', '==', user.uid))
        const unsub = onSnapshot(qy, snap => {
            if (snap.empty) {
                setMySheet(undefined)
            } else {
                const d = snap.docs[0]
                const data = d.data() as Omit<PlayerSheet, 'id'>
                setMySheet({ id: d.id, ...data })
            }
        })
        return () => unsub()
    }, [id, user])

    if (!campaign) return <div>Carregando ou não encontrado...</div>

    const isGM = user?.role === 'master' && campaign.ownerId === user.uid

    function handleInvite() {
        if (!id) return
        const { link } = generateInvite(id)
        setInviteLink(window.location.origin + link)
    }

    function handleCreateSession() {
        if (!id) return
        const name = prompt('Nome da Sessão:')
        if (name) {
            const result = createSession(id, { name, date: Date.now() })
            if (result.ok) {
                // Refresh sessions list immediately
                setSessions(listSessions(id))
            }
        }
    }

    return (
        <div className="campaign-detail container">
            <header className="campaign-header flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1>{campaign.name}</h1>
                {isGM && (
                    <div className="actions">
                        <button onClick={handleInvite} className="btn btn-primary">Gerar Convite</button>
                    </div>
                )}
            </header>

            <AnimatePresence>
                {inviteLink && (
                    <motion.div
                        className="invite-box card"
                        style={{ marginBottom: '2rem', borderColor: 'var(--primary)' }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <p>Link de convite: <input readOnly value={inviteLink} onClick={e => e.currentTarget.select()} /></p>
                        <button onClick={() => setInviteLink('')} className="btn">Fechar</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="tabs">
                <button className={activeTab === 'plot' ? 'active' : ''} onClick={() => setActiveTab('plot')}>Plot</button>
                <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notas</button>
                <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>Jogadores</button>
                <button className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>Sessões</button>
                {user?.role === 'player' && (
                    <button className={activeTab === 'sheet' ? 'active' : ''} onClick={() => setActiveTab('sheet')}>Minha Ficha</button>
                )}
            </nav>

            <main className="tab-content">
                <AnimatePresence mode="wait">
                    {activeTab === 'plot' && (
                        <motion.div
                            key="plot"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="plot-section card"
                        >
                            <h3>Enredo</h3>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{campaign.plot}</p>
                        </motion.div>
                    )}
                    {activeTab === 'notes' && (
                        <motion.div
                            key="notes"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="notes-section card"
                        >
                            <h3>Notas do Mestre</h3>
                            {isGM ? (
                                <div style={{ display: 'grid', gap: 8 }}>
                                    <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} placeholder="Anotações secretas..." style={{ minHeight: '200px' }} />
                                    <div>
                                        <button className="btn btn-primary" onClick={() => { if (id) updateCampaignNotes(id, notesValue) }}>Salvar Notas</button>
                                    </div>
                                </div>
                            ) : (
                                <p>Apenas o mestre pode ver isso.</p>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'players' && (
                        <motion.div
                            key="players"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="players-section card"
                        >
                            <h3>Jogadores</h3>
                            {players.length === 0 ? (
                                <p className="text-muted">Nenhum jogador aceito ainda.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {players.map(p => (
                                        <li key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>{p.displayName}</span>
                                            <span style={{ color: 'var(--muted)' }}>{p.email || `#${p.userId}`}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    )}
                    {activeTab === 'sessions' && (
                        <motion.div
                            key="sessions"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="sessions-section card"
                        >
                            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
                                <h3>Sessões</h3>
                                {isGM && <button onClick={handleCreateSession} className="btn btn-primary">Nova Sessão</button>}
                            </div>
                            <ul className="session-list" style={{ listStyle: 'none', padding: 0 }}>
                                {sessions.map(s => (
                                    <li key={s.id} style={{ marginBottom: '0.5rem' }}>
                                        <button
                                            onClick={() => navigate(`/campaigns/${id}/session/${s.id}`)}
                                            className="btn"
                                            style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg)', border: '1px solid var(--border)' }}
                                        >
                                            <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>{s.name}</span>
                                            <span className="text-muted">{new Date(s.date).toLocaleDateString()}</span>
                                        </button>
                                    </li>
                                ))}
                                {sessions.length === 0 && <p className="text-muted">Nenhuma sessão criada.</p>}
                            </ul>
                        </motion.div>
                    )}
                    {activeTab === 'sheet' && user?.role === 'player' && (
                        <motion.div
                            key="sheet"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="sheet-section card"
                        >
                            <h3>Minha Ficha</h3>
                            {!mySheet ? (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className="text-muted">Você ainda não tem ficha nesta campanha.</span>
                                    <button className="btn btn-primary" onClick={() => navigate(`/campaigns/${id}/sheet`)}>Criar Ficha</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div>
                                        <div><strong>{mySheet.name}</strong></div>
                                        <div className="text-muted">{mySheet.background}</div>
                                    </div>
                                    <div style={{ flex: 1 }} />
                                    <button className="btn" onClick={() => navigate(`/campaigns/${id}/sheet`)}>Abrir Ficha</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
