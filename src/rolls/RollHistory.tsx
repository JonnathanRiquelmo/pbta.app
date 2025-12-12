import { useEffect, useState } from 'react'
import { useAppStore } from '@shared/store/appStore'
import type { Roll } from './types'
import ConfirmationModal from '@shared/components/ConfirmationModal'
import { LuTrash2 } from 'react-icons/lu'

type Props = {
    rolls: Roll[]
    isMaster: boolean
    onDelete: (id: string) => void
}

export default function RollHistory({ rolls, isMaster, onDelete }: Props) {
    const [deletingRollId, setDeletingRollId] = useState<string | null>(null)

    function handleDelete(rollId: string) {
        setDeletingRollId(rollId)
    }

    function confirmDelete() {
        if (deletingRollId) {
            onDelete(deletingRollId)
            setDeletingRollId(null)
        }
    }

    function getRollModeLabel(r: Roll) {
        if (r.mode) {
            if (r.mode === 'advantage') return 'Vantagem';
            if (r.mode === 'disadvantage') return 'Desvantagem';
            return 'Normal';
        }
        // Fallback para rolagens antigas
        if (r.dice.length === 3) {
            const sorted = [...r.dice].sort((a,b) => a-b);
            const usedSum = r.usedDice.reduce((a,b) => a+b, 0);
            const minSum = sorted[0] + sorted[1];
            const maxSum = sorted[1] + sorted[2];
            
            if (usedSum === maxSum && usedSum !== minSum) return 'Vantagem';
            if (usedSum === minSum && usedSum !== maxSum) return 'Desvantagem';
            
            return 'Vantagem/Desvantagem';
        }
        return 'Normal';
    }

    return (
        <div className="roll-history">
            <h3>Histórico de Rolagens</h3>
            {rolls.length === 0 ? <p>Nenhuma rolagem ainda.</p> : (
                <ul className="roll-list">
                    {rolls.map(r => {
                        const label = getRollModeLabel(r);
                        const modeClass = label === 'Vantagem' ? 'advantage' : label === 'Desvantagem' ? 'disadvantage' : 'normal';
                        return (
                        <li key={r.id} className={`roll-item outcome-${r.outcome}`}>
                            <div className="roll-header">
                                <strong>{r.who.name}</strong>
                                <span className={`roll-mode mode-${modeClass}`}>{label}</span>
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
                                <button 
                                    className="btn btn-ghost delete-btn" 
                                    onClick={() => handleDelete(r.id)}
                                    title="Excluir Rolagem"
                                    style={{ padding: '4px 8px' }}
                                >
                                    <LuTrash2 size={16} />
                                </button>
                            )}
                        </li>
                    )})}
                </ul>
            )}
            
            <ConfirmationModal
                isOpen={!!deletingRollId}
                title="Excluir Rolagem"
                message="Tem certeza que deseja excluir esta rolagem?"
                confirmLabel="Excluir"
                onConfirm={confirmDelete}
                onCancel={() => setDeletingRollId(null)}
            />
        </div>
    )
}
