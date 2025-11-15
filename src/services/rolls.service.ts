import { addDoc, collection } from 'firebase/firestore'
import { db } from '../../firebase/config'

const BYPASS = (import.meta.env.VITE_TEST_BYPASS_AUTH === 'true')

export type RollInput = {
  rollerUid: string
  campaignId?: string
  characterId?: string
  total: number
  detail?: {
    dice: [number, number]
    mod?: number
    formula?: string
    outcome?: string
  }
}

type BypassRoll = { id: string } & RollInput & { timestamp: string }

function readBypassStore(): BypassRoll[] {
  const raw = localStorage.getItem('bypass:rolls')
  return raw ? JSON.parse(raw) : []
}

function writeBypassStore(items: BypassRoll[]) {
  localStorage.setItem('bypass:rolls', JSON.stringify(items))
}

export async function createRoll(input: RollInput): Promise<string> {
  if (BYPASS) {
    const id = 'roll_' + Date.now()
    const items = readBypassStore()
    items.push({ id, ...input, timestamp: new Date().toISOString() })
    writeBypassStore(items)
    return id
  }
  const ref = await addDoc(collection(db, 'rolls'), { ...input, timestamp: new Date() })
  return ref.id
}