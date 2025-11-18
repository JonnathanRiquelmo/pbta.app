import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { CreateNpcSheetInput } from '@npc/npcRepo'

export default function CampaignRoute() {
  const { id } = useParams()
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const setCurrentCampaign = useAppStore(s => s.setCurrentCampaign)
  const listPlayers = useAppStore(s => s.listPlayers)
  const role = useAppStore(s => s.role)
  const listNpcSheets = useAppStore(s => s.listNpcSheets)
  const createNpcSheets = useAppStore(s => s.createNpcSheets)
  if (id) setCurrentCampaign(id)
  const players = useMemo(() => (id ? listPlayers(id) : []), [id, listPlayers])
  const npcs = useMemo(() => (id ? listNpcSheets(id) : []), [id, listNpcSheets])
  const [tab, setTab] = useState<'players' | 'sheets'>('players')
  const [batch, setBatch] = useState<CreateNpcSheetInput[]>([])
  const [draft, setDraft] = useState<CreateNpcSheetInput>({
    name: '',
    background: '',
    attributes: { forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0 },
    equipment: '',
    notes: ''
  })
  const addDraftToBatch = () => {
    if (!draft.name.trim() || !draft.background.trim()) return
    setBatch(prev => [...prev, draft])
    setDraft({ name: '', background: '', attributes: { forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0 }, equipment: '', notes: '' })
  }
  const submitBatch = () => {
    if (!id || batch.length === 0) return
    const res = createNpcSheets(id, batch)
    if (res.ok) {
      setBatch([])
    }
  }
  return (
    <div>
      <h2>Campanha {id}</h2>
      {role === 'master' ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className={tab === 'players' ? 'primary' : ''} onClick={() => setTab('players')}>Jogadores</button>
            <button className={tab === 'sheets' ? 'primary' : ''} onClick={() => setTab('sheets')}>Fichas</button>
          </div>
          {tab === 'players' ? (
            <div className="card">
              <strong>Jogadores</strong>
              {players.length === 0 ? (
                <p>Nenhum jogador aceito ainda.</p>
              ) : (
                <ul>
                  {players.map(p => (
                    <li key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{p.displayName}</span>
                      <span style={{ color: 'var(--muted)' }}>#{p.userId}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="card" style={{ display: 'grid', gap: 16 }}>
              <strong>Fichas (NPCs)</strong>
              <div>
                {npcs.length === 0 ? (
                  <p>Nenhum NPC criado.</p>
                ) : (
                  <ul>
                    {npcs.map(n => (
                      <li key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{n.name}</span>
                        <span style={{ color: 'var(--muted)' }}>#{n.id}</span>
                        <span style={{ marginLeft: 'auto' }}>Movimentos: {n.moves.length}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="card" style={{ display: 'grid', gap: 8 }}>
                <strong>Criar NPCs</strong>
                <input placeholder="Nome" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} disabled={!isOnline} />
                <input placeholder="Antecedentes" value={draft.background} onChange={e => setDraft({ ...draft, background: e.target.value })} disabled={!isOnline} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {(['forca','agilidade','sabedoria','carisma','intuicao'] as const).map(k => (
                    <div key={k}>
                      <label>{k}</label>
                      <select value={draft.attributes[k]} onChange={e => setDraft({ ...draft, attributes: { ...draft.attributes, [k]: Number(e.target.value) as any } })} disabled={!isOnline}>
                        {[-1,0,1,2,3].map(v => (<option key={v} value={v}>{v}</option>))}
                      </select>
                    </div>
                  ))}
                </div>
                <input placeholder="Equipamentos (opcional)" value={draft.equipment || ''} onChange={e => setDraft({ ...draft, equipment: e.target.value })} disabled={!isOnline} />
                <textarea placeholder="Notas (opcional)" value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })} disabled={!isOnline} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addDraftToBatch} disabled={!isOnline}>Adicionar à lista</button>
                  <span style={{ alignSelf: 'center' }}>Na lista: {batch.length}</span>
                </div>
                <button className="primary" onClick={submitBatch} disabled={batch.length === 0 || !isOnline}>Criar NPCs</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <strong>Jogadores</strong>
          {players.length === 0 ? (
            <p>Nenhum jogador aceito ainda.</p>
          ) : (
            <ul>
              {players.map(p => (
                <li key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{p.displayName}</span>
                  <span style={{ color: 'var(--muted)' }}>#{p.userId}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}