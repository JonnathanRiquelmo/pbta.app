import { useEffect, useState } from 'react'
import { useAppStore } from '@shared/store/appStore'
import type { Roll } from './types'

type Props = {
    sessionId: string
}

export default function RollHistory({ sessionId }: Props) {
    const subscribeRolls = useAppStore(s => s.subscribeRolls)
    const deleteRoll = useAppStore(s => s.deleteRoll)
    const role = useAppStore(s => s.role)
    const [rolls, setRolls] = useState<Roll[]>([])

    useEffect(() => {
        const unsub = subscribeRolls(sessionId, items => setRolls(items))
        return () => { if (typeof unsub === 'function') unsub() }
    }, [sessionId, subscribeRolls])

    const isMaster = role === 'master'

    function handleDelete(rollId: string) {
        if (confirm('Tem certeza que deseja excluir esta rolagem?')) {
            deleteRoll(sessionId, rollId)
        }
    }

    return (
        <div className="roll-history">
            <h3>Histórico de Rolagens</h3>
            {rolls.length === 0 ? <p>Nenhuma rolagem ainda.</p> : (
                <ul className="roll-list">
                    {rolls.map(r => (
                        <li key={r.id} className={`roll-item outcome-${r.outcome}`}>
                            <div className="roll-header">
                                <strong>{r.who.name}</strong>
                                <span className="roll-mode">{r.dice.length === 3 ? (r.dice.length > r.usedDice.length ? 'Vantagem/Desvantagem' : 'Normal') : 'Normal'}</span>
                            </div>
                            <div className="roll-details">
                                <span className="dice">[{r.usedDice.join(', ')}]</span>
                                {r.totalModifier !== 0 && <span className="modifier">{r.totalModifier > 0 ? '+' : ''}{r.totalModifier}</span>}
                                <span className="total">= {r.total}</span>
                            </div>
                            <div className="roll-outcome">
                                {r.outcome === 'success' && 'Sucesso Total (10+)'}
                                {r.outcome === 'partial' && 'Sucesso Parcial (7-9)'}
                                {r.outcome === 'fail' && 'Falha (6-)'}
                            </div>
                            <div className="roll-meta">
                                {r.moveRef && <span className="move-tag">{r.moveRef}</span>}
                                {r.attributeRef && <span className="attr-tag">{r.attributeRef}</span>}
                            </div>
                            {isMaster && (
                                <button className="delete-btn" onClick={() => handleDelete(r.id)}>Excluir</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
