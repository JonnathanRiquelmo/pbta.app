import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { validateSheetUpdate } from '../utils/validators'

export type CharacterInput = {
  name: string
  playbook?: string
  stats?: Record<string, number>
  moves?: string[]
  campaignId?: string
}

const bypass = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

type BypassCharacter = {
  id: string
  ownerUid: string
  isNPC: boolean
  name?: string
  playbook?: string
  stats?: Record<string, number>
  moves?: string[]
  campaignId?: string | null
  publicShareId?: string
  isPrivateToMaster?: boolean
}

function readBypassStore(): BypassCharacter[] {
  try {
    const raw = localStorage.getItem('bypass:characters')
    return raw ? JSON.parse(raw) as BypassCharacter[] : []
  } catch {
    return []
  }
}

function writeBypassStore(items: BypassCharacter[]) {
  localStorage.setItem('bypass:characters', JSON.stringify(items))
}

export async function createCharacter(input: CharacterInput, ownerUid: string): Promise<string> {
  if (bypass) {
    const id = `char_${Date.now()}`
    const items = readBypassStore()
    items.push({ id, ownerUid, isNPC: false, name: input.name, playbook: input.playbook ?? '', stats: input.stats ?? {}, moves: input.moves ?? [], campaignId: input.campaignId ?? null })
    writeBypassStore(items)
    return id
  }
  const ref = await addDoc(collection(db, 'characters'), {
    ownerUid,
    isNPC: false,
    name: input.name,
    playbook: input.playbook ?? '',
    stats: input.stats ?? {},
    moves: input.moves ?? [],
    campaignId: input.campaignId ?? null,
    creationDate: new Date()
  })
  return ref.id
}

export async function updateCharacter(id: string, partial: Partial<CharacterInput>, currentUid: string): Promise<void> {
  if (bypass) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) throw new Error('NotFound')
    validateSheetUpdate(currentUid, { ownerUid: items[idx].ownerUid })
    items[idx] = { ...items[idx], ...partial }
    writeBypassStore(items)
    return
  }
  const ref = doc(db, 'characters', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('NotFound')
  const data = snap.data() as { ownerUid?: string }
  validateSheetUpdate(currentUid, { ownerUid: data.ownerUid })
  await updateDoc(ref, partial)
}

export async function deleteCharacter(id: string, currentUid: string): Promise<void> {
  if (bypass) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    validateSheetUpdate(currentUid, { ownerUid: items[idx].ownerUid })
    items.splice(idx, 1)
    writeBypassStore(items)
    return
  }
  const ref = doc(db, 'characters', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as { ownerUid?: string }
  validateSheetUpdate(currentUid, { ownerUid: data.ownerUid })
  await deleteDoc(ref)
}

export async function duplicateCharacter(id: string, currentUid: string): Promise<string> {
  if (bypass) {
    const items = readBypassStore()
    const src = items.find(i => i.id === id)
    if (!src) throw new Error('NotFound')
    validateSheetUpdate(currentUid, { ownerUid: src.ownerUid })
    const newId = `char_${Date.now()}`
    const name = (src.name as string | undefined) ?? 'Sem nome'
    items.push({ ...src, id: newId, ownerUid: currentUid, isNPC: false, name: `${name} (Cópia)` })
    writeBypassStore(items)
    return newId
  }
  const srcRef = doc(db, 'characters', id)
  const snap = await getDoc(srcRef)
  if (!snap.exists()) throw new Error('NotFound')
  const data = snap.data() as Record<string, unknown>
  validateSheetUpdate(currentUid, { ownerUid: (data.ownerUid as string | undefined) })
  const name = (data.name as string | undefined) ?? 'Sem nome'
  const newRef = await addDoc(collection(db, 'characters'), {
    ...data,
    ownerUid: currentUid,
    isNPC: false,
    name: `${name} (Cópia)`,
    creationDate: new Date()
  })
  return newRef.id
}

function createShareToken(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 10; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export async function generatePublicShareId(id: string, currentUid: string): Promise<string> {
  const token = createShareToken()
  if (bypass) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) throw new Error('NotFound')
    validateSheetUpdate(currentUid, { ownerUid: items[idx].ownerUid })
    items[idx] = { ...items[idx], publicShareId: token }
    writeBypassStore(items)
    return token
  }
  const ref = doc(db, 'characters', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('NotFound')
  const data = snap.data() as { ownerUid?: string }
  validateSheetUpdate(currentUid, { ownerUid: data.ownerUid })
  await updateDoc(ref, { publicShareId: token })
  return token
}

export type PdmInput = {
  name: string
  isPrivateToMaster?: boolean
  campaignId?: string
}

export async function createPdm(input: PdmInput, ownerUid: string): Promise<string> {
  if (bypass) {
    const id = `pdm_${Date.now()}`
    const items = readBypassStore()
    items.push({ id, ownerUid, isNPC: true, name: input.name, playbook: '', stats: {}, moves: [], campaignId: input.campaignId ?? null, isPrivateToMaster: !!input.isPrivateToMaster })
    writeBypassStore(items)
    return id
  }
  const ref = await addDoc(collection(db, 'characters'), {
    ownerUid,
    isNPC: true,
    name: input.name,
    playbook: '',
    stats: {},
    moves: [],
    campaignId: input.campaignId ?? null,
    isPrivateToMaster: !!input.isPrivateToMaster,
    creationDate: new Date()
  })
  return ref.id
}

export async function updatePdm(id: string, partial: Partial<PdmInput>, currentUid: string): Promise<void> {
  if (bypass) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) throw new Error('NotFound')
    validateSheetUpdate(currentUid, { ownerUid: items[idx].ownerUid })
    items[idx] = { ...items[idx], ...partial }
    writeBypassStore(items)
    return
  }
  const ref = doc(db, 'characters', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('NotFound')
  const data = snap.data() as { ownerUid?: string }
  validateSheetUpdate(currentUid, { ownerUid: data.ownerUid })
  await updateDoc(ref, partial)
}

export async function deletePdm(id: string, currentUid: string): Promise<void> {
  if (bypass) {
    const items = readBypassStore()
    const idx = items.findIndex(i => i.id === id)
    if (idx < 0) return
    validateSheetUpdate(currentUid, { ownerUid: items[idx].ownerUid })
    items.splice(idx, 1)
    writeBypassStore(items)
    return
  }
  const ref = doc(db, 'characters', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as { ownerUid?: string }
  validateSheetUpdate(currentUid, { ownerUid: data.ownerUid })
  await deleteDoc(ref)
}