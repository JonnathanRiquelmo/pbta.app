import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export type MoveInput = {
  campaignId: string
  name: string
  description?: string
  trigger?: string
  rollFormula?: string
  results?: {
    on10Plus?: string
    on7to9?: string
    onMiss?: string
  }
}

const BYPASS = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

type BypassMove = {
  id: string
  campaignId: string
  name: string
  description?: string
  trigger?: string
  rollFormula?: string
  results?: {
    on10Plus?: string
    on7to9?: string
    onMiss?: string
  }
}

function readBypassStore(): BypassMove[] {
  try {
    const raw = localStorage.getItem('bypass:moves')
    return raw ? JSON.parse(raw) as BypassMove[] : []
  } catch {
    return []
  }
}

function writeBypassStore(items: BypassMove[]) {
  localStorage.setItem('bypass:moves', JSON.stringify(items))
}

export async function createMove(input: MoveInput): Promise<string> {
  if (BYPASS) {
    const id = `move_${Date.now()}`
    const items = readBypassStore()
    items.push({ id, ...input, name: input.name.trim() })
    writeBypassStore(items)
    return id
  }
  const ref = await addDoc(collection(db, 'moves'), {
    campaignId: input.campaignId,
    name: input.name.trim(),
    description: input.description ?? '',
    trigger: input.trigger ?? '',
    rollFormula: input.rollFormula ?? '',
    results: input.results ?? {},
    creationDate: new Date()
  })
  return ref.id
}

export async function updateMove(id: string, partial: Partial<MoveInput>): Promise<void> {
  if (BYPASS) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) throw new Error('NotFound')
    const current = items[idx]
    items[idx] = {
      ...current,
      ...partial,
      name: (partial.name ?? current.name).trim()
    }
    writeBypassStore(items)
    return
  }
  await updateDoc(doc(db, 'moves', id), partial)
}

export async function deleteMove(id: string): Promise<void> {
  if (BYPASS) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    items.splice(idx, 1)
    writeBypassStore(items)
    return
  }
  await deleteDoc(doc(db, 'moves', id))
}