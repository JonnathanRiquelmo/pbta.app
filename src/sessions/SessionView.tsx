import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import DiceRoller from '@rolls/DiceRoller'
import RollHistory from '@rolls/RollHistory'

export default function SessionView() {
    const { id: campaignId, sessionId } = useParams()
    const navigate = useNavigate()
    const user = useAppStore(s => s.user)
    const getSession = useAppStore(s => s.getSession)
    const updateSession = useAppStore(s => s.updateSession)

    const [session, setSession] = useState(sessionId ? getSession(sessionId) : undefined)
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [summary, setSummary] = useState('')
    const [notes, setNotes] = useState('')
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        if (sessionId) {
            const s = getSession(sessionId)
            setSession(s)
            if (s) {
                setName(s.name)
                setDate(new Date(s.date).toISOString().split('T')[0])
                setSummary(s.summary || '')
                setNotes(s.masterNotes || '')
            }
        }
    }, [sessionId, getSession])

    const isMaster = user?.role === 'master'

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

    if (!session) return <div>Sessão não encontrada.</div>

    return (
        <div className="session-view">
            <header>
                <button onClick={() => navigate(`/campaigns/${campaignId}`)}>Voltar para Campanha</button>
                <h2>{name}</h2>
            </header>

            <div className="session-layout">
                <aside className="session-info">
                    <div className="card">
                        <h3>Detalhes da Sessão</h3>
                        <div className="form-group">
                            <label>Nome</label>
                            <input value={name} disabled={!isMaster} onChange={e => { setName(e.target.value); setDirty(true) }} />
                        </div>
                        <div className="form-group">
                            <label>Data</label>
                            <input type="date" value={date} disabled={!isMaster} onChange={e => { setDate(e.target.value); setDirty(true) }} />
                        </div>
                        <div className="form-group">
                            <label>Resumo</label>
                            <textarea value={summary} disabled={!isMaster} onChange={e => { setSummary(e.target.value); setDirty(true) }} />
                        </div>
                        <div className="form-group">
                            <label>Notas do Mestre</label>
                            <textarea value={notes} disabled={!isMaster} onChange={e => { setNotes(e.target.value); setDirty(true) }} />
                        </div>
                        {isMaster && <button onClick={handleSave} disabled={!dirty}>Salvar Alterações</button>}
                    </div>
                </aside>

                <main className="session-main">
                    <DiceRoller sessionId={session.id} campaignId={campaignId!} />
                    <RollHistory sessionId={session.id} />
                </main>
            </div>
        </div>
    )
}
