import { useState } from 'react'
import BackButton from '@shared/components/BackButton'
import { getFirebaseAuth } from '@fb/client'

export default function DebugCampaigns() {
  const [uid, setUid] = useState<string>('')
  const [rows, setRows] = useState<any>(null)
  const [doc, setDoc] = useState<any>(null)
  const [campaignId, setCampaignId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  async function runQuery() {
    setError(null)
    setRows(null)
    const auth = getFirebaseAuth()
    const user = auth?.currentUser
    if (!user) { setError('Sem usuário autenticado'); return }
    setUid(user.uid)
    const idToken = await user.getIdToken(true)
    const url = 'https://firestore.googleapis.com/v1/projects/pbta-app/databases/(default)/documents:runQuery'
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'campaigns' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'playersUids' },
            op: 'ARRAY_CONTAINS',
            value: { stringValue: user.uid }
          }
        }
      }
    }
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
        body: JSON.stringify(body)
      })
      const data = await resp.json()
      setRows(data)
    } catch (e: any) {
      setError(e?.message || 'Erro na runQuery')
    }
  }

  async function readDoc() {
    setError(null)
    setDoc(null)
    const auth = getFirebaseAuth()
    const user = auth?.currentUser
    if (!user) { setError('Sem usuário autenticado'); return }
    setUid(user.uid)
    const idToken = await user.getIdToken(true)
    const url = `https://firestore.googleapis.com/v1/projects/pbta-app/databases/(default)/documents/campaigns/${campaignId}`
    try {
      const resp = await fetch(url, { headers: { Authorization: 'Bearer ' + idToken } })
      const data = await resp.json()
      setDoc(data)
    } catch (e: any) {
      setError(e?.message || 'Erro ao ler documento')
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 12 }}>
        <BackButton />
        <strong style={{ margin: 0 }}>Debug Firestore</strong>
      </div>
      <p>UID atual: {uid || '---'}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={runQuery}>runQuery - campanhas do jogador</button>
        <input placeholder="campaignId" value={campaignId} onChange={e => setCampaignId(e.target.value)} />
        <button className="btn" onClick={readDoc}>Ler doc campanha</button>
      </div>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {rows ? (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(rows, null, 2)}</pre>
      ) : null}
      {doc ? (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(doc, null, 2)}</pre>
      ) : null}
    </div>
  )
}
