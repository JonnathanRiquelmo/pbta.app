import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export type SessionInput = {
  campaignId: string
  date: string
  summary?: string
  gmNotes?: string
  publicNotes?: string
  title?: string
}

const BYPASS = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

type BypassSession = {
  id: string
  campaignId: string
  date: string
  summary?: string
  gmNotes?: string
  publicNotes?: string
  title?: string
}

function readBypassStore(): BypassSession[] {
  try {
    const raw = localStorage.getItem('bypass:sessions')
    return raw ? JSON.parse(raw) as BypassSession[] : []
  } catch {
    return []
  }
}

function writeBypassStore(items: BypassSession[]) {
  localStorage.setItem('bypass:sessions', JSON.stringify(items))
}

export async function createSession(input: SessionInput): Promise<string> {
  const payload = {
    campaignId: input.campaignId,
    date: input.date,
    summary: input.summary ?? '',
    gmNotes: input.gmNotes ?? '',
    publicNotes: input.publicNotes ?? '',
    title: input.title ?? '',
    creationDate: new Date()
  }
  if (BYPASS) {
    const id = `session_${Date.now()}`
    const items = readBypassStore()
    items.push({ id, ...payload })
    writeBypassStore(items)
    return id
  }
  const ref = await addDoc(collection(db, 'sessions'), payload)
  return ref.id
}

export async function updateSession(id: string, partial: Partial<SessionInput>): Promise<void> {
  if (BYPASS) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) throw new Error('NotFound')
    const current = items[idx]
    items[idx] = {
      ...current,
      ...partial,
      title: (partial.title ?? current.title ?? '').trim()
    }
    writeBypassStore(items)
    return
  }
  await updateDoc(doc(db, 'sessions', id), partial)
}

export async function deleteSession(id: string): Promise<void> {
  if (BYPASS) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    items.splice(idx, 1)
    writeBypassStore(items)
    return
  }
  await deleteDoc(doc(db, 'sessions', id))
}