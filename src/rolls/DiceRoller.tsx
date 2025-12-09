import { useState, useEffect } from 'react'
import { useAppStore } from '@shared/store/appStore'
import type { Attributes } from '@characters/types'
import { getErrorMessage } from '@shared/utils/errorMessages'
import type { Roll } from './types'

type Props = {
    sessionId: string
    campaignId: string
    onRollCreated?: (roll: Roll) => void
}

export default function DiceRoller({ sessionId, campaignId, onRollCreated }: Props) {
    const role = useAppStore(s => s.role)
    const createRoll = useAppStore(s => s.createRoll)
    const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
    const listNpcSheets = useAppStore(s => s.listNpcSheets)
    const subscribeNpcs = useAppStore(s => s.subscribeNpcs)
    const listCampaignMoves = useAppStore(s => s.listCampaignMoves)
    const initMovesSubscription = useAppStore(s => s.initMovesSubscription)
    // Subscribe to movesCache to ensure re-render when moves change
    const movesCache = useAppStore(s => s.movesCache)

    const [whoKind, setWhoKind] = useState<'player' | 'npc'>('player')
    const [whoSheetId, setWhoSheetId] = useState<string>('')
    const [npcList, setNpcList] = useState(() => listNpcSheets(campaignId))

    // Subscribe to NPCs
    useEffect(() => {
        if (campaignId && role === 'master') {
            const unsub = subscribeNpcs(campaignId, (updated) => {
                setNpcList(updated)
            })
            return () => unsub()
        }
    }, [campaignId, role, subscribeNpcs])

    // Ensure moves are subscribed to when component mounts
    useEffect(() => {
        if (campaignId) {
            initMovesSubscription(campaignId)
        }
    }, [campaignId, initMovesSubscription])

    const [attributeRef, setAttributeRef] = useState<keyof Attributes | ''>('')
    const [moveRef, setMoveRef] = useState<string>('')
    const [mode, setMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const isMaster = role === 'master'
    const mySheet = getMyPlayerSheet(campaignId)

    // Options for "Who is rolling"
    const whoOptions = []
    if (mySheet) whoOptions.push({ value: `player:${mySheet.id}`, label: `Eu (${mySheet.name})` })

    if (isMaster) {
        // GM can roll for NPCs
        npcList.forEach(n => whoOptions.push({ value: `npc:${n.id}`, label: `NPC: ${n.name}` }))
        // GM can roll for other players? Prompt doesn't explicitly say, but usually yes.
        // "As rolagens dos PDMs do mestre só podem ser feitas pelo mestre"
        // "Quando o jogador/PDM do mestre for rolar"
        // Let's assume GM rolls for NPCs mostly. But maybe players too.
    }

    // If no options (e.g. player without sheet), show message
    if (whoOptions.length === 0 && !isMaster) return <div>Você precisa criar uma ficha para rolar dados.</div>

    // Derived options based on selection
    let availableAttributes: (keyof Attributes)[] = []
    let availableMoves: string[] = []

    if (whoSheetId) {
        if (whoKind === 'player') {
            // Fetch sheet. If it's me, use mySheet. If GM rolling for player, need to fetch.
            // For now, assume GM rolls for NPCs or themselves (if they had a sheet, but GM doesn't have a player sheet usually).
            // Wait, GM doesn't have a player sheet.
            if (mySheet && mySheet.id === whoSheetId) {
                availableAttributes = Object.keys(mySheet.attributes) as (keyof Attributes)[]
                const campaignMoves = listCampaignMoves(campaignId)
                availableMoves = (mySheet.moves || []).filter(m => campaignMoves.includes(m))
            }
        } else {
            const npc = npcList.find(n => n.id === whoSheetId)
            if (npc) {
                availableAttributes = Object.keys(npc.attributes) as (keyof Attributes)[]
                // NPCs have ALL campaign moves? Prompt: "Os PDMs do mestre tem todos os movimentos da lista previamente cadastrada por padrão"
                availableMoves = listCampaignMoves(campaignId)
            }
        }
    }

    async function handleRoll() {
        if (!sessionId) return
        setError(null)
        setSuccess(null)
        if (!whoSheetId) {
            setError('Selecione quem está rolando.')
            return
        }

        // Find name
        let name = ''
        if (whoKind === 'player') {
            name = mySheet?.name || 'Jogador'
        } else {
            name = npcList.find(n => n.id === whoSheetId)?.name || 'NPC'
        }

        const res = await createRoll(sessionId, {
            who: { kind: whoKind, sheetId: whoSheetId, name },
            attributeRef: attributeRef || undefined,
            moveRef: moveRef || undefined,
            mode
        })

        if (!res.ok) {
            setError(getErrorMessage(res.message))
        } else {
            setSuccess('Rolagem realizada!')
            if (res.roll && onRollCreated) {
                onRollCreated(res.roll)
            }
            // Reset fields? Maybe keep them for repeated rolls.
        }
    }

    return (
        <div className="dice-roller card">
            <h3>Rolador de Dados</h3>

            <div className="form-group">
                <label>Quem</label>
                <select
                    value={whoSheetId ? `${whoKind}:${whoSheetId}` : ''}
                    onChange={e => {
                        if (!e.target.value) {
                            setWhoSheetId('')
                            return
                        }
                        const [k, id] = e.target.value.split(':') as ['player' | 'npc', string]
                        setWhoKind(k)
                        setWhoSheetId(id)
                        setAttributeRef('')
                        setMoveRef('')
                    }}
                >
                    <option value="">Selecione...</option>
                    {whoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label>Atributo</label>
                <select value={attributeRef} onChange={e => setAttributeRef(e.target.value as keyof Attributes)}>
                    <option value="">Nenhum</option>
                    {availableAttributes.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label>Movimento</label>
                {availableMoves.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic', margin: '0.5rem 0' }}>
                        Nenhum movimento disponível na campanha.
                    </p>
                ) : (
                    <select value={moveRef} onChange={e => setMoveRef(e.target.value)}>
                        <option value="">Nenhum</option>
                        {Array.from(new Set(availableMoves)).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                )}
            </div>

            <div className="form-group">
                <label>Modo</label>
                <div className="radio-group">
                    <label className={mode === 'disadvantage' ? 'selected' : ''}>
                        <input type="radio" name="mode" value="disadvantage" checked={mode === 'disadvantage'} onChange={() => setMode('disadvantage')} />
                        Desvantagem
                    </label>
                    <label className={mode === 'normal' ? 'selected' : ''}>
                        <input type="radio" name="mode" value="normal" checked={mode === 'normal'} onChange={() => setMode('normal')} />
                        Normal
                    </label>
                    <label className={mode === 'advantage' ? 'selected' : ''}>
                        <input type="radio" name="mode" value="advantage" checked={mode === 'advantage'} onChange={() => setMode('advantage')} />
                        Vantagem
                    </label>
                </div>
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <button className="primary" onClick={handleRoll}>Rolar 2d6</button>
        </div>
    )
}
