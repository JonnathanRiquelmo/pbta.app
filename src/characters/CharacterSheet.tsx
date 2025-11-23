import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { AttributeScore, PlayerSheet } from './types'
import { getDb } from '@fb/client'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

function rangeScores(): AttributeScore[] {
    return [-1, 0, 1, 2, 3]
}

function sumAbs(a: number[]): number {
    return a.reduce((acc, v) => acc + Math.abs(v), 0)
}

export default function CharacterSheet() {
    const { id: campaignId } = useParams()
    const navigate = useNavigate()
    const user = useAppStore(s => s.user)
    const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
    const createMyPlayerSheet = useAppStore(s => s.createMyPlayerSheet)
    const updateMyPlayerSheet = useAppStore(s => s.updateMyPlayerSheet)
    const listCampaignMoves = useAppStore(s => s.listCampaignMoves)

    // TODO: Add getPlayerSheetById to store for GM to fetch other players' sheets
    // For now, we assume if sheetId is provided, we are GM looking at a specific sheet.
    // But existing store only has getMyPlayerSheet. We might need to fetch from listPlayers if we have the data there, or add a new store method.

    // Workaround: If GM, we might need to fetch the sheet differently. 
    // Since we don't have getSheetById yet, I'll stick to "My Sheet" for now and add TODO.

    const existing = useMemo(() => (campaignId ? getMyPlayerSheet(campaignId) : undefined), [campaignId, getMyPlayerSheet])

    const [name, setName] = useState('')
    const [background, setBackground] = useState('')
    const [attributes, setAttributes] = useState<PlayerSheet['attributes']>({
        forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0
    })
    const [equipment, setEquipment] = useState('')
    const [notes, setNotes] = useState('')
    const [selectedMoves, setSelectedMoves] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const movesEnabled = useMemo(() => (campaignId ? listCampaignMoves(campaignId) : []), [campaignId, listCampaignMoves])

    useEffect(() => {
        if (existing) {
            setName(existing.name)
            setBackground(existing.background)
            setAttributes(existing.attributes)
            setEquipment(existing.equipment)
            setNotes(existing.notes)
            setSelectedMoves(existing.moves)
        }
    }, [existing])

    useEffect(() => {
        const db = getDb()
        if (!db || !campaignId || !user) return
        const ref = collection(db, 'characters')
        const qy = query(ref, where('campaignId', '==', campaignId), where('userId', '==', user.uid))
        const unsub = onSnapshot(qy, snap => {
            if (!snap.empty) {
                const d = snap.docs[0]
                const data = d.data() as Omit<PlayerSheet, 'id'>
                setName(data.name)
                setBackground(data.background)
                setAttributes(data.attributes)
                setEquipment(data.equipment)
                setNotes(data.notes)
                setSelectedMoves(data.moves)
            }
        })
        return () => unsub()
    }, [campaignId, user])

    const currentSum = sumAbs([
        attributes.forca,
        attributes.agilidade,
        attributes.sabedoria,
        attributes.carisma,
        attributes.intuicao
    ])
    const remaining = 3 - currentSum
    const canSubmit = name.trim().length > 0 && background.trim().length > 0 && remaining === 0

    function changeAttr(key: keyof PlayerSheet['attributes'], value: AttributeScore) {
        setAttributes(prev => ({ ...prev, [key]: value }))
        setSuccess(null)
        setError(null)
    }

    function toggleMove(m: string) {
        setSelectedMoves(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]))
    }

    async function onSubmit() {
        setError(null)
        setSuccess(null)
        if (!user || !campaignId) return

        if (remaining !== 0) {
            setError('A soma dos atributos deve ser exatamente 3.')
            return
        }

        const payload = {
            name,
            background,
            attributes,
            equipment,
            notes,
            moves: selectedMoves
        }

        if (!existing) {
            const res = createMyPlayerSheet(campaignId, payload)
            if (!res.ok) {
                setError(res.message)
                return
            }
            setSuccess('Ficha criada com sucesso!')
        } else {
            const res = updateMyPlayerSheet(campaignId, payload)
            if (!res.ok) {
                setError(res.message)
                return
            }
            setSuccess('Ficha atualizada com sucesso!')
        }
    }

    return (
        <div className="container">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h2>{existing ? 'Editar Ficha' : 'Criar Ficha'}</h2>
                <button className="btn" onClick={() => navigate(`/campaigns/${campaignId}`)}>Voltar para Campanha</button>
            </header>

            <div className="card">
                <section>
                    <div className="form-group">
                        <label>Nome</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Personagem" />
                    </div>
                    <div className="form-group">
                        <label>Antecedentes</label>
                        <textarea value={background} onChange={e => setBackground(e.target.value)} placeholder="História, medos, objetivos..." />
                    </div>
                </section>

                <section>
                    <h3>Atributos (Soma: {currentSum}/3)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
                        {(['forca', 'agilidade', 'sabedoria', 'carisma', 'intuicao'] as const).map(attr => (
                            <div key={attr} className="attr-col">
                                <strong>{attr.charAt(0).toUpperCase() + attr.slice(1)}</strong>
                                <div className="radio-group">
                                    {rangeScores().map(v => (
                                        <label key={v} className={`radio-label ${attributes[attr] === v ? 'selected' : ''}`}>
                                            <input type="radio" name={attr} checked={attributes[attr] === v} onChange={() => changeAttr(attr, v)} />
                                            {v}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {remaining !== 0 && <p className="warning">Ajuste os atributos para que a soma seja 3.</p>}
                </section>

                <section>
                    <h3>Movimentos</h3>
                    <div className="moves-list">
                        {movesEnabled.length === 0 ? <p>Nenhum movimento disponível na campanha.</p> : movesEnabled.map(m => (
                            <label key={m} className="move-item">
                                <input type="checkbox" checked={selectedMoves.includes(m)} onChange={() => toggleMove(m)} />
                                <span>{m}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="form-group">
                        <label>Equipamentos</label>
                        <textarea value={equipment} onChange={e => setEquipment(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Notas</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                </section>
            </div>

            <div className="actions mt-4">
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <button className="btn btn-primary" onClick={onSubmit} disabled={!canSubmit}>Salvar Ficha</button>
            </div>
        </div>
    )
}
