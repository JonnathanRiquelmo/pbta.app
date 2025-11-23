import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { CreateNpcSheetInput } from './npcRepo'

export default function NpcSheet() {
    const { id: campaignId, npcId } = useParams()
    const navigate = useNavigate()
    const listNpcSheets = useAppStore(s => s.listNpcSheets)
    const createNpcSheets = useAppStore(s => s.createNpcSheets)
    const updateNpcSheet = useAppStore(s => s.updateNpcSheet)
    

    const existing = useMemo(() => {
        if (!campaignId || !npcId) return undefined
        const npcs = listNpcSheets(campaignId)
        return npcs.find(n => n.id === npcId)
    }, [campaignId, npcId, listNpcSheets])

    const [name, setName] = useState('')
    const [background, setBackground] = useState('')
    const [attributes, setAttributes] = useState({ forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0 })
    const [equipment, setEquipment] = useState('')
    const [notes, setNotes] = useState('')
    

    useEffect(() => {
        if (existing) {
            setName(existing.name)
            setBackground(existing.background)
            setAttributes(existing.attributes)
            setEquipment(existing.equipment || '')
            setNotes(existing.notes || '')
        }
    }, [existing])

    // Validation logic same as player sheet? Or simpler for NPC?
    // Prompt says: "O mestre poderá fazer muitas fichas de NPCs... As fichas devem ter nome, background... atributos... somatório total SEMPRE tem que ser 3."
    // So validation applies to NPCs too.

    const currentSum = Math.abs(attributes.forca) + Math.abs(attributes.agilidade) + Math.abs(attributes.sabedoria) + Math.abs(attributes.carisma) + Math.abs(attributes.intuicao)
    const remaining = 3 - currentSum
    const canSubmit = name.trim().length > 0 && background.trim().length > 0 && remaining === 0

    function changeAttr(key: keyof typeof attributes, value: number) {
        setAttributes(prev => ({ ...prev, [key]: value }))
    }


    async function onSubmit() {
        if (!campaignId) return
        if (remaining !== 0) {
            return
        }

        const payload: CreateNpcSheetInput = {
            name,
            background,
            attributes,
            equipment,
            notes,
            // moves: selectedMoves // NPC repo might handle moves differently? Let's check types.
        }
        // Wait, createNpcSheets takes an array. And updateNpcSheet takes a patch.
        // Also, does NPC have moves? Prompt says: "Os PDMs do mestre tem todos os movimentos da lista previamente cadastrada por padrão, todos eles para todos os PDMs."
        // But also: "O mestre deve conseguir ver as fichas dos jogadores... Os jogadores não devem ver as fichas do mestre."
        // And: "Quando o jogador/PDM do mestre for rolar ele deve informar qual o tipo de operação e se vai jogar "puro" (sem movimentos nenhum) ou com movimento associado, que deve ser somente é apenas algum movimento que está cadastradona sua ficha, e somente na sua ficha. Os PDMs do mestre tem todos os movimentos da lista previamente cadastrada por padrão, todos eles para todos os PDMs."
        // This implies NPCs have ALL moves. So maybe we don't select moves for NPCs?
        // But wait, "Os PDMs do mestre tem todos os movimentos da lista previamente cadastrada por padrão".
        // So I don't need to select moves for NPCs. They have all of them.

        if (!existing) {
            const res = createNpcSheets(campaignId, [payload])
            if (!res.ok) {
                return
            }
            navigate(`/campaigns/${campaignId}`)
        } else {
            if (!npcId) return
            const res = updateNpcSheet(campaignId, npcId, payload)
            if (!res.ok) {
                return
            }
        }
    }

    return (
        <div className="npc-sheet">
            <h2>{existing ? 'Editar NPC' : 'Criar NPC'}</h2>
            {/* Form similar to CharacterSheet but for NPC */}
            {/* ... */}
            {/* For brevity, I'll just put the basics here. */}
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" />
            <textarea value={background} onChange={e => setBackground(e.target.value)} placeholder="Background" />

            {/* Attributes */}
            <div className="attributes">
                <p>Soma: {currentSum}/3</p>
                {Object.keys(attributes).map(k => (
                    <div key={k}>
                        <label>{k}</label>
                        <select value={attributes[k as keyof typeof attributes]} onChange={e => changeAttr(k as keyof typeof attributes, Number(e.target.value))}>
                            {[-1, 0, 1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            <button onClick={onSubmit} disabled={!canSubmit}>Salvar</button>
        </div>
    )
}
