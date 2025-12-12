import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { AttributeScore, PlayerSheet } from './types'
import { getDb } from '@fb/client'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import BackButton from '@shared/components/BackButton'
import { getErrorMessage } from '@shared/utils/errorMessages'

function rangeScores(): AttributeScore[] {
    return [-1, 0, 1, 2, 3]
}

function sumTotal(a: number[]): number {
    return a.reduce((acc, v) => acc + v, 0)
}

export default function CharacterSheet() {
    const { id: campaignId } = useParams()
    const navigate = useNavigate()
    const user = useAppStore(s => s.user)
    const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
    const createMyPlayerSheet = useAppStore(s => s.createMyPlayerSheet)
    const updateMyPlayerSheet = useAppStore(s => s.updateMyPlayerSheet)
    const listCampaignMoves = useAppStore(s => s.listCampaignMoves)
    const movesCache = useAppStore(s => s.movesCache)
    const initMovesSubscription = useAppStore(s => s.initMovesSubscription)

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

    const movesEnabled = useMemo(() => (campaignId ? listCampaignMoves(campaignId) : []), [campaignId, listCampaignMoves, movesCache])
    
    // Obter todos os movimentos da campanha (ativos e inativos) para mostrar na UI
    const allCampaignMoves = useMemo(() => {
        if (!campaignId || !movesCache.has(campaignId)) return []
        return movesCache.get(campaignId) || []
    }, [campaignId, movesCache])

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

    // Sincronizar movimentos selecionados com movimentos ativos da campanha
    useEffect(() => {
        // Filtrar movimentos selecionados para manter apenas os ativos
        const activeMoves = new Set(movesEnabled)
        setSelectedMoves(prev => prev.filter(move => activeMoves.has(move)))
    }, [movesEnabled])

    useEffect(() => {
        if (campaignId) {
            initMovesSubscription(campaignId)
        }
    }, [campaignId, initMovesSubscription])

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

    const currentSum = sumTotal([
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
            // Garantir que apenas movimentos ativos sejam enviados, 
            // caso o useEffect de sincronização ainda não tenha rodado
            moves: selectedMoves.filter(m => movesEnabled.includes(m))
        }

        if (existing) {
            const res = await updateMyPlayerSheet(campaignId, payload)
            if (!res.ok) {
                setError(getErrorMessage(res.message))
                return
            }
            setSuccess('Ficha atualizada com sucesso!')
        } else {
            const res = await createMyPlayerSheet(campaignId, payload)
            if (!res.ok) {
                setError(getErrorMessage(res.message))
                return
            }
            setSuccess('Ficha criada com sucesso!')
        }
    }

    return (
        <div className="container">
            <header className="flex items-center" style={{ marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <BackButton />
                <h2>{existing ? 'Editar Ficha' : 'Criar Ficha'}</h2>
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
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Atributos (soma deve ser +3)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {(['forca', 'agilidade', 'sabedoria', 'carisma', 'intuicao'] as const).map(attr => (
                                <div key={attr} className="attr-row">
                                    <strong style={{ minWidth: '100px', textAlign: 'right', marginRight: 'var(--space-3)' }}>
                                        {attr.charAt(0).toUpperCase() + attr.slice(1)}
                                    </strong>
                                    <div className="radio-group compact">
                                        {rangeScores().map(v => (
                                            <label key={`${attr}-${v}`} className={`radio-label ${attributes[attr] === v ? 'selected' : ''}`}>
                                                <input type="radio" name={attr} value={v} checked={attributes[attr] === v} onChange={() => changeAttr(attr, v)} />
                                                {v}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ 
                            marginTop: '0.5rem', 
                            padding: '0.5rem', 
                            borderRadius: '4px',
                            backgroundColor: remaining === 0 ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                            color: remaining === 0 ? '#28a745' : '#dc3545',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            border: remaining === 0 ? '1px solid rgba(40, 167, 69, 0.3)' : '1px solid rgba(220, 53, 69, 0.3)'
                        }}>
                            {remaining === 0 ? '✅ Atributos válidos' : '❌ Atributos inválidos'}
                        </div>
                    </div>
                </section>

                <section>
                    <h3>Movimentos</h3>
                    <div className="moves-list">
                        {allCampaignMoves.length === 0 ? (
                            <p>Nenhum movimento disponível na campanha.</p>
                        ) : (
                            <>
                                {selectedMoves.length > 0 && selectedMoves.some(move => {
                                    const moveData = allCampaignMoves.find(m => m.name === move)
                                    return moveData && !moveData.active
                                }) && (
                                    <div className="sync-notice" style={{
                                        padding: '0.75rem',
                                        marginBottom: '1rem',
                                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                        border: '1px solid rgba(255, 193, 7, 0.3)',
                                        borderRadius: '4px',
                                        color: '#856404',
                                        fontSize: '0.9rem'
                                    }}>
                                        ⚠️ Você tem movimentos desativados selecionados. Eles não serão salvos.
                                    </div>
                                )}
                                {allCampaignMoves.map(move => {
                                    const isActive = move.active
                                    const isSelected = selectedMoves.includes(move.name)
                                    const isDisabled = !isActive
                                    
                                    return (
                                        <label 
                                            key={move.id} 
                                            className={`move-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                            title={isDisabled ? 'Este movimento foi desativado pelo mestre' : ''}
                                            style={{
                                                opacity: isDisabled ? 0.6 : 1,
                                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected} 
                                                onChange={() => !isDisabled && toggleMove(move.name)}
                                                disabled={isDisabled}
                                            />
                                            <span>{move.name}</span>
                                            {isDisabled && (
                                                <span style={{ marginLeft: '0.5rem', color: '#dc3545', fontSize: '0.8rem' }}>
                                                    (desativado)
                                                </span>
                                            )}
                                        </label>
                                    )
                                })}
                            </>
                        )}
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
