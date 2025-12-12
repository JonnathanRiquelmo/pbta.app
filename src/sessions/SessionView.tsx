import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import DiceRoller from '@rolls/DiceRoller'
import RollHistory from '@rolls/RollHistory'
import BackButton from '@shared/components/BackButton'
import ConfirmationModal from '@shared/components/ConfirmationModal'
import type { Roll } from '@rolls/types'
import { LuSave, LuTrash2 } from 'react-icons/lu'

export default function SessionView() {
    const { id: campaignId, sessionId } = useParams()
    const navigate = useNavigate()
    const user = useAppStore(s => s.user)
    const getSession = useAppStore(s => s.getSession)
    const updateSession = useAppStore(s => s.updateSession)
    const deleteSession = useAppStore(s => s.deleteSession)
    const subscribeSessions = useAppStore(s => s.subscribeSessions)
    const subscribeRolls = useAppStore(s => s.subscribeRolls)
    const deleteRoll = useAppStore(s => s.deleteRoll)

    const [session, setSession] = useState(sessionId ? getSession(sessionId) : undefined)
    const [rolls, setRolls] = useState<Roll[]>([])
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [summary, setSummary] = useState('')
    const [notes, setNotes] = useState('')
    const [dirty, setDirty] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    useEffect(() => {
        if (sessionId && campaignId) {
            const unsub = subscribeRolls(sessionId, campaignId, items => setRolls(items))
            return () => unsub()
        }
    }, [sessionId, campaignId, subscribeRolls])

    useEffect(() => {
        if (sessionId && campaignId) {
            // Tenta obter do cache primeiro
            const cached = getSession(sessionId)
            if (cached) {
                setSession(cached)
                setName(cached.name)
                setDate(new Date(cached.date).toISOString().split('T')[0])
                setSummary(cached.summary || '')
                setNotes(cached.masterNotes || '')
            }

            // Inscreve para atualizações (e carrega se não estiver no cache)
            const unsub = subscribeSessions(campaignId, (sessions) => {
                const s = sessions.find(s => s.id === sessionId)
                
                // Se a sessão não existe mais (foi deletada), redireciona para a campanha
                if (!s) {
                    navigate(`/campaigns/${campaignId}`)
                    return
                }
                
                setSession(s)
                if (s && !dirty) { // Só atualiza campos se não houver alterações não salvas
                    setName(s.name)
                    setDate(new Date(s.date).toISOString().split('T')[0])
                    setSummary(s.summary || '')
                    setNotes(s.masterNotes || '')
                }
            })
            return () => unsub()
        }
    }, [campaignId, sessionId, subscribeSessions, getSession])

    const isMaster = user?.role === 'master'

    const onRollCreated = (roll: Roll) => {
        setRolls(prev => {
            if (prev.find(r => r.id === roll.id)) return prev
            return [roll, ...prev]
        })
    }

    const onDeleteRoll = (rollId: string) => {
        if (sessionId) {
            deleteRoll(sessionId, rollId)
            setRolls(prev => prev.filter(r => r.id !== rollId))
        }
    }

    function handleSave() {
        if (!sessionId || !campaignId) return
        updateSession(campaignId, sessionId, {
            name,
            date: new Date(date).getTime(),
            summary,
            masterNotes: notes
        })
        setDirty(false)
    }

    function handleDelete() {
        setConfirmDelete(true)
    }

    function confirmDeleteSession() {
        if (!sessionId || !campaignId) return
        const res = deleteSession(campaignId, sessionId)
        if (res.ok) {
            navigate(`/campaigns/${campaignId}`)
        }
        setConfirmDelete(false)
    }

    if (!session) return <div>Sessão não encontrada.</div>

    return (
        <div className="session-view container">
            <header style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                flexWrap: 'wrap'
            }}>
                <BackButton />
                <h2 style={{ margin: 0, color: 'var(--text)' }}>{name}</h2>
            </header>

            <div className="session-layout">
                <aside className="session-info">
                    <div className="card" style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '1rem'
                    }}>
                        <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Detalhes da Sessão</h3>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Nome</label>
                            <input 
                                value={name} 
                                disabled={!isMaster} 
                                onChange={e => { setName(e.target.value); setDirty(true) }} 
                                style={{ 
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    color: 'var(--text)'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Data</label>
                            <input 
                                type="date" 
                                value={date} 
                                disabled={!isMaster} 
                                onChange={e => { setDate(e.target.value); setDirty(true) }} 
                                style={{ 
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    color: 'var(--text)'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Resumo</label>
                            <textarea 
                                value={summary} 
                                disabled={!isMaster} 
                                onChange={e => { setSummary(e.target.value); setDirty(true) }} 
                                style={{ 
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    color: 'var(--text)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Notas do Mestre</label>
                            <textarea 
                                value={notes} 
                                disabled={!isMaster} 
                                onChange={e => { setNotes(e.target.value); setDirty(true) }} 
                                style={{ 
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    color: 'var(--text)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        {isMaster && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button 
                                    className={`btn ${dirty ? 'btn-primary' : ''}`}
                                    onClick={handleSave} 
                                    disabled={!dirty}
                                    style={{ 
                                        flex: 1,
                                        opacity: dirty ? 1 : 0.7,
                                        cursor: dirty ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <LuSave size={18} style={{ marginRight: 8 }} />
                                    Salvar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#dc3545',
                                        border: '1px solid #dc3545',
                                        color: 'white'
                                    }}
                                    data-testid="btn-delete-session"
                                >
                                    <LuTrash2 size={18} style={{ marginRight: 8 }} />
                                    Excluir
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                <main className="session-main">
                    <DiceRoller sessionId={session.id} campaignId={campaignId!} onRollCreated={onRollCreated} />
                    <RollHistory rolls={rolls} isMaster={isMaster} onDelete={onDeleteRoll} />
                </main>
            </div>

            {isMaster && (
                <ConfirmationModal
                    isOpen={confirmDelete}
                    title="Excluir Sessão"
                    message="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita."
                    confirmLabel="Excluir"
                    onConfirm={confirmDeleteSession}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    )
}
