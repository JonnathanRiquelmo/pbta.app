import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { getDb } from '@fb/client'
import { getAuth } from 'firebase/auth'
import { getUser } from '@auth/userRepo'
import type { Campaign } from '@campaigns/types'
import type { PlayerSheet } from '@characters/types'
import type { NpcSheet } from '@npc/types'
import type { CreateNpcSheetInput } from '@npc/npcRepo'
import NpcForm from '@npc/NpcForm'
import BackButton from '@shared/components/BackButton'

export default function CampaignDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const setCurrentCampaign = useAppStore(s => s.setCurrentCampaign)
    const user = useAppStore(s => s.user)
    const generateInvite = useAppStore(s => s.generateInvite)
    const listSessions = useAppStore(s => s.listSessions)
    const subscribeSessions = useAppStore(s => s.subscribeSessions)
    const createSession = useAppStore(s => s.createSession)
    const deleteSession = useAppStore(s => s.deleteSession)
    const updateCampaignNotes = useAppStore(s => s.updateCampaignNotes)
    const listNpcSheets = useAppStore(s => s.listNpcSheets)
    const createNpcSheets = useAppStore(s => s.createNpcSheets)
    const deleteNpcSheet = useAppStore(s => s.deleteNpcSheet)

    const [campaign, setCampaign] = useState<Campaign | null>(null)

    const [activeTab, setActiveTab] = useState<'plot' | 'notes' | 'players' | 'sessions' | 'sheet' | 'npcs'>('plot')
    const [inviteLink, setInviteLink] = useState('')
    const [sessions, setSessions] = useState(id ? listSessions(id) : [])
    const [notesValue, setNotesValue] = useState('')
    const [mySheet, setMySheet] = useState<PlayerSheet | undefined>(undefined)
    const [playerSheets, setPlayerSheets] = useState<PlayerSheet[]>([])
    const [npcs, setNpcs] = useState<NpcSheet[]>([])
    const [npcsLoading, setNpcsLoading] = useState(true)
    const [npcsError, setNpcsError] = useState<string | null>(null)
    const [showNpcForm, setShowNpcForm] = useState(false)
    const [batchMode, setBatchMode] = useState(false)
    const [npcSuccess, setNpcSuccess] = useState<string | null>(null)
    const playerUids = campaign?.playersUids || []

    const [showSessionForm, setShowSessionForm] = useState(false)
    const [sessionName, setSessionName] = useState('')
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
    const [sessionSummary, setSessionSummary] = useState('')
    const [sessionMasterNotes, setSessionMasterNotes] = useState('')
    const [sessionError, setSessionError] = useState<string | null>(null)
    const [sessionSuccess, setSessionSuccess] = useState<string | null>(null)
    const [playerNames, setPlayerNames] = useState<Record<string, string>>({})

    

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

    // Buscar nomes dos jogadores
    useEffect(() => {
        if (!campaign?.playersUids?.length) return
        
        const loadPlayerNames = async () => {
            const names: Record<string, string> = {}
            for (const uid of campaign.playersUids) {
                // Primeiro tenta buscar do cache local
                let userData = getUser(uid)
                
                // Se não estiver no cache, busca do Firebase
                if (!userData) {
                    try {
                        const auth = getAuth()
                        // Aqui você pode buscar os dados do Firebase ou usar uma função do userRepo
                        // Por enquanto, vamos usar o getUserFromAuth que criamos anteriormente
                        const { getUserFromAuth } = await import('@auth/userRepo')
                        userData = await getUserFromAuth(uid)
                    } catch (error) {
                        console.error('Erro ao buscar usuário do Firebase:', error)
                    }
                }
                
                if (userData) {
                    // Formato: email (displayName) se tiver ambos, ou apenas email se não tiver displayName
                    if (userData.displayName && userData.email) {
                        names[uid] = `${userData.email} (${userData.displayName})`
                    } else if (userData.email) {
                        names[uid] = userData.email
                    } else {
                        names[uid] = `Jogador #${uid.substring(0, 8)}`
                    }
                } else {
                    names[uid] = `Jogador #${uid.substring(0, 8)}`
                }
            }
            setPlayerNames(names)
        }
        
        loadPlayerNames()
    }, [campaign?.playersUids])

    useEffect(() => {
        const db = getDb()
        if (!db || !id) return
        const ref = collection(db, 'characters')
        const unsubMine = user ? onSnapshot(query(ref, where('campaignId', '==', id), where('userId', '==', user.uid)), snap => {
            if (snap.empty) {
                setMySheet(undefined)
            } else {
                const d = snap.docs[0]
                const data = d.data() as Omit<PlayerSheet, 'id'>
                setMySheet({ id: d.id, ...data })
            }
        }) : undefined
        const unsubAll = onSnapshot(query(ref, where('campaignId', '==', id)), snap => {
            const items: PlayerSheet[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<PlayerSheet, 'id'>) }))
            setPlayerSheets(items)
        })
        return () => { if (unsubMine) unsubMine(); unsubAll() }
    }, [id, user])

    // Calcular isGM antes de qualquer early return
    const isGM = campaign && user?.role === 'master' && campaign.ownerId === user.uid

    // Efeito para carregar NPCs com subscribe em tempo real
    useEffect(() => {
        const db = getDb()
        if (!db || !id || !isGM) return
        
        setNpcsLoading(true)
        setNpcsError(null)
        
        // Sempre carregar NPCs, independente da aba ativa (para ter dados atualizados)
        const ref = collection(db, 'npcs')
        const unsubNpcs = onSnapshot(query(ref, where('campaignId', '==', id)), snap => {
            const items: NpcSheet[] = snap.docs.map(d => ({ 
                id: d.id, 
                ...(d.data() as Omit<NpcSheet, 'id'>)
            }))
            setNpcs(items)
            setNpcsLoading(false)
        }, error => {
            console.error('Erro ao carregar NPCs:', error)
            setNpcsError('Erro ao carregar fichas de NPC. Por favor, tente novamente.')
            setNpcsLoading(false)
        })
        
        return () => unsubNpcs()
    }, [id, isGM])

    if (!campaign) return <div>Carregando ou não encontrado...</div>

    function handleInvite() {
        if (!id) return
        const { link } = generateInvite(id)
        setInviteLink(window.location.origin + link)
    }

    function handleCreateSession() {
        if (!id) return
        setSessionName('')
        setSessionDate('')
        setSessionSummary('')
        setSessionMasterNotes('')
        setSessionError(null)
        setSessionSuccess(null)
        setShowSessionForm(true)
    }

    function fromDateInputValue(s: string): number {
        const t = Date.parse(s)
        return Number.isFinite(t) ? t : 0
    }

    function submitCreateSession() {
        if (!id) return
        setSessionError(null)
        setSessionSuccess(null)
        const ts = fromDateInputValue(sessionDate)
        const res = createSession(id, { name: sessionName, date: ts, summary: sessionSummary, masterNotes: sessionMasterNotes })
        if (!res.ok) {
            setSessionError(res.message)
            return
        }
        setSessionSuccess('created')
        setSessions(listSessions(id))
        setShowSessionForm(false)
    }

    function handleCreateNpc(npcData: CreateNpcSheetInput) {
        if (!id || !user) return
        
        setNpcSuccess(null)
        setNpcsError(null)
        
        const result = createNpcSheets(id, [npcData])
        if (result.ok) {
            setShowNpcForm(false)
            setNpcSuccess('NPC criado com sucesso!')
            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => setNpcSuccess(null), 3000)
            // A lista de NPCs será atualizada automaticamente pelo subscribe
        } else {
            const errorMessage = getErrorMessage(result.message)
            setNpcsError(errorMessage)
            console.error('Erro ao criar NPC:', result.message)
        }
    }

    function handleBatchCreate(npcBatchData: CreateNpcSheetInput[]) {
        if (!id || !user || npcBatchData.length === 0) return
        
        setNpcSuccess(null)
        setNpcsError(null)
        
        const result = createNpcSheets(id, npcBatchData)
        if (result.ok) {
            setShowNpcForm(false)
            setBatchMode(false)
            setNpcSuccess(`${npcBatchData.length} NPC(s) criado(s) com sucesso!`)
            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => setNpcSuccess(null), 3000)
            // A lista de NPCs será atualizada automaticamente pelo subscribe
        } else {
            const errorMessage = getErrorMessage(result.message)
            setNpcsError(errorMessage)
            console.error('Erro ao criar NPCs em lote:', result.message)
        }
    }

    function getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'not_authenticated':
                return 'Você precisa estar autenticado para criar NPCs.'
            case 'forbidden':
                return 'Apenas o mestre da campanha pode criar NPCs.'
            case 'invalid_required_fields':
                return 'Por favor, preencha todos os campos obrigatórios.'
            case 'invalid_attributes_sum':
                return 'A soma dos atributos deve ser igual a 3.'
            default:
                return 'Erro ao criar NPCs. Por favor, tente novamente.'
        }
    }

    function handleEditNpc(npcId: string) {
        if (!id) return
        navigate(`/campaigns/${id}/npcs/${npcId}`)
    }

    function handleDeleteNpc(npcId: string) {
        if (!id) return
        
        const npc = npcs.find(n => n.id === npcId)
        if (!npc) return
        
        if (confirm(`Tem certeza que deseja excluir o NPC "${npc.name}"? Esta ação não pode ser desfeita.`)) {
            const result = deleteNpcSheet(id, npcId)
            if (result.ok) {
                setNpcSuccess('NPC excluído com sucesso!')
                setTimeout(() => setNpcSuccess(null), 3000)
            } else {
                setNpcsError(getErrorMessage(result.message))
            }
        }
    }

    return (
        <div className="campaign-detail container">
            

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

            <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <BackButton />
                <h2 style={{ margin: 0 }}>{campaign?.name || 'Campanha'}</h2>
                {isGM && (
                    <div style={{ marginLeft: 'auto' }}>
                        <button onClick={handleInvite} className="btn btn-primary">Gerar Convite</button>
                    </div>
                )}
            </header>
            <nav className="tabs">
                <button className={activeTab === 'plot' ? 'active' : ''} onClick={() => setActiveTab('plot')}>Plot</button>
                <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notas</button>
                <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>Jogadores</button>
                <button className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>Sessões</button>
                {isGM && (
                    <button className={activeTab === 'npcs' ? 'active' : ''} onClick={() => setActiveTab('npcs')}>Fichas</button>
                )}
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
                                    <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} placeholder="Somente o mestre gera notas para campanha..." style={{ minHeight: '200px' }} />
                                    <div>
                                        <button className="btn btn-primary" onClick={() => { if (id) updateCampaignNotes(id, notesValue) }}>Salvar Notas</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    padding: '1rem', 
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    minHeight: '200px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {notesValue || 'Nenhuma nota do mestre ainda.'}
                                </div>
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
                            {(playerUids.length === 0) ? (
                                <p className="text-muted">Nenhum jogador aceito ainda.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {playerUids.map(uid => {
                                        const sheet = playerSheets.find(s => s.userId === uid)
                                        const playerDisplay = playerNames[uid] || `Jogador #${uid.substring(0, 8)}`
                                        return (
                                            <li key={uid} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span>{sheet ? sheet.name : playerDisplay}</span>
                                                {sheet && <span style={{ color: 'var(--muted)' }}>{sheet.background}</span>}
                                            </li>
                                        )
                                    })}
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
                            <AnimatePresence>
                                {showSessionForm && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'fixed',
                                            inset: 0,
                                            backgroundColor: 'var(--bg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1000
                                        }}
                                        onClick={() => setShowSessionForm(false)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="card"
                                            style={{
                                                width: '100%',
                                                maxWidth: 640,
                                                borderRadius: 12,
                                                padding: '1rem',
                                                backgroundColor: 'var(--bg-secondary)',
                                                margin: '1rem'
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Criar Sessão</h4>
                                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                                <label style={{ display: 'block' }}>
                                                    Nome
                                                    <input value={sessionName} onChange={e => { setSessionName(e.target.value); setSessionError(null); setSessionSuccess(null) }} style={{ width: '100%' }} />
                                                </label>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                                <label style={{ display: 'block' }}>
                                                    Data
                                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                        <input 
                                                            ref={(input) => {
                                                                if (input) {
                                                                    input.style.cursor = 'pointer';
                                                                    input.addEventListener('click', () => input.showPicker?.());
                                                                }
                                                            }}
                                                            type="date" 
                                                            value={sessionDate} 
                                                            onChange={e => { setSessionDate(e.target.value); setSessionError(null); setSessionSuccess(null) }} 
                                                            style={{ 
                                                                width: '100%', 
                                                                paddingRight: '2.5rem',
                                                                appearance: 'none',
                                                                WebkitAppearance: 'none',
                                                                MozAppearance: 'none',
                                                                backgroundColor: 'var(--bg)',
                                                                border: '1px solid var(--border)',
                                                                borderRadius: '4px',
                                                                padding: '0.5rem',
                                                                fontSize: '1rem'
                                                            }} 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                const input = e.currentTarget.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
                                                                if (input) {
                                                                    input.showPicker?.() || input.click();
                                                                }
                                                            }}
                                                            style={{ 
                                                                position: 'absolute', 
                                                                right: '0.25rem', 
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '0.5rem',
                                                                color: 'var(--text-muted)',
                                                                fontSize: '1.2rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                                        >
                                                            📅
                                                        </button>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                                <label style={{ display: 'block' }}>
                                                    Resumo
                                                    <textarea value={sessionSummary} onChange={e => { setSessionSummary(e.target.value); setSessionError(null); setSessionSuccess(null) }} style={{ width: '100%', minHeight: 80 }} />
                                                </label>
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                                <label style={{ display: 'block' }}>
                                                    Notas do Mestre
                                                    <textarea value={sessionMasterNotes} onChange={e => { setSessionMasterNotes(e.target.value); setSessionError(null); setSessionSuccess(null) }} style={{ width: '100%', minHeight: 80 }} />
                                                </label>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-primary" onClick={submitCreateSession} disabled={!sessionName.trim() || !sessionDate.trim()}>Criar</button>
                                                <button className="btn" onClick={() => setShowSessionForm(false)}>Cancelar</button>
                                            </div>
                                            {sessionError && <div className="error">{sessionError}</div>}
                                            {sessionSuccess && <div>{sessionSuccess}</div>}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <ul className="session-list" style={{ listStyle: 'none', padding: 0 }}>
                                {[...sessions].sort((a, b) => b.createdAt - a.createdAt).map(s => (
                                    <li key={s.id} style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => navigate(`/campaigns/${id}/session/${s.id}`)}
                                                className="btn"
                                                style={{ flex: 1, justifyContent: 'flex-start', background: 'var(--bg)', border: '1px solid var(--border)' }}
                                            >
                                                <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>{s.name}</span>
                                                <span className="text-muted">{new Date(s.date).toLocaleDateString()}</span>
                                            </button>
                                            {isGM && (
                                                <button
                                                    className="btn btn-danger"
                                                    data-testid={`list-delete-${s.id}`}
                                                    style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }}
                                                    onClick={async () => {
                                                        if (!id) return
                                                        try {
                                                            const r = await deleteSession(id, s.id)
                                                            if (r.ok) {
                                                                setSessions(prev => prev.filter(item => item.id !== s.id))
                                                            }
                                                        } catch (error) {
                                                            console.error('Erro ao excluir sessão:', error)
                                                        }
                                                    }}
                                                >
                                                    Excluir
                                                </button>
                                            )}
                                        </div>
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
                    {activeTab === 'npcs' && isGM && (
                        <motion.div
                            key="npcs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="npcs-section card"
                        >
                            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
                                <h3>Fichas de NPC/PDM</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => {
                                            setBatchMode(false)
                                            setShowNpcForm(true)
                                            setNpcSuccess(null)
                                            setNpcsError(null)
                                        }} 
                                        className="btn btn-primary"
                                    >
                                        Novo NPC
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setBatchMode(true)
                                            setShowNpcForm(true)
                                            setNpcSuccess(null)
                                            setNpcsError(null)
                                        }} 
                                        className="btn btn-secondary"
                                    >
                                        Criar em Lote
                                    </button>
                                </div>
                            </div>
                            
                            {showNpcForm && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>{batchMode ? 'Criar NPCs em Lote' : 'Criar Novo NPC'}</h4>
                                    <NpcForm 
                                        onSubmit={handleCreateNpc}
                                        onCancel={() => setShowNpcForm(false)}
                                        onBatchSubmit={handleBatchCreate}
                                        batchMode={batchMode}
                                    />
                                </div>
                            )}
                            
                            {npcSuccess && (
                                <div className="success-message" style={{ 
                                    marginBottom: '1rem', 
                                    padding: '0.75rem', 
                                    backgroundColor: 'rgba(40, 167, 69, 0.1)', 
                                    border: '1px solid rgba(40, 167, 69, 0.3)', 
                                    borderRadius: '4px', 
                                    color: '#28a745' 
                                }}>
                                    ✅ {npcSuccess}
                                </div>
                            )}
                            
                            {npcsError && (
                                <div className="error-message" style={{ 
                                    marginBottom: '1rem', 
                                    padding: '0.75rem', 
                                    backgroundColor: 'rgba(220, 53, 69, 0.1)', 
                                    border: '1px solid rgba(220, 53, 69, 0.3)', 
                                    borderRadius: '4px', 
                                    color: '#dc3545' 
                                }}>
                                    ❌ {npcsError}
                                </div>
                            )}
                            {npcsLoading ? (
                                <p className="text-muted">Carregando NPCs...</p>
                            ) : npcsError ? (
                                <div className="error-message" style={{ color: '#dc3545', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                                    <p>{npcsError}</p>
                                </div>
                            ) : npcs.length === 0 ? (
                                <div className="empty-state">
                                    <p className="text-muted">Nenhum NPC criado.</p>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Crie NPCs com atributos que somem 3 pontos (ex: 1-1-1 ou 2-1-0)</p>
                                </div>
                            ) : (
                                <ul className="npc-list" style={{ listStyle: 'none', padding: 0 }}>
                                    {npcs.map(npc => (
                                        <li key={npc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div><strong>{npc.name}</strong></div>
                                                <div className="text-muted" style={{ fontSize: '0.9rem' }}>{npc.background}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                                    Atributos: {npc.attributes.forca || 0} | {npc.attributes.agilidade || 0} | {npc.attributes.sabedoria || 0} | {npc.attributes.carisma || 0} | {npc.attributes.intuicao || 0}
                                                </div>
                                            </div>
                                            <button onClick={() => handleEditNpc(npc.id)} className="btn btn-sm">Editar</button>
                                            <button onClick={() => handleDeleteNpc(npc.id)} className="btn btn-sm btn-danger" style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }}>Excluir</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
