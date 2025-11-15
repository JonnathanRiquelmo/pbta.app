import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export type NoteInput = {
  ownerUid: string
  type: 'character' | 'session' | 'global'
  title?: string
  content?: string
  tags?: string[]
}

const BYPASS = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

type BypassNote = {
  id: string
  ownerUid: string
  type: 'character' | 'session' | 'global'
  title?: string
  content?: string
  tags?: string[]
  updatedAt: string
}

function readBypassStore(): BypassNote[] {
  try {
    const raw = localStorage.getItem('bypass:notes')
    return raw ? JSON.parse(raw) as BypassNote[] : []
  } catch {
    return []
  }
}

function writeBypassStore(items: BypassNote[]) {
  localStorage.setItem('bypass:notes', JSON.stringify(items))
}

export async function createNote(input: NoteInput): Promise<string> {
  if (BYPASS) {
    const id = `note_${Date.now()}`
    const items = readBypassStore()
    items.push({ id, ...input, title: (input.title ?? '').trim(), updatedAt: new Date().toISOString() })
    writeBypassStore(items)
    return id
  }
  const ref = await addDoc(collection(db, 'notes'), {
    ownerUid: input.ownerUid,
    type: input.type,
    title: (input.title ?? '').trim(),
    content: input.content ?? '',
    tags: input.tags ?? [],
    updatedAt: new Date()
  })
  return ref.id
}

export async function updateNote(id: string, partial: Partial<NoteInput>): Promise<void> {
  if (BYPASS) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) throw new Error('NotFound')
    const current = items[idx]
    items[idx] = {
      ...current,
      ...partial,
      title: (partial.title ?? current.title ?? '').trim(),
      updatedAt: new Date().toISOString()
    }
    writeBypassStore(items)
    return
  }
  await updateDoc(doc(db, 'notes', id), { ...partial, updatedAt: new Date() })
}

export async function deleteNote(id: string): Promise<void> {
  if (BYPASS) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    items.splice(idx, 1)
    writeBypassStore(items)
    return
  }
  await deleteDoc(doc(db, 'notes', id))
}