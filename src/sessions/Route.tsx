import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@shared/store/appStore'
import type { Session } from './types'
import type { Attributes } from '@characters/types'
import type { NpcSheet } from '@npc/types'
import BackButton from '@shared/components/BackButton'

function toDateInputValue(ts: number): string {
  const d = new Date(ts)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateInputValue(s: string): number {
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : 0
}

type Editable = Session & { _dirty?: boolean }

export default function SessionRoute() {
  const { id } = useParams()
  const getSession = useAppStore(s => s.getSession)
  const updateSession = useAppStore(s => s.updateSession)
  const role = useAppStore(s => s.role)
  const listNpcSheets = useAppStore(s => s.listNpcSheets)
  const getMyPlayerSheet = useAppStore(s => s.getMyPlayerSheet)
  const listCampaignMoves = useAppStore(s => s.listCampaignMoves)
  const listRolls = useAppStore(s => s.listRolls)
  const subscribeRolls = useAppStore(s => s.subscribeRolls)
  const createRoll = useAppStore(s => s.createRoll)
  const deleteRoll = useAppStore(s => s.deleteRoll)

  const session = useMemo(() => (id ? getSession(id) : undefined), [id, getSession])
  const [item, setItem] = useState<Editable | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [whoKind, setWhoKind] = useState<'player' | 'npc'>('player')
  const [whoSheetId, setWhoSheetId] = useState<string>('')
  const [whoName, setWhoName] = useState<string>('')
  const [attributeRef, setAttributeRef] = useState<keyof Attributes | ''>('')
  const [moveRef, setMoveRef] = useState<string>('')
  const [mode, setMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal')
  const [rollItems, setRollItems] = useState(() => (id ? listRolls(id) : []))

  useEffect(() => {
    setItem(session ? { ...session, _dirty: false } : null)
  }, [session])

  useEffect(() => {
    if (id) setRollItems(listRolls(id))
  }, [id, listRolls])

  useEffect(() => {
    if (!id) return
    const unsub = subscribeRolls(id, items => setRollItems(items))
    return () => { if (typeof unsub === 'function') unsub() }
  }, [id, subscribeRolls])

  if (!item) return <div className="card">Sessão não encontrada</div>

  const isMaster = role === 'master'

  async function onSave() {
    setError(null)
    setSuccess(null)
    if (!item) return
    const res = updateSession(item.campaignId, item.id, {
      name: item.name,
      date: item.date,
      summary: item.summary,
      masterNotes: item.masterNotes
    })
    if (!res.ok) {
      setError(res.message)
      return
    }
    setSuccess('saved')
    setItem({ ...res.session, _dirty: false })
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 16 }}>
        <BackButton />
        <h2 style={{ margin: 0 }}>{item.name}</h2>
      </div>
      <div>
        <label>
          Nome
          <input value={item.name} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, name: e.target.value, _dirty: true } : prev)} />
        </label>
      </div>
      <div>
        <label>
          Data
          <input type="date" value={toDateInputValue(item.date)} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, date: fromDateInputValue(e.target.value), _dirty: true } : prev)} />
        </label>
      </div>
      <div>
        <h3>Resumo</h3>
        <textarea value={item.summary} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, summary: e.target.value, _dirty: true } : prev)} />
      </div>
      <div>
        <h3>Notas do Mestre</h3>
        <textarea value={item.masterNotes} disabled={!isMaster} onChange={e => setItem(prev => prev ? { ...prev, masterNotes: e.target.value, _dirty: true } : prev)} />
      </div>
      {isMaster && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} disabled={!item._dirty}>Salvar</button>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {success && <div>{success}</div>}
      <div style={{ marginTop: 24 }}>
        <h3>Rolagens PBtA</h3>
        <div>
          <label>
            Quem
            <select
              value={`${whoKind}:${whoSheetId}`}
              onChange={e => {
                const v = e.target.value
                const [k, idv] = v.split(':') as ['player' | 'npc', string]
                setWhoKind(k)
                setWhoSheetId(idv)
                const name = k === 'player' ? (loadPlayerSheets(item.campaignId, getMyPlayerSheet).find(s => s.id === idv)?.name || '') : (listNpcSheets(item.campaignId).find(n => n.id === idv)?.name || '')
                setWhoName(name)
                setAttributeRef('')
                setMoveRef('')
              }}
            >
              <option value={''}>Selecione</option>
              {renderWhoOptions(item.campaignId, isMaster, getMyPlayerSheet, listNpcSheets).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Atributo
            <select value={attributeRef || ''} onChange={e => setAttributeRef((e.target.value || '') as keyof Attributes | '')}>
              <option value="">Nenhum</option>
              {attributeOptions(item.campaignId, whoKind, whoSheetId, getMyPlayerSheet, listNpcSheets).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Movimento
            <select value={moveRef} onChange={e => setMoveRef(e.target.value)}>
              <option value="">Nenhum</option>
              {moveOptions(item.campaignId, whoKind, whoSheetId, getMyPlayerSheet, listNpcSheets, listCampaignMoves).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Modo
            <select value={mode} onChange={e => setMode(e.target.value as 'normal' | 'advantage' | 'disadvantage')}>
              <option value="normal">Normal</option>
              <option value="advantage">Vantagem</option>
              <option value="disadvantage">Desvantagem</option>
            </select>
          </label>
        </div>
        <div>
          <button
            onClick={() => {
              setError(null)
              setSuccess(null)
              if (!whoSheetId) { setError('invalid_sheet'); return }
              const res = createRoll(item.id, {
                who: { kind: whoKind, sheetId: whoSheetId, name: whoName },
                attributeRef: attributeRef || undefined,
                moveRef: moveRef || undefined,
                mode
              })
              if (!res.ok) { setError(res.message); return }
              setSuccess('rolled')
              setWhoSheetId('')
              setWhoName('')
              setAttributeRef('')
              setMoveRef('')
              setMode('normal')
              setRollItems(listRolls(item.id))
            }}
          >
            Rolar
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <h4>Histórico</h4>
          {rollItems.length === 0 && <div>Nenhuma rolagem</div>}
          {rollItems.map(r => (
            <div key={r.id} className="list-item">
              <div>{r.who.name} ({r.who.kind})</div>
              <div>Modo: {modeLabel(r)}</div>
              <div>Dados: [{r.dice.join(', ')}] → usados: [{r.usedDice.join(', ')}]</div>
              <div>Atributo: {r.attributeRef ? `${String(r.attributeRef)} ${r.attributeModifier ?? 0}` : 'Nenhum'}</div>
              <div>Movimento: {r.moveRef ? `${r.moveRef} ${r.moveModifier ?? 0}` : 'Nenhum'}</div>
              <div>Total: {r.baseSum} + {r.totalModifier} = {r.total} → {r.outcome}</div>
              {isMaster && (
                <div>
                  <button onClick={() => {
                    const d = deleteRoll(item.id, r.id)
                    if (!d.ok) { setError(d.message); return }
                    setRollItems(listRolls(item.id))
                  }}>Deletar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import type { PlayerSheet } from '@characters/types'

function loadPlayerSheets(campaignId: string, getMyPlayerSheet: (campaignId: string) => PlayerSheet | undefined): PlayerSheet[] {
  const me = getMyPlayerSheet(campaignId)
  return me ? [me] : []
}

function renderWhoOptions(
  campaignId: string,
  isMaster: boolean,
  getMyPlayerSheet: (campaignId: string) => PlayerSheet | undefined,
  listNpcSheets: (campaignId: string) => NpcSheet[]
) {
  const opts: { value: string; label: string }[] = []
  const my = getMyPlayerSheet(campaignId)
  if (my) opts.push({ value: `player:${my.id}`, label: `Jogador: ${my.name}` })
  if (isMaster) {
    for (const s of loadPlayerSheets(campaignId, getMyPlayerSheet)) {
      if (!my || s.id !== my.id) opts.push({ value: `player:${s.id}`, label: `Jogador: ${s.name}` })
    }
    for (const n of listNpcSheets(campaignId)) {
      opts.push({ value: `npc:${n.id}`, label: `NPC: ${n.name}` })
    }
  }
  return opts
}

function attributeOptions(
  campaignId: string,
  kind: 'player' | 'npc',
  sheetId: string,
  getMyPlayerSheet: (campaignId: string) => PlayerSheet | undefined,
  listNpcSheets: (campaignId: string) => NpcSheet[]
): (keyof Attributes)[] {
  if (!sheetId) return []
  if (kind === 'player') {
    const s = getMyPlayerSheet(campaignId)
    if (!s || s.id !== sheetId) return []
    return Object.keys(s.attributes) as (keyof Attributes)[]
  }
  const n = listNpcSheets(campaignId).find(x => x.id === sheetId)
  if (!n) return []
  return Object.keys(n.attributes) as (keyof Attributes)[]
}

function moveOptions(
  campaignId: string,
  kind: 'player' | 'npc',
  sheetId: string,
  getMyPlayerSheet: (campaignId: string) => PlayerSheet | undefined,
  listNpcSheets: (campaignId: string) => NpcSheet[],
  listCampaignMoves: (campaignId: string) => string[]
): string[] {
  if (!sheetId) return []
  const active = listCampaignMoves(campaignId)
  if (kind === 'player') {
    const s = getMyPlayerSheet(campaignId)
    if (!s || s.id !== sheetId) return []
    return (s.moves || []).filter((m: string) => active.includes(m))
  }
  const n = listNpcSheets(campaignId).find(x => x.id === sheetId)
  if (!n) return []
  return (n.moves || []).filter(m => active.includes(m))
}

import type { Roll } from '@rolls/types'

function modeLabel(r: Roll) {
  const count = r.dice.length
  if (count === 2) return 'Normal'
  const sorted = [...r.dice].sort((a: number, b: number) => b - a)
  const used = r.usedDice
  if (used[0] === sorted[0] && used[1] === sorted[1]) return 'Vantagem'
  return 'Desvantagem'
}
